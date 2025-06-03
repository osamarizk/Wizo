import { Text, TouchableOpacity } from "react-native";
import React from "react";

const CustomButton = ({
  title,
  handlePress,
  containerStyle,
  textStyles,
  isLoading,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isLoading}
      className={`mt-2 w-full bg-secondary rounded-md p-3 items-center justify-center ${containerStyle} $
      {isLaoding ? "opacity-50" : ''}`}
    >
      <Text className={`text-white font-semibold text-lg ${textStyles}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
