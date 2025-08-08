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

  // --- Listener as a stable callback ---
  // This listener is still required to handle subscription status changes while the app is open.
  const customerInfoUpdateListener = useCallback(
    async (customerInfo) => {
      console.log(
        "RevenueCat: Customer info updated from listener:",
        customerInfo
      );
      const activeEntitlement =
        customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
      const isPremium = !!activeEntitlement;

      // We only update Appwrite if there's a difference to avoid unnecessary calls.
      if (user?.isPremium === isPremium) {
        console.log("Premium status unchanged. No Appwrite update needed.");
        return;
      }

      try {
        if (user?.$id) {
          // --- BEGIN: UPDATED LOGIC ---
          // Extract the individual values from the activeEntitlement
          const subscriptionType = isPremium
            ? activeEntitlement.productIdentifier.includes("monthly")
              ? "monthly"
              : "yearly"
            : null;
          const renewalDate = isPremium
            ? activeEntitlement.latestExpirationDate
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
          // --- END: UPDATED LOGIC ---

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
        // In a real app, you might want to log this or retry
      }
    },
    [user, t, setUser, updateUnreadCount]
  );

  useEffect(() => {
    // 1. Configure RevenueCat and fetch products on component mount
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

        // This is the core logic to synchronize the state on page load.
        // Get the latest info from RevenueCat.
        const customerInfo = await Purchases.getCustomerInfo();
        const activeEntitlement =
          customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
        const isPremiumFromRevenueCat = !!activeEntitlement;

        // Compare RevenueCat's status with Appwrite's.
        if (user?.isPremium !== isPremiumFromRevenueCat) {
          console.log("Appwrite status is out of sync. Updating Appwrite...");
          // Appwrite is stale, so we update it in the background silently.
          // We use the RevenueCat data as the source of truth.
          if (user?.$id) {
            // --- BEGIN: UPDATED LOGIC ---
            // Extract the individual values from the activeEntitlement
            const subscriptionType = isPremiumFromRevenueCat
              ? activeEntitlement.productIdentifier.includes("monthly")
                ? "monthly"
                : "yearly"
              : null;
            const renewalDate = isPremiumFromRevenueCat
              ? activeEntitlement.latestExpirationDate
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
            // --- END: UPDATED LOGIC ---

            setUser((prevUser) => ({
              ...prevUser,
              isPremium: isPremiumFromRevenueCat,
              subscriptionType: subscriptionType,
              renewalDate: renewalDate,
              premiumStartDate: premiumStartDate,
            }));
          }
        }

        // Now, get the subscription details to display if the user is premium.
        if (isPremiumFromRevenueCat) {
          setActiveSubscription({
            renewalDate: new Date(
              activeEntitlement.latestExpirationDate
            ).toLocaleDateString(),
            subscriptionType: activeEntitlement.productIdentifier.includes(
              "monthly"
            )
              ? t("upgradePremium.monthlyPlan")
              : t("upgradePremium.yearlyPlan"),
          });
        }

        // Fetch products for the UI
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
  }, [user]);

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
        await Purchases.presentCodeRedemptionSheet();
      } else if (Platform.OS === "android") {
        await Linking.openURL(
          "https://play.google.com/store/account/subscriptions"
        );
      }
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
                  <Text
                    className="text-base text-gray-700 text-center"
                    style={{ fontFamily: getFontClassName("regular") }}
                  >
                    {t("upgradePremium.nextRenewal")}:{" "}
                    {activeSubscription.renewalDate}
                  </Text>
                </>
              )}
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
