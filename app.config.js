import "dotenv/config";

export default {
  expo: {
    name: "Wizo",
    slug: "Wizo",
    scheme: "Wizo",
    jsEngine: "jsc",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.o7.rn1",
    },
    android: {
      package: "com.o7.rn1",
      edgeToEdge: true,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-calendar",
        {
          calendarPermission: "The app needs to access your calendar.",
        },
      ],
    ],
    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
  },
};
