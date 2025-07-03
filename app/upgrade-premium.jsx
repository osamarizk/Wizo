import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  I18nManager, // Import I18nManager
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, router } from "expo-router";
import GradientBackground from "../components/GradientBackground";
import icons from "../constants/icons";
import { useGlobalContext } from "../context/GlobalProvider";
import {
  updateUserPremiumStatus,
  getAppwriteErrorMessageKey,
} from "../lib/appwrite"; // Import getAppwriteErrorMessageKey

import { useTranslation } from "react-i18next"; // Import useTranslation
import { getFontClassName } from "../utils/fontUtils"; // Import getFontClassName

// --- START: REAL EXPO IAP IMPORTS & PRODUCT IDs ---
// In a REAL Expo project, you would uncomment this:
// import * as InAppPurchases from 'expo-in-app-purchases';

// IMPORTANT: Replace these with your ACTUAL Product IDs from App Store Connect and Google Play Console
const IOS_PRODUCT_ID = "com.yourcompany.yourapp.premium.monthly"; // Example: "com.o7.rn1.premium.monthly"
const ANDROID_PRODUCT_ID = "com.yourcompany.yourapp.premium.monthly"; // Example: "com.o7.rn1.premium.monthly"

const PRODUCT_IDS = Platform.select({
  ios: [IOS_PRODUCT_ID],
  android: [ANDROID_PRODUCT_ID],
  default: [],
});
// --- END: REAL EXPO IAP IMPORTS & PRODUCT IDs ---

// Benefits array will now use translation keys
const PremiumBenefitsKeys = [
  "financialAdviceUnlimited",
  "unlimitedReceiptUploads",
  "advancedSpendingAnalytics",
  "exportData",
  "priorityCustomerSupport",
  "noAds",
  "customBudgetCategories",
  // Add more compelling benefits here!
];

const UpgradePremium = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // Initialize useTranslation
  const { user, setUser, checkSessionAndFetchUser, globalLoading } =
    useGlobalContext();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [localizedPrice, setLocalizedPrice] = useState(
    t("upgradePremium.loadingPrice")
  ); // Use translation
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Ref to hold the purchase listener, allowing it to be cleaned up
  const purchaseListener = useRef(null);

  // Helper for Alert.alert with translation and error key
  const showAlert = (titleKey, messageKey, error = null) => {
    const errorKey = error ? getAppwriteErrorMessageKey(error) : null;
    let message = t(messageKey);

    if (errorKey === "appwriteErrors.genericAppwriteError" && error) {
      message = t(errorKey, { message: error.message });
    } else if (errorKey) {
      message = t(errorKey);
    }
    Alert.alert(t(titleKey), message);
  };

  // Function to fetch product details and set up IAP listeners
  const initializeIAP = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      // --- REAL EXPO IAP: Connect to stores ---
      // await InAppPurchases.connectAsync();
      // console.log("InAppPurchases connected.");

      // --- REAL EXPO IAP: Add purchase listener ---
      // This listener will fire when a purchase completes, fails, or is updated
      // purchaseListener.current = InAppPurchases.addPurchaseListener(async ({ responseCode, results, errorCode }) => {
      //    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      //        for (const purchase of results) {
      //            if (!purchase.acknowledged) { // Only process unacknowledged purchases
      //                console.log("Purchase received (needs validation):", purchase);
      //                await handleServerSideValidationAndAcknowledgement(purchase);
      //            }
      //        }
      //    } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
      //        showAlert("common.error", "appwriteErrors.purchaseCanceled");
      //        setIsSubscribing(false);
      //    } else if (responseCode === InAppPurchases.IAPResponseCode.DEFERRED) {
      //        showAlert("common.error", "appwriteErrors.purchasePending");
      //        setIsSubscribing(false);
      //    } else {
      //        console.error("IAP Response Error Code:", errorCode);
      //        showAlert("common.error", "appwriteErrors.purchaseFailedGeneric");
      //        setIsSubscribing(false);
      //    }
      // });

      // --- REAL EXPO IAP: Fetch product details ---
      // const { results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
      // if (results.length > 0) {
      //    setLocalizedPrice(results[0].localizedPrice);
      //    console.log("Fetched localized price:", results[0].localizedPrice);
      // } else {
      //    console.warn("No products found for IDs:", PRODUCT_IDS);
      //    setLocalizedPrice(t("upgradePremium.priceNotAvailable")); // Use translation
      // }

      // --- SIMULATION for Canvas environment ---
      setLocalizedPrice("EGP 99.99/month"); // Keep hardcoded for simulation price
      console.log("Simulated IAP initialization complete.");
      // --- END SIMULATION ---
    } catch (error) {
      console.error("IAP initialization error:", error);
      showAlert(
        "common.error",
        "appwriteErrors.iapInitializationFailed",
        error
      ); // Use showAlert
      setLocalizedPrice(t("upgradePremium.priceNotAvailable")); // Use translation
    } finally {
      setIsLoadingProducts(false);
    }
  }, [t]); // Add t to dependencies

  // Effect to run IAP initialization and cleanup
  useEffect(() => {
    initializeIAP();

    // Cleanup listener when component unmounts
    return () => {
      // InAppPurchases.removePurchaseListener(purchaseListener.current);
      // InAppPurchases.disconnectAsync(); // Disconnect from stores (Expo IAP)
      console.log("IAP listeners cleaned up (simulated).");
    };
  }, [initializeIAP]);

  // Handle incoming purchases (from listener)
  const handleServerSideValidationAndAcknowledgement = async (purchase) => {
    try {
      console.log("Sending purchase for server-side validation:", purchase);

      // Simulate Appwrite Function call and successful validation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const validationResponse = { success: true }; // Assume success for simulation

      if (validationResponse.success) {
        // Update user premium status in your Appwrite DB
        await updateUserPremiumStatus(user.$id, true);
        console.log(
          "User premium status updated in Appwrite after validation!"
        );

        // Acknowledge the purchase with the store (crucial for both Apple and Google)
        // await InAppPurchases.finishTransactionAsync(purchase, true); // REAL Expo IAP

        // Re-fetch global user data to update UI throughout the app
        await checkSessionAndFetchUser();

        showAlert(
          "upgradePremium.congratulationsTitle",
          "upgradePremium.congratulationsMessage"
        ); // Use showAlert
        router.replace("/settings/app-settings");
      } else {
        showAlert("common.error", "appwriteErrors.purchaseValidationFailed"); // Use showAlert
      }
    } catch (error) {
      console.error(
        "Server-side validation and acknowledgement failed:",
        error
      );
      showAlert(
        "common.error",
        "appwriteErrors.purchaseValidationFailed",
        error
      ); // Use showAlert
    } finally {
      setIsSubscribing(false); // Stop loading spinner
    }
  };

  // Check if user is already premium when they land on this page
  useEffect(() => {
    if (user?.isPremium) {
      showAlert(
        "upgradePremium.alreadyPremiumTitle",
        "upgradePremium.alreadyPremiumMessage"
      ); // Use showAlert
      router.replace("/settings/app-settings"); // Navigate back
    }
  }, [user, navigation, t]); // Add t to dependencies

  const handleSubscribeButtonPress = async () => {
    setIsSubscribing(true);
    try {
      // --- REAL EXPO IAP: Initiate the purchase ---
      // const productIdToPurchase = Platform.OS === 'ios' ? IOS_PRODUCT_ID : ANDROID_PRODUCT_ID;
      // await InAppPurchases.purchaseItemAsync(productIdToPurchase);
      // The purchaseListener will then handle the result.

      // --- SIMULATED PURCHASE (for Canvas environment) ---
      console.log("Simulating purchase initiation...");
      // Directly call the validation handler after a delay to mimic immediate success.
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const simulatedPurchase = {
        productId: Platform.OS === "ios" ? IOS_PRODUCT_ID : ANDROID_PRODUCT_ID,
        purchaseToken: `sim_android_token_${Date.now()}`,
        receipt: `sim_ios_receipt_${Date.now()}`,
        acknowledged: false,
      };
      await handleServerSideValidationAndAcknowledgement(simulatedPurchase);
      // --- END SIMULATED PURCHASE ---
    } catch (error) {
      console.error("Purchase initiation failed:", error);
      showAlert(
        "common.error",
        "appwriteErrors.purchaseInitiationFailed",
        error
      ); // Use showAlert
      setIsSubscribing(false);
    }
  };

  // Show loading spinner if products are still being fetched or if global context is loading
  if (isLoadingProducts || globalLoading) {
    return (
      <GradientBackground>
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4E17B3" />
          <Text
            className="mt-2 text-gray-500"
            style={{ fontFamily: getFontClassName("regular") }} // Apply font
          >
            {t("upgradePremium.loadingDetails")} {/* Use translation */}
          </Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingTop: 15,
            paddingBottom: 10,
          }}
        >
          {/* Header */}
          <View
            className={`flex-row items-center justify-between mb-8 mt-4 ${
              I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // RTL alignment
            }`}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text
                className="text-blue-600 text-lg"
                style={{ fontFamily: getFontClassName("medium") }} // Apply font
              >
                {t("common.back")} {/* Use translation */}
              </Text>
            </TouchableOpacity>
            <Text
              className="text-2xl text-black"
              style={{ fontFamily: getFontClassName("bold") }} // Apply font
            >
              {t("upgradePremium.goPremiumTitle")} {/* Use translation */}
            </Text>
            <View className="w-10" />
          </View>

          {/* Premium Benefits Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-purple-200">
            <Text
              className={`text-2xl text-purple-800 mb-4 text-center `}
              style={{ fontFamily: getFontClassName("bold") }} // Apply font
            >
              {t("upgradePremium.unlockFeaturesTitle")} {/* Use translation */}
            </Text>
            <Image
              source={icons.star}
              className="w-20 h-20 tint-yellow-500 self-center mb-6"
              resizeMode="contain"
            />

            {PremiumBenefitsKeys.map(
              (
                key,
                index // Iterate over keys
              ) => (
                <View
                  key={index}
                  className={`flex-row items-center mb-3 ${
                    I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // RTL alignment
                  }`}
                >
                  <Image
                    source={icons.check}
                    className={`w-5 h-5 tint-green-500 ml-3 mr-3 ${
                      I18nManager.isRTL ? "ml-3" : "mr-3" // Adjust margin for RTL
                    }`}
                    resizeMode="contain"
                  />
                  <Text
                    className={`text-lg text-gray-700 flex-1 ${
                      I18nManager.isRTL ? "text-right" : "text-left" // RTL alignment
                    }`}
                    style={{ fontFamily: getFontClassName("bold") }} // Apply font
                  >
                    {t(`upgradePremium.${key}`)} {/* Use translation */}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Pricing Call to Action */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-purple-200">
            <Text
              className="text-2xl text-black mb-2 text-center"
              style={{ fontFamily: getFontClassName("bold") }} // Apply font
            >
              {localizedPrice}
            </Text>
            <Text
              className="text-base text-gray-600 text-center mb-4"
              style={{ fontFamily: getFontClassName("regular") }} // Apply font
            >
              {t("upgradePremium.cancelAnytime")} {/* Use translation */}
            </Text>
            <TouchableOpacity
              onPress={handleSubscribeButtonPress}
              className={`flex-row items-center justify-center p-4 rounded-md ${
                isSubscribing ? "bg-purple-300" : "bg-purple-600"
              }`}
              disabled={isSubscribing}
            >
              {isSubscribing ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  className={`${I18nManager.isRTL ? "ml-2" : "mr-2"}`} // Adjust margin for RTL
                />
              ) : (
                <Image
                  source={icons.star}
                  className={`w-6 h-6 tint-white ml-2 mr-2 ${
                    I18nManager.isRTL ? "ml-2" : "mr-2" // Adjust margin for RTL
                  }`}
                  resizeMode="contain"
                />
              )}
              <Text
                className="text-white text-lg"
                style={{ fontFamily: getFontClassName("bold") }} // Apply font
              >
                {isSubscribing
                  ? t("upgradePremium.subscribingButton")
                  : t("upgradePremium.subscribeNowButton")}{" "}
                {/* Use translation */}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spacer for bottom padding */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default UpgradePremium;
