import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  // Alert, // Commented out Alert for clean UI
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
import icons from "../constants/icons"; // Assuming you have a checkmark or similar icon

// --- Direct StoreKit Imports (for debugging) ---
// import * as InAppPurchases from 'expo-in-app-purchases'; // Comment out for mock data
// --- END Direct StoreKit Imports ---

// --- Appwrite Imports ---
import {
  updateUserPremiumStatus,
  createNotification,
  countUnreadNotifications,
  getFutureDate,
} from "../lib/appwrite";
// --- END Appwrite Imports ---

// Define your Product IDs (MUST match App Store Connect, used for mock data)
const IOS_MONTHLY_PRODUCT_ID = "com.o7.rn1.premium.monthly"; // Your actual Apple Product ID
const IOS_YEARLY_PRODUCT_ID = "com.o7.rn1.premium.yearly"; // Your actual Apple Product ID (if you have one)

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
  const [storeKitProducts, setStoreKitProducts] = useState([]); // To store fetched direct StoreKit products
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // Define your premium benefits here for display
  const premiumBenefits = [
    t("upgradePremium.unlimitedReceipts"),
    t("upgradePremium.advancedSpendingAnalytics"),
    t("upgradePremium.customBudgets"),
    t("upgradePremium.cloudSync"),
    t("upgradePremium.addFree"),
    t("upgradePremium.priorityCustomerSupport"),
  ];

  // --- Configure and fetch products using direct StoreKit ---
  useEffect(() => {
    const fetchStoreKitProducts = async () => {
      setIsLoadingProducts(true);

      // --- TEMPORARY MOCK DATA FOR SCREENSHOTS ---
      const mockProducts = [
        {
          productId: IOS_MONTHLY_PRODUCT_ID,
          localizedTitle: "Premium Monthly",
          localizedDescription: "Unlock all premium features for a month!",
          price: "4.99",
          currencyCode: "USD",
          priceLocale: { currencyCode: "USD", identifier: "en_US" },
          subscriptionPeriod: { numberOfUnits: 1, unit: "MONTH" },
          introductoryPrice: null,
          discounts: [],
        },
        {
          productId: IOS_YEARLY_PRODUCT_ID,
          localizedTitle: "Premium Yearly (Save 20%)",
          localizedDescription: "Unlock all premium features for a year!",
          price: "49.99",
          currencyCode: "USD",
          priceLocale: { currencyCode: "USD", identifier: "en_US" },
          subscriptionPeriod: { numberOfUnits: 1, unit: "YEAR" },
          introductoryPrice: {
            price: "7.49",
            priceLocale: { currencyCode: "USD", identifier: "en_US" },
            subscriptionPeriod: { numberOfUnits: 1, unit: "WEEK" },
            numberOfPeriods: 1,
          },
          discounts: [],
        },
      ].filter(Boolean);

      setStoreKitProducts(mockProducts);
      // --- END TEMPORARY MOCK DATA ---

      setIsLoadingProducts(false);
    };

    fetchStoreKitProducts();
  }, []);

  // --- Purchase Logic (Placeholder for direct StoreKit - will not work with mock data) ---
  const purchaseProduct = useCallback(async (productId) => {
    // No actual purchase logic here when using mock data
  }, []);

  // --- Restore Purchases Logic (Placeholder for direct StoreKit - will not work with mock data) ---
  const restorePurchases = useCallback(async () => {
    // No actual restore logic here when using mock data
  }, []);

  // --- Loading State ---
  if (globalLoading || isLoadingProducts) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text
          className="text-white mt-2"
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-2">
          {/* Header */}
          <View
            className={`flex-row items-center justify-between mb-2 mt-2 ${
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

          {/* Unlock Premium Benefits Section */}
          <View className="bg-white rounded-xl p-4 mb-2 border border-gray-200">
            <Text
              className={`text-xl text-black mb-4 ${
                I18nManager.isRTL ? "text-right" : "text-left"
              }`}
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("upgradePremium.unlockPremiumBenefits")}{" "}
            </Text>
            {premiumBenefits.map((benefit, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <Image
                  source={icons.check} // Assuming you have a checkmark icon in your constants/icons
                  className="w-5 h-5 tint-green-500 mr-2"
                  resizeMode="contain"
                />
                <Text
                  className="text-base text-gray-800"
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          <Text
            className={`text-2xl text-black mb-2 ${
              I18nManager.isRTL ? "text-right" : "text-left"
            }`}
            style={{ fontFamily: getFontClassName("bold") }}
          >
            {t("upgradePremium.chooseYourPlan")}{" "}
          </Text>

          {/* --- Subscription Options Display (using mock data) --- */}
          {storeKitProducts.length > 0 ? (
            <View>
              {storeKitProducts.map((product) => (
                <View
                  key={product.productId}
                  className="mb-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm"
                >
                  <Text className="text-xl font-bold text-black mb-1">
                    {product.localizedTitle}
                  </Text>
                  <Text className="text-base text-gray-700 mb-2">
                    {product.localizedDescription}
                  </Text>
                  <Text className="text-2xl font-bold text-green-600 mb-3">
                    {product.price} {product.currencyCode}
                  </Text>
                  {product.introductoryPrice && (
                    <Text className="text-sm text-gray-500 mb-2">
                      {t("upgradePremium.introductoryOffer", {
                        price: product.introductoryPrice.price,
                        currency:
                          product.introductoryPrice.priceLocale.currencyCode,
                        period:
                          product.introductoryPrice.subscriptionPeriod
                            .numberOfUnits === 1
                            ? t(
                                `common.${product.introductoryPrice.subscriptionPeriod.unit.toLowerCase()}`
                              )
                            : t(
                                `common.${product.introductoryPrice.subscriptionPeriod.unit.toLowerCase()}s`,
                                {
                                  count:
                                    product.introductoryPrice.subscriptionPeriod
                                      .numberOfUnits,
                                }
                              ),
                      })}
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => purchaseProduct(product.productId)}
                    className="bg-blue-600 p-3 rounded-lg mt-2 items-center justify-center"
                    disabled={isProcessingPurchase}
                  >
                    <Text className="text-white text-lg font-bold">
                      {isProcessingPurchase
                        ? "Processing..."
                        : t("upgradePremium.subscribeNowButton")}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={restorePurchases}
                className="bg-gray-300 p-3 rounded-lg mt-2 items-center justify-center"
              >
                <Text className="text-gray-800 text-lg font-bold">
                  {t("upgradePremium.restorePurchases")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
              <Text className="text-gray-600 text-center">
                {t("upgradePremium.noPlansAvailable")}
              </Text>
              <Text className="text-xs text-gray-500 text-center mt-2">
                (Subscription plans are not currently available. Please try
                again later.)
              </Text>
            </View>
          )}
          {/* --- END Subscription Options Display --- */}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default UpgradePremium;
