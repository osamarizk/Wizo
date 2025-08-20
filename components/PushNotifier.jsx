// components/PushNotifier.jsx
import * as Notifications from "expo-notifications";

/**
 * Sends a push notification to a specific device using its Expo Push Token.
 * This is a client-side function that can be used for development/testing,
 * but in a production app, this logic should be on your backend server
 * to prevent users from sending notifications to each other.
 *
 * @param {string} to - The Expo Push Token of the recipient device.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body/message of the notification.
 * @param {object} data - Optional data payload to send with the notification.
 */
export const sendPushNotification = async (to, title, body, data = {}) => {
  // Check if the recipient token is a valid Expo Push Token.
  if (!Notifications.isExpoPushToken(to)) {
    console.error("Invalid Expo Push Token provided:", to);
    alert("Invalid Expo Push Token.");
    return;
  }

  // Define the message to be sent.
  const message = {
    to: to,
    sound: "default",
    title: title,
    body: body,
    data: data,
  };

  try {
    // Send the push notification using Expo's API.
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    console.log("Push notification sent successfully!");
  } catch (error) {
    console.error("Error sending push notification:", error);
    alert("An error occurred while sending the notification.");
  }
};
