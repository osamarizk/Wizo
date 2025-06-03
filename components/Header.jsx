// components/Header.jsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import icons from "../constants/icons"; // Adjust path if necessary, e.g., '../../constants/icons'
import { router } from "expo-router"; // If you're using Expo Router for navigation

const Header = ({ user, unreadCount, greeting }) => {
  return (
    <View className="flex-row justify-between items-center mb-2 mt-1 ">
      <View>
        <Text className="text-base text-gray-500 font-pregular">
          {greeting}
        </Text>
        <Text className="text-xl font-bold text-center font-pbold">
          {user?.username
            ? `${user.username.charAt(0).toUpperCase()}${user.username.slice(
                1
              )}`
            : user?.email
            ? `${user.email.charAt(0).toUpperCase()}${user.email.slice(1)}`
            : "User"}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/notification")} // Assuming /notification is the correct route
        className="relative p-2 rounded-full mt-1"
      >
        <Image source={icons.notification} className="w-6 h-6" />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-xs font-bold">{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Header;
