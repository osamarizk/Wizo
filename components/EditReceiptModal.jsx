import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet, // For the custom button style
  Platform,
  Image, // Needed for input type number on iOS/Android
} from "react-native";
import icons from "../constants/icons"; // Assuming icons are here

// Ensure you have `editReceipt` imported from your appwrite library
import { editReceipt } from "../lib/appwrite";

const EditReceiptModal = ({
  isVisible,
  onClose,
  initialReceiptData,
  onSaveSuccess,
}) => {
  const [merchant, setMerchant] = useState("");
  const [total, setTotal] = useState("");
  const [items, setItems] = useState([]); // To display items read-only
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (isVisible && initialReceiptData) {
      setMerchant(initialReceiptData.merchant || "");
      setTotal(initialReceiptData.total?.toString() || "");

      // --- FIX START: More robust items parsing ---
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
        setItems(initialReceiptData.items); // Items are already an array, use directly
      } else {
        setItems([]); // Default if items is null or other unexpected type
      }

      setError(null); // Clear previous errors
    }
  }, [isVisible, initialReceiptData]);

  const handleSave = async () => {
    if (!initialReceiptData?.$id) {
      setError("Receipt data is missing. Cannot save.");
      return;
    }
    if (!merchant.trim()) {
      setError("Merchant name cannot be empty.");
      return;
    }
    const parsedTotal = parseFloat(total);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setError("Total must be a valid positive number.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedFields = {
        merchant: merchant.trim(),
        total: parsedTotal,
      };

      // Call the Appwrite function to update the receipt
      await editReceipt(initialReceiptData.$id, updatedFields);

      Alert.alert("Success", "Receipt updated successfully!");
      onSaveSuccess(); // Trigger parent's success handler to refresh data and close modal
    } catch (e) {
      console.error("Failed to save receipt edits:", e);
      setError(`Failed to save: ${e.message || "Unknown error"}`);
      Alert.alert(
        "Error",
        `Failed to save receipt: ${e.message || "Unknown error"}`
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
          className="bg-white rounded-lg p-6 w-[90%] max-h-[80%] shadow-lg"
          onStartShouldSetResponder={(event) => true}
        >
          <TouchableOpacity
            className="absolute top-3 right-3 p-2 rounded-full"
            onPress={onClose}
          >
            <Image
              source={icons.close}
              className="w-6 h-6 tint-gray-600"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text className="text-2xl font-pbold text-gray-800 mb-6 text-center">
            Edit Receipt
          </Text>

          {error && (
            <Text className="text-red-500 font-pmedium text-center mb-3">
              {error}
            </Text>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-base font-pmedium text-gray-700 mb-1">
                Merchant Name:
              </Text>
              <TextInput
                className="border border-gray-300 rounded-md p-3 text-base font-pregular bg-gray-50"
                value={merchant}
                onChangeText={setMerchant}
                placeholder="Enter merchant name"
                placeholderTextColor="#999"
              />
            </View>

            <View className="mb-4">
              <Text className="text-base font-pmedium text-gray-700 mb-1">
                Total Amount:
              </Text>
              <TextInput
                className="border border-gray-300 rounded-md p-3 text-base font-pregular bg-gray-50"
                value={total}
                onChangeText={setTotal}
                placeholder="Enter total amount"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Display existing items (read-only) */}
            {items.length > 0 && (
              <View className="mb-4">
                <Text className="text-base font-pbold text-gray-700 mb-2">
                  Items (Read-Only):
                </Text>
                {items.map((item, index) => (
                  <View
                    key={index}
                    className="flex-row justify-between items-center bg-gray-100 p-2 rounded-md mb-1"
                  >
                    <Text className="flex-1 text-sm font-pregular text-gray-800">
                      {item.name || "Unnamed Item"}
                      {item.category && (
                        <Text className="text-gray-500 text-xs">
                          {" "}
                          ({item.category})
                        </Text>
                      )}
                    </Text>
                    <Text className="text-sm font-psemibold text-gray-800">
                      {item.price
                        ? `💵 ${parseFloat(item.price).toFixed(2)}`
                        : "N/A"}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={handleSave}
            className={`mt-4 w-full bg-purple-600 rounded-md p-3 items-center justify-center ${
              isSaving ? "opacity-70" : ""
            }`}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-pmedium text-base">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ... your existing styles ...
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditReceiptModal;
