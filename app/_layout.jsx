import {
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  UIManager,
  View,
  Image,
} from "react-native";
import React from "react";
import { useLoadFonts } from "../lib/useLoadFonts";
import GlobalProvider from "../context/GlobalProvider";

import { Stack } from "expo-router";

const RootLayout = () => {
  // Laod fonts and handle errorrs of font loading
  const { fontsLoaded, error } = useLoadFonts();
  if (!fontsLoaded && !error) return null;
  // if (
  //   Platform.OS === "android" &&
  //   UIManager.setLayoutAnimationEnabledExperimental
  // ) {
  //   UIManager.setLayoutAnimationEnabledExperimental(true);
  // }
  return (
    // <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    //   <KeyboardAvoidingView
    //     behavior={Platform.OS === "ios" ? "padding" : "height"} // Moves content up when keyboard appears
    //     style={{ flex: 1 }}
    //   >
    <GlobalProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen
          name="notification"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen name="budget-insights" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
      </Stack>
    </GlobalProvider>
    // </KeyboardAvoidingView>
    // </TouchableWithoutFeedback>
  );
};

export default RootLayout;
