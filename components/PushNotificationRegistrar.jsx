import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useGlobalContext } from "../context/GlobalProvider";
import { saveDeviceToken } from "../lib/appwrite";

// This component handles the logic for registering push notifications.
// It should be placed in any screen that a user navigates to after a successful login or sign-up.
const PushNotificationRegistrar = () => {
  const { user } = useGlobalContext();

  /**
   * Registers a device for push notifications and saves the token to Appwrite.
   */
  const registerForPushNotificationsAsync = async () => {
    // A user must be logged in to register a token.
    if (!user || !user.$id) {
      console.warn("User is not logged in, skipping push token registration.");
      return;
    }

    console.log("User ID for push token registration:", user.$id);

    // Push notifications only work on physical devices.
    if (!Device.isDevice) {
      console.warn("Push notifications require a physical device.");
      return;
    }

    // Request permissions from the user.
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.warn("Failed to get push token for push notification!");
      return;
    }

    // This is the CRUCIAL change: use getExpoPushTokenAsync().
    try {
      const tokenObject = await Notifications.getExpoPushTokenAsync();
      const token = tokenObject.data;
      console.log("Expo Push Token:", token);

      // Set up a notification channel for Android.
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      // Save the token to Appwrite.
      await saveDeviceToken(user.$id, token, Platform.OS);
      console.log("Token successfully saved to user document in Appwrite.");
    } catch (error) {
      console.error("Error registering and saving Expo push token:", error);
    }
  };

  /**
   * This effect runs whenever the 'user' object changes in the global context.
   * This ensures the push token is registered as soon as the user object is available.
   */
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, [user]);

  // This component doesn't render any UI, so it returns null.
  return null;
};

export default PushNotificationRegistrar;
