import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  Alert,
  I18nManager,
  TouchableOpacity, // NEW: Import TouchableOpacity for the close icon
  Image, // NEW: Import Image for the close icon
} from "react-native";

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import icons from "../constants/icons"; // NEW: Import icons

const EmailResetModal = ({ visible, onClose, onSend }) => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert(t("common.errorTitle"), t("auth.invalidEmailError"));
      return;
    }

    try {
      await onSend(email);
      console.log("Model email", email);
      setEmail("");
      onClose(); // only close after success
    } catch (err) {
      Alert.alert(
        t("common.errorTitle"),
        err.message || t("common.unexpectedError")
      );
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
            <View className="w-full bg-white rounded-2xl p-6">
              <TouchableOpacity
                className="absolute top-3 right-3 p-2 rounded-full z-10" // Adjust position as needed
                onPress={onClose}
              >
                <Image
                  source={icons.close}
                  className="w-6 h-6"
                  resizeMode="contain"
                  tintColor={"black"} // Adjust tint color for visibility
                />
              </TouchableOpacity>

              <Text
                className={`text-xl text-center mb-4 ${getFontClassName(
                  "bold"
                )}`}
                style={{
                  fontFamily: getFontClassName("bold"),
                }}
              >
                {t("auth.resetPasswordTitle")}
              </Text>

              <Text
                className={`text-base text-gray-600 mb-1 ${getFontClassName(
                  "regular"
                )}`}
                style={{
                  fontFamily: getFontClassName("regular"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              >
                {t("auth.enterEmailInstruction")}
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t("auth.enterEmailPlaceholder")}
                placeholderTextColor="#7b7b8b"
                keyboardType="email-address"
                className={`border border-gray-400 rounded-xl px-4 py-3 mb-5 text-lg ${getFontClassName(
                  "regular"
                )}`}
                style={{
                  fontFamily: getFontClassName("regular"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              />

              <Pressable
                onPress={handleSubmit}
                className="bg-secondary py-3 rounded-xl"
              >
                <Text
                  className={`text-white text-center text-lg ${getFontClassName(
                    "bold"
                  )}`}
                  style={{ fontFamily: getFontClassName("bold") }}
                >
                  {t("auth.sendEmailButton")}
                </Text>
              </Pressable>

              {/* REMOVED: Cancel Button */}
              {/* <Pressable onPress={onClose}>
                <Text className="text-center text-gray-500 mt-4">Cancel</Text>
              </Pressable> */}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default EmailResetModal;
