import React from "react";
import { View, Image, Pressable, Modal } from "react-native";

const ReceiptFull = ({ imageUri, visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 bg-onboarding justify-center items-center"
      >
        <Image
          source={{ uri: imageUri }}
          className="w-full h-full"
          resizeMode="contain"
        />
      </Pressable>
    </Modal>
  );
};

export default ReceiptFull;
