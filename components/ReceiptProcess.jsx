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
} from "../lib/appwrite";
import Checkbox from "expo-checkbox"; // Make sure expo-checkbox is installed
import { useGlobalContext } from "../context/GlobalProvider";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system"; // for reading the image as blob
import mime from "mime"; // helps get MIME type from file extension
import GradientBackground from "./GradientBackground";

const ReceiptProcess = ({ imageUri, onCancel, onRefresh }) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const { user, updateUnreadCount } = useGlobalContext();

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

      // --- Start of NEW Item Consolidation Logic ---
      if (data.data && data.data.items && data.data.items.length > 0) {
        const originalItems = data.data.items;
        const consolidatedItems = [];

        for (let i = 0; i < originalItems.length; i++) {
          const currentItem = originalItems[i];

          // Check if the current item has a price of 0 and is not the very first item
          if (currentItem.price === 0 && i > 0) {
            // Attempt to append this item's name to the previous item's name
            const lastConsolidatedItem =
              consolidatedItems[consolidatedItems.length - 1];

            if (lastConsolidatedItem) {
              // Append the current item name in parentheses to the previous item's name
              lastConsolidatedItem.name = `${lastConsolidatedItem.name} (${currentItem.name})`;
              // Optionally, you can also transfer category/subcategory if they are missing on the main item
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
              // Fallback: If for some reason there's no previous item (should be rare for add-ons),
              // add it as a standalone item.
              consolidatedItems.push(currentItem);
            }
          } else {
            // If the item has a price > 0, or it's the first item, add it directly
            consolidatedItems.push(currentItem);
          }
        }
        // Update the items in your extractedData with the consolidated list
        data.data.items = consolidatedItems;
      }
      // --- End of NEW Item Consolidation Logic ---

      // Set the extracted data if it is a receipt
      setExtractedData(data.data); // access the inner `data` field

      console.log("Receipt Data", data.data);
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
      Alert.alert("Error", "Missing receipt data or image.");
      return;
    }

    const isDuplicate = await isDuplicateReceipt(
      user.$id,
      extractedData.merchant || "Unknown",
      extractedData.datetime || new Date().toISOString(),
      extractedData.total || 0
    );

    if (isDuplicate) {
      Alert.alert(
        "Duplicate Receipt",
        "This receipt already exists and won't be saved again."
      );
      return;
    }

    try {
      setIsProcessing(true);
      setHasSaved(true); // <-- Set hasSaved to true HERE

      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      const fileUri = fileInfo.uri;
      const fileName = fileUri.split("/").pop();
      const mimeType = mime.getType(fileName); // e.g., "image/jpeg"

      const uploadedFile = await uploadReceiptImage(
        fileUri,
        fileName,
        mimeType
      );
      // 1. Create a Date object from the ISO string
      const receiptDate = new Date(extractedData.datetime);

      // 2. Define options for date formatting (customize as needed)
      const dateOptions = {
        year: "numeric",
        month: "long", // 'numeric', '2-digit', 'short', 'long'
        day: "numeric", // 'numeric', '2-digit'
      };

      // 3. Define options for time formatting (customize as needed)
      const timeOptions = {
        hour: "2-digit", // 'numeric', '2-digit'
        minute: "2-digit", // 'numeric', '2-digit'
        hour12: true, // true for AM/PM, false for 24-hour
      };

      // 4. Format the date and time
      const formattedDate = receiptDate.toLocaleDateString(
        undefined,
        dateOptions
      ); // `undefined` uses default locale
      const formattedTime = receiptDate.toLocaleTimeString(
        undefined,
        timeOptions
      );

      // 2. Process items to include IDs
      const itemsWithIds = await Promise.all(
        extractedData.items.map(async (item) => {
          const categoryId = await getCategoryByName(item.category);
          const subcategoryId = await getSubcategoryByName(item.subcategory);
          return {
            ...item,
            category_id: categoryId,
            subcategory_id: subcategoryId,
            // payment_method: extractedData.paymentMethod || "Unknown",
            // transaction_id: extractedData.transactionId || "Unknown",
            // loyaltyPoints: extractedData.loyaltyPoints || "Unknown",
            // loyaltyProgram: extractedData.loyaltyProgram || "Unknown",
            // notes: extractedData.notes || "Unknown",
          };
        })
      );

      console.log("extracted Receipt Data ....", extractedData);

      const receiptData = {
        user_id: user.$id,
        merchant: extractedData.merchant || "Unknown",
        location: extractedData.location
          ? `${extractedData.location.address}, ${extractedData.location.city}, ${extractedData.location.country}`
          : "Unknown",
        datetime: extractedData.datetime || new Date().toISOString(),
        currency: "EGP",
        subtotal: parseFloat(extractedData.subtotal) || 0,
        vat: parseFloat(extractedData.vat) || 0,
        total: parseFloat(extractedData.total) || 0,
        items: JSON.stringify(itemsWithIds || []),
        cardLastFourDigits: extractedData.cardLastFourDigits || "null",
        cashierId: String(extractedData.cashierId || "null"),
        payment_method: extractedData.paymentMethod || "null",
        storeBranchId: String(extractedData.storeBranchId || "null"), // Convert to string
        transactionId: String(extractedData.transactionId || "null"),
        loyalty_points:
          typeof extractedData.loyaltyPoints === "string"
            ? parseInt(extractedData.loyaltyPoints) // Convert string "0" to number 0 if necessary
            : extractedData.loyaltyPoints || 0,
        notes: extractedData.notes || "null",
        image_file_id: uploadedFile.$id,
        image_type: uploadedFile.mimeType,
        image_size: uploadedFile.sizeOriginal || 0,
        image_url: `https://cloud.appwrite.io/v1/storage/buckets/${uploadedFile.bucketId}/files/${uploadedFile.$id}/view?project=${projectId}`,
      };
      // Save receipt metadata in the database
      const response = await createReceipt(receiptData);

      if (response && response.$id) {
        Alert.alert("Success", "Receipt saved successfully!");
        // Create Receipt Upload notification
        await createNotification({
          user_id: user.$id,
          title: "Receipt Uploaded",
          message: `${user.username} Your receipt was successfully uploaded.`,
          receipt_id: response.$id,
        });
        // --- POINTS & BADGES INTEGRATION START ---
        // 1. Award points for receipt upload
        const pointsEarned = 10; // Example: 10 points per receipt
        await updateUserPoints(user.$id, pointsEarned, "receipt_upload");
        console.log(
          `User ${user.$id} earned ${pointsEarned} points for receipt upload.`
        );

        // 2. Check for badges
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

          // Create Points notification

          await createNotification({
            user_id: user.$id,
            title: "Points Earned",
            message: `${user.username} you earned ${pointsExtra} Extra Points for  ${badgeNames}!`,
            receipt_id: response.$id,
          });
          console.log(`User ${user.$id} earned badges: ${badgeNames}`);
        }
        // --- POINTS & BADGES INTEGRATION END ---

        // Update the unread notification count in the context
        const updatedUnreadCount = await countUnreadNotifications(user.$id); // Fetch updated unread count
        updateUnreadCount(updatedUnreadCount); // Update context with new unread count

        onRefresh();
        onCancel(); // Close the modal
      } else {
        console.error("Invalid response from createReceipt:", response);
        Alert.alert("Error", "Receipt was not saved. Please try again.");
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Could not save receipt.");
      setHasSaved(false); // Reset if save fails
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
    <View className=" px-2 pt-2 pb-1 max-h-[100vh] bg-[#cccccd] ">
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
            <Text className="text-xl text-black font-psemibold text-center mb-2 mt-4 ">
              {
                hasSaved && isProcessing // If hasSaved is true and still processing
                  ? "♥️ Saving your receipt"
                  : "🎉Please confirm Receipt Data" // After extraction, before saving or if save failed
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
            <View className="w-full mt-1 px-8 py-1 rounded-xl mb-2">
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
                      {extractedData.location.address
                        ? extractedData.location.address + ", "
                        : ""}
                      {extractedData.location.city
                        ? extractedData.location.city + ", "
                        : ""}
                      {extractedData.location.country}
                    </Text>
                  </Text>
                )}

              {extractedData.datetime && !showAllItems && (
                <Text className="text-blue-900 font-psemibold mb-3 text-base">
                  <Text className="text-black font-pbold text-base">
                    📅 Date →
                  </Text>{" "}
                  {new Date(extractedData.datetime).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}{" "}
                  {new Date(extractedData.datetime).toLocaleTimeString(
                    undefined,
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
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
                    {extractedData.items.length > 3 && (
                      <TouchableOpacity onPress={toggleItems}>
                        <Text className="font-pbold text-base text-blue-700 ml-1">
                          {showAllItems ? "(▲ Show less)" : "(Show more ▼)"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {(showAllItems || extractedData.items.length <= 2
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

                  {extractedData.items.length > 3 && (
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

              {extractedData.subtotal && !showAllItems && (
                <Text className="text-red-900 text-base font-psemibold mb-1">
                  <Text className="text-black font-pbold text-base">
                    💵 Subtotal →
                  </Text>{" "}
                  {extractedData.subtotal}
                </Text>
              )}
              {extractedData.vat && !showAllItems && (
                <Text className="text-red-900 text-base font-psemibold mb-1">
                  <Text className="text-black font-pbold text-base">
                    🧾 VAT →
                  </Text>{" "}
                  {extractedData.vat}
                </Text>
              )}
            </View>

            {extractedData.total && (
              <Text className="text-blue-900 font-psemibold mb-1 text-xl">
                <Text className="text-black font-pbold text-xl">💰 Total:</Text>{" "}
                {extractedData.total}
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
