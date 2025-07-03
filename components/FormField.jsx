import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  I18nManager,
} from "react-native";
import React, { useState, useEffect } from "react"; // NEW: Import useEffect
import icons from "../constants/icons";

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  secureTextEntry: initialSecureTextEntry, // NEW: Rename prop to avoid conflict with internal state
  ...props
}) => {
  const { t } = useTranslation();

  // NEW: State to manage the current secureTextEntry status for the TextInput
  const [isSecure, setIsSecure] = useState(initialSecureTextEntry);

  // NEW: Update isSecure if initialSecureTextEntry prop changes (e.g., when modal opens)
  useEffect(() => {
    setIsSecure(initialSecureTextEntry);
  }, [initialSecureTextEntry]);

  // Function to toggle password visibility
  const toggleShowPassword = () => {
    setIsSecure((prevIsSecure) => !prevIsSecure);
  };

  return (
    <View className={`space-y-0  ${otherStyles}`}>
      <Text
        className={`text-base text-gray-600 ${getFontClassName("bold")}`}
        style={{
          fontFamily: getFontClassName("bold"),
          textAlign: I18nManager.isRTL ? "right" : "left",
        }}
      >
        {title}
      </Text>
      <View
        className={`border border-black w-full h-14 px-4 rounded bg-slate-100 focus:border-secondary items-center flex-row ${
          I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <TextInput
          className={`flex-1 text-black-100 text-base ${getFontClassName(
            "bold"
          )}`}
          style={{
            fontFamily: getFontClassName("bold"),
            textAlign: I18nManager.isRTL ? "right" : "left",
             writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
          }}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7b7b8b"
          onChangeText={handleChangeText}
          secureTextEntry={isSecure} // MODIFIED: Use internal isSecure state
          {...props}
        />

        {/* MODIFIED: Only show eye icon if initialSecureTextEntry was true */}
        {initialSecureTextEntry && (
          <TouchableOpacity
            onPress={toggleShowPassword} // MODIFIED: Use new toggle function
            className={`${I18nManager.isRTL ? "ml-2" : "mr-2"}`}
          >
            <Image
              source={isSecure ? icons.eyeHide : icons.eye} // MODIFIED: Use isSecure to pick icon
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
