import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useGlobalContext } from "../context/GlobalProvider";
import { saveDeviceToken } from "../lib/appwrite";

// This component handles the logic for registering push notifications.
const PushNotificationRegistrar = () => {
  const { user } = useGlobalContext();
  const tokenListener = useRef(null);

  /**
   * Registers a device for push notifications and saves the token to Appwrite.
   * This function can be called on app start or whenever a new token is received.
   *
   * @param {string} token - Optional, a new token to be saved. If not provided, it will be fetched.
   */
  const registerForPushNotificationsAsync = async (token = null) => {
    if (!user || !user.$id) {
      console.warn("User is not logged in, skipping push token registration.");
      return;
    }

    if (!Device.isDevice) {
      console.warn("Push notifications require a physical device.");
      return;
    }

    try {
      let finalToken;

      if (token) {
        // Use the token provided by the listener
        finalToken = token;
      } else {
        // Fetch a new token for the initial registration
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

        const tokenObject = await Notifications.getExpoPushTokenAsync();
        finalToken = tokenObject.data;
      }

      console.log("Expo Push Token:", finalToken);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      // Save the token to Appwrite.
      await saveDeviceToken(user.$id, finalToken, Platform.OS);
      console.log("Token successfully saved to user document in Appwrite.");
    } catch (error) {
      console.error("Error registering and saving Expo push token:", error);
    }
  };

  /**
   * This effect sets up the initial token registration and the listener.
   * It ensures that we are always using the latest token.
   */
  useEffect(() => {
    // 1. Initial registration when the user object is available
    if (user && user.$id) {
      registerForPushNotificationsAsync();
    }

    // 2. Add a listener to handle token refreshes automatically
    tokenListener.current = Notifications.addPushTokenListener((newToken) => {
      console.log("A new push token was received. Updating Appwrite.");
      registerForPushNotificationsAsync(newToken.data);
    });

    // 3. Clean up the listener when the component unmounts
    return () => {
      // Use the new, recommended method to remove the listener
      if (tokenListener.current) {
        tokenListener.current.remove();
      }
    };
  }, [user]);

  // This component doesn't render any UI, so it returns null.
  return null;
};

export default PushNotificationRegistrar;
