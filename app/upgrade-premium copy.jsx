import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  I18nManager,
  Platform,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n";
import GradientBackground from "../components/GradientBackground";
import icons from "../constants/icons";

// --- RevenueCat Imports ---
import Purchases from "react-native-purchases";
import Constants from "expo-constants"; // Import Constants to access extra config
// --- END RevenueCat Imports ---

// --- Appwrite Imports (for updating user premium status later) ---
import {
  updateUserPremiumStatus,
  // getAppwriteErrorMessageKey, // This function is not used in the provided code, consider removing if truly unused.
  createNotification,
  countUnreadNotifications,
  getFutureDate,
} from "../lib/appwrite";
// --- END Appwrite Imports ---

// Define your RevenueCat API keys here (fetched from Constants.expoConfig.extra)
// Ensure these are set as EAS Secrets and correctly configured in app.config.js
const REVENUECAT_APPLE_API_KEY =
  Constants.expoConfig.extra.REVENUECAT_APPLE_API_KEY;
const REVENUECAT_GOOGLE_API_KEY =
  Constants.expoConfig.extra.REVENUECAT_GOOGLE_API_KEY;
const PREMIUM_ENTITLEMENT_ID = "resynqent"; // The ID of your premium entitlement in RevenueCat

const UpgradePremium = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    user,
    setUser,
    isLoading: globalLoading,
    updateUnreadCount,
  } = useGlobalContext();

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [products, setProducts] = useState([]); // To store fetched RevenueCat products
  const [offeringsData, setOfferingsData] = useState(null); // State to store the full offerings object for display
  const [purchaseError, setPurchaseError] = useState(null);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // --- Configure RevenueCat and fetch products on component mount ---
  useEffect(() => {
    const configureAndFetchProducts = async () => {
      try {
        // Set up RevenueCat debug logs (remove in production)
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        let revenueCatApiKey = null;
        if (Platform.OS === "ios") {
          revenueCatApiKey = REVENUECAT_APPLE_API_KEY;
        } else if (Platform.OS === "android") {
          revenueCatApiKey = REVENUECAT_GOOGLE_API_KEY;
        }

        if (!revenueCatApiKey) {
          console.warn(
            "RevenueCat API key is not defined for this platform:",
            Platform.OS
          );
          Alert.alert(
            "Configuration Error",
            `RevenueCat API key missing for ${Platform.OS}.`
          );
          setIsLoadingProducts(false);
          return;
        }

        // Configure RevenueCat with platform-specific API keys
        await Purchases.configure({ apiKey: revenueCatApiKey });
        console.log("RevenueCat configured with API Key:", revenueCatApiKey);

        if (user?.$id) {
          await Purchases.logIn(user.$id);
          console.log("RevenueCat identified user:", user.$id);
        } else {
          console.warn("RevenueCat: User not logged in, using anonymous ID.");
        }

        const offerings = await Purchases.getOfferings();
        setOfferingsData(offerings); // Store the entire offerings object for display

        if (
          offerings.current &&
          offerings.current.availablePackages.length > 0
        ) {
          // Alert.alert("Offering Result", JSON.stringify(offerings, null, 2)); // Keep this for quick debugging
          console.log(
            "Offering fetched successfully:",
            JSON.stringify(offerings, null, 2)
          );

          const monthlyProduct = offerings.current.availablePackages.find(
            (pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.MONTHLY
          );
          const yearlyProduct = offerings.current.availablePackages.find(
            (pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL
          );
          // You would typically set products state here if you plan to display them
          // setProducts([monthlyProduct, yearlyProduct].filter(Boolean));
        } else {
          Alert.alert(
            "No current offerings found in RevenueCat.",
            "This typically means there's an issue with your App Store Connect/Google Play Console setup, or product IDs."
          );
          console.log("No current offerings found in RevenueCat.");
          setProducts([]);
        }
      } catch (error) {
        console.error(
          "RevenueCat configuration or product fetch error:",
          error
        );
        setPurchaseError(
          t("upgradePremium.fetchProductsError", {
            message: error.message || t("common.unknownError"),
          })
        );
        Alert.alert(
          "RevenueCat Error",
          `Failed to load subscription plans: ${
            error.message || "Unknown error"
          }. Check logs and App Store Connect/Google Play Console.`
        );
      } finally {
        setIsLoadingProducts(false);
      }
    };

    configureAndFetchProducts();
  }, [user, t, setUser, updateUnreadCount]);

  // --- Purchase Logic ---
  // --- Restore Purchases Logic ---

  // --- Loading State ---
  if (globalLoading || isLoadingProducts) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text
          className="text-white mt-4"
          style={{ fontFamily: getFontClassName("extralight") }}
        >
          {t("upgradePremium.loadingSubscriptions")}{" "}
        </Text>
      </SafeAreaView>
    );
  }

  // --- Render UI ---
  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* Header */}
          <View
            className={`flex-row items-center justify-between mb-8 mt-4 ${
              I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <TouchableOpacity onPress={() => router.back()} className="p-2">
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
              {t("upgradePremium.upgradeToPremiumTitle")}{" "}
            </Text>
            <View className="w-10" />
          </View>

          <View className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
            <Text
              className={`text-xl text-black mb-4 ${
                I18nManager.isRTL ? "text-right" : "text-left"
              }`}
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("upgradePremium.unlockPremiumBenefits")}{" "}
            </Text>
          </View>

          <Text
            className={`text-2xl text-black mb-4 ${
              I18nManager.isRTL ? "text-right" : "text-left"
            }`}
            style={{ fontFamily: getFontClassName("bold") }}
          >
            {t("upgradePremium.chooseYourPlan")}{" "}
          </Text>

          {/* --- DEBUGGING SECTION: Display Offerings Data --- */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-red-400">
            <Text className="text-lg font-bold text-red-600 mb-2">
              DEBUG: RevenueCat Offerings Status
            </Text>
            {purchaseError && (
              <Text className="text-red-500 mb-2">Error: {purchaseError}</Text>
            )}
            {offeringsData ? (
              <ScrollView className="max-h-60 bg-gray-100 p-2 rounded">
                <Text className="text-xs text-gray-800">
                  {JSON.stringify(offeringsData, null, 2)}
                </Text>
              </ScrollView>
            ) : (
              <Text className="text-gray-600">
                No offerings data available yet or an error occurred.
              </Text>
            )}
            <Text className="text-xs text-gray-500 mt-2">
              (This section is for debugging and should be removed in
              production)
            </Text>
          </View>
          {/* --- END DEBUGGING SECTION --- */}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

// --- Helper Component for Subscription Option Cards ---
export default UpgradePremium;
