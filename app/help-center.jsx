import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  I18nManager,
  Linking, // Import Linking for external links like email
  Alert, // For showing alerts on link errors
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import GradientBackground from "../components/GradientBackground";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils"; // Adjust path as needed

const HelpCenter = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Function to open external URLs (e.g., email, support page)
  const openExternalLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t("common.error"), t("helpCenter.linkOpenError"));
      }
    } catch (error) {
      console.error("Failed to open link:", error);
      Alert.alert(t("common.error"), t("helpCenter.linkOpenError"));
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingVertical: 16,
          }} // Combined padding
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
                className="text-blue-600 text-lg"
                style={{ fontFamily: getFontClassName("medium") }}
              >
                {t("common.back")}
              </Text>
            </TouchableOpacity>
            <Text
              className={`text-3xl text-black text-center flex-1 ${
                I18nManager.isRTL ? "pr-0 pl-12" : "pr-12 pl-0" // Adjust padding for centering in RTL
              }`}
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("helpCenter.pageTitle")}
            </Text>
            {/* Spacer for symmetrical layout */}
            <View className="w-10" />
          </View>

          {/* Help Center Content */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text
              className="text-base text-gray-800 leading-relaxed mb-4"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              {t("helpCenter.intro")}
            </Text>

            <Text
              className="text-xl text-gray-800 font-semibold mb-2"
              style={{ fontFamily: getFontClassName("semibold") }}
            >
              {t("helpCenter.faqTitle")}
            </Text>

            {/* Getting Started */}
            <Text
              className="text-lg text-gray-700 font-semibold mt-4 mb-2"
              style={{ fontFamily: getFontClassName("semibold") }}
            >
              {t("helpCenter.gettingStartedTitle")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("helpCenter.faq1Q")}
              </Text>
              {"\n"}
              {t("helpCenter.faq1A")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("helpCenter.faq2Q")}
              </Text>
              {"\n"}
              {t("helpCenter.faq2A")}
            </Text>

            {/* Receipt Scanning & Management */}
            <Text
              className="text-lg text-gray-700 font-semibold mt-4 mb-2"
              style={{ fontFamily: getFontClassName("semibold") }}
            >
              {t("helpCenter.receiptManagementTitle")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("helpCenter.faq3Q")}
              </Text>
              {"\n"}
              {t("helpCenter.faq3A")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("helpCenter.faq4Q")}
              </Text>
              {"\n"}
              {t("helpCenter.faq4A")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("helpCenter.faq5Q")}
              </Text>
              {"\n"}
              {t("helpCenter.faq5A")}
            </Text>

            {/* Budgeting & Analytics */}
            <Text
              className="text-lg text-gray-700 font-semibold mt-4 mb-2"
              style={{ fontFamily: getFontClassName("semibold") }}
            >
              {t("helpCenter.budgetingAnalyticsTitle")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("helpCenter.faq6Q")}
              </Text>
              {"\n"}
              {t("helpCenter.faq6A")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("helpCenter.faq7Q")}
              </Text>
              {"\n"}
              {t("helpCenter.faq7A")}
            </Text>

            {/* Troubleshooting */}
            <Text
              className="text-xl text-gray-800 font-semibold mt-6 mb-2"
              style={{ fontFamily: getFontClassName("semibold") }}
            >
              {t("helpCenter.troubleshootingTitle")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              {t("helpCenter.troubleshootingIntro")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              {t("helpCenter.troubleshootingList1")}
              {"\n"}
              {t("helpCenter.troubleshootingList2")}
              {"\n"}
              {t("helpCenter.troubleshootingList3")}
              {"\n"}
              {t("helpCenter.troubleshootingList4")}
            </Text>

            {/* Contact Support */}
            <Text
              className="text-xl text-gray-800 font-semibold mt-6 mb-2"
              style={{ fontFamily: getFontClassName("semibold") }}
            >
              {t("helpCenter.contactSupportTitle")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              {t("helpCenter.contactSupportIntro")}
            </Text>
            <TouchableOpacity
              onPress={() => openExternalLink("mailto:support@resynq.net")}
            >
              <Text
                className="text-blue-600 text-base underline mb-1"
                style={{
                  fontFamily: getFontClassName("regular"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              >
                {t("helpCenter.contactEmail")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                openExternalLink("https://resynq.net/support.html")
              }
            >
              <Text
                className="text-blue-600 text-base underline"
                style={{
                  fontFamily: getFontClassName("regular"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              >
                {t("helpCenter.contactWebsite")}
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

export default HelpCenter;
