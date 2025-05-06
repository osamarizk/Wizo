import { View, Text, Image } from "react-native";
import React from "react";

const TabIcons = ({ icon, color, name, focused }) => {
  const isUpload = name.toLowerCase() === "upload";

  return (
    <View
      className={`  items-center justify-center gap-1 ${
        isUpload ? "w-24 h-24 -mt-10 rounded-full" : "w-16"
      }`}
    >
      <View
        className={`${
          isUpload ? (focused ? "bg-[#D24726]" : "bg-[#F3F3F3]") : ""
        } ${isUpload ? "p-7 rounded-full shadow-md" : ""}`}
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
        className={`${focused ? "font-psemibold" : "font-pregular"} text-sm`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

export default TabIcons;
