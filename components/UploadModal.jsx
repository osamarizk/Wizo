import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  Platform,
} from "react-native";
import icons from "../constants/icons";
import { pickImageFromCamera, pickImageFromGallery } from "../lib/imagePicker";
import ReceiptProcess from "../components/ReceiptProcess";
import { router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { getReceiptStats } from "../lib/appwrite";
import { useFocusEffect } from "@react-navigation/native";

const UploadModal = ({ visible, onClose, onUploadSuccess }) => {
  const [receiptStats, setReceiptStats] = useState({
    totalCount: 0,
    thisMonthCount: 0,
    monthlySpending: 0,
    latestDate: "N/A",
  });
  const { user } = useGlobalContext();

  useEffect(() => {
    if (user?.$id) {
      fetchRecieptStats();
      // uploadInitialData();
    }
  }, [user?.$id]);

  useFocusEffect(
    useCallback(() => {
      if (user?.$id) {
        fetchRecieptStats();
      }
    }, [fetchRecieptStats])
  );

  const fetchRecieptStats = async () => {
    const recieptData = await getReceiptStats(user.$id);
    setReceiptStats(recieptData);
  };

  const [selectedImageUri, setSelectedImageUri] = useState(null);
  // console.log("Refreshing Value:", onRefresh);

  const handleCancel = () => {
    setSelectedImageUri(null);
    onClose(); // Close the modal and reset state via onClose callback
  };

  const handleSelect = async (pickerFunc) => {
    // set to handle android autorefreh
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
            <View className="bg-onboarding  px-4 pt-2 pb-2  border ">
              <View className="px-2 border-2 border-secondary  mb-5 mt-3">
                <View className="flex-row items-center justify-between h-[7vh] gap-2 px-4">
                  <Text className="font-pbold text-base text-gray-700">
                    Uploaded Receipts #
                  </Text>
                  <Text className="font-pextrabold text-lg">
                    {" "}
                    {receiptStats?.totalCount}
                  </Text>
                </View>
              </View>

              <Text className="text-base font-psemibold mb-4">
                Please select to upload your receipts
              </Text>

              <View className="flex-row justify-center items-center gap-3">
                <TouchableOpacity
                  onPress={() => handleSelect(pickImageFromCamera)}
                  className="flex-row items-center justify-center bg-gray-50 rounded-xl p-1 w-44 gap-1 border-2 border-[#F0F0F2]"
                >
                  <Image
                    source={icons.camera}
                    resizeMode="contain"
                    className="w-10 h-10 mb-2"
                  />
                  <Text className="font-psemibold text-gray-700">Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelect(pickImageFromGallery)}
                  className="flex-row items-center justify-center bg-gray-50 w-40 rounded-xl p-1 gap-1 border-2 border-[#F0F0F2]"
                >
                  <Image
                    source={icons.gallery}
                    resizeMode="contain"
                    className="w-10 h-10 mb-2"
                  />
                  <Text className="font-psemibold text-gray-700">Gallery</Text>
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
