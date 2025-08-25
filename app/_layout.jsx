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
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLoadFonts } from "../lib/useLoadFonts";
import GlobalProvider from "../context/GlobalProvider";
import i18n from "../utils/i18n";
import { Stack, SplashScreen, router } from "expo-router"; // NEW: Import router from expo-router
import { useAppUpdates } from "../lib/useAppUpdates";
import * as Notifications from "expo-notifications"; // NEW: Import Notifications

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

// Set up notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const RootLayout = () => {
  useAppUpdates();
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

  // NEW: Effect to handle notification responses
  useEffect(() => {
    // This listener is crucial for handling notifications that are tapped on.
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("User tapped on a notification.");
        const notificationData = response.notification.request.content.data;
        console.log("Notification payload data:", notificationData);

        // Check if there's a specific page to navigate to
        if (notificationData.page === "spending") {
          router.push("(tabs)/spending");
          return; // Exit the function after navigating
        }
        // Check for a receiptId in the data. You should add a 'type' key to be more robust.
        // If a receiptId exists, navigate to the notification page.
        if (notificationData.receiptId) {
          router.push({
            pathname: "/notification",
            params: { notificationData: JSON.stringify(notificationData) },
          });
        }
        // You can add more conditions here for other types of notifications
        // else if (notificationData.budgetId) {
        //   router.push({
        //     pathname: "/notification",
        //     params: { notificationData: JSON.stringify(notificationData) }
        //   });
        // }
      });

    // Clean up the listener when the component unmounts
    return () => {
      responseListener.remove();
    };
  }, []); // Run only once when the component mounts

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
          <Stack.Screen
            name="upgrade-premium"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="account" options={{ headerShown: false }} />
          <Stack.Screen
            name="financial-insights"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="about-us" options={{ headerShown: false }} />
          <Stack.Screen name="help-center" options={{ headerShown: false }} />
        </Stack>
      </View>
    </GlobalProvider>
  );
};

export default RootLayout;
