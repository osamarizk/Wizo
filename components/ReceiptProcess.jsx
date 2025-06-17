import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
} from "react-native";
import React, { useState } from "react";
import ReceiptFull from "./ReceiptFull";
import { extractReceiptData } from "../lib/extractReceiptData";
import images from "../constants/images";
import {
  projectId,
  createReceipt,
  getCurrentUser,
  uploadReceiptImage,
  isDuplicateReceipt,
  createNotification,
  countUnreadNotifications,
  getCategoriesByName,
  getSubcategoriesByName,
  updateUserPoints,
  checkAndAwardBadges,
  checkSession,
  getFutureDate,
} from "../lib/appwrite";
import Checkbox from "expo-checkbox"; // Make sure expo-checkbox is installed
import { useGlobalContext } from "../context/GlobalProvider";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system"; // for reading the image as blob
import mime from "mime"; // helps get MIME type from file extension
import * as ImageManipulator from "expo-image-manipulator";

import GradientBackground from "./GradientBackground";
import { ro } from "date-fns/locale";
import { format } from "date-fns";

const ReceiptProcess = ({ imageUri, onCancel, onProcessComplete }) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const {
    user,
    updateUnreadCount,
    applicationSettings,
    setUser,
    checkSessionAndFetchUser,
  } = useGlobalContext();

  // NEW STATE: To control visibility after save click
  const [hasSaved, setHasSaved] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const [showAllItems, setShowAllItems] = useState(false);

  const toggleItems = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAllItems((prev) => !prev);
  };
  // Assuming this code snippet is within your ReceiptProcess.jsx component

  const handleProcessReceipt = async () => {
    // --- START: NEW MONTHLY RECEIPT UPLOAD LIMIT CHECK (BEFORE EXTRACTION) ---
    if (!user || !applicationSettings) {
      Alert.alert(
        "Error",
        "User or application settings not loaded. Please try again."
      );
      return;
    }

    const userCurrentReceiptCount = user.currentMonthReceiptCount || 0;
    const freeLimit = applicationSettings.free_tier_receipt_limit;

    if (!user.isPremium && userCurrentReceiptCount >= freeLimit) {
      Alert.alert(
        "Limit Reached!",
        `You've reached your monthly limit of ${freeLimit} receipt uploads. Upgrade to Premium for unlimited uploads and more features!`,
        [
          { text: "Later", style: "cancel", onPress: () => onCancel() }, // Go back/dismiss
          {
            text: "Upgrade Now",
            onPress: () => {
              router.push("/upgrade-premium"); // Navigate to your upgrade page
              onCancel(); // Close the modal if it's open
            },
          },
        ]
      );
      // Notification for Limit Reached
      try {
        await createNotification({
          user_id: user.$id,
          title: "Receipt Upload Limit Reached",
          message: `You've used all ${freeLimit} free monthly receipt uploads. Upgrade to Premium!`,
          type: "limit_reached",
          expiresAt: getFutureDate(30),
          receipt_id: null,
        });
        const updatedUnreadCount = await countUnreadNotifications(user.$id);
        updateUnreadCount(updatedUnreadCount);
      } catch (notificationError) {
        console.warn(
          "Failed to create limit reached notification:",
          notificationError
        );
      }
      return; // CRUCIAL: Stop execution here
    }
    // --- END: NEW MONTHLY RECEIPT UPLOAD LIMIT CHECK ---
    try {
      setIsProcessing(true);
      const data = await extractReceiptData(imageUri);

      // Check if it's not a receipt
      if (!data.isReceipt) {
        Alert.alert(
          "Not a Receipt",
          data.message || "This image is not a receipt."
        );
        return;
      }

      // --- Item Consolidation Logic (remains unchanged) ---
      if (data.data && data.data.items && data.data.items.length > 0) {
        const originalItems = data.data.items;
        const consolidatedItems = [];

        for (let i = 0; i < originalItems.length; i++) {
          const currentItem = originalItems[i];
          if (currentItem.price === 0 && i > 0) {
            const lastConsolidatedItem =
              consolidatedItems[consolidatedItems.length - 1];
            if (lastConsolidatedItem) {
              lastConsolidatedItem.name = `${lastConsolidatedItem.name} (${currentItem.name})`;
              if (!lastConsolidatedItem.category && currentItem.category) {
                lastConsolidatedItem.category = currentItem.category;
              }
              if (
                !lastConsolidatedItem.subcategory &&
                currentItem.subcategory
              ) {
                lastConsolidatedItem.subcategory = currentItem.subcategory;
              }
            } else {
              consolidatedItems.push(currentItem);
            }
          } else {
            consolidatedItems.push(currentItem);
          }
        }
        data.data.items = consolidatedItems;
      }
      // --- End of Item Consolidation Logic ---

      // --- START: MODIFIED LOGIC FOR COUNTRY AND NULL HANDLING (for display/editing) ---

      // Ensure data.data and data.data.location exist to prevent errors
      if (!data.data) {
        data.data = {};
      }
      if (!data.data.location) {
        data.data.location = {};
      }

      // 1. Determine the country for the receipt (prioritizing extracted over user session)
      const userSession = await checkSession();
      // userCountryFromSession can be null/undefined if not found
      const userCountryFromSession = userSession?.countryName;

      const extractedLocationCountry = data.data.location.country;
      // rawFinalCountry will be null/undefined if neither extracted nor user session has it
      const rawFinalCountry =
        extractedLocationCountry || userCountryFromSession;

      // 2. Convert all location components to string, defaulting to an EMPTY STRING if null/undefined.
      // This allows `filter(Boolean)` in display logic to correctly omit them.
      data.data.location.address = String(data.data.location.address || "");
      data.data.location.city = String(data.data.location.city || "");
      data.data.location.country = String(rawFinalCountry || ""); // Ensure country is also "" if truly null

      // 3. Apply null handling to other relevant fields (defaulting to "null" string or appropriate numbers)
      data.data.merchant = String(data.data.merchant || "Unknown"); // Still default to "Unknown" for merchant
      data.data.currency = String(data.data.currency || "EGP");

      // Numeric fields: ensure they are numbers, defaulting to 0 if null/undefined/invalid
      data.data.subtotal = parseFloat(data.data.subtotal || 0);
      data.data.vat = parseFloat(data.data.vat || 0);
      data.data.total = parseFloat(data.data.total || 0);

      // Other string fields: default to "null" string if null/undefined
      data.data.cardLastFourDigits = String(
        data.data.cardLastFourDigits || "null"
      );
      data.data.cashierId = String(data.data.cashierId || "null");
      data.data.paymentMethod = String(data.data.paymentMethod || "cash");
      data.data.storeBranchId = String(data.data.storeBranchId || "null");
      data.data.transactionId = String(data.data.transactionId || "null");

      // Loyalty points handling: null/undefined to "null" string, numeric string to float, others to string.
      if (
        data.data.loyaltyPoints === null ||
        data.data.loyaltyPoints === undefined
      ) {
        data.data.loyaltyPoints = "null"; // If null/undefined, save as the string "null"
      } else if (
        typeof data.data.loyaltyPoints === "string" &&
        !isNaN(parseFloat(data.data.loyaltyPoints))
      ) {
        data.data.loyaltyPoints = parseFloat(data.data.loyaltyPoints); // If it's a numeric string, convert to number
      } else {
        data.data.loyaltyPoints = String(data.data.loyaltyPoints || "null"); // Convert any other non-null/undefined value to string, defaulting to "null" if falsy
      }

      data.data.notes = String(data.data.notes || "null");

      // --- END: MODIFIED LOGIC FOR COUNTRY AND NULL HANDLING ---

      // Set the extracted data (now processed and cleaned)
      setExtractedData(data.data);
      console.log("Receipt Data (Processed for display/editing)", data.data);
      Alert.alert("Success", "Receipt processed successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to extract receipt data.");
      console.error("Receipt extraction failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSave = async () => {
    console.log("extractedData", extractedData);

    if (!consentGiven) {
      Alert.alert(
        "Consent Required",
        "Please agree to save your data before proceeding."
      );
      return;
    }

    if (!extractedData || !imageUri || !user) {
      Alert.alert("Error", "Missing receipt data or image or user info.");
      return;
    }

    console.log("User Data...", user);

    const isDuplicate = await isDuplicateReceipt(
      user.$id,
      extractedData.merchant || "Unknown",
      extractedData.datetime || new Date().toISOString(),
      extractedData.total || 0
    );

    if (isDuplicate) {
      Alert.alert(
        "Duplicate Receipt",
        "This receipt already exists and won't be saved again.",
        [
          // NEW: Add buttons array
          {
            text: "OK",
            onPress: () => onProcessComplete?.(), // Call dismiss callback ONLY AFTER user presses OK
          },
        ]
      );
      console.log("Duplicate receipt detected:");
      try {
        await createNotification({
          user_id: user.$id,
          title: "Duplicate Receipt Detected",
          message: `Your receipt for ${
            extractedData.merchant || "Unknown Merchant"
          } on ${format(
            new Date(extractedData.datetime),
            "MMM dd,PPPP"
          )} was a duplicate and not saved.`,
          type: "system",
          expiresAt: getFutureDate(14),
          receipt_id: null,
        });
        const updatedUnreadCount = await countUnreadNotifications(user.$id);
        updateUnreadCount(updatedUnreadCount);
      } catch (notificationError) {
        console.warn(
          "Failed to create duplicate receipt notification:",
          notificationError
        );
      }
      onProcessComplete?.();
      return;
    }

    try {
      setIsProcessing(true);
      setHasSaved(true);

      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      const fileUri = manipulatedImage.uri;
      const fileName = fileUri.split("/").pop();
      const mimeType = mime.getType(fileName);

      const uploadedFile = await uploadReceiptImage(
        fileUri,
        fileName,
        mimeType
      );

      const manipulatedInfo = await FileSystem.getInfoAsync(fileUri);

      console.log(`Original size: ${fileInfo.size} bytes`);
      console.log(`Manipulated image Size: ${manipulatedInfo.size}`);
      const receiptDate = new Date(extractedData.datetime);

      const dateOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      const formattedDate = receiptDate.toLocaleDateString(
        undefined,
        dateOptions
      );
      const formattedTime = receiptDate.toLocaleTimeString(
        undefined,
        timeOptions
      );

      const itemsWithIds = await Promise.all(
        extractedData.items.map(async (item) => {
          let categoryId = null;
          if (item.category) {
            const categoryDoc = await getCategoryByName(item.category);
            console.log("categoryDoc before Saving...", categoryDoc);
            categoryId = categoryDoc ? categoryDoc : null;
          }

          let subcategoryId = null;
          if (item.subcategory) {
            const subcategoryDoc = await getSubcategoryByName(item.subcategory);
            subcategoryId = subcategoryDoc ? subcategoryDoc : null;
          }

          return {
            ...item,
            category_id: categoryId,
            subcategory_id: subcategoryId,
          };
        })
      );

      console.log("extracted Receipt Data ....", extractedData);

      const locationAddress = extractedData.location?.address;
      const locationCity = extractedData.location?.city;
      const locationCountry = extractedData.location?.country;

      const locationParts = [
        locationAddress,
        locationCity,
        locationCountry,
      ].filter(Boolean);

      const finalLocationString =
        locationParts.length > 0 ? locationParts.join(", ") : "Unknown";
      console.log("finalLocationString...", finalLocationString);
      const countryForAppwrite =
        extractedData.location?.country === ""
          ? "null"
          : String(extractedData.location?.country || "null");
      console.log(
        "extractedData.loyaltyPoints...",
        extractedData.loyaltyPoints
      );
      const receiptData = {
        user_id: user.$id,
        merchant: String(extractedData.merchant || "Unknown"),
        location: finalLocationString,
        datetime: extractedData.datetime || new Date().toISOString(),
        currency: String(extractedData.currency || "EGP"),
        subtotal: parseFloat(extractedData.subtotal || 0),
        vat: parseFloat(extractedData.vat || 0),
        total: parseFloat(extractedData.total || 0),
        items: JSON.stringify(itemsWithIds || []),
        cardLastFourDigits: String(extractedData.cardLastFourDigits || "null"),
        cashierId: String(extractedData.cashierId || "null"),
        payment_method: String(extractedData.paymentMethod || "cash"),
        storeBranchId: String(extractedData.storeBranchId || "null"),
        transactionId: String(extractedData.transactionId || "null"),
        loyalty_points: (() => {
          let value = extractedData.loyaltyPoints;
          if (value === null || value === undefined || value === "") {
            return 0;
          }
          const parsed = parseInt(value);
          if (!isNaN(parsed)) {
            return parsed;
          }
          return 0;
        })(),
        notes: String(extractedData.notes || "null"),
        image_file_id: uploadedFile.$id,
        image_type: uploadedFile.mimeType,
        image_size: uploadedFile.sizeOriginal || 0,
        image_url: `https://cloud.appwrite.io/v1/storage/buckets/${uploadedFile.bucketId}/files/${uploadedFile.$id}/view?project=${projectId}`,
      };

      const userCurrentReceiptCount = user.currentMonthReceiptCount || 0; // Get current count from global user object
      console.log(
        "LOG currentMonthReceiptCount.......>>>",
        userCurrentReceiptCount
      ); // Log the value being passed // Call createReceipt with receiptData, user ID, and current receipt count

      const { receipt: newReceipt, updatedUser: freshUser } =
        await createReceipt(
          // NEW: Destructure response
          receiptData,
          user.$id,
          userCurrentReceiptCount
        );

      if (newReceipt && newReceipt.$id) {
        if (freshUser) {
          setTimeout(() => {
            setUser(freshUser);
          }, 200);
          // Update global user state with the latest count
          console.log(
            "Global user state updated with new receipt count:",
            freshUser.currentMonthReceiptCount
          );
          // Check the receipt part of the response
          Alert.alert("Success", "Receipt saved successfully!", [
            // NEW: Add buttons array
            {
              text: "OK",
              onPress: () => {
                onProcessComplete?.(); // Call onProcessComplete after OK is pressed
              },
            },
          ]); // NEW: Directly update the user in global context with the fresh data
        } else {
          // Fallback if updatedUser is unexpectedly null (though it shouldn't be with current createReceipt)
          // Still call checkSessionAndFetchUser to attempt a full refresh.

          setTimeout(async () => {
            await checkSessionAndFetchUser();
          }, 200);

          console.warn(
            "freshUser was null after createReceipt. Triggering full user refresh."
          );
        }

        await createNotification({
          user_id: user.$id,
          title: "Receipt Processed",
          message: `Your receipt for ${
            extractedData.merchant || "Unknown"
          } (${parseFloat(extractedData.total || 0).toFixed(
            2
          )}) has been successfully processed!`,
          receipt_id: newReceipt.$id, // Use newReceipt here
          type: "receipt",
          expiresAt: getFutureDate(7),
        });

        const pointsEarned = 0;
        await updateUserPoints(user.$id, pointsEarned, "receipt_upload");
        console.log(
          `User ${user.$id} earned ${pointsEarned} points for receipt upload.`
        );

        const earnedBadges = await checkAndAwardBadges(user.$id);
        if (earnedBadges.length > 0) {
          const badgeNames = earnedBadges.map((badge) => badge.name).join(", ");
          const pointsExtra = earnedBadges
            .map((badge) => badge.points_reward)
            .join(", ");
          Alert.alert(
            "Achievement Unlocked!",
            `You earned new badges: ${badgeNames}! You earned Extra Points: ${pointsExtra}!`
          );

          await createNotification({
            user_id: user.$id,
            title: "Achievement Unlocked!",
            message: `You earned ${pointsExtra} Extra Points for ${badgeNames}! Keep up the great work!`,
            type: "points_award",
            expiresAt: getFutureDate(7),
          });
          console.log(`User ${user.$id} earned badges: ${badgeNames}`);
        }

        const updatedUnreadCount = await countUnreadNotifications(user.$id);
        updateUnreadCount(updatedUnreadCount);
        onCancel();

        onProcessComplete?.();
      } else {
        console.error("Invalid response from createReceipt:", newReceipt);
        Alert.alert("Error", "Receipt was not saved. Please try again.");
        try {
          await createNotification({
            user_id: user.$id,
            title: "Receipt Save Failed",
            message: `Failed to save your receipt for ${
              extractedData.merchant || "Unknown"
            }. Please try again.`,
            type: "error",
            expiresAt: getFutureDate(14),
          });
          const updatedUnreadCount = await countUnreadNotifications(user.$id);
          updateUnreadCount(updatedUnreadCount);
        } catch (notificationError) {
          console.warn(
            "Failed to create save failure notification:",
            notificationError
          );
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Could not save receipt.");
      setHasSaved(false);
      try {
        await createNotification({
          user_id: user.$id,
          title: "Receipt Processing Error",
          message: `An unexpected error occurred while saving your receipt. Error: ${
            error.message || "Unknown error"
          }.`,
          type: "error",
          expiresAt: getFutureDate(14),
        });
        const updatedUnreadCount = await countUnreadNotifications(user.$id);
        updateUnreadCount(updatedUnreadCount);
      } catch (notificationError) {
        console.warn(
          "Failed to create catch-all error notification:",
          notificationError
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };
  const getCategoryByName = async (categoryName) => {
    try {
      const category = await getCategoriesByName(categoryName); // Changed to getCategoriesByName
      return category?.[0]?.$id || null; // Access the first item if found
    } catch (e) {
      console.log("getCategoriesByName error", e);
      return null;
    }
  };

  const getSubcategoryByName = async (subcategoryName) => {
    try {
      const subcategory = await getSubcategoriesByName(subcategoryName); // Changed to getSubcategoriesByName
      return subcategory?.[0]?.$id || null; // Access the first item if found
    } catch (e) {
      console.log("getSubcategoriesByName error", e);
      return null;
    }
  };

  return (
    <View className=" px-2 pt-10 pb-2  max-h-[90vh] bg-[#cccccd] ">
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 1,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={true}
        // style={{ borderColor: 'red', borderWidth: 1 }}
      >
        {extractedData && (
          <>
            <Text className="text-xl text-black font-pbold text-center mb-2 mt-4 ">
              {
                hasSaved && isProcessing // If hasSaved is true and still processing
                  ? "♥️ Saving your receipt"
                  : "Reciept Extracted Successfuly" // After extraction, before saving or if save failed
              }
            </Text>
            {/* <Image
              source={images.success}
              className=" w-16 h-16 right-1 "
              resizeMode="contain"
            /> */}
          </>
        )}

        {/* The full image view and processing/action buttons before data extraction */}
        {!extractedData && (
          <>
            <TouchableOpacity
              onPress={() => setShowFullImage(true)}
              className="relative w-full"
            >
              <Image
                source={{ uri: imageUri }}
                resizeMode="contain"
                className="w-full aspect-[5/6] mb-1 mt-4 rounded-3xl"
              />
              <View className="absolute bottom-36 right-2 bg-black/70 px-2 py-1 rounded">
                <Text className="font-psemibold text-base text-white">
                  Tap to view full
                </Text>
              </View>
            </TouchableOpacity>

            {isProcessing ? (
              <View className="items-center mt-6 mb-6">
                <ActivityIndicator size="large" color="#ef6969" />
                <Text className="mt-2 font-psemibold text-black/70">
                  {`Processing...\n Our platform uses advanced AI to automatically extract key details from your uploaded receipt.`}
                </Text>
              </View>
            ) : (
              <View className="flex-row justify-center items-center gap-6 mt-4 mb-6">
                {/* Cancel Button - Hidden when hasSaved is true */}
                {!hasSaved && (
                  <TouchableOpacity onPress={onCancel}>
                    <View className="items-center">
                      <Image
                        source={images.cancel}
                        resizeMode="contain"
                        className="w-[50px] h-[50px] rounded-full p-1 border-2 border-red-400 opacity-90"
                      />
                      <Text className="mt-1 font-pregular text-sm text-black/80">
                        Cancel
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={handleProcessReceipt}>
                  <View className="items-center">
                    <Image
                      source={images.confirm}
                      resizeMode="contain"
                      className="w-[50px] h-[50px] rounded-full p-1 border-2 border-green-500 opacity-90"
                    />
                    <Text className="mt-1 font-pregular text-sm text-black/80">
                      Process
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Extracted Data Display - Hidden when hasSaved is true */}
        {extractedData && !hasSaved && (
          <>
            <View className="w-full mt-2 px-8 py-1 rounded-xl mb-2">
              {extractedData.merchant && !showAllItems && (
                <Text className="text-blue-900 font-psemibold mb-3 text-base">
                  <Text className="text-black font-semibold text-base ">
                    🏪 Merchant →
                  </Text>{" "}
                  {extractedData.merchant}
                </Text>
              )}

              {extractedData.location &&
                !showAllItems &&
                (extractedData.location.address ||
                  extractedData.location.city ||
                  extractedData.location.country) && (
                  <Text className="text-blue-900 font-psemibold mb-3 text-base">
                    <Text className="text-black font-pbold text-base">
                      📍 Location →
                    </Text>
                    <Text>
                      {[
                        extractedData.location.address,
                        extractedData.location.city,
                        extractedData.location.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                  </Text>
                )}

              {extractedData.datetime && !showAllItems && (
                <Text className="text-blue-900 font-psemibold mb-3 text-base">
                  <Text className="text-black font-pbold text-base">
                    📅 Date →
                  </Text>{" "}
                  {(() => {
                    const dateTimeString = extractedData.datetime;
                    const localDateTimeString = dateTimeString.endsWith("Z")
                      ? dateTimeString.slice(0, -1) // Remove 'Z'
                      : dateTimeString;

                    const displayDate = new Date(localDateTimeString);

                    return (
                      <>
                        {displayDate.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        {displayDate.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </>
                    );
                  })()}
                </Text>
              )}

              {extractedData.items.length > 0 && !showAllItems && (
                <View>
                  <Text className="font-pbold text-base text-black mb-1 ">
                    🗂️ Category:
                  </Text>
                  <Text className="text-base text-green-900 ml-4 mb-2 font-psemibold">
                    {extractedData.items[0].category || "Unknown"} →{" "}
                    {extractedData.items[0].subcategory || "Uncategorized"}
                  </Text>
                </View>
              )}

              {/* Items extracted as collapsed */}
              {extractedData.items?.length > 0 && (
                <View className="mb-3">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-pbold text-base text-blue-700">
                      🛒 Items:
                    </Text>
                    {extractedData.items.length > 2 && ( // CHANGE THIS LINE: 3 is your desired default
                      <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={true}
                      >
                        <TouchableOpacity onPress={toggleItems}>
                          <Text className="font-pbold text-base text-blue-700 ml-1">
                            {showAllItems ? "(▲ Show less)" : "(Show more ▼)"}
                          </Text>
                        </TouchableOpacity>
                      </ScrollView>
                    )}
                  </View>

                  {(showAllItems || extractedData.items.length <= 2 // CHANGE THIS LINE TOO, to match the desired default
                    ? extractedData.items
                    : extractedData.items.slice(0, 2)
                  ).map((item, index) => (
                    <View key={index} className="ml-4 mb-1 p-1 ">
                      <Text className="text-blue-900 font-psemibold text-base">
                        • {item.name || "Unnamed item"} →{" "}
                        <Text className="font-bold text-red-900 text-base">
                          {item.price || "N/A"}
                        </Text>
                      </Text>
                    </View>
                  ))}

                  {extractedData.items.length > 2 && ( // CHANGE THIS LINE: 3 is your desired default
                    <TouchableOpacity onPress={toggleItems}>
                      <Text className="text-blue-700 font-pbold ml-4 mt-1 text-base">
                        {showAllItems
                          ? "▲ Hide Items & Show Details"
                          : "▼ Show All Items"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {/* Subtotal Display */}
              {typeof extractedData.subtotal === "number" &&
                !isNaN(extractedData.vat) &&
                extractedData.subtotal !== 0 &&
                !showAllItems && ( // <--- MODIFIED CONDITION
                  <Text className="text-red-900 text-base font-psemibold mb-1">
                    <Text className="text-black font-pbold text-base">
                      💵 Subtotal →
                    </Text>{" "}
                    {extractedData.subtotal.toFixed(2)}{" "}
                    {/* Added .toFixed(2) for consistent display */}
                  </Text>
                )}
              {/* VAT Display */}
              {typeof extractedData.vat === "number" &&
                !isNaN(extractedData.vat) &&
                extractedData.vat !== 0 &&
                !showAllItems && ( // <--- MODIFIED CONDITION
                  <Text className="text-red-900 text-base font-psemibold mb-1">
                    <Text className="text-black font-pbold text-base">
                      🧾 VAT →
                    </Text>{" "}
                    {extractedData.vat.toFixed(2)}{" "}
                    {/* Added .toFixed(2) for consistent display */}
                  </Text>
                )}
            </View>

            {typeof extractedData.total === "number" &&
              !isNaN(extractedData.total) &&
              extractedData.total !== 0 &&
              !showAllItems && ( // <--- MODIFIED CONDITION
                <Text className="text-red-900 text-base font-psemibold mb-1">
                  <Text className="text-black font-pbold text-base">
                    💰 Total →
                  </Text>{" "}
                  {extractedData.total.toFixed(2)}{" "}
                  {/* Added .toFixed(2) for consistent display */}
                </Text>
              )}

            {/* Consent checkbox */}
            <View className="flex-row items-center mt-4 gap-2 px-4">
              <Checkbox
                value={consentGiven}
                onValueChange={setConsentGiven}
                color={consentGiven ? "#22c55e" : undefined}
              />
              <Text className="text-base text-black/90 font-pregular underline ">
                Your data is saved securely and may be shared anonymized with
                trusted third parties..
              </Text>
            </View>

            {/* Buttons */}
            <View className="flex-row justify-center items-center gap-6 mt-0 mb-1">
              {/* Cancel Button - Hidden when hasSaved is true */}
              {!hasSaved && (
                <TouchableOpacity onPress={onCancel}>
                  <View className="items-center">
                    <Image
                      source={images.cancel}
                      resizeMode="contain"
                      className="w-[55px] h-[55px] rounded-full p-1 border-2 border-red-400 opacity-90"
                    />
                    <Text className="mt-1 font-pregular text-sm text-black/80">
                      Cancel
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleSave}>
                <View className="items-center opacity-100">
                  <Image
                    source={images.confirm}
                    resizeMode="contain"
                    className={`w-[58px] h-[58px] rounded-full p-1 border-2 ${
                      consentGiven ? "border-green-500" : "border-gray-300"
                    }`}
                  />
                  <Text className="mt-1 font-pregular text-sm text-black/80">
                    Save
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* This block shows only after save is clicked OR during initial processing */}
        {extractedData &&
          isProcessing &&
          hasSaved && ( // <-- Added hasSaved condition here
            <View className="items-center mt-4 mb-6 px-4">
              <ActivityIndicator size="large" color="#ef6969" />
              <Text className="text-center mt-2 text-black/70 font-pregular">
                Your data is saving securely...
              </Text>
              <Text className="text-center mt-2 text-black/70 font-pregular">
                Please wait while we process your request.
              </Text>
            </View>
          )}
      </ScrollView>

      <ReceiptFull
        imageUri={imageUri}
        visible={showFullImage}
        onClose={() => setShowFullImage(false)}
      />
    </View>
  );
};

export default ReceiptProcess;
