import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import icons from "../constants/icons";
import { pickImageFromCamera, pickImageFromGallery } from "../lib/imagePicker";
import ReceiptProcess from "../components/ReceiptProcess";

const UploadModal = ({ visible, onClose, onRefresh }) => {
  const [selectedImageUri, setSelectedImageUri] = useState(null);

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
            <View className="bg-onboarding rounded-xl px-4 pt-2 pb-2 shadow-lg shadow-gray-100 border-2 border-secondary opacity-95">
              <View className="px-4 border-2 border-gradient-dark rounded-lg mb-5">
                <View className="flex-row items-center justify-between h-[7vh] gap-2 px-4">
                  <Text className="font-psemibold text-base">
                    Uploaded Receipts
                  </Text>
                  <Text className="font-pextrabold text-lg"> ####</Text>
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
              onRefresh={onRefresh}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default UploadModal;
