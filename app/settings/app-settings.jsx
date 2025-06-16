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
import {
  getApplicationSettings,
  saveUserPreferences,
} from "../../lib/appwrite"; // NEW IMPORTS

const ApplicationSettings = () => {
  const navigation = useNavigation();
  const {
    user,
    isLoading: globalLoading,
    checkSessionAndFetchUser,
  } = useGlobalContext(); // Added checkSessionAndFetchUser

  // State for local user preferences (fetched from user document)
  const [enableNotifications, setEnableNotifications] = useState(false); // Default to false
  const [darkMode, setDarkMode] = useState(false); // Default to false
  const [currencyPreference, setCurrencyPreference] = useState("EGP"); // Default currency

  // State for global app limits (fetched from ApplicationSetting document)
  const [appLimits, setAppLimits] = useState({
    free_tier_receipt_limit: 15,
    free_tier_budget_count: 3,
    free_tier_data_exports_monthly: 1,
    premium_feature_advanced_analytics: true,
    premium_feature_priority_support: true,
    default_currency_code: "EGP",
    premium_receipt_limit_text: "Unlimited",
    premium_budget_count_text: "Unlimited",
    premium_data_exports_text: "Unlimited",
  });

  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true); // Combined loading for both types of settings

  // Determine if the current user is premium (from global context)
  const isPremiumUser = user?.isPremium || false;

  // --- Fetch initial settings (global app settings and user-specific preferences) ---
  const fetchSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      // 1. Fetch global application settings
      const globalSettings = await getApplicationSettings();
      setAppLimits(globalSettings);

      // 2. Fetch user-specific preferences (from user's profile document)
      if (user?.$id) {
        // Assuming user object from global context has these preferences
        setEnableNotifications(user.enableNotifications ?? false);
        setDarkMode(user.darkMode ?? false);
        setCurrencyPreference(
          user.currencyPreference ?? globalSettings.default_currency_code
        );
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      Alert.alert("Error", "Failed to load settings. Please try again.");
      // Keep default values or show error state
    } finally {
      setIsLoadingSettings(false);
    }
  }, [user]); // Depend on user to re-fetch if user data changes (e.g., after login/logout)

  useEffect(() => {
    if (user?.$id) {
      // Only fetch if user is logged in
      fetchSettings();
    } else if (!globalLoading) {
      // If user is not logged in and global context finished loading
      setIsLoadingSettings(false); // Stop loading if no user to fetch for
    }
  }, [user, globalLoading, fetchSettings]);

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

  if (globalLoading || isLoadingSettings) {
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
                {isPremiumUser
                  ? appLimits.premium_receipt_limit_text
                  : appLimits.free_tier_receipt_limit}
              </Text>
            </View>

            {/* Budget Creation Limit */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Active Budget Limit:
              </Text>
              <Text
                className={`text-lg font-psemibold ${
                  isPremiumUser ? "text-green-600" : "text-orange-500"
                }`}
              >
                {isPremiumUser
                  ? appLimits.premium_budget_count_text
                  : appLimits.free_tier_budget_count}
              </Text>
            </View>

            {/* Data Export Limit */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Monthly Data Exports:
              </Text>
              <Text
                className={`text-lg font-psemibold ${
                  isPremiumUser ? "text-green-600" : "text-orange-500"
                }`}
              >
                {isPremiumUser
                  ? appLimits.premium_data_exports_text
                  : appLimits.free_tier_data_exports_monthly}
              </Text>
            </View>

            {/* Advanced Analytics */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Advanced Spending Analytics:
              </Text>
              <View className="flex-row items-center">
                {isPremiumUser &&
                appLimits.premium_feature_advanced_analytics ? (
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
                    appLimits.premium_feature_advanced_analytics
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {isPremiumUser && appLimits.premium_feature_advanced_analytics
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
                {isPremiumUser && appLimits.premium_feature_priority_support ? (
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
                    isPremiumUser && appLimits.premium_feature_priority_support
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {isPremiumUser && appLimits.premium_feature_priority_support
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

          {/* Navigation to Feature Setup Sections */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Feature Management
            </Text>

            {/* Wallet Setup */}
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

            {/* Budgeting Setup */}
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
