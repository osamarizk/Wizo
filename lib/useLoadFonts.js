// useFonts.js

import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";

// Import all Cairo font variants you want to use
import {
  Cairo_200ExtraLight,
  Cairo_300Light,
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  Cairo_900Black,
} from "@expo-google-fonts/cairo";

export const useLoadFonts = () => {
  const [fontsLoaded, error] = useFonts({
    // Poppins Fonts (for LTR / English) - Keep as is
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),

    // Cairo Fonts (for Arabic) - NEW
    "Cairo-ExtraLight": Cairo_200ExtraLight,
    "Cairo-Light": Cairo_300Light,
    "Cairo-Regular": Cairo_400Regular,
    "Cairo-Medium": Cairo_500Medium,
    "Cairo-SemiBold": Cairo_600SemiBold,
    "Cairo-Bold": Cairo_700Bold,
    "Cairo-ExtraBold": Cairo_800ExtraBold,
    "Cairo-Black": Cairo_900Black,
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    if (error) {
      console.error("Font Loading Error:", error);
      throw error;
    }

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  return { fontsLoaded, error };
};
