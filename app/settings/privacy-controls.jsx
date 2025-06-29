import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Image, // Added Image for arrowRight icon
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, router } from "expo-router"; // Import router for navigation
import GradientBackground from "../../components/GradientBackground"; // Adjust path as needed
import icons from "../../constants/icons"; // Adjust path as needed, assuming you have arrowRight and info icons

const PrivacyControls = () => {
  const navigation = useNavigation();

  // State for privacy preferences (these would typically be stored in Appwrite/AsyncStorage)
  const [shareAnonymizedData, setShareAnonymizedData] = useState(true);
  const [personalizedRecommendations, setPersonalizedRecommendations] =
    useState(true);
  const [receiveMarketingEmails, setReceiveMarketingEmails] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  // In a real app, you would fetch these initial settings from Appwrite or local storage on mount
  useEffect(() => {
    // Simulate fetching existing privacy settings
    // For demonstration, we use default useState values.
    // Replace with actual data fetching logic from your backend (e.g., Appwrite user preferences)
    console.log("Fetching existing privacy settings...");
    // Example: const userPrivacySettings = await getUserPrivacySettings(user.$id);
    // setShareAnonymizedData(userPrivacySettings.shareAnonymizedData);
    // setPersonalizedRecommendations(userPrivacySettings.personalizedRecommendations);
    // setReceiveMarketingEmails(userPrivacySettings.receiveMarketingEmails);
  }, []);

  const handleSavePrivacySettings = async () => {
    setIsLoadingSave(true);
    try {
      // Simulate API call to save privacy settings
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // In a real app, you would update user privacy preferences in Appwrite here
      console.log("Saving privacy settings:", {
        shareAnonymizedData,
        personalizedRecommendations,
        receiveMarketingEmails,
      });
      Alert.alert("Success", "Privacy settings saved successfully!");
    } catch (error) {
      console.error("Failed to save privacy settings:", error);
      Alert.alert(
        "Error",
        "Failed to save privacy settings. Please try again."
      );
    } finally {
      setIsLoadingSave(false);
    }
  };

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
              Privacy Controls
            </Text>
            <View className="w-10" />
          </View>

          {/* Data Usage Preferences */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Data Usage
            </Text>

            {/* Anonymized Usage Data Toggle */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-1 pr-2">
                <Text className="text-lg font-pregular text-gray-700">
                  Share Anonymized Usage Data
                </Text>
                <Text className="text-sm font-plight text-gray-500 mt-1">
                  Helps us improve the app. Your data is aggregated and cannot
                  identify you.
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: "#9F54B6" }}
                thumbColor={shareAnonymizedData ? "#D03957" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setShareAnonymizedData}
                value={shareAnonymizedData}
              />
            </View>

            {/* Personalized Recommendations Toggle */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1 pr-2">
                <Text className="text-lg font-pregular text-gray-700">
                  Enable Personalized Experiences
                </Text>
                <Text className="text-sm font-plight text-gray-500 mt-1">
                  Get tailored insights and suggestions based on your activity.
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: "#9F54B6" }}
                thumbColor={personalizedRecommendations ? "#D03957" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setPersonalizedRecommendations}
                value={personalizedRecommendations}
              />
            </View>
          </View>

          {/* Communication Preferences */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Communication
            </Text>

            {/* Marketing Emails Toggle */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1 pr-2">
                <Text className="text-lg font-pregular text-gray-700">
                  Receive Marketing Emails
                </Text>
                <Text className="text-sm font-plight text-gray-500 mt-1">
                  Updates on new features, promotions, and news.
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: "#9F54B6" }}
                thumbColor={receiveMarketingEmails ? "#D03957" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setReceiveMarketingEmails}
                value={receiveMarketingEmails}
              />
            </View>
          </View>

          {/* Legal Information Links */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Legal Information
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/settings/privacy-policy")} // Link to your Privacy Policy page
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              <Text className="text-lg font-pregular text-gray-700">
                Privacy Policy
              </Text>
              <Image
                source={icons.arrowRight}
                className="w-4 h-4 tint-gray-500"
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/settings/terms-of-service")} // Link to your Terms of Service page
              className="flex-row items-center justify-between py-3"
            >
              <Text className="text-lg font-pregular text-gray-700">
                Terms of Service
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
            onPress={handleSavePrivacySettings}
            className={`bg-purple-600 rounded-md p-4 items-center justify-center ${
              isLoadingSave ? "opacity-70" : ""
            }`}
            disabled={isLoadingSave}
          >
            {isLoadingSave ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-psemibold text-lg">
                Save Privacy Settings
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

export default PrivacyControls;
