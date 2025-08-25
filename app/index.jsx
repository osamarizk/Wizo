import "intl";
import "intl/locale-data/jsonp/en"; // English locale data
import "intl/locale-data/jsonp/ar"; // Arabic locale data
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  I18nManager,
} from "react-native"; // NEW: Import I18nManager
import React from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/CustomButton"; // Keep if still used elsewhere, otherwise can be removed.
import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import images from "../constants/images";
import { useGlobalContext } from "../context/GlobalProvider";
import { Dimensions } from "react-native";
import GradientBackground from "../components/GradientBackground";

// import i18n from "../utils/i18n"; // No longer needed directly here, use useTranslation
import { useTranslation } from "react-i18next"; // NEW: Import useTranslation
import { getFontClassName } from "../utils/fontUtils"; // NEW: Import font utility

const Index = () => {
  const { width, height } = Dimensions.get("window");
  const { loading, isLogged } = useGlobalContext();
  const { t } = useTranslation(); // NEW: Initialize useTranslation

  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Ensure scroll view grows to fit content */}
          <View className="justify-center items-center px-4 py-3 ">
            <Image
              source={images.logoo7}
              resizeMode="contain"
              className="w-[230px] h-[105px] "
            />

            <Image
              source={images.mobrc}
              resizeMode="contain"
              style={{ width: width * 0.9, height: height * 0.3 }}
              className="mb-1"
            />

            <View className="flex-1 w-full px-4">
              {/* NEW: Added w-full and px-4 for consistent padding */}
              <Text
                className={` p-1 text-2xl text-gray-700 text-center ${getFontClassName(
                  "light"
                )}`} // NEW: Apply font class
                style={{
                  fontFamily: getFontClassName("bold"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }} // NEW: RTL text align
              >
                {t("onboarding.heroText")}
                {"\n"}
              </Text>
              <Text
                className={`text-gray-700 text-base mb-2 ${getFontClassName(
                  "regular"
                )}`} // NEW: Apply font class
                style={{
                  fontFamily: getFontClassName("semibold"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }} // NEW: RTL text align
              >
                {t("onboarding.feature1")}
                {"\n"}
                {"\n"}
                {t("onboarding.feature2")}
                {"\n"}
                {"\n"}
                {t("onboarding.feature3")}
                {"\n"}
                {"\n"}
                {t("onboarding.feature4")}
              </Text>
            </View>

            {/* Slogan Text (if you decide to uncomment it) */}
            {/* <Text
              className={`text-secondary text-2xl text-center mt-1 ${getFontClassName(
                "bold"
              )}`}
              style={{
                fontFamily: getFontClassName("bold"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              {t("onboarding.slogan")}
            </Text> */}

            <TouchableOpacity
              onPress={() => {
                router.push("/sign-in");
              }}
              className="mt-4 w-full bg-secondary rounded-md p-3 items-center justify-center" // Adjust className for your desired style
            >
              <Text
                className={`text-white text-base ${getFontClassName("bold")}`} // NEW: Apply font class
                style={{ fontFamily: getFontClassName("bold") }}
              >
                {t("onboarding.continueWithMail")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <StatusBar backgroundColor="#161622" style="dark" />
        {/* Keep StatusBar outside ScrollView for better behavior */}
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Index;
