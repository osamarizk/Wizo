import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  I18nManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import GradientBackground from "../../components/GradientBackground"; // Adjust path as needed
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../../utils/fontUtils";

const TermsOfService = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="mr-3 ml-3 mt-4">
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
              className={`text-3xl text-black text-center flex-1 ${
                I18nManager.isRTL ? "pr-0 pl-12" : "pr-12 pl-0" // Adjust padding for centering in RTL
              }`} // Removed font class from className
              style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
            >
              {t("termsOfService.pageTitle")} {/* Translated */}
            </Text>
            {/* Spacer for symmetrical layout */}
            <View className="w-10" />
          </View>

          {/* Terms Content */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text
              className="text-base text-gray-800 leading-relaxed" // Removed font-pregular
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left", // Align text based on RTL
              }}
            >
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("termsOfService.lastUpdated")}
              </Text>
              {"\n\n"}
              {t("termsOfService.intro")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("termsOfService.section1Title")}
              </Text>
              {"\n"}
              {t("termsOfService.section1Content")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("termsOfService.section2Title")}
              </Text>
              {"\n"}
              {t("termsOfService.section2Content1")}
              {"\n"}- {t("termsOfService.section2List1")}
              {"\n"}- {t("termsOfService.section2List2")}
              {"\n"}- {t("termsOfService.section2List3")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("termsOfService.section3Title")}
              </Text>
              {"\n"}
              {t("termsOfService.section3Content")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("termsOfService.section4Title")}
              </Text>
              {"\n"}
              {t("termsOfService.section4Content1")}
              {"\n"}
              {t("termsOfService.section4Content2")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("termsOfService.section5Title")}
              </Text>
              {"\n"}
              {t("termsOfService.section5Content")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("termsOfService.section6Title")}
              </Text>
              {"\n"}
              {t("termsOfService.section6Content")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("termsOfService.section7Title")}
              </Text>
              {"\n"}
              {t("termsOfService.section7Content")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("termsOfService.section8Title")}
              </Text>
              {"\n"}
              {t("termsOfService.section8Content")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("termsOfService.section9Title")}
              </Text>
              {"\n"}
              {t("termsOfService.section9Content1")}
              {"\n"}
              {t("termsOfService.section9Content2")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("termsOfService.section10Title")}
              </Text>
              {"\n"}
              {t("termsOfService.section10Content")}
            </Text>
          </View>

          {/* Spacer for bottom padding */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default TermsOfService;
