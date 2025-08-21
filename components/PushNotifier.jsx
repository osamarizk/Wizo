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
  // This check is already good, keep it.
  if (!Notifications.isExpoPushToken(to)) {
    console.error("Invalid Expo Push Token provided:", to);
    // Replace alert with a more user-friendly UI component like a modal in production.
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
    _displayInForeground: true, // This is a new addition
  };

  try {
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

    // Check the response from Expo's API for any errors.
    const result = await response.json();
    console.log("Expo Push API Response:", result);

    if (
      result &&
      result.data &&
      result.data[0] &&
      result.data[0].status === "error"
    ) {
      console.error("Error from Expo Push API:", result.data[0].details.error);
      alert(`Error from Expo: ${result.data[0].details.error}`);
    } else {
      console.log("Push notification sent successfully!");
      // You might not want an alert in a real app, but for testing it's useful.
      // alert("Push notification sent successfully!");
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
    alert("An error occurred while sending the notification.");
  }
};
