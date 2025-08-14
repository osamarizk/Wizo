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
  Linking,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n";
import GradientBackground from "../components/GradientBackground";
import icons from "../constants/icons";
import * as Clipboard from "expo-clipboard";

// --- RevenueCat Imports ---
import Purchases from "react-native-purchases";
import Constants from "expo-constants";
// --- END RevenueCat Imports ---

// --- Appwrite Imports ---
import {
  updateUserPremiumStatus,
  createNotification,
  countUnreadNotifications,
  getFutureDate,
} from "../lib/appwrite";
// --- END Appwrite Imports ---

const REVENUECAT_APPLE_API_KEY =
  Constants.expoConfig.extra.REVENUECAT_APPLE_API_KEY;
const REVENUECAT_GOOGLE_API_KEY =
  Constants.expoConfig.extra.REVENUECAT_GOOGLE_API_KEY;
const PREMIUM_ENTITLEMENT_ID = "resynqent";

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
  const [products, setProducts] = useState([]);
  const [purchaseError, setPurchaseError] = useState(null);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [willRenew, setWillRenew] = useState(true);

  // --- MODIFIED: State for debug information, panel visibility, and user check ---
  const [debugInfo, setDebugInfo] = useState("");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [isOsamaUser, setIsOsamaUser] = useState(false);

  // --- NEW: Helper function to format debug information ---
  const formatDebugInfo = (customerInfo) => {
    let debugText = "--- Debug Information ---\n";
    debugText += `User ID: ${user?.$id || "Anonymous"}\n`;
    debugText += `Email: ${user?.email || "N/A"}\n`;
    debugText += `Appwrite Premium Status: ${user?.isPremium}\n`;
    debugText += "-------------------------\n\n";
    debugText += "--- RevenueCat Customer Info ---\n";
    debugText += JSON.stringify(customerInfo, null, 2);
    return debugText;
  };

  // --- Listener as a stable callback ---
  const customerInfoUpdateListener = useCallback(
    async (customerInfo) => {
      console.log(
        "RevenueCat: Customer info updated from listener:",
        customerInfo
      );

      // --- MODIFIED: Capture debug info on every update if the user is the debug user ---
      if (user?.email === "osamarizk20@gmail.com") {
        setDebugInfo(formatDebugInfo(customerInfo));
      }

      const activeEntitlement =
        customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
      const isPremium = !!activeEntitlement;

      // --- MODIFIED: Also update the willRenew state here ---
      if (activeEntitlement) {
        setWillRenew(activeEntitlement.willRenew);
      }

      if (user?.isPremium === isPremium) {
        console.log("Premium status unchanged. No Appwrite update needed.");
        return;
      }

      try {
        if (user?.$id) {
          const subscriptionType = isPremium
            ? activeEntitlement.productIdentifier.includes("monthly")
              ? "monthly"
              : "yearly"
            : null;
          const renewalDate = isPremium
            ? activeEntitlement.expirationDate
            : null;
          const premiumStartDate = isPremium
            ? activeEntitlement.purchaseDate
            : null;

          await updateUserPremiumStatus(
            user.$id,
            isPremium,
            subscriptionType,
            renewalDate,
            premiumStartDate
          );

          setUser((prevUser) => ({
            ...prevUser,
            isPremium: isPremium,
            subscriptionType: subscriptionType,
            renewalDate: renewalDate,
            premiumStartDate: premiumStartDate,
          }));

          console.log(
            `Appwrite user ${user.$id} premium status updated via listener.`
          );

          await createNotification({
            user_id: user.$id,
            title: isPremium
              ? t("notifications.premiumActivatedTitle")
              : t("notifications.premiumDeactivatedTitle"),
            message: isPremium
              ? t("notifications.premiumActivatedMessage")
              : t("notifications.premiumDeactivatedMessage"),
            type: "premium_status",
            expiresAt: getFutureDate(isPremium ? 30 : 7),
          });
          const updatedUnreadCountValue = await countUnreadNotifications(
            user.$id
          );
          updateUnreadCount(updatedUnreadCountValue);
        }
      } catch (err) {
        console.error("Error processing customer info update:", err);
      }
    },
    [user, t, setUser, updateUnreadCount]
  );

  useEffect(() => {
    const configureAndFetchProducts = async () => {
      try {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        if (Platform.OS === "ios") {
          Purchases.configure({ apiKey: REVENUECAT_APPLE_API_KEY });
        } else if (Platform.OS === "android") {
          Purchases.configure({ apiKey: REVENUECAT_GOOGLE_API_KEY });
        } else {
          console.warn(
            "RevenueCat not configured for this platform:",
            Platform.OS
          );
          setIsLoadingProducts(false);
          return;
        }

        if (user?.$id) {
          await Purchases.logIn(user.$id);
          console.log("RevenueCat identified user:", user.$id);
        } else {
          console.warn("RevenueCat: User not logged in, using anonymous ID.");
        }

        // --- NEW: Check if the user is the debug user ---
        if (user?.email === "osamarizk20@gmail.com") {
          setIsOsamaUser(true);
        } else {
          setIsOsamaUser(false);
        }

        const customerInfo = await Purchases.getCustomerInfo();

        // --- MODIFIED: Capture debug info immediately after fetching if the user is the debug user ---
        if (isOsamaUser) {
          setDebugInfo(formatDebugInfo(customerInfo));
        }

        const activeEntitlement =
          customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
        const isPremiumFromRevenueCat = !!activeEntitlement;

        // --- MODIFIED: Set the willRenew state from the initial fetch ---
        if (activeEntitlement) {
          setWillRenew(activeEntitlement.willRenew);
        } else {
          setWillRenew(false);
        }

        if (user?.isPremium !== isPremiumFromRevenueCat) {
          console.log("Appwrite status is out of sync. Updating Appwrite...");
          if (user?.$id) {
            const subscriptionType = isPremiumFromRevenueCat
              ? activeEntitlement.productIdentifier.includes("monthly")
                ? "monthly"
                : "yearly"
              : null;
            const renewalDate = isPremiumFromRevenueCat
              ? activeEntitlement.expirationDate
              : null;
            const premiumStartDate = isPremiumFromRevenueCat
              ? activeEntitlement.purchaseDate
              : null;

            await updateUserPremiumStatus(
              user.$id,
              isPremiumFromRevenueCat,
              subscriptionType,
              renewalDate,
              premiumStartDate
            );

            setUser((prevUser) => ({
              ...prevUser,
              isPremium: isPremiumFromRevenueCat,
              subscriptionType: subscriptionType,
              renewalDate: renewalDate,
              premiumStartDate: premiumStartDate,
            }));
          }
        }

        if (isPremiumFromRevenueCat && activeEntitlement) {
          setActiveSubscription({
            renewalDate: new Date(
              activeEntitlement.expirationDate
            ).toLocaleDateString(),
            subscriptionType: activeEntitlement.productIdentifier.includes(
              "monthly"
            )
              ? t("upgradePremium.monthlyPlan")
              : t("upgradePremium.yearlyPlan"),
          });
        }

        const offerings = await Purchases.getOfferings();
        if (
          offerings.current &&
          offerings.current.availablePackages.length > 0
        ) {
          const monthlyProduct = offerings.current.availablePackages.find(
            (pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.MONTHLY
          );
          const yearlyProduct = offerings.current.availablePackages.find(
            (pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL
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
            message: error.message || t("common.unknownError"),
          })
        );
      } finally {
        setIsLoadingProducts(false);
      }
    };

    configureAndFetchProducts();

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
    };
  }, [user, isOsamaUser]);

  // --- NEW: Function to copy debug info ---
  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(debugInfo);
      Alert.alert("Success", "Debug information copied to clipboard!");
    } catch (e) {
      Alert.alert("Error", "Failed to copy to clipboard.");
      console.error("Clipboard copy error:", e);
    }
  };

  const handlePurchase = async (productPackage) => {
    if (isProcessingPurchase) return;
    setIsProcessingPurchase(true);
    setPurchaseError(null);
    try {
      console.log("Attempting to purchase package:", productPackage.identifier);
      const { customerInfo } = await Purchases.purchasePackage(productPackage);
      const isPremium = customerInfo.entitlements.active.hasOwnProperty(
        PREMIUM_ENTITLEMENT_ID
      );

      if (isPremium) {
        Alert.alert(
          t("common.successTitle"),
          t("upgradePremium.purchaseSuccess")
        );
        router.back();
      } else {
        Alert.alert(
          t("common.errorTitle"),
          t("upgradePremium.purchaseFailedGeneric")
        );
      }
    } catch (e) {
      if (!e.userCancelled) {
        console.error("Purchase error:", e);
        let errorMessage = t("upgradePremium.purchaseFailedGeneric");
        if (
          e.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR
        ) {
          errorMessage = t("upgradePremium.purchaseNotAllowed");
        } else if (
          e.code === Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR
        ) {
          errorMessage = t("upgradePremium.paymentPending");
        } else if (
          e.code ===
          Purchases.PURCHASES_ERROR_CODE
            .PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR
        ) {
          errorMessage = t("upgradePremium.productNotAvailable");
        } else if (
          e.code ===
          Purchases.PURCHASES_ERROR_CODE.PURCHASE_INVALID_FOR_PRODUCT_ERROR
        ) {
          errorMessage = t("upgradePremium.purchaseInvalid");
        } else if (
          e.code === Purchases.PURCHASES_ERROR_CODE.CANNOT_FIND_PRODUCT
        ) {
          errorMessage = t("upgradePremium.cannotFindProduct");
        }
        Alert.alert(t("common.errorTitle"), errorMessage);
        setPurchaseError(errorMessage);
      } else {
        console.log("Purchase cancelled by user.");
      }
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (isProcessingPurchase) return;
    setIsProcessingPurchase(true);
    setPurchaseError(null);
    try {
      console.log("Attempting to restore purchases...");
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = customerInfo.entitlements.active.hasOwnProperty(
        PREMIUM_ENTITLEMENT_ID
      );
      if (isPremium) {
        Alert.alert(
          t("common.successTitle"),
          t("upgradePremium.restoreSuccess")
        );
        router.back();
      } else {
        Alert.alert(
          t("common.infoTitle"),
          t("upgradePremium.noActivePurchasesFound")
        );
      }
    } catch (e) {
      console.error("Restore purchases error:", e);
      let errorMessage = t("upgradePremium.restoreFailedGeneric");
      if (e.code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR) {
        errorMessage = t("upgradePremium.networkError");
      }
      Alert.alert(t("common.errorTitle"), errorMessage);
      setPurchaseError(errorMessage);
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      if (Platform.OS === "ios") {
        await Purchases.showManageSubscriptions();
      } else if (Platform.OS === "android") {
        await Linking.openURL(
          "https://play.google.com/store/account/subscriptions"
        );
      }

      // --- This alert is only shown when a user is managing their subscription (i.e., canceling) ---
      Alert.alert(
        t("upgradePremium.cancellationInitiatedTitle"),
        t("upgradePremium.cancellationInitiatedMessage")
      );

      // Navigate back after a short delay to prevent the "ghost subscription" view
      setTimeout(() => {
        router.back();
      }, 3000); // 3-second delay
    } catch (e) {
      console.error("Error managing subscription:", e);
      Alert.alert(
        t("common.errorTitle"),
        t("upgradePremium.manageSubscriptionError")
      );
    }
  };

  if (globalLoading || isLoadingProducts) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text
          className="text-white mt-4"
          style={{ fontFamily: getFontClassName("extralight") }}
        >
          {t("upgradePremium.loadingSubscriptions")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="p-4 mt-6"
        >
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
              {t("upgradePremium.upgradeToPremiumTitle")}
            </Text>
            <View className="w-10" />
          </View>
          {purchaseError && (
            <Text
              className="text-red-500 text-center mb-4"
              style={{ fontFamily: getFontClassName("medium") }}
            >
              {purchaseError}
            </Text>
          )}
          {user?.isPremium ? (
            <View className="bg-white rounded-xl p-6 mb-6 border border-gray-200 items-center">
              <Image
                source={icons.check}
                className="w-10 h-10 mb-4"
                tintColor="#2A9D8F"
                resizeMode="contain"
              />
              <Text
                className="text-2xl text-black text-center mb-2"
                style={{ fontFamily: getFontClassName("bold") }}
              >
                {t("upgradePremium.youArePremium")}
              </Text>
              {activeSubscription && (
                <>
                  <Text
                    className="text-base text-gray-700 text-center mb-1"
                    style={{ fontFamily: getFontClassName("regular") }}
                  >
                    {t("upgradePremium.yourPlan")}:{" "}
                    {activeSubscription.subscriptionType}
                  </Text>
                  {willRenew ? (
                    <Text
                      className="text-base text-gray-700 text-center"
                      style={{ fontFamily: getFontClassName("regular") }}
                    >
                      {t("upgradePremium.nextRenewal")}:{" "}
                      {activeSubscription.renewalDate}
                    </Text>
                  ) : (
                    <Text
                      className="text-base text-red-500 text-center"
                      style={{ fontFamily: getFontClassName("regular") }}
                    >
                      {t("upgradePremium.subscriptionExpires")}:{" "}
                      {activeSubscription.renewalDate}
                    </Text>
                  )}
                </>
              )}
              {/* --- MODIFIED: Conditional button based on `willRenew` to fix the resubscribe issue --- */}
              {willRenew ? (
                <TouchableOpacity
                  onPress={handleManageSubscription}
                  className="mt-4 p-4 rounded-lg bg-blue-600 items-center w-full"
                >
                  <Text
                    className="text-white text-lg"
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    {t("upgradePremium.manageSubscription")}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => router.back()} // Resubscribe action takes the user back to the list of plans
                  className="mt-4 p-4 rounded-lg bg-red-600 items-center w-full"
                >
                  <Text
                    className="text-white text-lg"
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    {t("upgradePremium.resubscribe")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <View className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
                <Text
                  className={`text-xl text-black mb-4 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("bold") }}
                >
                  {t("upgradePremium.unlockPremiumBenefits")}
                </Text>
                <BenefitItem
                  text={t("upgradePremium.unlimitedReceipts")}
                  icon={icons.check}
                />
                <BenefitItem
                  text={t("upgradePremium.advancedSpendingAnalytics")}
                  icon={icons.check}
                />
                <BenefitItem
                  text={t("upgradePremium.priorityCustomerSupport")}
                  icon={icons.check}
                />
                <BenefitItem
                  text={t("upgradePremium.addFree")}
                  icon={icons.check}
                />
                <BenefitItem
                  text={t("upgradePremium.customBudgets")}
                  icon={icons.check}
                />
              </View>

              <Text
                className={`text-2xl text-black mb-4 ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`}
                style={{ fontFamily: getFontClassName("bold") }}
              >
                {t("upgradePremium.chooseYourPlan")}
              </Text>

              {products.length === 0 ? (
                <View className="bg-white rounded-xl p-6 border border-gray-200 items-center">
                  <Text
                    className="text-gray-500 italic text-center"
                    style={{ fontFamily: getFontClassName("regular") }}
                  >
                    {t("upgradePremium.noSubscriptionPlansAvailable")}
                  </Text>
                </View>
              ) : (
                products.map((product) => (
                  <SubscriptionOption
                    key={product.identifier}
                    product={product}
                    onPress={handlePurchase}
                    isProcessing={isProcessingPurchase}
                    t={t}
                  />
                ))
              )}

              <TouchableOpacity
                onPress={handleRestorePurchases}
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
                    {t("upgradePremium.restorePurchases")}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <Text
            className={`text-xs text-gray-500 text-center mt-6 ${
              I18nManager.isRTL ? "text-right" : "text-left"
            }`}
            style={{ fontFamily: getFontClassName("regular") }}
          >
            {t("upgradePremium.termsDisclaimer")}
          </Text>

          {/* --- MODIFIED: Conditional rendering of the entire debug panel --- */}
          {isOsamaUser && (
            <View className="mt-8 bg-gray-100 p-4 rounded-xl">
              <TouchableOpacity
                onPress={() => setShowDebugPanel(!showDebugPanel)}
                className="flex-row items-center justify-between"
              >
                <Text
                  className="text-lg font-bold text-gray-800"
                  style={{ fontFamily: getFontClassName("bold") }}
                >
                  {t("upgradePremium.debugInfoToggle")}
                </Text>
                <Image
                  source={showDebugPanel ? icons.upArrow : icons.downArrow}
                  className="w-4 h-4"
                  resizeMode="contain"
                  tintColor="#4B5563"
                />
              </TouchableOpacity>

              {showDebugPanel && (
                <View className="mt-4">
                  <Text
                    className="text-xs text-gray-600"
                    style={{ fontFamily: getFontClassName("regular") }}
                  >
                    {debugInfo}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCopyToClipboard}
                    className="mt-4 p-3 rounded-lg bg-gray-300 items-center"
                  >
                    <Text
                      className="text-gray-800"
                      style={{ fontFamily: getFontClassName("semibold") }}
                    >
                      {t("upgradePremium.copyDebugInfo")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const BenefitItem = ({ text, icon }) => {
  const { I18nManager } = require("react-native");
  const { getFontClassName } = require("../utils/fontUtils");
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

const SubscriptionOption = ({ product, onPress, isProcessing, t }) => {
  const { I18nManager } = require("react-native");
  const { getFontClassName } = require("../utils/fontUtils");

  const price = product.product.priceString;
  const productDescription = product.product.description || "";
  const title = product.product.title;
  const period = product.product.period || "";

  let planLabel = "";
  let subscriptionLengthText = "";

  if (period && period.includes("M")) {
    planLabel = t("upgradePremium.monthlyPlan");
    subscriptionLengthText = t("upgradePremium.monthlySubscriptionLength");
  } else if (period && period.includes("Y")) {
    planLabel = t("upgradePremium.yearlyPlan");
    subscriptionLengthText = t("upgradePremium.yearlySubscriptionLength");
  } else {
    planLabel = product.product.periodUnit || t("upgradePremium.unknownPlan");
  }

  const serviceDescription = t("upgradePremium.serviceDescription");

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
        {title} ({price})
      </Text>
      <Text
        className={`text-base text-gray-700 mb-1 ${
          I18nManager.isRTL ? "text-right" : "text-left"
        }`}
        style={{ fontFamily: getFontClassName("regular") }}
      >
        {subscriptionLengthText}
      </Text>
      <Text
        className={`text-base text-gray-700 ${
          I18nManager.isRTL ? "text-right" : "text-left"
        }`}
        style={{ fontFamily: getFontClassName("regular") }}
      >
        {productDescription || serviceDescription}
      </Text>
    </TouchableOpacity>
  );
};

export default UpgradePremium;
