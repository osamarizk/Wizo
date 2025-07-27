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

const AboutUs = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Function to open external URLs (e.g., email, support page)
  const openExternalLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t("common.error"), t("aboutUs.linkOpenError"));
      }
    } catch (error) {
      console.error("Failed to open link:", error);
      Alert.alert(t("common.error"), t("aboutUs.linkOpenError"));
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
              {t("aboutUs.pageTitle")}
            </Text>
            {/* Spacer for symmetrical layout */}
            <View className="w-10" />
          </View>

          {/* About Us Content */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text
              className="text-base text-gray-800 leading-relaxed mb-4"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              {t("aboutUs.intro")}
            </Text>

            <Text
              className="text-xl text-gray-800 font-semibold mb-2"
              style={{ fontFamily: getFontClassName("semibold") }}
            >
              {t("aboutUs.ourVisionTitle")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-4"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              {t("aboutUs.ourVisionContent")}
            </Text>

            <Text
              className="text-xl text-gray-800 font-semibold mb-2"
              style={{ fontFamily: getFontClassName("semibold") }}
            >
              {t("aboutUs.ourCommitmentTitle")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              {t("aboutUs.ourCommitmentList1")}
              {"\n"}
              {t("aboutUs.ourCommitmentList2")}
              {"\n"}
              {t("aboutUs.ourCommitmentList3")}
              {"\n"}
              {t("aboutUs.ourCommitmentList4")}
            </Text>

            {/* Contact Us */}
            <Text
              className="text-xl text-gray-800 font-semibold mt-6 mb-2"
              style={{ fontFamily: getFontClassName("semibold") }}
            >
              {t("aboutUs.contactUsTitle")}
            </Text>
            <Text
              className="text-base text-gray-800 leading-relaxed mb-2"
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              {t("aboutUs.contactUsIntro")}
            </Text>
            <TouchableOpacity
              onPress={() => openExternalLink("mailto:support@resynq.com")}
            >
              <Text
                className="text-blue-600 text-base underline mb-1"
                style={{
                  fontFamily: getFontClassName("regular"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              >
                {t("aboutUs.contactEmail")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openExternalLink("https://www.resynq.com/support")}
            >
              <Text
                className="text-blue-600 text-base underline"
                style={{
                  fontFamily: getFontClassName("regular"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              >
                {t("aboutUs.contactWebsite")}
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

export default AboutUs;
