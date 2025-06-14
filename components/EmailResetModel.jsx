import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";

const EmailResetModal = ({ visible, onClose, onSend }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      await onSend(email);
      console.log("Model email", email); // wait for the email to be sent
      setEmail("");
      onClose(); // only close after success
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <TouchableWithoutFeedback>
            <View className="w-full bg-onboarding rounded-2xl p-6">
              <Text className="text-xl font-pbold text-center mb-4">
                Reset Password
              </Text>

              <Text className="text-base text-gray-600 mb-1">
                Enter your email address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                // placeholder="you@example.com"
                keyboardType="email-address"
                className="border border-gray-400 rounded-xl px-4 py-3 mb-5 font-pregular text-lg"
              />

              <Pressable
                onPress={handleSubmit}
                className="bg-secondary py-3 rounded-xl"
              >
                <Text className="text-white text-center font-psemibold text-base">
                  Send Email
                </Text>
              </Pressable>

              <Pressable onPress={onClose}>
                <Text className="text-center text-gray-500 mt-4">Cancel</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default EmailResetModal;
