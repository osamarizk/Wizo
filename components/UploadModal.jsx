import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  Platform,
  I18nManager, // NEW: Import I18nManager
} from "react-native";
import icons from "../constants/icons";
import { pickImageFromCamera, pickImageFromGallery } from "../lib/imagePicker";
import ReceiptProcess from "../components/ReceiptProcess";
import { router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { getReceiptStats } from "../lib/appwrite";
import { useFocusEffect } from "@react-navigation/native";

// NEW: Import i18n related hooks/objects and font utility
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n"; // Used for conditional numeral conversion

// Make sure `convertToArabicNumerals` is accessible here.
// It should be defined outside your functional components, e.g., in a utils file or at the top of Home.jsx if it's there.
// If it's not globally available, you might need to import it or pass it.
// Assuming it's either in this file (above this component) or a common utility.

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

const UploadModal = ({ visible, onClose, onUploadSuccess }) => {
  const [receiptStats, setReceiptStats] = useState({
    totalCount: 0,
    thisMonthCount: 0,
    monthlySpending: 0,
    latestDate: "N/A",
  });
  const { user } = useGlobalContext();
  const { t } = useTranslation(); // NEW: Initialize translation hook

  // Memoize fetchRecieptStats to ensure stable function reference for useCallback dependency
  const fetchRecieptStats = useCallback(async () => {
    try {
      const recieptData = await getReceiptStats(user.$id);
      setReceiptStats(recieptData);
    } catch (error) {
      console.error("Error fetching receipt stats in UploadModal:", error);
      // Optionally handle error state or show a message
    }
  }, [user?.$id]); // Dependency on user.$id

  useEffect(() => {
    if (user?.$id) {
      fetchRecieptStats();
    }
  }, [user?.$id, fetchRecieptStats]); // Add fetchRecieptStats as dependency

  useFocusEffect(
    useCallback(() => {
      if (user?.$id) {
        fetchRecieptStats();
      }
    }, [fetchRecieptStats])
  );

  const handleCancel = () => {
    setSelectedImageUri(null);
    onClose(); // Close the modal and reset state via onClose callback
  };

  const handleSelect = async (pickerFunc) => {
    const uri = await pickerFunc();

    if (uri) {
      setSelectedImageUri(uri);
    }
  };

  const handleProcessComplete = () => {
    onUploadSuccess?.(); // Call the parent's (home.jsx's) success handler
    onClose(); // Close the modal
    setTimeout(() => {
      setSelectedImageUri(null);
    }, 200);
  };

  const [selectedImageUri, setSelectedImageUri] = useState(null); // Keep this useState here

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Background that listens to taps to dismiss */}
      <Pressable
        onPress={handleCancel}
        className="flex-1 bg-black/40 justify-end"
      >
        {/* This blocks background tap propagation */}
        <Pressable onPress={() => {}} className="mt-auto mb-[17vh] px-3 pt-2 ">
          {!selectedImageUri ? (
            <View className="bg-onboarding px-4 pt-2 pb-2 border ">
              <View className="px-2 border-2 border-secondary mb-5 mt-3">
                <View className="flex-row items-center justify-between h-[7vh] gap-2 px-4">
                  {/* "Uploaded Receipts #" text with dynamic font and alignment */}
                  <Text
                    className={`text-base text-gray-700 ${getFontClassName(
                      "bold"
                    )} ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                    style={{ fontFamily: getFontClassName("bold") }}
                  >
                    {t("uploadModal.uploadedReceiptsCount")}{" "}
                  </Text>
                  {/* Total Count with dynamic font and conditional Arabic numerals */}
                  <Text
                    className={`text-lg ${getFontClassName("pextrabold")} ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`}
                    style={{ fontFamily: getFontClassName("pextrabold") }}
                  >
                    {" "}
                    {i18n.language.startsWith("ar")
                      ? convertToArabicNumerals(receiptStats?.totalCount || 0)
                      : receiptStats?.totalCount || 0}
                  </Text>
                </View>
              </View>

              {/* "Please select to upload your receipts" text with dynamic font and alignment */}
              <Text
                className={`text-base mb-4 ${getFontClassName("semibold")} ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {t("uploadModal.pleaseSelectToUpload")}
              </Text>

              <View className="flex-row justify-center items-center gap-3 ">
                {/* Camera Button */}
                <TouchableOpacity
                  onPress={() => handleSelect(pickImageFromCamera)}
                  className="flex-row items-center justify-center bg-gray-50 rounded-xl p-1 w-44 gap-1 border-2 border-[#F0F0F2]"
                >
                  <Image
                    source={icons.camera}
                    resizeMode="contain"
                    className="w-10 h-10 mb-2"
                  />
                  {/* Camera button text with dynamic font and alignment */}
                  <Text
                    className={`text-gray-700 ${getFontClassName("semibold")} ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`}
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    {t("uploadModal.camera")}
                  </Text>
                </TouchableOpacity>

                {/* Gallery Button */}
                <TouchableOpacity
                  onPress={() => handleSelect(pickImageFromGallery)}
                  className="flex-row items-center justify-center bg-gray-50 w-40 rounded-xl p-1 gap-1 border-2 border-[#F0F0F2]"
                >
                  <Image
                    source={icons.gallery}
                    resizeMode="contain"
                    className="w-10 h-10 mb-2"
                  />
                  {/* Gallery button text with dynamic font and alignment */}
                  <Text
                    className={`text-gray-700 ${getFontClassName("semibold")} ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`}
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    {t("uploadModal.gallery")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ReceiptProcess
              imageUri={selectedImageUri}
              onCancel={handleCancel}
              onProcessComplete={handleProcessComplete}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default UploadModal;
