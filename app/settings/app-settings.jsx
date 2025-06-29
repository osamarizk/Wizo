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
  Modal,
  Pressable,
  I18nManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, router } from "expo-router";
import GradientBackground from "../../components/GradientBackground";
import icons from "../../constants/icons";
import { useGlobalContext } from "../../context/GlobalProvider";
import { saveUserPreferences } from "../../lib/appwrite";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../../utils/fontUtils";
import i18n from "../../utils/i18n";

const convertToArabicNumerals = (num) => {
  const numString = String(num || 0); // Defensive check for null/undefined
  if (typeof numString !== "string") return String(numString);
  const arabicNumeralsMap = {
    0: "٠",
    1: "١",
    2: "٢",
    3: "٣",
    4: "٤",
    5: "٥",
    6: "٦",
    7: "٧",
    8: "٨",
    9: "٩",
  };
  return numString.replace(/\d/g, (digit) => arabicNumeralsMap[digit] || digit);
};

const ApplicationSettings = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    user,
    isLoading: globalLoading,
    applicationSettings,
    checkSessionAndFetchUser,
    currentLanguage,
    changeLanguage,
  } = useGlobalContext();

  const [enableNotifications, setEnableNotifications] = useState(
    user?.enableNotifications ?? false
  );
  const [darkMode, setDarkMode] = useState(user?.darkMode ?? false);
  const [currencyPreference, setCurrencyPreference] = useState(
    user?.currencyPreference ??
      applicationSettings?.default_currency_code ??
      "EGP"
  );

  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages = [
    { code: "en", name: t("settings.english") },
    { code: "ar", name: t("settings.arabic") },
  ];

  const isPremiumUser = user?.isPremium || false;

  useEffect(() => {
    if (user && applicationSettings) {
      setEnableNotifications(user.enableNotifications ?? false);
      setDarkMode(user.darkMode ?? false);

      setCurrencyPreference(
        user.currencyPreference ??
          applicationSettings.default_currency_code ??
          "EGP"
      );
    }
  }, [user, applicationSettings]);

  const handleLanguageSelect = async (langCode) => {
    // Made async for potential async storage
    console.log("handleLanguageSelect triggered for:", langCode);
    const prevLanguage = i18n.language; // Get current language before changing

    // Await the language change to ensure it's applied
    await changeLanguage(langCode);

    // Force RTL based on the *new* language
    const isRTL = langCode.startsWith("ar");
    if (I18nManager.isRTL !== isRTL) {
      // Only force if it's actually changing
      I18nManager.forceRTL(isRTL);
      // I18nManager.allowRTL(isRTL); // allowRTL is usually set once at app startup
      // This is crucial for applying layout changes without app restart
      // However, a full reload is often needed for deep RTL changes in native modules.
      // For simpler UI elements, forceRTL combined with styling can be enough.
      // Alert.alert(t("settings.languageChangeRestartTitle"), t("settings.languageChangeRestartMessage"));
      // if (Platform.OS !== 'web') {
      //   Updates.reloadAsync(); // For Expo Go or standalone app
      // }
    }
    setShowLanguageModal(false);
  };

  const handleSaveSettings = async () => {
    setIsLoadingSave(true);
    try {
      if (!user?.$id) {
        // Translated Alert.alert
        Alert.alert(t("common.error"), t("settings.notLoggedInSaveError"));
        return;
      }

      const preferencesToSave = {
        enableNotifications,
        darkMode,
        currencyPreference,
      };

      await saveUserPreferences(user.$id, preferencesToSave);
      await checkSessionAndFetchUser(); // Re-fetch user to update global state immediately

      // Translated Alert.alert
      Alert.alert(t("common.success"), t("settings.settingsSavedSuccess"));
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Translated Alert.alert
      Alert.alert(
        t("common.error"),
        t("settings.failedToSaveSettings", {
          error: error.message || t("common.unknownError"),
        })
      );
    } finally {
      setIsLoadingSave(false);
    }
  };

  if (globalLoading || !applicationSettings) {
    return (
      <GradientBackground>
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4E17B3" />
          <Text
            className="mt-2 text-gray-500" // Removed redundant `${getFontClassName("regular")}` as it's directly in style
            style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
          >
            {t("common.loading")} {/* Translated */}
          </Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="mr-1 ml-1"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            className={`flex-row items-center justify-between mb-8 mt-4 ${
              I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse header for RTL
            }`}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text
                className="text-blue-600 text-lg" // Removed font class from className
                style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
              >
                {t("common.back")} {/* Translated */}
              </Text>
            </TouchableOpacity>
            <Text
              className="text-2xl text-black" // Removed font class from className
              style={{ fontFamily: getFontClassName("extrabold") }} // Apply font directly
            >
              {t("settings.applicationSettingsTitle")} {/* Translated */}
            </Text>
            {/* Spacer for symmetrical layout */}
            <View className="w-10" />
          </View>

          {/* General Preferences Section */}
          <View className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
            <Text
              className={`text-xl text-gray-800 mb-4 ${
                I18nManager.isRTL ? "text-right" : "text-left" // Align title
              }`} // Removed font class from className
              style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
            >
              {t("settings.generalPreferences")} {/* Translated */}
            </Text>

            {/* Notifications Toggle (Keep disabled for now as requested) */}
            <View
              className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700" // Removed font class from className
                style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
              >
                {t("settings.enableNotifications")}{" "}
                <Text
                  className="text-sm text-gray-500" // Smaller, lighter text for "Coming Soon"
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  ({t("settings.comingSoon")})
                </Text>
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#9F54B6" }}
                thumbColor={enableNotifications ? "#D03957" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setEnableNotifications}
                value={enableNotifications}
                disabled={true}
              />
            </View>

            {/* Dark Mode Toggle (Keep disabled for now as requested) */}
            <View
              className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700" // Removed font class from className
                style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
              >
                {t("settings.darkMode")}{" "}
                <Text
                  className="text-sm text-gray-500" // Smaller, lighter text for "Coming Soon"
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  ({t("settings.comingSoon")})
                </Text>
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#9F54B6" }}
                thumbColor={darkMode ? "#D03957" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setDarkMode}
                value={darkMode}
                disabled={true}
              />
            </View>

            {/* Language Preference Section */}
            <TouchableOpacity
              className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text
                className="text-lg text-gray-700" // Removed font class from className
                style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
              >
                {t("settings.language")} {/* Translated */}
              </Text>
              <View
                className={`flex-row items-center ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
                }`}
              >
                <Text
                  className="text-lg text-gray-800" // Removed font class from className
                  style={{
                    fontFamily: getFontClassName("semibold"),
                    marginRight: I18nManager.isRTL ? 0 : 8, // Adjust margin
                    marginLeft: I18nManager.isRTL ? 8 : 0,
                  }}
                >
                  {t(
                    `settings.${
                      currentLanguage === "en" ? "english" : "arabic"
                    }`
                  )}{" "}
                  {/* Translated current language */}
                </Text>
                <Image
                  source={icons.arrowRight}
                  className="w-4 h-4"
                  tintColor="#7b7b8b" // Tint with gray for consistency
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>

            {/* Currency Preference */}
            <TouchableOpacity
              className={`flex-row items-center justify-between py-3 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
              onPress={() =>
                Alert.alert(
                  t("settings.currencyTitle"),
                  t("settings.currencyComingSoon")
                )
              }
            >
              <Text
                className="text-lg text-gray-700" // Removed font class from className
                style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
              >
                {t("settings.currencyPreference")} {/* Translated */}
              </Text>
              <View
                className={`flex-row items-center ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
                }`}
              >
                <Text
                  className="text-lg text-gray-800" // Removed font class from className
                  style={{
                    fontFamily: getFontClassName("semibold"),
                    marginRight: I18nManager.isRTL ? 0 : 8, // Adjust margin
                    marginLeft: I18nManager.isRTL ? 8 : 0,
                  }}
                >
                  {currencyPreference} {/* Display current currency code */}
                </Text>
                <Image
                  source={icons.arrowRight}
                  className="w-4 h-4"
                  tintColor="#7b7b8b" // Tint with gray for consistency
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Account Limits & Premium Features Section */}
          <View className="bg-white rounded-xl p-6 mb-6  border border-gray-200">
            <Text
              className={`text-xl text-gray-800 mb-4 ${
                I18nManager.isRTL ? "text-right" : "text-left" // Align title
              }`}
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("settings.yourPlanBenefits")} {/* Translated */}
            </Text>

            {/* Current Plan Display */}
            <View
              className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("settings.currentPlan")}: {/* Translated */}
              </Text>
              <Text
                className={`text-lg ${getFontClassName("semibold")} ${
                  isPremiumUser ? "text-[#9F54B6]" : "text-[#4E17B3]" // Purple for Premium, Orange for Free
                }`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {isPremiumUser ? t("settings.premium") : t("settings.freeTier")}{" "}
                {/* Translated */}
              </Text>
            </View>

            {/* Monthly Receipt Upload Limit */}
            <View
              className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("settings.monthlyReceiptUploadLimit")}: {/* Translated */}
              </Text>
              <Text
                className={`text-lg ${getFontClassName("semibold")} ${
                  isPremiumUser ? "text-green-600" : "text-[#b31791]" // Green for Premium, Orange for Free
                }`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {isPremiumUser
                  ? applicationSettings.premium_receipt_limit_text ||
                    t("common.unlimited")
                  : i18n.language.startsWith("ar")
                  ? convertToArabicNumerals(
                      applicationSettings.free_tier_receipt_limit || 0
                    )
                  : applicationSettings.free_tier_receipt_limit || 0}{" "}
                {/* Numeral conversion */}
              </Text>
            </View>

            {/* Monthly Receipts Download Limit */}
            <View
              className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("settings.monthlyReceiptDownloadLimit")}: {/* Translated */}
              </Text>
              <Text
                className={`text-lg ${getFontClassName("semibold")} ${
                  isPremiumUser ? "text-green-600" : "text-[#4E17B3]" // Green for Premium, Orange for Free
                }`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {isPremiumUser
                  ? applicationSettings.premium_data_downloads_text ||
                    t("common.unlimited")
                  : i18n.language.startsWith("ar")
                  ? convertToArabicNumerals(
                      applicationSettings.free_tier_data_downloads_monthly || 0
                    )
                  : applicationSettings.free_tier_data_downloads_monthly ||
                    0}{" "}
                {/* Numeral conversion */}
              </Text>
            </View>

            {/* Active Budget Limit */}
            <View
              className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("settings.activeBudgetLimit")}: {/* Translated */}
              </Text>
              <Text
                className={`text-lg ${getFontClassName("semibold")} ${
                  isPremiumUser ? "text-green-600" : "text-[#b31794]" // Green for Premium, Orange for Free
                }`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {isPremiumUser
                  ? applicationSettings.premium_budget_count_text ||
                    t("common.unlimited")
                  : i18n.language.startsWith("ar")
                  ? convertToArabicNumerals(
                      applicationSettings.free_tier_budget_count || 0
                    )
                  : applicationSettings.free_tier_budget_count || 0}{" "}
                {/* Numeral conversion */}
              </Text>
            </View>

            {/* Monthly Data Export Limit */}
            <View
              className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("settings.monthlyDataExports")}: {/* Translated */}
              </Text>
              <Text
                className={`text-lg ${getFontClassName("semibold")} ${
                  isPremiumUser ? "text-green-600" : "text-[#4E17B3]" // Green for Premium, Orange for Free
                }`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {isPremiumUser
                  ? applicationSettings.premium_data_exports_text ||
                    t("common.unlimited")
                  : i18n.language.startsWith("ar")
                  ? convertToArabicNumerals(
                      applicationSettings.free_tier_data_exports_monthly || 0
                    )
                  : applicationSettings.free_tier_data_exports_monthly ||
                    0}{" "}
                {/* Numeral conversion */}
              </Text>
            </View>

            {/* Advanced Analytics */}
            <View
              className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("settings.advancedSpendingAnalytics")}: {/* Translated */}
              </Text>
              <View
                className={`flex-row items-center ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
                }`}
              >
                {isPremiumUser &&
                applicationSettings.premium_feature_advanced_analytics ? (
                  <Image
                    source={icons.check}
                    className={`w-5 h-5 ${I18nManager.isRTL ? "ml-2" : "mr-2"}`} // Adjust margin
                    tintColor="green" // Green tint for check
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={icons.lock}
                    className={`w-5 h-5 ${I18nManager.isRTL ? "ml-2" : "mr-2"}`} // Adjust margin
                    tintColor="gray" // Gray tint for lock
                    resizeMode="contain"
                  />
                )}
                <Text
                  className={`text-lg ${getFontClassName("semibold")} ${
                    isPremiumUser &&
                    applicationSettings.premium_feature_advanced_analytics
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {isPremiumUser &&
                  applicationSettings.premium_feature_advanced_analytics
                    ? t("settings.included")
                    : t("settings.premiumStatus")}{" "}
                  {/* Translated */}
                </Text>
              </View>
            </View>

            {/* Priority Customer Support */}
            <View
              className={`flex-row items-center justify-between py-3 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("settings.priorityCustomerSupport")}: {/* Translated */}
              </Text>
              <View
                className={`flex-row items-center ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
                }`}
              >
                {isPremiumUser &&
                applicationSettings.premium_feature_priority_support ? (
                  <Image
                    source={icons.check}
                    className={`w-5 h-5 ${I18nManager.isRTL ? "ml-2" : "mr-2"}`} // Adjust margin
                    tintColor="green"
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={icons.lock}
                    className={`w-5 h-5 ${I18nManager.isRTL ? "ml-2" : "mr-2"}`} // Adjust margin
                    tintColor="gray"
                    resizeMode="contain"
                  />
                )}
                <Text
                  className={`text-lg ${getFontClassName("semibold")} ${
                    isPremiumUser &&
                    applicationSettings.premium_feature_priority_support
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {isPremiumUser &&
                  applicationSettings.premium_feature_priority_support
                    ? t("settings.included")
                    : t("settings.premiumStatus")}{" "}
                  {/* Translated */}
                </Text>
              </View>
            </View>

            {!isPremiumUser && (
              <TouchableOpacity
                onPress={() => router.push("/upgrade-premium")}
                className={`flex-row items-center justify-center p-4 rounded-md mt-6 bg-[#9F54B6]  ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
                }`}
              >
                <Image
                  source={icons.star}
                  className={`w-6 h-6 tint-white ${
                    I18nManager.isRTL ? "ml-2" : "mr-2"
                  }`} // Adjust margin
                  resizeMode="contain"
                />
                <Text
                  className="text-white text-lg"
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {t("settings.upgradeToPremium")} {/* Translated */}
                </Text>
              </TouchableOpacity>
            )}
            {isPremiumUser && (
              <View
                className={`mt-6 p-3 bg-green-50 rounded-md border border-green-200 flex-row items-center justify-center ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
                }`}
              >
                <Image
                  source={icons.trophy}
                  className={`w-5 h-5 tint-green-700 ${
                    I18nManager.isRTL ? "ml-2" : "mr-2"
                  }`} // Adjust margin
                  resizeMode="contain"
                />
                <Text
                  className="text-green-800 text-center"
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {t("settings.allPremiumFeaturesIncluded")} {/* Translated */}
                </Text>
              </View>
            )}
          </View>

          {/* Feature Management Sections */}
          <View className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
            <Text
              className={`text-xl text-gray-800 mb-4 ${
                I18nManager.isRTL ? "text-right" : "text-left" // Align title
              }`}
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("settings.featureManagement")} {/* Translated */}
            </Text>

            {/* Wallet Setup */}
            <TouchableOpacity
              onPress={() => router.push("/wallet")}
              className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("settings.walletSetup")}: {/* Translated */}
              </Text>
              <View
                className={`flex-row items-center ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
                }`}
              >
                <Text
                  className={`text-lg ${getFontClassName("semibold")} ${
                    user?.hasWalletSetup ? "text-green-600" : "text-red-500"
                  } ${I18nManager.isRTL ? "ml-2" : "mr-2"}`} // Adjust margin
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {user?.hasWalletSetup
                    ? t("settings.complete")
                    : t("settings.notSetUp")}{" "}
                  {/* Translated */}
                </Text>
                <Image
                  source={icons.arrowRight}
                  className="w-4 h-4"
                  tintColor="#7b7b8b" // Tint with gray
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>

            {/* Budgeting Setup */}
            <TouchableOpacity
              onPress={() => router.push("/budget")}
              className={`flex-row items-center justify-between py-3 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("settings.budgetingSetup")}: {/* Translated */}
              </Text>
              <View
                className={`flex-row items-center ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
                }`}
              >
                <Text
                  className={`text-lg ${getFontClassName("semibold")} ${
                    user?.hasBudgetSetup ? "text-green-600" : "text-red-500"
                  } ${I18nManager.isRTL ? "ml-2" : "mr-2"}`} // Adjust margin
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {user?.hasBudgetSetup
                    ? t("settings.complete")
                    : t("settings.notSetUp")}{" "}
                  {/* Translated */}
                </Text>
                <Image
                  source={icons.arrowRight}
                  className="w-4 h-4"
                  tintColor="#7b7b8b" // Tint with gray
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Data & Privacy Section */}
          <View className="bg-white rounded-xl p-6 mb-6  border border-gray-200">
            <Text
              className={`text-xl text-gray-800 mb-4 ${
                I18nManager.isRTL ? "text-right" : "text-left" // Align title
              }`}
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("settings.dataPrivacy")} {/* Translated */}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/settings/manage-data")}
              className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("settings.manageMyData")} {/* Translated */}
              </Text>
              <Image
                source={icons.arrowRight}
                className="w-4 h-4"
                tintColor="#7b7b8b" // Tint with gray
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/settings/privacy-controls")}
              className={`flex-row items-center justify-between py-3 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("settings.privacyControls")} {/* Translated */}
              </Text>
              <Image
                source={icons.arrowRight}
                className="w-4 h-4"
                tintColor="#7b7b8b" // Tint with gray
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Save Settings Button */}
          <TouchableOpacity
            onPress={handleSaveSettings}
            className={`rounded-md p-4 items-center justify-center ${
              isLoadingSave ? "bg-gray-400 opacity-70" : "bg-[#264653]" // Teal for save button
            }`}
            disabled={isLoadingSave}
          >
            {isLoadingSave ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                className="text-white text-lg" // Removed font class from className
                style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
              >
                {t("settings.saveSettings")} {/* Translated */}
              </Text>
            )}
          </TouchableOpacity>

          {/* Spacer for bottom padding */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>

      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLanguageModal}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={() => setShowLanguageModal(false)}
        >
          <View
            className="bg-white rounded-lg p-6 w-[80%]" // Re-added shadow-lg
            onStartShouldSetResponder={() => true}
          >
            {/* Close Icon (X) for Modal */}
            <TouchableOpacity
              onPress={() => setShowLanguageModal(false)}
              className={`absolute top-3 ${
                I18nManager.isRTL ? "left-3" : "right-3"
              } p-2 z-10`}
            >
              <Image
                source={icons.close} // Assuming icons.close exists
                className="w-5 h-5"
                tintColor="#7b7b8b" // Gray tint
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text
              className={`text-xl text-gray-800 mb-6 text-center `}
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("settings.selectLanguage")}
            </Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleLanguageSelect(lang.code)}
                className={`py-3 px-4 rounded-md mb-2 ${
                  currentLanguage === lang.code
                    ? "bg-[#E6F3F2] border border-[#2A9D8F]" // Light teal with teal border
                    : "bg-gray-50 border border-gray-200"
                } flex-row items-center justify-between ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
                }`}
              >
                <Text
                  className={`text-lg ${
                    currentLanguage === lang.code
                      ? `text-[#2A9D8F]` // Teal
                      : `text-gray-800`
                  }`}
                  style={{
                    fontFamily:
                      currentLanguage === lang.code
                        ? getFontClassName("bold")
                        : getFontClassName("regular"),
                  }}
                >
                  {lang.name}
                </Text>
                {currentLanguage === lang.code && (
                  <Image
                    source={icons.check}
                    className={`w-5 h-5 ${I18nManager.isRTL ? "ml-2" : "mr-2"}`} // Adjust margin
                    tintColor="#2A9D8F" // Corrected: Teal tint for checkmark
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </GradientBackground>
  );
};

export default ApplicationSettings;
