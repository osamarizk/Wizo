import { View, Text, Image, Platform, I18nManager } from "react-native"; // NEW: Import I18nManager
import React from "react";
// NEW: Import getFontClassName
import { getFontClassName } from "../utils/fontUtils";

const TabIcons = ({ icon, color, name, focused }) => {
  const isUpload =
    name.toLowerCase() === "upload" || name.toLowerCase() === "تحميل"; // Note: This comparison relies on the English "upload"
  // If 'name' is already translated, this needs adjustment.
  // Assuming 'name' will be the original English 'Upload' for this check.
  // If 'name' is already translated from TabsLayout, then 'name.toLowerCase()' might not be 'upload'.
  // Best practice: Pass an `isUploadTab` boolean from TabsLayout.
  // For now, I will assume 'name' here is still the English string for the comparison.

  return (
    <View
      className={`items-center justify-center gap-1 ${
        isUpload ? "w-24 h-24 -mt-10 rounded-full" : "w-16"
      }`}
    >
      <View
        className={`${
          isUpload ? (focused ? "bg-[#D24726]" : "bg-[#F3F3F3]") : ""
        } ${isUpload ? "p-6 rounded-full shadow-md" : ""}`}
        style={{
          shadowColor: focused ? "#D24726" : "##CDCDE0", // Adjust the shadow color here
          shadowOffset: { width: 0, height: 4 }, // You can adjust the shadow offset
          shadowOpacity: 0.1, // Adjust opacity
          shadowRadius: 5, // Adjust radius for blur effect
        }}
      >
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={isUpload ? (focused ? "white" : "#D24726") : color}
          className={`${isUpload ? "w-10 h-10" : "w-6 h-6"}`} // Increase icon size here
        />
      </View>

      {/* Always render the name of the tab */}
      <Text
        // Apply dynamic font class based on 'focused' state
        className={` text-center ${I18nManager.isRTL ? "text-right" : "text-left"}`} // NEW: Apply RTL alignment
        style={{
          color: color,
          fontSize: Platform.select({
            ios: 13,
            android: 11,
          }),
          fontFamily: getFontClassName(focused ? "semibold" : "regular"),
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {name} {/* 'name' prop is already translated from TabsLayout */}
      </Text>
    </View>
  );
};

export default TabIcons;
