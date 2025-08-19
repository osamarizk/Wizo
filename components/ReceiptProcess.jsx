import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  I18nManager,
} from "react-native";
import React, { useCallback, useState } from "react";
import ReceiptFull from "./ReceiptFull";
import { extractReceiptData } from "../lib/extractReceiptData";
import images from "../constants/images";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n";
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
import Checkbox from "expo-checkbox";
import { useGlobalContext } from "../context/GlobalProvider";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system"; // for reading the image as blob
import mime from "mime"; // helps get MIME type from file extension
import * as ImageManipulator from "expo-image-manipulator";

import GradientBackground from "./GradientBackground";
import { ar } from "date-fns/locale";
import { format } from "date-fns";

const convertToArabicNumerals = (num) => {
  const numString = String(num);

  if (typeof numString !== "string") return String(numString);

  const arabicNumeralsMap = {
    0: "٠",
    1: "١",
    2: "٢",
    3: "٣",
    4: "٤",
    5: "٥",
    6: "٦",
    7: "٧",
    8: "٨",
    9: "٩",
  };
  return numString.replace(/\d/g, (digit) => arabicNumeralsMap[digit] || digit);
};

const generateTranslationKey = (originalName) => {
  if (!originalName) return "";
  // Convert "Food & Dining" -> "foodDining", "Health & Wellness" -> "healthWellness"
  return originalName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove non-alphanumeric except spaces
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, ""); // Remove all spaces after capitalization
};
const ReceiptProcess = ({ imageUri, onCancel, onProcessComplete }) => {
  const { t } = useTranslation();
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
    preferredCurrencySymbol,
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

  const getTranslatedAiMessage = useCallback(
    (englishMessage) => {
      // Trim whitespace and ensure consistency for comparison
      const cleanedEnglishMessage = englishMessage ? englishMessage.trim() : "";

      const keyMap = {
        // CRITICAL FIX: Match the EXACT string from your API response
        "This image does not appear to be a receipt.":
          "aiMessages.notAReceiptDefault",
        "Image quality too low.": "aiMessages.imageQualityTooLow",
        "No text detected in image.": "aiMessages.noTextDetected",
        "Could not process image.": "aiMessages.couldNotProcessImage",
        "No items found.": "aiMessages.noItemsFound",
        "Missing merchant name.": "aiMessages.missingMerchantName",
        "Failed to extract or detect receipt. Please try again. Details: Empty response from Gemini":
          "aiMessages.geminiEmptyResponse",
        "The model is overloaded. Please try again later.":
          "aiMessages.modelOverloaded",
      };

      console.log(
        "DEBUG: getTranslatedAiMessage - Looking up message:",
        `"${cleanedEnglishMessage}"`
      );
      // console.log('DEBUG: getTranslatedAiMessage - Available keyMap keys:', Object.keys(keyMap)); // Uncomment for deeper debugging

      const translationKey = keyMap[cleanedEnglishMessage];

      // Debugging log: show if a translation key was found
      console.log(
        "DEBUG: getTranslatedAiMessage - Found translation key:",
        translationKey
      );

      // If a mapping exists, translate it. Otherwise, return the original English message as a fallback.
      return translationKey
        ? t(translationKey)
        : t("aiMessages.genericAiError", { message: englishMessage });
    },
    [t]
  );

  const now = new Date();
  const monthOptions = { month: "long" };
  const monthName = now.toLocaleString("default", monthOptions); // 'default' uses the user's default locale

  const currentMonthDate = new Date();
  const currentMonthIndex = currentMonthDate.getMonth();

  const monthNamesEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthNamesAr = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const displayMonthName = t(
    `common.monthNames.${currentMonthIndex}`, // Using a common translation key for month names
    {
      defaultValue: i18n.language.startsWith("ar")
        ? monthNamesAr[currentMonthIndex]
        : monthNamesEn[currentMonthIndex],
    }
  );

  const handleProcessReceipt = async () => {
    if (!user || !applicationSettings) {
      Alert.alert(
        t("common.errorTitle"),
        t("receiptProcess.userSettingsError")
      );
      return;
    }
    const userCurrentReceiptCount = user.currentMonthReceiptCount || 0;
    const freeLimit = applicationSettings.free_tier_receipt_limit;

    if (!user.isPremium && userCurrentReceiptCount >= freeLimit) {
      console.log("Limit reached for free tier:", freeLimit);
      Alert.alert(
        t("receiptProcess.limitReachedTitle"),
        t("receiptProcess.limitReachedMessage", {
          freeLimit: i18n.language.startsWith("ar")
            ? convertToArabicNumerals(freeLimit)
            : freeLimit,
        }),
        [
          {
            text: t("common.later"),
            style: "cancel",
            onPress: () => onCancel(),
          },
          {
            text: t("common.upgradeNow"),
            onPress: () => {
              router.push("/upgrade-premium");
              onCancel();
            },
          },
        ]
      );
      // Notification for Limit Reached
      try {
        await createNotification({
          user_id: user.$id,
          title: t("notifications.receiptUploadLimitReachedTitle"),
          message: t("notifications.receiptUploadLimitReachedMessage", {
            freeLimit: i18n.language.startsWith("ar")
              ? convertToArabicNumerals(freeLimit)
              : freeLimit,
          }),
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
      return;
    }
    // --- END: NEW MONTHLY RECEIPT UPLOAD LIMIT CHECK ---

    try {
      setIsProcessing(true);
      const data = await extractReceiptData(imageUri);

      // Check if it's not a receipt
      if (!data.isReceipt) {
        const displayMessage = data.message
          ? getTranslatedAiMessage(data.message)
          : t("receiptProcess.notAReceiptMessage"); // Fallback if data.message is null/empty

        // --- FIXED: Dynamically choose alert title based on message content ---
        let alertTitle;
        // If the message indicates a technical AI issue (like overload or empty response),
        // use a more general "AI Processing Error" title.
        if (
          data.message &&
          (data.message.includes("overloaded") ||
            data.message.includes("Empty response from Gemini"))
        ) {
          alertTitle = t("receiptProcess.aiProcessingErrorTitle"); // NEW translation key
        } else {
          // Otherwise, it's genuinely "not a receipt" or a general AI message
          alertTitle = t("receiptProcess.notAReceiptTitle");
        }

        Alert.alert(alertTitle, displayMessage); // <-- UPDATED Alert.alert call
        // --- END FIXED ---
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
      Alert.alert(
        t("common.successTitle"),
        t("receiptProcess.processedSuccess")
      );
    } catch (error) {
      console.error("Receipt extraction failed:", error); // Keep detailed log for debugging

      // --- FIXED: Use getTranslatedAiMessage for more specific AI errors ---
      let displayMessage;
      if (error && error.message) {
        // Attempt to get a specific translation for the AI error message
        displayMessage = getTranslatedAiMessage(error.message);
      } else {
        // Fallback for generic or unknown errors
        displayMessage = t("receiptProcess.generalProcessingError"); // New translation key needed
      }

      Alert.alert(t("common.errorTitle"), displayMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSave = async () => {
    console.log("extractedData", extractedData);
    if (!consentGiven) {
      Alert.alert(
        t("receiptProcess.consentRequiredTitle"),
        t("receiptProcess.consentRequiredMessage")
      );
      return;
    }

    if (!extractedData || !imageUri || !user) {
      Alert.alert(t("common.errorTitle"), t("receiptProcess.missingData"));
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
        t("receiptProcess.duplicateTitle"),
        t("receiptProcess.duplicateMessage", {
          merchant: extractedData.merchant || t("common.unknownMerchant"),
          // Ensure date format uses the correct locale and translated format string
          date: format(
            new Date(extractedData.datetime),
            t("common.dateFormatShort"),
            { locale: i18n.language.startsWith("ar") ? ar : undefined }
          ),
        }),
        [
          {
            text: t("common.ok"),
            onPress: () => onProcessComplete?.(),
          },
        ]
      );

      try {
        await createNotification({
          user_id: user.$id,
          title: t("notifications.duplicateReceiptDetectedTitle"),
          message: t("notifications.duplicateReceiptDetectedMessage", {
            merchant: extractedData.merchant || t("common.unknownMerchant"),
            date: format(
              new Date(extractedData.datetime),
              t("common.dateFormatShort"),
              { locale: i18n.language.startsWith("ar") ? ar : undefined }
            ),
          }),
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

          // Check the receipt part of the response
          Alert.alert(
            t("common.successTitle"),
            t("receiptProcess.savedSuccess"),
            [
              {
                text: t("common.ok"),
                onPress: () => {
                  onProcessComplete?.(); // Call onProcessComplete after OK is pressed
                },
              },
            ]
          );
        } else {
          setTimeout(async () => {
            await checkSessionAndFetchUser();
          }, 300);

          console.warn(
            "freshUser was null after createReceipt. Triggering full user refresh."
          );
        }

        await createNotification({
          user_id: user.$id,
          title: t("notifications.receiptProcessedTitle"),
          message: t("notifications.receiptProcessedMessage", {
            merchant: extractedData.merchant || t("common.unknown"),
            total: (extractedData.total || 0).toFixed(2), // Total is a number, keep as is for message template
          }),
          receipt_id: newReceipt.$id,
          type: "receipt",
          expiresAt: getFutureDate(7),
        });

        const pointsEarned = 0;
        await updateUserPoints(user.$id, pointsEarned, "receipt_upload");

        const earnedBadges = await checkAndAwardBadges(user.$id);
        if (earnedBadges.length > 0) {
          const badgeNames = earnedBadges.map((badge) => badge.name).join(", ");
          const pointsExtra = earnedBadges
            .map((badge) => badge.points_reward)
            .join(", ");
          Alert.alert(
            t("notifications.achievementUnlockedTitle"), // Translated "Achievement Unlocked!"
            t("notifications.achievementUnlockedMessage", {
              badgeNames,
              pointsExtra,
            }) // Translated with interpolation
          );

          await createNotification({
            user_id: user.$id,
            title: t("notifications.achievementUnlockedTitle"), // Translated
            message: t("notifications.achievementUnlockedMessage", {
              badgeNames,
              pointsExtra,
            }), // Translated with interpolation
            type: "points_award",
            expiresAt: getFutureDate(7),
          });
        }

        const updatedUnreadCount = await countUnreadNotifications(user.$id);
        updateUnreadCount(updatedUnreadCount);
        onCancel();

        onProcessComplete?.();
      } else {
        Alert.alert(t("common.errorTitle"), t("receiptProcess.saveFailed"));
        try {
          await createNotification({
            user_id: user.$id,
            title: t("notifications.receiptSaveFailedTitle"),
            message: t("notifications.receiptSaveFailedMessage", {
              merchant: extractedData.merchant || t("common.unknown"),
            }),
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
      Alert.alert(t("common.errorTitle"), t("receiptProcess.generalSaveError"));
      setHasSaved(false);
      try {
        await createNotification({
          user_id: user.$id,
          title: t("notifications.receiptProcessingErrorTitle"),
          message: t("notifications.receiptProcessingErrorMessage", {
            errorMessage: error.message || t("common.unknownError"),
          }),
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
    <View className=" px-5 pt-10 pb-2  max-h-[92vh] bg-[#cccccc]">
      {!extractedData &&
        !isProcessing &&
        !hasSaved && ( // Ensure it only shows when relevant
          <View
            className={`absolute z-10 top-4 ${
              I18nManager.isRTL ? "left-4" : "right-4"
            }`}
          >
            <TouchableOpacity onPress={onCancel}>
              <View className="items-center">
                <Image
                  source={images.cancel}
                  resizeMode="contain"
                  className="w-[40px] h-[40] rounded-full p-1 border-2 border-red-600 opacity-90"
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

      {extractedData && (
        <View
          className={`absolute z-10 top-3 ${
            I18nManager.isRTL ? "left-3" : "right-3"
          }`}
        >
          <TouchableOpacity onPress={onCancel}>
            <View className="items-center">
              <Image
                source={images.cancel}
                resizeMode="contain"
                className="w-[40px] h-[40px] rounded-full p-1 border-2 border-red-600 "
              />
            </View>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 1,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {extractedData && (
          <>
            <Text
              className={`text-lg text-black text-center mb-1 mt-2 ${getFontClassName(
                "bold"
              )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {hasSaved && isProcessing
                ? t("receiptProcess.savingReceipt")
                : t("receiptProcess.extractedSuccess")}
            </Text>

            {/* <Image
              source={images.success}
              className=" w-16 h-16 right-1 "
              resizeMode="contain"
            /> */}
          </>
        )}

        {!extractedData && (
          <>
            <TouchableOpacity
              onPress={() => setShowFullImage(true)}
              className="relative w-full"
            >
              <Image
                source={{ uri: imageUri }}
                resizeMode="contain"
                className="w-full aspect-[5/6] mb-1 mt-6 rounded-3xl"
              />

              <View
                className={`absolute bottom-36 ${
                  I18nManager.isRTL ? "left-2 right-auto" : "right-2"
                } bg-black/70 px-2 py-1 rounded`}
              >
                <Text
                  className={`text-sm text-white ${getFontClassName(
                    "semibold"
                  )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {t("receiptProcess.tapToViewFull")}
                </Text>
              </View>
            </TouchableOpacity>

            {isProcessing ? (
              <View className="items-center mt-6 mb-6">
                <ActivityIndicator size="large" color="#ef6969" />
                <Text
                  className={`mt-2 text-black/70 text-center ${getFontClassName(
                    "semibold"
                  )}`}
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {t("receiptProcess.processingMessage")}
                </Text>
              </View>
            ) : (
              <View className="flex-row justify-center items-center gap-6 mt-2 mb-6">
                <TouchableOpacity onPress={handleProcessReceipt}>
                  <View className="items-center">
                    <Image
                      source={images.confirm}
                      resizeMode="contain"
                      className="w-[40px] h-[40px] rounded-full p-1 border-2 border-green-800 opacity-90"
                    />
                    <Text
                      className={`mt-1 text-sm text-black/80 ${getFontClassName(
                        "regular"
                      )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                      style={{ fontFamily: getFontClassName("regular") }}
                    >
                      {t("receiptProcess.process")}
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
            <View className="w-full mt-2 px-4 py-1 rounded-xl mb-1">
              {/* Merchant Display */}
              {extractedData.merchant && !showAllItems && (
                <Text
                  className={`text-blue-900 mb-3 text-sm ${getFontClassName(
                    "semibold"
                  )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  <Text
                    className={`text-black text-md ${getFontClassName(
                      "semibold"
                    )}`}
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    🏪 {t("receiptProcess.merchant")}
                    {" : "}
                  </Text>
                  {extractedData.merchant}
                </Text>
              )}

              {extractedData.location &&
                !showAllItems &&
                (extractedData.location.address ||
                  extractedData.location.city ||
                  extractedData.location.country) && (
                  <Text
                    className={`text-blue-900 mb-3 text-sm ${getFontClassName(
                      "semibold"
                    )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    <Text
                      className={`text-black text-sm ${getFontClassName(
                        "semibold"
                      )}`}
                      style={{ fontFamily: getFontClassName("semibold") }}
                    >
                      📍 {t("receiptProcess.location")}
                      {" : "}
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

              {/* Date & Time Display */}
              {extractedData.datetime && !showAllItems && (
                <Text
                  className={`text-blue-900 mb-3 text-sm ${getFontClassName(
                    "semibold"
                  )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  <Text
                    className={`text-black text-sm ${getFontClassName(
                      "semibold"
                    )}`}
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    📅 {t("receiptProcess.date")}
                    {" : "}
                  </Text>
                  {(() => {
                    const dateTimeString = extractedData.datetime;
                    const localDateTimeString = dateTimeString.endsWith("Z")
                      ? dateTimeString.slice(0, -1)
                      : dateTimeString;

                    const displayDate = new Date(localDateTimeString);

                    // CRITICAL: Use `ar` as the locale object if language is Arabic
                    const currentLocale = i18n.language.startsWith("ar")
                      ? ar
                      : undefined; // <--- CHANGED FROM 'ro' TO 'ar'

                    // Debugging: Log the locale being used and the raw date string
                    console.log(
                      "DEBUG Date Formatting: Current i18n Language:",
                      i18n.language
                    );
                    console.log(
                      "DEBUG Date Formatting: Resolved Date-fns Locale:",
                      currentLocale ? currentLocale.code : "Default/Undefined"
                    );
                    console.log(
                      "DEBUG Date Formatting: Date String:",
                      dateTimeString
                    );

                    const formattedDate = format(
                      displayDate,
                      t("common.dateFormatShort"),
                      { locale: currentLocale }
                    );
                    const formattedTime = format(
                      displayDate,
                      t("common.timeFormatShort"),
                      { locale: currentLocale }
                    );

                    return (
                      <>
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(formattedDate)
                          : formattedDate}{" "}
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(formattedTime)
                          : formattedTime}
                      </>
                    );
                  })()}
                </Text>
              )}

              {extractedData.items.length > 0 && !showAllItems && (
                <View
                  className={`${
                    I18nManager.isRTL ? "items-end" : "items-start"
                  }`}
                >
                  <Text
                    className={`text-sm text-black mb-1 ${getFontClassName(
                      "bold"
                    )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    🗂️ {t("receiptProcess.category")}:{" "}
                    <Text
                      className={`text-sm text-red-900 ml-4 mb-2 ${getFontClassName(
                        "semibold"
                      )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                      style={{ fontFamily: getFontClassName("semibold") }}
                    >
                      {t(
                        `categories.${generateTranslationKey(
                          extractedData.items[0].category || t("common.unknown")
                        )}`,
                        {
                          defaultValue:
                            extractedData.items[0].category ||
                            t("common.unknown"),
                        }
                      )}
                      {" : "}

                      {t(
                        `subcategories.${generateTranslationKey(
                          extractedData.items[0].subcategory ||
                            t("common.uncategorized")
                        )}`,
                        {
                          defaultValue:
                            extractedData.items[0].subcategory ||
                            t("common.uncategorized"),
                        }
                      )}
                    </Text>
                  </Text>
                </View>
              )}

              {/* Items extracted as collapsed */}
              {extractedData.items?.length > 0 && (
                <View className="mb-3 w-full">
                  <View
                    className={`flex-row items-center mb-1 ${
                      I18nManager.isRTL
                        ? "flex-row-reverse justify-end"
                        : "justify-start"
                    }`}
                  >
                    <Text
                      className={`text-sm text-blue-700 ${getFontClassName(
                        "bold"
                      )}`}
                      style={{ fontFamily: getFontClassName("semibold") }}
                    >
                      🛒 {t("receiptProcess.items")}:
                    </Text>
                    {extractedData.items.length > 2 && ( // Default showing 2 items initially
                      <ScrollView
                        className="flex-1"
                        horizontal={I18nManager.isRTL} // Scroll horizontally in RTL if needed for "Show more" text
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                      >
                        <TouchableOpacity onPress={toggleItems}>
                          <Text
                            className={`text-sm text-blue-700 ${
                              I18nManager.isRTL ? "mr-1" : "ml-1"
                            } ${getFontClassName("semibold")} ${
                              I18nManager.isRTL ? "text-right" : "text-left"
                            }`}
                            style={{ fontFamily: getFontClassName("semibold") }}
                          >
                            {showAllItems
                              ? t("receiptProcess.showLess")
                              : t("receiptProcess.showMore")}{" "}
                          </Text>
                        </TouchableOpacity>
                      </ScrollView>
                    )}
                  </View>

                  {(showAllItems || extractedData.items.length <= 2 // Default showing 2 items initially
                    ? extractedData.items
                    : extractedData.items.slice(0, 2)
                  ).map((item, index) => (
                    <View
                      key={index}
                      className={`mb-1 p-1 ${
                        I18nManager.isRTL ? "items-end" : "items-start"
                      }`}
                    >
                      <Text
                        className={`text-blue-900 text-sm ${getFontClassName(
                          "semibold"
                        )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                        style={{ fontFamily: getFontClassName("semibold") }}
                      >
                        • {item.name || t("receiptProcess.unnamedItem")}
                        {" : "}
                        <Text
                          className={`text-red-900 text-sm ${getFontClassName(
                            "semibold"
                          )}`}
                          style={{
                            fontFamily: getFontClassName("semibold"),
                            textAlign: i18n.language.startsWith("ar")
                              ? "right"
                              : "left",
                          }}
                        >
                          {i18n.language.startsWith("ar")
                            ? convertToArabicNumerals(item.price || 0)
                            : (item.price || 0).toFixed(2)}{" "}
                          {preferredCurrencySymbol}{" "}
                        </Text>
                      </Text>
                    </View>
                  ))}

                  {extractedData.items.length > 2 && ( // Default showing 2 items initially
                    <TouchableOpacity
                      onPress={toggleItems}
                      className={`${
                        I18nManager.isRTL ? "items-end" : "items-start"
                      }`}
                    >
                      <Text
                        className={`text-blue-700 mt-1 text-sm ${getFontClassName(
                          "bold"
                        )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                        style={{ fontFamily: getFontClassName("bold") }}
                      >
                        {showAllItems
                          ? t("receiptProcess.hideItemsShowDetails")
                          : t("receiptProcess.showAllItems")}{" "}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Subtotal Display */}
              {typeof extractedData.subtotal === "number" &&
                !isNaN(extractedData.subtotal) &&
                extractedData.subtotal !== 0 &&
                !showAllItems && (
                  <Text
                    className={`text-red-900 text-sm mb-1 ${getFontClassName(
                      "semibold"
                    )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    <Text
                      className={`text-black text-sm ${getFontClassName(
                        "bold"
                      )}`}
                      style={{ fontFamily: getFontClassName("bold") }}
                    >
                      💵 {t("receiptProcess.subtotal")}
                      {" : "}
                    </Text>{" "}
                    {i18n.language.startsWith("ar")
                      ? convertToArabicNumerals(
                          extractedData.subtotal.toFixed(2)
                        )
                      : extractedData.subtotal.toFixed(2)}{" "}
                    {preferredCurrencySymbol}
                  </Text>
                )}
              {/* VAT Display */}
              {typeof extractedData.vat === "number" &&
                !isNaN(extractedData.vat) &&
                extractedData.vat !== 0 &&
                !showAllItems && (
                  <Text
                    className={`text-red-900 text-sm mb-1 ${getFontClassName(
                      "semibold"
                    )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    <Text
                      className={`text-black text-sm ${getFontClassName(
                        "bold"
                      )}`}
                      style={{ fontFamily: getFontClassName("bold") }}
                    >
                      🧾 {t("receiptProcess.vat")}
                      {" : "}
                    </Text>{" "}
                    {i18n.language.startsWith("ar")
                      ? convertToArabicNumerals(extractedData.vat.toFixed(2))
                      : extractedData.vat.toFixed(2)}{" "}
                    {preferredCurrencySymbol}
                  </Text>
                )}
            </View>

            {/* Total Display */}
            {typeof extractedData.total === "number" &&
              !isNaN(extractedData.total) &&
              extractedData.total !== 0 &&
              !showAllItems && (
                <Text
                  className={`text-red-900 text-sm mb-4 ${getFontClassName(
                    "semibold"
                  )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                  style={{ fontFamily: getFontClassName("bold") }}
                >
                  <Text
                    className={`text-black text-sm ${getFontClassName("bold")}`}
                    style={{ fontFamily: getFontClassName("bold") }}
                  >
                    💰 {t("receiptProcess.total")}
                    {" : "}
                  </Text>{" "}
                  {i18n.language.startsWith("ar")
                    ? convertToArabicNumerals(extractedData.total.toFixed(2))
                    : extractedData.total.toFixed(2)}{" "}
                  {preferredCurrencySymbol}
                </Text>
              )}

            {/* Consent checkbox */}
            <View
              className={`flex-row items-center mt-6 mb-2 px-1 gap-2 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Checkbox
                value={consentGiven}
                onValueChange={setConsentGiven}
                color={consentGiven ? "#22c55e" : undefined} // Use green-500 equivalent
                className="rounded-sm" // Small border radius for checkbox
              />

              <Text
                className={`flex-1 ${
                  I18nManager.isRTL ? "mr-2" : "ml-2"
                } text-gray-700 text-sm ${getFontClassName("regular")} ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`}
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {" "}
                {t("receiptProcess.consentMessage")}
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              className={`bg-[#621562] py-3 rounded-md shadow-md w-full mt-4 mb-8 ${
                isProcessing && hasSaved ? "opacity-50" : ""
              }`}
              disabled={isProcessing && hasSaved} // Disable if saving
            >
              <Text
                className={`text-white text-center ${getFontClassName(
                  "semibold"
                )}`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {isProcessing && hasSaved
                  ? t("receiptProcess.saving")
                  : t("receiptProcess.save")}{" "}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* This block shows only after save is clicked OR during initial processing */}
        {extractedData &&
          isProcessing &&
          hasSaved && ( // Corrected condition: shows if data extracted, processing, AND saving has started
            <View className="items-center mt-4 mb-6 px-4">
              <ActivityIndicator size="large" color="#ef6969" />
              <Text
                className={`text-center mt-2 text-black/70 ${getFontClassName(
                  "regular"
                )}`}
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("receiptProcess.dataSavingSecurely")}
              </Text>
              <Text
                className={`text-center mt-2 text-black/70 ${getFontClassName(
                  "regular"
                )}`}
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("receiptProcess.pleaseWaitProcessing")}
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
