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
import UploadModal from "../../components/UploadModal";
import { router, useFocusEffect } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider"; // Adjust path as needed
import icons from "../../constants/icons"; // Adjust path as needed
import GradientBackground from "../../components/GradientBackground"; // If you use this for background
import { signOut } from "../../lib/appwrite"; // Adjust path to your appwrite.js file

const Account = () => {
  const {
    user,
    setUser,
    isLoading: globalLoading,
    showUploadModal,
    setShowUploadModal,
  } = useGlobalContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  // Define menu options
  const menuOptions = [
    {
      id: "profileSettings",
      title: "Profile Settings",
      icon: icons.settings, // Make sure you have a settings icon
      route: "/profile-settings", // Placeholder route
    },
    {
      id: "privacyPolicy",
      title: "Privacy Policy",
      icon: icons.privacy, // Make sure you have a privacy icon
      route: "/privacy-policy", // Placeholder route
    },
    {
      id: "termsOfService",
      title: "Terms of Service",
      icon: icons.terms, // Make sure you have a terms icon
      route: "/terms-of-service", // Placeholder route
    },
    {
      id: "aboutUs",
      title: "About Us",
      icon: icons.about, // Make sure you have an info icon
      route: "/about-us", // Placeholder route
    },
    {
      id: "helpCenter",
      title: "Help Center",
      icon: icons.help, // Make sure you have a help icon
      route: "/help-center", // Placeholder route
    },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // await menuOptions();
  });

  useEffect(() => {
    setRefreshing(true);
  }, [globalLoading]);

  useFocusEffect(
    useCallback(() => {
      // This will be called every time the Spending screen comes into focus
      setRefreshing(true);
    }, [globalLoading])
  );

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
            <Text className="text-2xl font-pbold text-gray-800">Account</Text>
          </View>

          {/* User Profile Section */}
          <View className="bg-white rounded-xl shadow-lg p-6 mb-8 flex-row items-center">
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
          <View className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                className={`flex-row items-center p-4 ${
                  index < menuOptions.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
                onPress={() => router.push(option.route)}
              >
                {option.icon && (
                  <Image
                    source={option.icon}
                    className="w-6 h-6 mr-4 tint-primary-500" // Apply tint if icons are monochrome
                    resizeMode="contain"
                  />
                )}
                <Text className="flex-1 text-lg font-pmedium text-gray-700">
                  {option.title}
                </Text>
                <Image
                  source={icons.chevronRight} // Make sure you have a chevronRight icon
                  className="w-5 h-5 ml-4 tint-gray-400"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-xl p-4 flex-row items-center justify-center shadow-lg"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Image
                  source={icons.logout} // Make sure you have a logout icon
                  className="w-6 h-6 mr-3 tint-white"
                  resizeMode="contain"
                />
                <Text className="text-xl font-pbold text-white">Log Out</Text>
              </>
            )}
          </TouchableOpacity>
          {/* Upload Modal */}
          {showUploadModal && (
            <UploadModal
              visible={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              onRefresh={onRefresh}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Account;

// You might need to add these icons in your constants/icons.js if they don't exist
// Example:
// import profilePlaceholder from '../assets/icons/profile-placeholder.png'; // Or your default avatar
// import settings from '../assets/icons/settings.png';
// import privacy from '../assets/icons/privacy.png';
// import terms from '../assets/icons/terms.png';
// import info from '../assets/icons/info.png';
// import help from '../assets/icons/help.png';
// import logout from '../assets/icons/logout.png';
// import chevronRight from '../assets/icons/chevron-right.png';
//
// export default {
//   profilePlaceholder,
//   settings,
//   privacy,
//   terms,
//   info,
//   help,
//   logout,
//   chevronRight,
//   // ... other icons
// };
