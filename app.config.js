import "dotenv/config";

export default {
  expo: {
    name: "ResynQ",
    slug: "ResynQ",
    scheme: "ResynQ",
    jsEngine: "jsc",
    version: "1.1.1", // Your user-facing app version
    orientation: "portrait",
    icon: "./assets/icons/ResynQ-logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsRTL: true,
      supportsTablet: false,
      bundleIdentifier: "com.o7.rn1",
      buildNumber: "17",
      infoPlist: {
        NSCameraUsageDescription:
          "This app needs access to your camera to take photos of receipts.",
        NSPhotoLibraryUsageDescription:
          "This app needs access to your photo library to select receipt images.",
        NSPhotoLibraryAddUsageDescription:
          "This app needs to save photos to your photo library.",
      },
      usesIcloudStorage: true,
    },
    android: {
      package: "com.o7.rn1",
      supportsRTL: true,
      edgeToEdge: true,
      adaptiveIcon: {
        foregroundImage: "./assets/icons/resynq.png",
        backgroundColor: "#ffffff",
      },
      versionCode: 17,
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
      "expo-image-picker",
    ],
    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      REVENUECAT_APPLE_API_KEY: process.env.REVENUECAT_APPLE_API_KEY,
      REVENUECAT_GOOGLE_API_KEY: process.env.REVENUECAT_GOOGLE_API_KEY,
      eas: {
        projectId: "545243ca-fd5a-492f-8d6f-bf236c9166d5",
      },
    },
  },
};
