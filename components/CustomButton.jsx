import { Text, TouchableOpacity, I18nManager } from "react-native"; // NEW: Import I18nManager
import React from "react";

// NEW: Import font utility
import { getFontClassName } from "../utils/fontUtils";

const CustomButton = ({
  title, // This title is expected to be a translated string from the parent component
  handlePress,
  containerStyle,
  textStyles,
  isLoading, // Corrected prop name
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isLoading}
      // MODIFIED: Corrected isLoading typo, added font and RTL alignment
      className={`mt-2 w-full bg-secondary rounded-md p-3 items-center justify-center ${containerStyle} ${
        isLoading ? "opacity-50" : "" // Corrected 'isLaoding' to 'isLoading'
      }`}
    >
      <Text
        className={`text-white text-lg ${getFontClassName(
          "bold"
        )} ${textStyles}`} // NEW: Apply font class
        style={{
          fontFamily: getFontClassName("bold"),
          textAlign: I18nManager.isRTL ? "right" : "left",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
