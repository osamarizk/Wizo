import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UploadModal from "../components/UploadModal";
import { router, useFocusEffect } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider"; // Adjust path as needed
import icons from "../constants/icons"; // Adjust path as needed
import GradientBackground from "../components/GradientBackground"; // If you use this for background
import { signOut } from "../lib/appwrite"; // Adjust path to your appwrite.js file

const Account = () => {
  const {
    user,
    setUser,
    isLoading: globalLoading,
    showUploadModal,
    setShowUploadModal,
  } = useGlobalContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Removed 'refreshing' state and its related useEffect/useCallback as they weren't directly used by menu options.
  // If you have specific data refresh needs on focus, keep the useFocusEffect logic,
  // but it's not tied to menuOptions directly.

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await signOut();
              setUser(null); // Clear user from global context
              router.replace("/sign-in"); // Navigate to sign-in screen
            } catch (error) {
              Alert.alert("Logout Error", error.message);
              console.error("Logout failed:", error);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (globalLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4E17B3" />
        <Text className="mt-2 text-gray-500">Loading user data...</Text>
      </View>
    );
  }

  // Define menu options, now including the logout item
  const menuOptions = [
    {
      id: "profileSettings",
      title: "Profile Settings",
      icon: icons.settings, // Make sure you have a settings icon
      onPress: () => router.push("/profile-settings"), // Use onPress directly
    },
    {
      id: "privacyPolicy",
      title: "Privacy Policy",
      icon: icons.privacy, // Make sure you have a privacy icon
      onPress: () => router.push("/privacy-policy"),
    },
    {
      id: "termsOfService",
      title: "Terms of Service",
      icon: icons.terms, // Make sure you have a terms icon
      onPress: () => router.push("/terms-of-service"),
    },
    {
      id: "aboutUs",
      title: "About Us",
      icon: icons.about, // Make sure you have an info icon
      onPress: () => router.push("/about-us"),
    },
    {
      id: "helpCenter",
      title: "Help Center",
      icon: icons.help, // Make sure you have a help icon
      onPress: () => router.push("/help-center"),
    },
    {
      id: "logout", // New logout item
      title: "Log Out",
      icon: icons.logout, // Make sure you have a logout icon
      onPress: handleLogout, // Call the handleLogout function
      isLogoutOption: true, // Flag to apply specific styling and loading logic
    },
  ];

  return (
    <GradientBackground>
      {/* Use your GradientBackground component if applicable */}
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-4 py-8"
        >
          {/* Header */}
          <View className="flex-row items-center justify-center mb-8">
            <Text className="text-2xl font-pbold text-gray-800">
              Account Settings
            </Text>
          </View>

          {/* User Profile Section */}
          <View className="bg-transparent border border-[#D03957] rounded-xl p-6 mb-4 flex-row items-center">
            <Image
              source={user?.avatar ? { uri: user.avatar } : icons.user} // Use user's avatar or a placeholder
              className="w-20 h-20 rounded-full mr-4 border-2 border-primary-500"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-xl font-pbold text-gray-800">
                {user?.username || "Guest User"}
              </Text>
              <Text className="text-base font-pregular text-gray-600 mt-1">
                {user?.email || "No email provided"}
              </Text>
            </View>
          </View>

          {/* Menu Options */}
          <View className="bg-transparent border border-[#D03957] rounded-xl mb-8 overflow-hidden">
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                className={`flex-row items-center p-4 ${
                  index < menuOptions.length - 1
                    ? "border-b border-slate-300"
                    : ""
                }`}
                onPress={option.onPress} // Use the onPress function defined in the option
                disabled={option.isLogoutOption && isLoggingOut} // Disable logout option when logging out
              >
                {/* Conditionally show ActivityIndicator for logout */}
                {option.isLogoutOption && isLoggingOut ? (
                  <ActivityIndicator
                    size="small"
                    color="#D03957"
                    className="mr-4"
                  />
                ) : (
                  option.icon && (
                    <Image
                      source={option.icon}
                      className={`w-6 h-6 mr-4 ${
                        option.isLogoutOption
                          ? "tint-red-500"
                          : "tint-primary-500"
                      }`} // Tint logout icon red, others primary
                      resizeMode="contain"
                    />
                  )
                )}
                <Text
                  className={`flex-1 text-lg font-pmedium ${
                    option.isLogoutOption ? "text-[#264653]" : "text-gray-700"
                  }`} // Make logout text red, others gray
                >
                  {option.title}
                </Text>
                {/* Don't show chevron for the logout option unless specifically desired */}
                {!option.isLogoutOption && (
                  <Image
                    source={icons.rightArrow} // Make sure you have a rightArrow icon
                    className="w-3 h-3 ml-4"
                    resizeMode="contain"
                    tintColor="gray"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Removed the separate Logout Button section */}

          {/* Upload Modal */}
          {showUploadModal && (
            <UploadModal
              visible={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              // onRefresh={onRefresh} // If onRefresh is still needed for modal context
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Account;

// Ensure your constants/icons.js has the necessary icons:
// export default {
//   user: require('../assets/icons/user.png'), // Default profile placeholder
//   settings: require('../assets/icons/settings.png'),
//   privacy: require('../assets/icons/privacy.png'),
//   terms: require('../assets/icons/terms.png'),
//   about: require('../assets/icons/about.png'), // Renamed from 'info' as per your code
//   help: require('../assets/icons/help.png'),
//   logout: require('../assets/icons/logout.png'),
//   rightArrow: require('../assets/icons/right-arrow.png'), // Assuming this is your chevron icon
//   // ... other icons
// };
