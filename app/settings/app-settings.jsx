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
import { useNavigation, router } from "expo-router"; // Import router for navigation
import GradientBackground from "../../components/GradientBackground"; // Adjust path as needed
import icons from "../../constants/icons"; // Adjust path as needed

// Assuming useGlobalContext provides user, and potentially information about budget/wallet setup.
import { useGlobalContext } from "../../context/GlobalProvider";
// You might need to import specific Appwrite functions to check budget/wallet status
// For this example, we'll simulate these statuses or assume they are in global context.
// import { getUserBudgets, getUserWalletBalance } from "../../lib/appwrite";

const FREE_TIER_RECEIPT_LIMIT = 15; // Define your free tier limit

const ApplicationSettings = () => {
  const navigation = useNavigation();
  const { user, isLoading: globalLoading } = useGlobalContext(); // Get user from global context

  // State for local settings (these would typically come from user preferences stored in Appwrite/AsyncStorage)
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currencyPreference, setCurrencyPreference] = useState("EGP");
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  // New states for limits and feature status
  const [currentReceiptLimit, setCurrentReceiptLimit] = useState(
    FREE_TIER_RECEIPT_LIMIT
  );
  const [isPremiumUser, setIsPremiumUser] = useState(false); // To determine if user is premium
  const [hasWalletSetup, setHasWalletSetup] = useState(false); // Status of wallet setup
  const [hasBudgetSetup, setHasBudgetSetup] = useState(false); // Status of budget setup
  const [isLoadingFeatureStatus, setIsLoadingFeatureStatus] = useState(true);

  // Simulate fetching user premium status, wallet, and budget setup status
  const fetchFeatureStatus = useCallback(async () => {
    setIsLoadingFeatureStatus(true);
    try {
      // Replace with actual logic to check user's premium status from Appwrite
      // For example:
      // const userData = await getUserProfile(user.$id);
      // setIsPremiumUser(userData?.isPremium || false);

      // For now, simulate premium status (e.g., if user email is 'premium@example.com')
      setIsPremiumUser(user?.email === "premium@example.com");

      // Replace with actual Appwrite calls to check if wallet/budget are set up
      // Example:
      // const userBudgets = await getUserBudgets(user.$id);
      // setHasBudgetSetup(userBudgets && userBudgets.length > 0);
      // const userWallet = await getUserWalletBalance(user.$id); // Assuming this returns a non-null/non-zero balance if set up
      // setHasWalletSetup(userWallet !== null && userWallet.balance !== undefined);

      // Simulate wallet/budget status for demo
      setHasWalletSetup(true); // Assuming wallet is generally available or set up by default
      setHasBudgetSetup(true); // Assuming budget is generally available or set up by default

      // Set receipt limit based on premium status
      setCurrentReceiptLimit(
        user?.email === "premium@example.com"
          ? "Unlimited"
          : FREE_TIER_RECEIPT_LIMIT
      );
    } catch (error) {
      console.error("Failed to fetch feature status:", error);
      // Handle error, maybe set default statuses
      setIsPremiumUser(false);
      setCurrentReceiptLimit(FREE_TIER_RECEIPT_LIMIT);
      setHasWalletSetup(false);
      setHasBudgetSetup(false);
    } finally {
      setIsLoadingFeatureStatus(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.$id) {
      fetchFeatureStatus();
    }
  }, [user, fetchFeatureStatus]);

  const handleSaveSettings = async () => {
    setIsLoadingSave(true);
    try {
      // Simulate API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // In a real app, you would update user preferences in Appwrite or local storage here
      console.log("Saving settings:", {
        enableNotifications,
        darkMode,
        currencyPreference,
      });
      Alert.alert("Success", "Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsLoadingSave(false);
    }
  };

  if (globalLoading || isLoadingFeatureStatus) {
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
              <Text className="text-blue-600 text-lg font-pmedium">Back</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-pbold text-black">
              Application Settings
            </Text>
            <View className="w-10" />
          </View>

          {/* General Settings Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              General
            </Text>

            {/* Notifications Toggle */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Enable Notifications
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#9F54B6" }}
                thumbColor={enableNotifications ? "#D03957" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setEnableNotifications}
                value={enableNotifications}
              />
            </View>

            {/* Dark Mode Toggle */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Dark Mode
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#9F54B6" }}
                thumbColor={darkMode ? "#D03957" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setDarkMode}
                value={darkMode}
              />
            </View>

            {/* Currency Preference */}
            <TouchableOpacity className="flex-row items-center justify-between py-3">
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

          {/* Account Limits / Subscription Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Account Limits
            </Text>
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Monthly Receipt Upload Limit:
              </Text>
              <Text
                className={`text-lg font-psemibold ${
                  isPremiumUser ? "text-green-600" : "text-orange-500"
                }`}
              >
                {currentReceiptLimit}
              </Text>
            </View>

            {!isPremiumUser && (
              <TouchableOpacity
                onPress={() => router.push("/upgrade-premium")}
                className="flex-row items-center justify-center p-4 rounded-md mt-4 bg-purple-500"
              >
                <Image
                  source={icons.star}
                  className="w-6 h-6 tint-white mr-2"
                  resizeMode="contain"
                />{" "}
                {/* Assuming you have a star/crown icon */}
                <Text className="text-white font-psemibold text-lg">
                  Upgrade to Premium for Unlimited
                </Text>
              </TouchableOpacity>
            )}
            {isPremiumUser && (
              <View className="mt-4 p-3 bg-green-50 rounded-md border border-green-200 flex-row items-center justify-center">
                <Image
                  source={icons.check}
                  className="w-5 h-5 tint-green-600 mr-2"
                  resizeMode="contain"
                />{" "}
                {/* Assuming you have a check icon */}
                <Text className="text-green-700 font-psemibold">
                  You have Unlimited Receipt Uploads!
                </Text>
              </View>
            )}
          </View>

          {/* Feature Status Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Feature Status
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/wallet")}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              <Text className="text-lg font-pregular text-gray-700">
                Wallet:
              </Text>
              <View className="flex-row items-center">
                <Text
                  className={`text-lg font-psemibold ${
                    hasWalletSetup ? "text-green-600" : "text-red-500"
                  } mr-2`}
                >
                  {hasWalletSetup ? "Setup Complete" : "Not Set Up"}
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
                Budgeting:
              </Text>
              <View className="flex-row items-center">
                <Text
                  className={`text-lg font-psemibold ${
                    hasBudgetSetup ? "text-green-600" : "text-red-500"
                  } mr-2`}
                >
                  {hasBudgetSetup ? "Setup Complete" : "Not Set Up"}
                </Text>
                <Image
                  source={icons.arrowRight}
                  className="w-4 h-4 tint-gray-500"
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Data & Privacy Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Data & Privacy
            </Text>

            {/* Manage Data Option */}
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

            {/* Privacy Controls Option */}
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
