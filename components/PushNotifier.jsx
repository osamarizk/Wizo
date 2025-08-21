import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

/**
 * Sends a push notification to a specific device using its Expo Push Token.
 *
 * @param {string} to - The Expo Push Token of the recipient device.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body/message of the notification.
 * @param {object} data - Optional data payload to send with the notification.
 */
const sendPushNotification = async (to, title, body, data = {}) => {
  // As requested, the isExpoPushToken validation has been removed.
  // This function now assumes the 'to' token is a valid Expo Push Token.

  try {
    // Define the message to be sent.
    const message = {
      to: to,
      sound: "default",
      title: title,
      body: body,
      data: data,
      _displayInForeground: true,
    };

    console.log("Expo Push start fetching....:", message);
    // Send the push notification using Expo's API.
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log("Expo Push API Response:", result);

    // Check the response from Expo's API for any errors.
    if (
      result &&
      result.data &&
      result.data[0] &&
      result.data[0].status === "error"
    ) {
      const errorMessage =
        result.data[0].details?.error || "Unknown error from Expo.";
      console.error("Error from Expo Push API:", errorMessage);
      Alert.alert(
        "Push Notification Error",
        `Error from Expo: ${errorMessage}`
      );
    } else {
      console.log("Push notification sent successfully!");
      // Optionally, show a success alert for debugging
      // Alert.alert("Success", "Push notification sent successfully!");
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
    // Provide a more detailed error message from the caught error object.
    Alert.alert(
      "Push Notification Error",
      `An error occurred while sending the notification: ${
        error.message || JSON.stringify(error)
      }`
    );
  }
};

export default sendPushNotification;
