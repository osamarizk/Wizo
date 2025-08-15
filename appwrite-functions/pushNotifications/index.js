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

    const message = await messaging.createPush(
      sdk.ID.unique(), // messageId 1
      title, // title 2
      body, // body 3
      [], // topics 4
      [], // users 5
      deviceIds, // targets (device IDs from Appwrite) 6
      data || {}, // data payload 7
      null, // action 8
      null, // image 9
      null, // icon 10
      null, // sound 11
      null, // color 12
      null, // tag 13
      1, // badge 14
      false, // draft 15
      "", //scheduledAt 16
      false, // contentAvailable 17
      false, // critical 18
      sdk.MessagePriority.Normal // priority 19
    );

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
