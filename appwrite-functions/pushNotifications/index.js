const sdk = require("node-appwrite");

function generateValidMessageId() {
  // Ensure it's short, valid, and doesn't start with a special char
  return "msg_" + Math.random().toString(36).substring(2, 14);
}

module.exports = async function ({ req, res, log, error }) {
  log("Starting generic Push Notification function...");

  const {
    APPWRITE_API_KEY,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_DATABASE_ID,
    APPWRITE_USERS_COLLECTION_ID,
  } = process.env;

  if (
    !APPWRITE_API_KEY ||
    !APPWRITE_ENDPOINT ||
    !APPWRITE_PROJECT_ID ||
    !APPWRITE_DATABASE_ID ||
    !APPWRITE_USERS_COLLECTION_ID
  ) {
    error("Environment variables are not set. Function cannot proceed.");
    return res.json({
      success: false,
      error: "Environment variables not set.",
    });
  }

  const client = new sdk.Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);
  const messaging = new sdk.Messaging(client);

  let payload;
  try {
    payload = JSON.parse(req.body);
    log("Payload received:", payload);
  } catch (parseError) {
    error("Failed to parse request body:", parseError);
    return res.json({ success: false, error: "Invalid JSON in request body." });
  }

  const { userId, title, body, data } = payload;

  if (!userId || !title || !body) {
    return res.json({ success: false, error: "Missing required parameters." });
  }

  try {
    const userDoc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      userId
    );

    const deviceIds = userDoc.deviceTokens || [];

    log("Device IDs from database:", deviceIds);

    if (deviceIds.length === 0) {
      log(`No device IDs found for user ${userId}. Not sending notification.`);
      return res.json({ success: true, message: "No devices registered." });
    }

    // Schedule 1 minute in the future to ensure it's valid
    const scheduledAt = new Date(Date.now() + 60 * 1000)
      .toISOString()
      .replace(/\.\d{3}Z$/, "Z"); // Remove milliseconds for consistency

    log("ScheduledAt:", scheduledAt);

    const message = await messaging.createPush({
      messageId: generateValidMessageId(),
      title,
      body,
      topics: [],
      users: [],
      targets: deviceIds,
      data: data || {},
      action: null,
      image: null,
      icon: null,
      sound: null,
      color: null,
      tag: null,
      badge: 1,
      critical: false,
      priority: "high",
      draft: false,
      scheduledAt,
    });

    log("Push notification sent successfully.");
    log("Message response:", message);

    return res.json({
      success: true,
      message: "Push notifications sent.",
      response: message,
    });
  } catch (err) {
    error("Error sending push notification:", err);
    return res.json({ success: false, error: err.message });
  }
};
