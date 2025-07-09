import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert, // For RevenueCat errors
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
import icons from "../constants/icons"; // Assuming you have icons like checkmark, star, etc.

// --- RevenueCat Imports ---
import Purchases from "react-native-purchases"; // Main RevenueCat SDK
// --- END RevenueCat Imports ---

// --- Appwrite Imports (for updating user premium status later) ---
import {
  updateUserPremiumStatus, // You have this function in appwrite.js
  getAppwriteErrorMessageKey,
  createNotification, // For notifications on subscription status
  countUnreadNotifications, // To update unread count
  getFutureDate, // For notification expiry
} from "../lib/appwrite";
// --- END Appwrite Imports ---

// Define your RevenueCat API keys here (replace with your actual keys)
// You should ideally get these from environment variables in a production app.
const REVENUECAT_APPLE_API_KEY = "appl_YOUR_APPLE_API_KEY"; // Replace with your Apple App Store Public API Key
const REVENUECAT_GOOGLE_API_KEY = "goog_YOUR_GOOGLE_API_KEY"; // Replace with your Google Play Public API Key
const PREMIUM_ENTITLEMENT_ID = "premium_access"; // The ID of your premium entitlement in RevenueCat

const UpgradePremium = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    user,
    setUser, // To update global user context
    isLoading: globalLoading,
    updateUnreadNotifications, // Assuming you have this in GlobalProvider
  } = useGlobalContext();

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [products, setProducts] = useState([]); // To store fetched RevenueCat products
  const [purchaseError, setPurchaseError] = useState(null);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // --- Configure RevenueCat and fetch products on component mount ---
  useEffect(() => {
    const configureAndFetchProducts = async () => {
      try {
        // Set up RevenueCat debug logs (remove in production)
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        // Configure RevenueCat with platform-specific API keys
        if (Platform.OS === "ios") {
          Purchases.configure({ apiKey: REVENUECAT_APPLE_API_KEY });
        } else if (Platform.OS === "android") {
          Purchases.configure({ apiKey: REVENUECAT_GOOGLE_API_KEY });
        } else {
          // For web or other platforms, you might use a different approach or not offer in-app purchases
          console.warn(
            "RevenueCat not configured for this platform:",
            Platform.OS
          );
          setIsLoadingProducts(false);
          return;
        }

        // Identify the user with their Appwrite ID
        if (user?.$id) {
          await Purchases.logIn(user.$id);
          console.log("RevenueCat identified user:", user.$id);
        } else {
          // For guest users, Purchases.configure will create an anonymous ID
          console.warn("RevenueCat: User not logged in, using anonymous ID.");
        }

        // Fetch available products
        const offerings = await Purchases.getOfferings();
        if (
          offerings.current &&
          offerings.current.availablePackages.length > 0
        ) {
          // Filter for your specific products if needed, or sort them
          const monthlyProduct = offerings.current.availablePackages.find(
            (pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.MONTHLY // Assuming you have a monthly package
          );
          const yearlyProduct = offerings.current.availablePackages.find(
            (pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL // Assuming you have an annual package
          );

          const fetchedProducts = [];
          if (monthlyProduct) fetchedProducts.push(monthlyProduct);
          if (yearlyProduct) fetchedProducts.push(yearlyProduct);

          setProducts(fetchedProducts);
          console.log("RevenueCat products fetched:", fetchedProducts);
        } else {
          console.log("No current offerings found in RevenueCat.");
          setProducts([]);
        }
      } catch (error) {
        console.error(
          "RevenueCat configuration or product fetch error:",
          error
        );
        setPurchaseError(
          t("subscription.fetchProductsError", {
            message: error.message || t("common.unknownError"),
          })
        );
      } finally {
        setIsLoadingProducts(false);
      }
    };

    configureAndFetchProducts();

    // --- Listener for entitlement changes (important for real-time updates) ---
    // This listener will fire when a purchase is made, restored, or expires
    const customerInfoUpdateListener = async (customerInfo) => {
      console.log("RevenueCat: Customer info updated:", customerInfo);
      try {
        const isPremium = customerInfo.entitlements.active.hasOwnProperty(
          PREMIUM_ENTITLEMENT_ID
        );
        console.log("RevenueCat: Is Premium?", isPremium);

        // Update Appwrite user document
        if (user?.$id) {
          await updateUserPremiumStatus(user.$id, isPremium);
          // Update global user context immediately
          setUser((prevUser) => ({ ...prevUser, isPremium: isPremium }));
          console.log(
            `Appwrite user ${user.$id} premium status updated to ${isPremium}`
          );

          // Send notification to user
          await createNotification({
            user_id: user.$id,
            title: isPremium
              ? t("notification.premiumActivatedTitle")
              : t("notification.premiumDeactivatedTitle"),
            message: isPremium
              ? t("notification.premiumActivatedMessage")
              : t("notification.premiumDeactivatedMessage"),
            type: "premium_status",
            expiresAt: getFutureDate(isPremium ? 30 : 7), // Longer expiry for active premium, shorter for deactivation
          });
          const updatedUnreadCount = await countUnreadNotifications(user.$id);
          updateUnreadNotifications(updatedUnreadCount); // Update global unread count
        }
      } catch (err) {
        console.error("Error processing customer info update:", err);
        Alert.alert(
          t("common.errorTitle"),
          t("subscription.updateStatusError", {
            message: err.message || t("common.unknownError"),
          })
        );
      }
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

    // Cleanup listener on unmount
    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
    };
  }, [user, t, setUser, updateUnreadNotifications]); // Dependencies for useEffect

  // --- Loading State ---
  if (globalLoading || isLoadingProducts) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text
          className="text-white mt-4"
          style={{ fontFamily: getFontClassName("extralight") }}
        >
          {t("subscription.loadingSubscriptions")} {/* New translation key */}
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
              {t("subscription.upgradeToPremiumTitle")}{" "}
              {/* New translation key */}
            </Text>
            <View className="w-10" />
          </View>

          {/* Error Message */}
          {purchaseError && (
            <Text
              className="text-red-500 text-center mb-4"
              style={{ fontFamily: getFontClassName("medium") }}
            >
              {purchaseError}
            </Text>
          )}

          {/* Premium Benefits Section */}
          <View className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
            <Text
              className={`text-xl text-black mb-4 ${
                I18nManager.isRTL ? "text-right" : "text-left"
              }`}
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("subscription.unlockPremiumBenefits")}{" "}
              {/* New translation key */}
            </Text>
            <BenefitItem
              text={t("subscription.unlimitedReceipts")} // New translation key
              icon={icons.check} // Assuming a checkmark icon
            />
            <BenefitItem
              text={t("subscription.advancedAnalytics")} // New translation key
              icon={icons.check}
            />
            <BenefitItem
              text={t("subscription.prioritySupport")} // New translation key
              icon={icons.check}
            />
            {/* Add more benefits as needed */}
          </View>

          {/* Subscription Options */}
          <Text
            className={`text-2xl text-black mb-4 ${
              I18nManager.isRTL ? "text-right" : "text-left"
            }`}
            style={{ fontFamily: getFontClassName("bold") }}
          >
            {t("subscription.chooseYourPlan")} {/* New translation key */}
          </Text>

          {products.length === 0 ? (
            <View className="bg-white rounded-xl p-6 border border-gray-200 items-center">
              <Text
                className="text-gray-500 italic text-center"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("subscription.noSubscriptionPlansAvailable")}{" "}
                {/* New translation key */}
              </Text>
            </View>
          ) : (
            products.map((product) => (
              <SubscriptionOption
                key={product.identifier}
                product={product}
                onPress={() =>
                  console.log("Purchase Pressed for:", product.identifier)
                } // Will implement purchase logic here
                isProcessing={isProcessingPurchase}
                t={t} // Pass translation function
              />
            ))
          )}

          {/* Restore Purchases Button */}
          <TouchableOpacity
            onPress={() => console.log("Restore Purchases Pressed")} // Will implement restore logic here
            className={`mt-6 p-4 rounded-lg items-center justify-center border border-blue-600 ${
              isProcessingPurchase ? "opacity-70" : ""
            }`}
            disabled={isProcessingPurchase}
          >
            {isProcessingPurchase ? (
              <ActivityIndicator size="small" color="#264653" />
            ) : (
              <Text
                className="text-blue-600 text-lg"
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {t("subscription.restorePurchases")} {/* New translation key */}
              </Text>
            )}
          </TouchableOpacity>

          {/* Terms and Privacy */}
          <Text
            className={`text-xs text-gray-500 text-center mt-6 ${
              I18nManager.isRTL ? "text-right" : "text-left"
            }`}
            style={{ fontFamily: getFontClassName("regular") }}
          >
            {t("subscription.termsDisclaimer")} {/* New translation key */}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

// --- Helper Component for Benefit List Items ---
const BenefitItem = ({ text, icon }) => {
  const { I18nManager } = require("react-native"); // Re-import I18nManager if not globally available
  const { getFontClassName } = require("../utils/fontUtils"); // Re-import if not globally available
  return (
    <View
      className={`flex-row items-center mb-2 ${
        I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {icon && (
        <Image
          source={icon}
          className={`w-5 h-5 ${I18nManager.isRTL ? "ml-2" : "mr-2"}`}
          tintColor="#2A9D8F"
          resizeMode="contain"
        />
      )}
      <Text
        className={`flex-1 text-base text-gray-700 ${
          I18nManager.isRTL ? "text-right" : "text-left"
        }`}
        style={{ fontFamily: getFontClassName("regular") }}
      >
        {text}
      </Text>
    </View>
  );
};

// --- Helper Component for Subscription Option Cards ---
const SubscriptionOption = ({ product, onPress, isProcessing, t }) => {
  const { I18nManager } = require("react-native");
  const { getFontClassName } = require("../utils/fontUtils");
  const { preferredCurrencySymbol } = useGlobalContext(); // Access global currency symbol

  const price = product.product.priceString;
  const description = product.product.description;
  const title = product.product.title; // RevenueCat product title (e.g., "Premium Monthly", "Premium Annual")
  const period = product.product.period; // e.g., "P1M" for monthly, "P1Y" for yearly

  let planLabel = "";
  if (period.includes("M")) {
    planLabel = t("subscription.monthlyPlan");
  } else if (period.includes("Y")) {
    planLabel = t("subscription.yearlyPlan");
  } else {
    planLabel = product.product.periodUnit; // Fallback
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(product)}
      className={`bg-white rounded-xl p-6 mb-4 border border-gray-200 ${
        isProcessing ? "opacity-70" : ""
      }`}
      disabled={isProcessing}
    >
      <Text
        className={`text-xl text-black mb-2 ${
          I18nManager.isRTL ? "text-right" : "text-left"
        }`}
        style={{ fontFamily: getFontClassName("semibold") }}
      >
        {planLabel} ({price}) {/* e.g., "Monthly Plan ($9.99)" */}
      </Text>
      <Text
        className={`text-base text-gray-700 ${
          I18nManager.isRTL ? "text-right" : "text-left"
        }`}
        style={{ fontFamily: getFontClassName("regular") }}
      >
        {description || title}{" "}
        {/* Use description if available, otherwise title */}
      </Text>
      {/* You can add more details here, like saving percentage for yearly */}
    </TouchableOpacity>
  );
};

export default UpgradePremium;
