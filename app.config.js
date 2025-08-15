import "dotenv/config";

export default {
  expo: {
    name: "ResynQ",
    slug: "ResynQ",
    scheme: "resynQ",
    jsEngine: "jsc",
    version: "1.2.2", // Your user-facing app version
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
      buildNumber: "1",
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
      versionCode: 1,
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
      "expo-notifications",
    ],
    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      REVENUECAT_APPLE_API_KEY: process.env.REVENUECAT_APPLE_API_KEY,
      REVENUECAT_GOOGLE_API_KEY: process.env.REVENUECAT_GOOGLE_API_KEY,
      eas: {
        projectId: "25b09883-da1b-42ae-9e94-c19a6ae209d0",
      },
    },
  },
};
