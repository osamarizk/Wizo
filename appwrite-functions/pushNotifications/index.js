const sdk = require("node-appwrite");
const https = require("https");

module.exports = async function ({ req, res, log, error }) {
  log("Starting generic Push Notification function...");

  const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
  const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT; // Correctly defined as https://cloud.appwrite.io/v1
  const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
  const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
  const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID;

  if (
    !APPWRITE_API_KEY ||
    !APPWRITE_ENDPOINT ||
    !APPWRITE_PROJECT_ID ||
    !DATABASE_ID ||
    !USERS_COLLECTION_ID
  ) {
    error("Environment variables are not set. Function cannot proceed.");
    return res.json({
      success: false,
      error: "Environment variables not set.",
    });
  }

  const client = new sdk.Client();
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);

  let payload;
  try {
    payload = JSON.parse(req.body);
    log("Payload received:", payload);
  } catch (parseError) {
    error("Failed to parse request body:", parseError);
    return res.json({ success: false, error: "Invalid JSON in request body." });
  }

  const { userId, title, body } = payload;

  if (!userId || !title || !body) {
    return res.json({ success: false, error: "Missing required parameters." });
  }

  try {
    const userDoc = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );
    const deviceTokens = userDoc.deviceTokens || [];

    log("Device tokens from database:", deviceTokens);

    if (deviceTokens.length === 0) {
      log(
        `No device tokens found for user ${userId}. Not sending a notification.`
      );
      return res.json({ success: true, message: "No device tokens found." });
    }

    // FINAL FIX: Use the correct Appwrite API endpoint without adding /v1 again
    const apiEndpoint = `${APPWRITE_ENDPOINT}/messaging/messages`;

    const requestPayload = {
      messageId: sdk.ID.unique(),
      title,
      body,
      targets: deviceTokens,
      data: payload,
      badge: 1,
      priority: "high",
    };

    const apiResponse = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": APPWRITE_PROJECT_ID,
        "X-Appwrite-Key": APPWRITE_API_KEY,
      },
      body: JSON.stringify(requestPayload),
    });

    if (apiResponse.ok) {
      const result = await apiResponse.json();
      log("Push notification sent successfully.");
      log("Message response:", result);
      return res.json({
        success: true,
        message: "Push notifications sent.",
        response: result,
      });
    } else {
      const errorResult = await apiResponse.json();
      error(`Appwrite API Error: ${JSON.stringify(errorResult)}`);
      return res.json({
        success: false,
        error: errorResult.message || "Unknown API error",
      });
    }
  } catch (err) {
    error("Error sending push notification:", err);
    return res.json({ success: false, error: err.message });
  }
};
