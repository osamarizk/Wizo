// _layout.jsx

import {
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  UIManager,
  View,
  Image,
  StyleSheet,
  I18nManager,
  Text,
  Alert, // Make sure Alert is imported
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLoadFonts } from "../lib/useLoadFonts";
import GlobalProvider from "../context/GlobalProvider";
import i18n from "../utils/i18n"; // Import your i18next instance

import { Stack, SplashScreen } from "expo-router";

// This block runs once when the JavaScript module is loaded.
// It sets the initial I18nManager state based on the language.
const initialI18nLanguage =
  typeof i18n.language === "string" ? i18n.language : "en";
const initialLocaleIsRTL = initialI18nLanguage.startsWith("ar");
if (I18nManager.isRTL !== initialLocaleIsRTL) {
  I18nManager.forceRTL(initialLocaleIsRTL);
  I18nManager.allowRTL(initialLocaleIsRTL);
  console.log(
    `_layout.jsx (initial outside component): I18nManager.forceRTL set to ${initialLocaleIsRTL}. App restart likely needed for full effect.`
  );
}

const RootLayout = () => {
  const { fontsLoaded, error } = useLoadFonts();
  const [currentDisplayLanguage, setCurrentDisplayLanguage] = useState(
    i18n.language
  );
  const [currentDisplayRTL, setCurrentDisplayRTL] = useState(I18nManager.isRTL);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      console.log(
        `_layout.jsx: i18next 'languageChanged' event fired! New language: ${lng}`
      );

      const shouldBeRTL = lng.startsWith("ar");

      setCurrentDisplayLanguage(lng);
      setCurrentDisplayRTL(shouldBeRTL);

      if (I18nManager.isRTL !== shouldBeRTL) {
        console.log(
          `_layout.jsx useEffect (languageChanged event): I18nManager.isRTL (${I18nManager.isRTL}) !== shouldBeRTL (${shouldBeRTL}). Forcing new RTL state.`
        );
        I18nManager.forceRTL(shouldBeRTL);
        I18nManager.allowRTL(shouldBeRTL);

        // --- UNCOMMENT THIS ALERT! ---
      } else {
        console.log(
          `_layout.jsx useEffect (languageChanged event): I18nManager.isRTL (${I18nManager.isRTL}) already matches shouldBeRTL (${shouldBeRTL}). No I18nManager change needed.`
        );
      }
    };

    i18n.on("languageChanged", handleLanguageChange);
    handleLanguageChange(i18n.language); // Call once on mount

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Error loading fonts:", error);
      SplashScreen.hideAsync();
    }
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  const appContainerStyle = {
    direction: currentDisplayRTL ? "rtl" : "ltr",
    flex: 1,
  };

  return (
    <GlobalProvider>
      <View style={appContainerStyle}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="notification" options={{ headerShown: false }} />
          <Stack.Screen
            name="budget-insights"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="account" options={{ headerShown: false }} />
          <Stack.Screen
            name="financial-insights"
            options={{ headerShown: false }}
          />
        </Stack>

        {/* financial-insights */}

        {/* Debugging Text (optional, can be commented out in production) */}
        {/* <View
          style={{
            position: "absolute",
            bottom: 50,
            left: 10,
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: 5,
            borderRadius: 5,
            zIndex: 999,
          }}
        >
          <Text style={{ color: "white", fontSize: 10 }}>
            I18nManager.isRTL (Native): {I18nManager.isRTL ? "TRUE" : "FALSE"}
          </Text>
          <Text style={{ color: "white", fontSize: 10 }}>
            i18n.language (i18next): {currentDisplayLanguage}
          </Text>
          <Text style={{ color: "white", fontSize: 10 }}>
            Component Display RTL: {currentDisplayRTL ? "TRUE" : "FALSE"}
          </Text>
        </View> */}
      </View>
    </GlobalProvider>
  );
};

export default RootLayout;
