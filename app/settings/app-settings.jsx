import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, router } from "expo-router";
import GradientBackground from "../../components/GradientBackground";
import icons from "../../constants/icons";
import { useGlobalContext } from "../../context/GlobalProvider";
import { saveUserPreferences } from "../../lib/appwrite"; // Only saveUserPreferences is needed from appwrite.js

const ApplicationSettings = () => {
  const navigation = useNavigation();
  // Destructure applicationSettings from global context
  const {
    user,
    isLoading: globalLoading,
    applicationSettings,
    checkSessionAndFetchUser,
  } = useGlobalContext();

  // State for local user preferences (fetched from user document)
  // Initialize with defaults or user's saved preferences
  const [enableNotifications, setEnableNotifications] = useState(
    user?.enableNotifications ?? false
  );
  const [darkMode, setDarkMode] = useState(user?.darkMode ?? false);
  const [currencyPreference, setCurrencyPreference] = useState(
    user?.currencyPreference ??
      applicationSettings?.default_currency_code ??
      "EGP"
  );

  const [isLoadingSave, setIsLoadingSave] = useState(false);

  // Determine if the current user is premium (from global context)
  const isPremiumUser = user?.isPremium || false;

  // Use a separate useEffect to set initial preferences once user and settings are loaded
  useEffect(() => {
    if (user && applicationSettings) {
      setEnableNotifications(user.enableNotifications ?? false);
      setDarkMode(user.darkMode ?? false);
      setCurrencyPreference(
        user.currencyPreference ??
          applicationSettings.default_currency_code ??
          "EGP"
      );
    }
  }, [user, applicationSettings]);

  // --- Save user-specific preferences ---
  const handleSaveSettings = async () => {
    setIsLoadingSave(true);
    try {
      if (!user?.$id) {
        Alert.alert("Error", "You must be logged in to save settings.");
        return;
      }

      const preferencesToSave = {
        enableNotifications,
        darkMode,
        currencyPreference,
      };

      await saveUserPreferences(user.$id, preferencesToSave);
      // After saving, re-fetch global user context to update UI if preferences are part of user object
      await checkSessionAndFetchUser();

      Alert.alert("Success", "Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsLoadingSave(false);
    }
  };

  // Show loading if global context is still loading OR if applicationSettings haven't been fetched yet
  if (globalLoading || !applicationSettings) {
    return (
      <GradientBackground>
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4E17B3" />
          <Text className="mt-2 text-gray-500">Loading settings...</Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8 mt-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text className="text-blue-600 text-lg font-pmedium"> Back </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-pbold text-black">
              Application Settings
            </Text>
            <View className="w-10" />
          </View>

          {/* General Preferences Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              General Preferences
            </Text>

            {/* Notifications Toggle (Keep disabled for now as requested) */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Enable Notifications (Coming Soon)
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#9F54B6" }}
                thumbColor={enableNotifications ? "#D03957" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setEnableNotifications}
                value={enableNotifications}
                disabled={true} // Explicitly disabled for now
              />
            </View>

            {/* Dark Mode Toggle (Keep disabled for now as requested) */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Dark Mode (Coming Soon)
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#9F54B6" }}
                thumbColor={darkMode ? "#D03957" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setDarkMode}
                value={darkMode}
                disabled={true} // Explicitly disabled for now
              />
            </View>

            {/* Currency Preference (Enable for user to set) */}
            <TouchableOpacity
              className="flex-row items-center justify-between py-3"
              onPress={() =>
                Alert.alert(
                  "Currency",
                  "Currency preference selection coming soon!"
                )
              } // Placeholder for selection logic
            >
              <Text className="text-lg font-pregular text-gray-700">
                Currency Preference
              </Text>
              <View className="flex-row items-center">
                <Text className="text-lg font-psemibold text-gray-800 mr-2">
                  {currencyPreference}
                </Text>
                <Image
                  source={icons.arrowRight}
                  className="w-4 h-4 tint-gray-500"
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Account Limits & Premium Features Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Your Plan & Benefits
            </Text>

            {/* Current Plan Display */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Current Plan:
              </Text>
              <Text
                className={`text-lg font-psemibold ${
                  isPremiumUser ? "text-purple-600" : "text-blue-600"
                }`}
              >
                {isPremiumUser ? "Premium" : "Free Tier"}
              </Text>
            </View>

            {/* Monthly Receipt Upload Limit */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Monthly Receipt Upload Limit:
              </Text>
              <Text
                className={`text-lg font-psemibold ${
                  isPremiumUser ? "text-green-600" : "text-orange-500"
                }`}
              >
                {/* Use applicationSettings for free and premium limit text */}
                {isPremiumUser
                  ? applicationSettings.premium_receipt_limit_text ||
                    "Unlimited"
                  : applicationSettings.free_tier_receipt_limit || 0}
              </Text>
            </View>

            {/* Monthly Receipt Upload Limit */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Monthly Receipts Download Limit:
              </Text>
              <Text
                className={`text-lg font-psemibold ${
                  isPremiumUser ? "text-green-600" : "text-orange-500"
                }`}
              >
                {/* Use applicationSettings for free and premium limit text */}
                {isPremiumUser
                  ? applicationSettings.premium_data_downloads_text ||
                    "Unlimited"
                  : applicationSettings.free_tier_data_downloads_monthly || 0}
              </Text>
            </View>

            {/* Active Budget Limit */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Active Budget Limit:
              </Text>
              <Text
                className={`text-lg font-psemibold ${
                  isPremiumUser ? "text-green-600" : "text-orange-500"
                }`}
              >
                {/* Use applicationSettings for free and premium limit text */}
                {isPremiumUser
                  ? applicationSettings.premium_budget_count_text || "Unlimited"
                  : applicationSettings.free_tier_budget_count || 0}
              </Text>
            </View>

            {/* Monthly Data Export Limit */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Monthly Data Exports:
              </Text>
              <Text
                className={`text-lg font-psemibold ${
                  isPremiumUser ? "text-green-600" : "text-orange-500"
                }`}
              >
                {/* Use applicationSettings for free and premium limit text */}
                {isPremiumUser
                  ? applicationSettings.premium_data_exports_text || "Unlimited"
                  : applicationSettings.free_tier_data_exports_monthly || 0}
              </Text>
            </View>

            {/* Advanced Analytics */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Advanced Spending Analytics:
              </Text>
              <View className="flex-row items-center">
                {isPremiumUser &&
                applicationSettings.premium_feature_advanced_analytics ? (
                  <Image
                    source={icons.check}
                    className="w-5 h-5 tint-green-600 mr-2"
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={icons.lock}
                    className="w-5 h-5 tint-gray-400 mr-2"
                    resizeMode="contain"
                  />
                )}
                <Text
                  className={`text-lg font-psemibold ${
                    isPremiumUser &&
                    applicationSettings.premium_feature_advanced_analytics
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {isPremiumUser &&
                  applicationSettings.premium_feature_advanced_analytics
                    ? "Included"
                    : "Premium"}
                </Text>
              </View>
            </View>

            {/* Priority Customer Support */}
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-lg font-pregular text-gray-700">
                Priority Customer Support:
              </Text>
              <View className="flex-row items-center">
                {isPremiumUser &&
                applicationSettings.premium_feature_priority_support ? (
                  <Image
                    source={icons.check}
                    className="w-5 h-5 tint-green-600 mr-2"
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={icons.lock}
                    className="w-5 h-5 tint-gray-400 mr-2"
                    resizeMode="contain"
                  />
                )}
                <Text
                  className={`text-lg font-psemibold ${
                    isPremiumUser &&
                    applicationSettings.premium_feature_priority_support
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {isPremiumUser &&
                  applicationSettings.premium_feature_priority_support
                    ? "Included"
                    : "Premium"}
                </Text>
              </View>
            </View>

            {!isPremiumUser && (
              <TouchableOpacity
                onPress={() => router.push("/upgrade-premium")}
                className="flex-row items-center justify-center p-4 rounded-md mt-6 bg-purple-600 shadow-lg"
              >
                <Image
                  source={icons.star}
                  className="w-6 h-6 tint-white mr-2"
                  resizeMode="contain"
                />
                <Text className="text-white font-psemibold text-lg">
                  Upgrade to Premium
                </Text>
              </TouchableOpacity>
            )}
            {isPremiumUser && (
              <View className="mt-6 p-3 bg-green-50 rounded-md border border-green-200 flex-row items-center justify-center">
                <Image
                  source={icons.trophy} // Assuming a trophy or badge icon for premium
                  className="w-5 h-5 tint-green-700 mr-2"
                  resizeMode="contain"
                />
                <Text className="text-green-800 font-psemibold text-center">
                  You have all Premium Features!
                </Text>
              </View>
            )}
          </View>

          {/* Feature Management Sections (unchanged) */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Feature Management
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/wallet")}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              <Text className="text-lg font-pregular text-gray-700">
                Wallet Setup:
              </Text>
              <View className="flex-row items-center">
                <Text
                  className={`text-lg font-psemibold ${
                    user?.hasWalletSetup ? "text-green-600" : "text-red-500"
                  } mr-2`}
                >
                  {user?.hasWalletSetup ? "Complete" : "Not Set Up"}
                </Text>
                <Image
                  source={icons.arrowRight}
                  className="w-4 h-4 tint-gray-500"
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/budget")}
              className="flex-row items-center justify-between py-3"
            >
              <Text className="text-lg font-pregular text-gray-700">
                Budgeting Setup:
              </Text>
              <View className="flex-row items-center">
                <Text
                  className={`text-lg font-psemibold ${
                    user?.hasBudgetSetup ? "text-green-600" : "text-red-500"
                  } mr-2`}
                >
                  {user?.hasBudgetSetup ? "Complete" : "Not Set Up"}
                </Text>
                <Image
                  source={icons.arrowRight}
                  className="w-4 h-4 tint-gray-500"
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Data & Privacy Section (keep as is) */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Data & Privacy
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/settings/manage-data")}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              <Text className="text-lg font-pregular text-gray-700">
                Manage My Data
              </Text>
              <Image
                source={icons.arrowRight}
                className="w-4 h-4 tint-gray-500"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/settings/privacy-controls")}
              className="flex-row items-center justify-between py-3"
            >
              <Text className="text-lg font-pregular text-gray-700">
                Privacy Controls
              </Text>
              <Image
                source={icons.arrowRight}
                className="w-4 h-4 tint-gray-500"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Save Settings Button */}
          <TouchableOpacity
            onPress={handleSaveSettings}
            className={`bg-purple-600 rounded-md p-4 items-center justify-center ${
              isLoadingSave ? "opacity-70" : ""
            }`}
            disabled={isLoadingSave}
          >
            {isLoadingSave ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-psemibold text-lg">
                Save Settings
              </Text>
            )}
          </TouchableOpacity>

          {/* Spacer for bottom padding */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ApplicationSettings;
