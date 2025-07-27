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
  Linking, // Import Linking for external links like email
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

  // Function to open a URL (for email or web link)
  const openUrl = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Don't know how to open this URL: ${url}`);
      Alert.alert(t("common.error"), t("account.linkOpenError")); // Using common.error and new translation key
    }
  };

  // NEW: Handle Account Deletion Request
  const handleAccountDeletionRequest = () => {
    Alert.alert(
      t("account.deleteAccountConfirmTitle"),
      t("account.deleteAccountConfirmMessage"),
      [
        {
          text: t("common.cancel"), // Reusing common.cancel
          style: "cancel",
        },
        {
          text: t("account.deleteAccountConfirmButton"),
          onPress: () => {
            const recipient = "support@resynq.com";
            const subject = encodeURIComponent(
              `Account Deletion Request for User ID: ${user?.$id || "N/A"}`
            );
            const body = encodeURIComponent(
              `Dear ResynQ Support Team,\n\nI would like to request the deletion of my ResynQ account.\n\nMy registered email address is: ${
                user?.email || "N/A"
              }\nMy User ID is: ${
                user?.$id || "N/A"
              }\n\nPlease confirm once my account and all associated data have been permanently deleted.\n\nThank you.`
            );
            const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;
            openUrl(mailtoUrl);
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
          className="mt-2 text-gray-500"
          style={{ fontFamily: getFontClassName("regular") }}
        >
          {t("account.loadingUserData")}
        </Text>
      </View>
    );
  }

  // Define menu options, now including the logout and delete account items
  const menuOptions = [
    {
      id: "appSettings",
      title: t("account.applicationSettings"),
      icon: icons.settings,
      onPress: () => router.push("settings/app-settings"),
    },
    {
      id: "financialInsights",
      title: t("financialInsights.pageTitle"),
      icon: icons.analysis, // Suggesting a chart-like icon, or sparkles if you have it
      onPress: () => router.push("/financial-insights"),
    },
    {
      id: "privacyPolicy",
      title: t("account.privacyPolicy"),
      icon: icons.privacy,
      onPress: () =>
        openUrl("https://wizo-app-auth.web.app/privacy-policy.html"), // Use openUrl for external link
    },
    {
      id: "termsOfService",
      title: t("account.termsOfService"),
      icon: icons.terms,
      onPress: () =>
        openUrl(
          "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
        ), // Use openUrl for external link
    },
    {
      id: "aboutUs",
      title: t("account.aboutUs"),
      icon: icons.about,
      onPress: () => router.push("/about-us"), // Assuming this is an internal route now
    },
    {
      id: "helpCenter",
      title: t("account.helpCenter"),
      icon: icons.help,
      onPress: () => router.push("/help-center"), // Assuming this is an internal route now
    },
    {
      id: "deleteAccount", // NEW ID for Delete Account
      title: t("account.deleteAccount"), // Translated
      icon: icons.dlt, // Assuming you have a delete icon
      onPress: handleAccountDeletionRequest,
      isDestructiveOption: true, // Custom flag for destructive action
    },
    {
      id: "logout",
      title: t("account.logout"),
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
                {t("common.back")}
              </Text>
            </TouchableOpacity>
            <Text
              className="text-3xl text-black"
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("account.accountSettingsTitle")}
            </Text>
            {/* Spacer for symmetrical layout */}
            <View className="w-10" />
          </View>
          {/* User Profile Section */}
          <View
            className={`bg-white rounded-xl p-6 mb-6 mt-4 border border-gray-200 flex-row items-center ${
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
                {user?.username || t("account.guestUser")}
              </Text>
              <Text
                className={`text-base text-gray-600 mt-1 ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align text
                }`}
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {user?.email || t("account.noEmailProvided")}
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
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                className={`flex-row items-center p-5 ${
                  index < menuOptions.length - 1
                    ? "border-b border-gray-100"
                    : ""
                } ${
                  option.isLogoutOption
                    ? "bg-red-50"
                    : option.isDestructiveOption
                    ? "bg-red-50" // Apply light red background for destructive options too
                    : "bg-white"
                } ${I18nManager.isRTL ? "flex-row-reverse" : "flex-row"}`}
                onPress={option.onPress}
                disabled={
                  (option.isLogoutOption && isLoggingOut) ||
                  (option.isDestructiveOption && isLoggingOut)
                } // Disable destructive options during logout
              >
                {/* Conditionally show ActivityIndicator for logout/destructive */}
                {(option.isLogoutOption || option.isDestructiveOption) &&
                isLoggingOut ? (
                  <ActivityIndicator
                    size="small"
                    color="#D03957"
                    className={`${I18nManager.isRTL ? "ml-4" : "mr-4"}`}
                  />
                ) : (
                  option.icon && (
                    <Image
                      source={option.icon}
                      className={`w-6 h-6 ${
                        I18nManager.isRTL ? "ml-4" : "mr-4"
                      }`}
                      tintColor={
                        option.isLogoutOption || option.isDestructiveOption
                          ? "#D03957"
                          : "#264653" // Red for logout/destructive, Dark Blue for others
                      }
                      resizeMode="contain"
                    />
                  )
                )}
                <Text
                  className={`flex-1 text-lg mr-3 ${
                    option.isLogoutOption || option.isDestructiveOption
                      ? "text-red-600"
                      : "text-gray-700"
                  } ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {option.title}
                </Text>
                {/* Right Arrow Icon (optional, only for non-logout/non-destructive) */}
                {!(option.isLogoutOption || option.isDestructiveOption) && (
                  <Image
                    source={icons.arrowRight}
                    className="w-4 h-4"
                    tintColor="#7b7b8b"
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
