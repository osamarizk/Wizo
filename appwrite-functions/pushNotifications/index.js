import { Client, Databases } from "node-appwrite";
import fetch from "node-fetch"; // Required for Node.js environments

export default async ({ req, res, log, error }) => {
  // Extract the necessary data from the request body
  // Appwrite functions receive the payload in req.body
  const { to, title, body, data } = JSON.parse(req.body);

  // Best practice: Validate the payload before proceeding
  if (!to || !title || !body) {
    return res.json(
      {
        success: false,
        message: "Missing required parameters: to, title, or body.",
      },
      400
    ); // 400 Bad Request
  }

  try {
    const message = {
      to: to,
      sound: "default",
      title: title,
      body: body,
      data: data,
      _displayInForeground: true, // Used for testing
    };

    log("Push notification payload:", message);

    // Send the push notification using Expo's API
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
    log("Expo Push API Response:", result);

    // Check the response from Expo's API for any errors
    if (
      result &&
      result.data &&
      result.data[0] &&
      result.data[0].status === "error"
    ) {
      const errorMessage =
        result.data[0].details?.error || "Unknown error from Expo.";
      error(`Error from Expo Push API: ${errorMessage}`);
      return res.json({
        success: false,
        message: `Error from Expo: ${errorMessage}`,
        details: result.data[0].details,
      });
    }

    log("Push notification sent successfully!");
    return res.json({
      success: true,
      message: "Push notification sent successfully!",
      details: result,
    });
  } catch (err) {
    error("Error sending push notification:", err);
    return res.json(
      {
        success: false,
        message: `An error occurred while sending the notification: ${err.message}`,
      },
      500
    ); // 500 Internal Server Error
  }
};
