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
  getAppwriteErrorMessageKey, // This function is not used in the provided code, consider removing if truly unused.
  createNotification, // For notifications on subscription status
  countUnreadNotifications, // To update unread count
  getFutureDate, // For notification expiry
} from "../lib/appwrite";
// --- END Appwrite Imports ---

// Define your RevenueCat API keys here (replace with your actual keys)
// You should ideally get these from environment variables in a production app.
const REVENUECAT_APPLE_API_KEY = "appl_QGenOQgTBgVrWNxzlmqzkhPezNw"; // Replace with your Apple App Store Public API Key
const REVENUECAT_GOOGLE_API_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs4wOunS1xsFu8Qwz6KYtK7p4nEXN7k40gg8TdrnTDj41AC4NHoqwTexQ3lQ/2FPDppV2bj45Zod+B+BQ4SS5IA/DaQjGEzod+USLmwGbeSmFZAq9dT7BGvlMUCZuKMFg9Oe5OfXkHIpa7cuphWVFCE8LryHOkzrieu/iirL3D4JNyHj88nVLGhAV+2ihtsJhnyv22Jyudx2cnSQLMxJjw1zLwFZ0v2CSBjpuoMHfcL6fMA14yY0fH6DHurxQ6W/VdRgD62BaXQD/3Kqh2x7dPYBb8XGAr9uThgvbqd/z3x/cwWYxKYJzUM6jNePOH3LWgFuu9PhRBLc2XXvjOOz1XQIDAQAB"; // Replace with your Google Play Public API Key
const PREMIUM_ENTITLEMENT_ID = "premium_access"; // The ID of your premium entitlement in RevenueCat

const UpgradePremium = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    user,
    setUser, // To update global user context
    isLoading: globalLoading,
    updateUnreadCount, // Corrected from updateUnreadNotifications
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
          t("upgradePremium.fetchProductsError", {
            // Changed to upgradePremium
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
          const updatedUnreadCountValue = await countUnreadNotifications(
            user.$id
          ); // Renamed to avoid conflict
          updateUnreadCount(updatedUnreadCountValue); // Update global unread count
        }
      } catch (err) {
        console.error("Error processing customer info update:", err);
        Alert.alert(
          t("common.errorTitle"),
          t("upgradePremium.updateStatusError", {
            // Changed to upgradePremium
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
  }, [user, t, setUser, updateUnreadCount]); // Updated dependency to updateUnreadCount

  // --- Purchase Logic ---
  const handlePurchase = async (productPackage) => {
    if (isProcessingPurchase) return; // Prevent double taps

    setIsProcessingPurchase(true);
    setPurchaseError(null); // Clear previous errors

    try {
      console.log("Attempting to purchase package:", productPackage.identifier);
      const { customerInfo } = await Purchases.purchasePackage(productPackage);

      // The customerInfoUpdateListener will handle updating Appwrite,
      // but we can add immediate feedback here.
      const isPremium = customerInfo.entitlements.active.hasOwnProperty(
        PREMIUM_ENTITLEMENT_ID
      );

      if (isPremium) {
        Alert.alert(
          t("common.successTitle"),
          t("upgradePremium.purchaseSuccess") // Changed to upgradePremium
        );
        router.back(); // Navigate back if purchase is successful
      } else {
        Alert.alert(
          t("common.errorTitle"),
          t("upgradePremium.purchaseFailedGeneric") // Changed to upgradePremium
        );
      }
    } catch (e) {
      if (!e.userCancelled) {
        // Check if the error was not due to user cancellation
        console.error("Purchase error:", e);
        let errorMessage = t("upgradePremium.purchaseFailedGeneric"); // Changed to upgradePremium

        if (
          e.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR
        ) {
          errorMessage = t("upgradePremium.purchaseNotAllowed"); // Changed to upgradePremium
        } else if (
          e.code === Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR
        ) {
          errorMessage = t("upgradePremium.paymentPending"); // Changed to upgradePremium
        } else if (
          e.code ===
          Purchases.PURCHASES_ERROR_CODE
            .PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR
        ) {
          errorMessage = t("upgradePremium.productNotAvailable"); // Changed to upgradePremium
        } else if (
          e.code ===
          Purchases.PURCHASES_ERROR_CODE.PURCHASE_INVALID_FOR_PRODUCT_ERROR
        ) {
          errorMessage = t("upgradePremium.purchaseInvalid"); // Changed to upgradePremium
        } else if (
          e.code === Purchases.PURCHASES_ERROR_CODE.CANNOT_FIND_PRODUCT
        ) {
          errorMessage = t("upgradePremium.cannotFindProduct"); // Changed to upgradePremium
        }
        // Add more specific error handling for other RevenueCat error codes as needed

        Alert.alert(t("common.errorTitle"), errorMessage);
        setPurchaseError(errorMessage);
      } else {
        console.log("Purchase cancelled by user.");
      }
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  // --- Restore Purchases Logic ---
  const handleRestorePurchases = async () => {
    if (isProcessingPurchase) return; // Prevent double taps

    setIsProcessingPurchase(true);
    setPurchaseError(null); // Clear previous errors

    try {
      console.log("Attempting to restore purchases...");
      const customerInfo = await Purchases.restorePurchases();

      const isPremium = customerInfo.entitlements.active.hasOwnProperty(
        PREMIUM_ENTITLEMENT_ID
      );

      if (isPremium) {
        Alert.alert(
          t("common.successTitle"),
          t("upgradePremium.restoreSuccess") // Changed to upgradePremium
        );
        router.back(); // Navigate back if restoration is successful
      } else {
        Alert.alert(
          t("common.infoTitle"),
          t("upgradePremium.noActivePurchasesFound") // Changed to upgradePremium
        );
      }
    } catch (e) {
      console.error("Restore purchases error:", e);
      let errorMessage = t("upgradePremium.restoreFailedGeneric"); // Changed to upgradePremium

      if (e.code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR) {
        errorMessage = t("upgradePremium.networkError"); // Changed to upgradePremium
      }
      // Add more specific error handling for other RevenueCat error codes as needed

      Alert.alert(t("common.errorTitle"), errorMessage);
      setPurchaseError(errorMessage);
    } finally {
      setIsProcessingPurchase(false);
    }
  };

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
          {/* Changed to upgradePremium */}
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
              {/* Changed to upgradePremium */}
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
              {t("upgradePremium.unlockPremiumBenefits")}{" "}
              {/* Changed to upgradePremium */}
            </Text>
            <BenefitItem
              text={t("upgradePremium.unlimitedReceipts")} // Changed to upgradePremium
              icon={icons.check} // Assuming a checkmark icon
            />
            <BenefitItem
              text={t("upgradePremium.advancedSpendingAnalytics")} // Changed to upgradePremium
              icon={icons.check}
            />
            <BenefitItem
              text={t("upgradePremium.priorityCustomerSupport")} // Changed to upgradePremium
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
            {t("upgradePremium.chooseYourPlan")}{" "}
            {/* Changed to upgradePremium */}
          </Text>

          {products.length === 0 ? (
            <View className="bg-white rounded-xl p-6 border border-gray-200 items-center">
              <Text
                className="text-gray-500 italic text-center"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("upgradePremium.noSubscriptionPlansAvailable")}{" "}
                {/* Changed to upgradePremium */}
              </Text>
            </View>
          ) : (
            products.map((product) => (
              <SubscriptionOption
                key={product.identifier}
                product={product}
                onPress={handlePurchase} // Linked to handlePurchase
                isProcessing={isProcessingPurchase}
                t={t} // Pass translation function
              />
            ))
          )}

          {/* Restore Purchases Button */}
          <TouchableOpacity
            onPress={handleRestorePurchases} // Linked to handleRestorePurchases
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
                {t("upgradePremium.restorePurchases")}{" "}
                {/* Changed to upgradePremium */}
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
            {t("upgradePremium.termsDisclaimer")}{" "}
            {/* Changed to upgradePremium */}
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
  // Safely get the period, defaulting to an empty string if undefined/null
  const period = product.product.period || ""; // e.g., "P1M" for monthly, "P1Y" for yearly

  let planLabel = "";
  // Now, check if 'period' exists (is not an empty string) before calling .includes()
  if (period && period.includes("M")) {
    planLabel = t("upgradePremium.monthlyPlan"); // Changed to upgradePremium
  } else if (period && period.includes("Y")) {
    planLabel = t("upgradePremium.yearlyPlan"); // Changed to upgradePremium
  } else {
    planLabel = product.product.periodUnit || t("upgradePremium.unknownPlan"); // Changed to upgradePremium
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
