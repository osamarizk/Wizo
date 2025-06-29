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
import GradientBackground from "../../components/GradientBackground";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../../utils/fontUtils"; // Adjust path as needed

const PrivacyPolicy = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="mr-3 ml-3 mt-4"
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
              className={`text-3xl text-black text-center flex-1 ${
                I18nManager.isRTL ? "pr-0 pl-12" : "pr-12 pl-0" // Adjust padding for centering in RTL
              }`} // Removed font class from className
              style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
            >
              {t("privacyPolicy.pageTitle")} {/* Translated */}
            </Text>
            {/* Spacer for symmetrical layout */}
            <View className="w-10" />
          </View>

          {/* Policy Content */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text
              className="text-base text-gray-800 leading-relaxed" // Removed font-pregular
              style={{
                fontFamily: getFontClassName("regular"),
                textAlign: I18nManager.isRTL ? "right" : "left", // Align text based on RTL
              }}
            >
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("privacyPolicy.effectiveDate")}
              </Text>
              {"\n\n"}
              {t("privacyPolicy.intro")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("privacyPolicy.section1Title")}
              </Text>
              {"\n"}
              {t("privacyPolicy.section1Content")}
              {"\n"}- {t("privacyPolicy.section1List1")}
              {"\n"}- {t("privacyPolicy.section1List2")}
              {"\n"}- {t("privacyPolicy.section1List3")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("privacyPolicy.section2Title")}
              </Text>
              {"\n"}
              {t("privacyPolicy.section2Content")}
              {"\n"}- {t("privacyPolicy.section2List1")}
              {"\n"}- {t("privacyPolicy.section2List2")}
              {"\n"}- {t("privacyPolicy.section2List3")}
              {"\n"}- {t("privacyPolicy.section2List4")}
              {"\n"}- {t("privacyPolicy.section2List5")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("privacyPolicy.section3Title")}
              </Text>
              {"\n"}
              {t("privacyPolicy.section3Content")}
              {"\n"}-{" "}
              <Text style={{ fontFamily: getFontClassName("semibold") }}>
                {t("privacyPolicy.section3Subtitle1")}{" "}
              </Text>
              {t("privacyPolicy.section3Desc1")}
              {"\n"}-{" "}
              <Text style={{ fontFamily: getFontClassName("semibold") }}>
                {t("privacyPolicy.section3Subtitle2")}{" "}
              </Text>
              {t("privacyPolicy.section3Desc2")}
              {"\n"}-{" "}
              <Text style={{ fontFamily: getFontClassName("semibold") }}>
                {t("privacyPolicy.section3Subtitle3")}{" "}
              </Text>
              {t("privacyPolicy.section3Desc3")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("privacyPolicy.section4Title")}
              </Text>
              {"\n"}
              {t("privacyPolicy.section4Content")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("privacyPolicy.section5Title")}
              </Text>
              {"\n"}
              {t("privacyPolicy.section5Content")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("privacyPolicy.section6Title")}
              </Text>
              {"\n"}
              {t("privacyPolicy.section6Content")}
              {"\n\n"}
              <Text style={{ fontFamily: getFontClassName("bold") }}>
                {t("privacyPolicy.section7Title")}
              </Text>
              {"\n"}
              {t("privacyPolicy.section7Content")}
            </Text>
          </View>

          {/* Spacer for bottom padding */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default PrivacyPolicy;
