import { Client, Databases } from "node-appwrite";
import fetch from "node-fetch";

export default async ({ req, res, log, error }) => {
  const { to, title, body, data } = JSON.parse(req.body);

  if (!to || !title || !body) {
    return res.json(
      {
        success: false,
        message: "Missing required parameters: to, title, or body.",
      },
      400
    );
  }

  try {
    const message = {
      to: to,
      sound: "default",
      title: title,
      body: body,
      data: data,
      _displayInForeground: true,
    };

    log("Push notification payload:", message);

    // Step 1: Send the notification
    const sendResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const sendResult = await sendResponse.json();
    log("Expo Push API Response:", sendResult);

    if (
      sendResult &&
      sendResult.data &&
      sendResult.data[0] &&
      sendResult.data[0].status === "error"
    ) {
      const errorMessage =
        sendResult.data[0].details?.error || "Unknown error from Expo.";
      error(`Error from Expo Push API (send): ${errorMessage}`);
      return res.json({
        success: false,
        message: `Error from Expo: ${errorMessage}`,
        details: sendResult.data[0].details,
      });
    }

    // Correctly get the ticket ID from the response's data array
    const ticketId = sendResult.data[0]?.id;

    if (!ticketId) {
      log("No ticket ID returned from Expo.");
      return res.json({
        success: false,
        message: "Failed to get a ticket ID from Expo.",
      });
    }

    log(`Received ticket ID: ${ticketId}. Now checking for receipt.`);

    // Step 2: Check the delivery receipt after a short delay
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

    const getResponse = await fetch("https://exp.host/--/api/v2/push/get", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: [ticketId] }),
    });

    const getResult = await getResponse.json();
    log("Expo Receipt API Response:", getResult);

    if (
      getResult &&
      getResult.data &&
      getResult.data[0] &&
      getResult.data[0].status === "ok"
    ) {
      log("Notification status is 'ok'. APNs received it.");
      return res.json({
        success: true,
        message: "Push notification successfully received by APNs.",
        details: getResult.data[0],
      });
    } else {
      const errorDetails = getResult.data[0]?.details || "Unknown error.";
      error(`Receipt status is not 'ok': ${JSON.stringify(errorDetails)}`);
      return res.json({
        success: false,
        message: `Notification failed to deliver.`,
        details: errorDetails,
      });
    }
  } catch (err) {
    error("Error sending push notification:", err);
    return res.json(
      {
        success: false,
        message: `An error occurred: ${err.message}`,
      },
      500
    );
  }
};
