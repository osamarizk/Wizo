import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert, // Keep Alert for now as it's used in your provided code
  Pressable,
  StyleSheet,
  Platform,
  Image,
  I18nManager, // Import I18nManager for RTL checks
} from "react-native";
import icons from "../constants/icons";

// Ensure you have `editReceipt` imported from your appwrite library
import { editReceipt } from "../lib/appwrite";

// NEW: Import translation and font utilities
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n"; // Import i18n to check current language

// Assuming convertToArabicNumerals is available, or define it locally:
const convertToArabicNumerals = (num) => {
  const numString = String(num || 0); // Defensive check
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
  return originalName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove non-alphanumeric except spaces
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, ""); // Remove all spaces after capitalization
};
const EditReceiptModal = ({
  isVisible,
  onClose,
  initialReceiptData,
  onSaveSuccess,
}) => {
  const { t } = useTranslation(); // Initialize translation hook

  const [merchant, setMerchant] = useState("");
  const [total, setTotal] = useState("");
  const [items, setItems] = useState([]); // To display items read-only
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isVisible && initialReceiptData) {
      setMerchant(initialReceiptData.merchant || "");
      setTotal(initialReceiptData.total?.toString() || "");

      if (typeof initialReceiptData.items === "string") {
        try {
          setItems(JSON.parse(initialReceiptData.items));
        } catch (e) {
          console.error(
            "EditReceiptModal: Error parsing receipt items string:",
            e,
            initialReceiptData.items
          );
          setItems([]); // Fallback to empty array on parse error
        }
      } else if (Array.isArray(initialReceiptData.items)) {
        setItems(initialReceiptData.items);
      } else {
        setItems([]);
      }

      setError(null);
      setHasChanges(false);
    }
  }, [isVisible, initialReceiptData]);

  useEffect(() => {
    if (isVisible && initialReceiptData) {
      const currentMerchant = merchant.trim();
      const currentTotal = parseFloat(total);
      const initialTotal = parseFloat(initialReceiptData.total);

      // Check if current values are different from initial values
      const merchantChanged =
        currentMerchant !== (initialReceiptData.merchant || "");
      const totalChanged =
        !isNaN(currentTotal) && currentTotal !== initialTotal;

      setHasChanges(merchantChanged || totalChanged);
    }
  }, [merchant, total, initialReceiptData, isVisible]);

  const handleSave = async () => {
    if (!initialReceiptData?.$id) {
      setError(t("editReceipt.errorMissingData")); // Translated
      return;
    }
    if (!merchant.trim()) {
      setError(t("editReceipt.errorMerchantEmpty")); // Translated
      return;
    }
    const parsedTotal = parseFloat(total);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setError(t("editReceipt.errorTotalInvalid")); // Translated
      return;
    }

    if (!hasChanges) {
      Alert.alert(t("common.infoTitle"), t("editReceipt.noChangesMade")); // NEW: Inform user no changes
      onClose(); // Just close the modal if no changes
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedFields = {
        merchant: merchant.trim(),
        total: parsedTotal,
      };

      await editReceipt(initialReceiptData.$id, updatedFields);

      Alert.alert(t("common.successTitle"), t("editReceipt.saveSuccess")); // Translated
      onSaveSuccess();
    } catch (e) {
      console.error("Failed to save receipt edits:", e);
      setError(
        t("editReceipt.saveFailed", {
          message: e.message || t("common.unknownError"),
        })
      ); // Translated
      Alert.alert(
        t("common.errorTitle"), // Translated
        t("editReceipt.saveFailedAlert", {
          message: e.message || t("common.unknownError"),
        }) // Translated
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/50"
        onPress={onClose}
      >
        <View
          className="bg-white rounded-lg p-6 w-[90%] max-h-[80%] shadow-lg "
          onStartShouldSetResponder={(event) => true} // Prevent parent Pressable from closing
        >
          <TouchableOpacity
            className="absolute top-3 right-3 p-2 rounded-full z-10" // Added z-10 to ensure it's clickable
            onPress={onClose}
          >
            <Image
              source={icons.close}
              className="w-6 h-6"
              resizeMode="contain"
              tintColor={"#999"} // Adjusted tint color for better visibility
            />
          </TouchableOpacity>

          {/* Modal Title */}
          <Text
            className="text-2xl text-gray-800 mb-6 text-center"
            style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
          >
            {t("editReceipt.editReceipt")}
          </Text>

          {/* Error Message */}
          {error && (
            <Text
              className="text-red-500 text-center mb-3"
              style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
            >
              {error}
            </Text>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text
                className={`text-base text-gray-700 mb-1 ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`} // Align label text
                style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
              >
                {t("editReceipt.merchantName")}:
              </Text>
              <TextInput
                className={`border border-gray-300 rounded-md p-3 text-base bg-gray-50 ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align input text
                }`}
                style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                value={merchant}
                onChangeText={setMerchant}
                placeholder={t("editReceipt.enterMerchantName")} // Translated
                placeholderTextColor="#999"
              />
            </View>

            <View className="mb-4">
              <Text
                className={`text-base text-gray-700 mb-1 ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`} // Align label text
                style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
              >
                {t("editReceipt.totalAmount")}:
              </Text>
              <TextInput
                className={`border border-gray-300 rounded-md p-3 text-base bg-gray-50 ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align input text
                }`}
                style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                value={total}
                onChangeText={setTotal}
                placeholder={t("editReceipt.enterTotalAmount")} // Translated
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {items.length > 0 && (
              <View className="mb-4">
                <Text
                  className={`text-base text-gray-700 mb-2 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`} // Align label text
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                >
                  {t("editReceipt.itemsReadOnly")}:
                </Text>
                {items.map((item, index) => (
                  <View
                    key={index}
                    className={`flex-row justify-between items-center bg-gray-100 p-2 rounded-md mb-1 ${
                      I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Text
                      className={`flex-1 text-sm text-gray-800 ${
                        I18nManager.isRTL ? "text-right" : "text-left"
                      }`}
                      style={{ fontFamily: getFontClassName("regular") }}
                    >
                      {item.name || t("common.unnamedItem")}
                      {item.category && (
                        <Text
                          className={`text-gray-500 text-xs ${
                            I18nManager.isRTL ? "text-right" : "text-left"
                          }`}
                          style={{ fontFamily: getFontClassName("regular") }}
                        >
                          (
                          {t(
                            `categories.${generateTranslationKey(
                              item.category
                            )}`,
                            { defaultValue: item.category }
                          )}
                          )
                        </Text>
                      )}
                    </Text>

                    <Text
                      className={`text-sm text-gray-800 ${
                        I18nManager.isRTL ? "text-left" : "text-right"
                      }`}
                      style={{ fontFamily: getFontClassName("semibold") }}
                    >
                      {item.price
                        ? `${t("common.currency_symbol_short")} ${
                            i18n.language.startsWith("ar")
                              ? convertToArabicNumerals(
                                  parseFloat(item.price).toFixed(2)
                                )
                              : parseFloat(item.price).toFixed(2)
                          }`
                        : t("common.notAvailableShort")}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={handleSave}
            className={`mt-4 w-full bg-[#4E17B3] rounded-md p-3 items-center justify-center ${
              isSaving ? "opacity-70" : ""
            }`}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                className="text-white text-base"
                style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
              >
                {t("editReceipt.saveChanges")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // You can remove styles.centeredView if the Tailwind class is sufficient
  // centeredView: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
});

export default EditReceiptModal;
