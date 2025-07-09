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
  I18nManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UploadModal from "../components/UploadModal";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider"; // Adjust path as needed
import icons from "../constants/icons"; // Adjust path as needed
import GradientBackground from "../components/GradientBackground"; // If you use this for background
import { signOut } from "../lib/appwrite"; // Adjust path to your appwrite.js file

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils"; // Adjust path as needed for THIS file
import i18n from "../utils/i18n";

const Account = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
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
      t("account.logoutAlertTitle"), // Translated
      t("account.logoutAlertMessage"), // Translated
      [
        {
          text: t("account.cancelLogout"), // Translated
          style: "cancel",
        },
        {
          text: t("account.confirmLogout"), // Translated
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await signOut();
              setUser(null); // Clear user from global context
              router.replace("/sign-in"); // Navigate to sign-in screen
            } catch (error) {
              // Translated Alert.alert
              Alert.alert(
                t("account.logoutErrorTitle"),
                error.message || t("common.error")
              );
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
        <Text
          className="mt-2 text-gray-500" // Removed font class from className
          style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
        >
          {t("account.loadingUserData")} {/* Translated */}
        </Text>
      </View>
    );
  }

  // Define menu options, now including the logout item
  const menuOptions = [
    {
      id: "appSettings",
      title: t("account.applicationSettings"), // Translated
      icon: icons.settings,
      onPress: () => router.push("settings/app-settings"),
    },
    {
      id: "financialInsights", // NEW ID
      title: t("financialInsights.pageTitle"), // Use the translated page title
      icon: icons.analysis, // Suggesting a chart-like icon, or sparkles if you have it
      onPress: () => router.push("/financial-insights"), // Link to the new page
    },
    {
      id: "privacyPolicy",
      title: t("account.privacyPolicy"), // Translated
      icon: icons.privacy,
      onPress: () => router.push("/settings/privacy-policy"),
    },
    {
      id: "termsOfService",
      title: t("account.termsOfService"), // Translated
      icon: icons.terms,
      onPress: () => router.push("/settings/terms-of-service"),
    },
    {
      id: "aboutUs",
      title: t("account.aboutUs"), // Translated
      icon: icons.about,
      onPress: () => router.push("/about-us"),
    },
    {
      id: "helpCenter",
      title: t("account.helpCenter"), // Translated
      icon: icons.help,
      onPress: () => router.push("/help-center"),
    },
    {
      id: "logout",
      title: t("account.logout"), // Translated
      icon: icons.logout,
      onPress: handleLogout,
      isLogoutOption: true,
    },
  ];

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="mr-2 ml-2"
        >
          {/* Adjusted padding */}
          {/* Header */}
          <View
            className={`flex-row items-center justify-between mb-8 mt-8 ${
              I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse header for RTL
            }`}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text
                className="text-blue-600 text-lg"
                style={{ fontFamily: getFontClassName("medium") }}
              >
                {t("common.back")} {/* Translated */}
              </Text>
            </TouchableOpacity>
            <Text
              className="text-3xl text-black"
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("account.accountSettingsTitle")} {/* Translated */}
            </Text>
            {/* Spacer for symmetrical layout */}
            <View className="w-10" />
          </View>
          {/* User Profile Section */}
          <View
            className={`bg-white rounded-xl p-6 mb-6 mt-4  border border-gray-200 flex-row items-center ${
              I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
            }`}
          >
            <Image
              source={user?.avatar ? { uri: user.avatar } : icons.user}
              className={`w-20 h-20 rounded-full border-2 border-[#9F54B6] ${
                I18nManager.isRTL ? "ml-4" : "mr-4" // Adjust margin
              }`}
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text
                className={`text-xl text-gray-800 ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align text
                }`}
                style={{ fontFamily: getFontClassName("bold") }}
              >
                {user?.username || t("account.guestUser")} {/* Translated */}
              </Text>
              <Text
                className={`text-base text-gray-600 mt-1 ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align text
                }`}
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {user?.email || t("account.noEmailProvided")} {/* Translated */}
              </Text>
              {/* Optional: Edit Profile Button */}
              <TouchableOpacity
                onPress={() => router.push("/edit-profile")} // Assuming an edit profile route
                className={`mt-2 p-2 rounded-md bg-[#2A9D8F] items-center ${
                  I18nManager.isRTL ? "self-end" : "self-start"
                }`}
              >
                <Text
                  className="text-white text-sm"
                  style={{ fontFamily: getFontClassName("medium") }}
                >
                  {t("account.editProfile")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Menu Options */}
          <View className="bg-white rounded-xl mb-8 shadow-md border border-gray-200 overflow-hidden">
            {/* Changed bg-transparent to bg-white, added shadow/border */}
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                className={`flex-row items-center p-5 ${
                  index < menuOptions.length - 1
                    ? "border-b border-gray-100" // Lighter border
                    : ""
                } ${
                  option.isLogoutOption ? "bg-red-50" : "bg-white" // Light red background for logout
                } ${I18nManager.isRTL ? "flex-row-reverse" : "flex-row"}`} // Reverse for RTL
                onPress={option.onPress}
                disabled={option.isLogoutOption && isLoggingOut}
              >
                {/* Conditionally show ActivityIndicator for logout */}
                {option.isLogoutOption && isLoggingOut ? (
                  <ActivityIndicator
                    size="small"
                    color="#D03957" // Red tint for logout indicator
                    className={`${I18nManager.isRTL ? "ml-4" : "mr-4"}`} // Adjust margin
                  />
                ) : (
                  option.icon && (
                    <Image
                      source={option.icon}
                      className={`w-6 h-6 ${
                        I18nManager.isRTL ? "ml-4" : "mr-4" // Adjust margin
                      }`}
                      tintColor={
                        option.isLogoutOption ? "#D03957" : "#264653" // Red for logout, Dark Blue for others
                      }
                      resizeMode="contain"
                    />
                  )
                )}
                <Text
                  className={`flex-1 text-lg mr-3 ${
                    option.isLogoutOption ? "text-red-600" : "text-gray-700" // Red for logout, gray for others
                  } ${I18nManager.isRTL ? "text-right" : "text-left"}`} // Align text
                  style={{ fontFamily: getFontClassName("semibold") }} // Always use semibold for menu items
                >
                  {option.title}
                </Text>
                {/* Right Arrow Icon (optional, only for non-logout) */}
                {!option.isLogoutOption && (
                  <Image
                    source={icons.arrowRight} // Assuming you have an arrowRight icon
                    className="w-4 h-4"
                    tintColor="#7b7b8b" // Gray tint
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
          {/* Upload Modal (if applicable) */}
          {showUploadModal && (
            <UploadModal
              visible={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              // onRefresh={onRefresh} // Pass if needed
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Account;
