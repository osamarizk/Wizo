import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import icons from "../constants/icons";
import { pickImageFromCamera, pickImageFromGallery } from "../lib/imagePicker";
import ReceiptProcess from "../components/ReceiptProcess"
const UploadModal = ({ visible, onClose }) => {
  const [selectedImageUri, setSelectedImageUri] = useState(null);

  const handleCancel = () => {
    setSelectedImageUri(null);
    onClose();
  };

  const handleSelect = async (pickerFunc) => {
    const uri = await pickerFunc();
    if (uri) {
      setSelectedImageUri(uri);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    

      <Pressable className="flex-1 bg-transparent justify-end -top-[17vh] opacity-95 px-3" >
      
          {!selectedImageUri ? (
            <>
            <View className="bg-[#F0F0F2] rounded-xl px-4 pt-2 pb-2 shadow-lg shadow-gray-100 border-2 border-secondary opacity-85">
              <View className="px-4 border-2 border-[#F0F0F2] rounded-lg mb-5">
                <View className="flex-row items-center justify-between h-[7vh] gap-2 px-4">
                  <Text className="font-psemibold text-base">Uploaded Receipts</Text>
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
                  <Image source={icons.camera} resizeMode="contain" className="w-10 h-10 mb-2" />
                  <Text className="font-psemibold text-gray-700">Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelect(pickImageFromGallery)}
                  className="flex-row items-center justify-center bg-gray-50 w-40 rounded-xl p-1 gap-1 border-2 border-[#F0F0F2]"
                >
                  <Image source={icons.gallery} resizeMode="contain" className="w-10 h-10 mb-2" />
                  <Text className="font-psemibold text-gray-700">Gallery</Text>
                </TouchableOpacity>
              </View>
              </View>
            </>
          ) : (
            
            <ReceiptProcess imageUri={selectedImageUri} onCancel={handleCancel} />
           
          )}
         
      </Pressable>
      
    </Modal>
  );
};

export default UploadModal;
