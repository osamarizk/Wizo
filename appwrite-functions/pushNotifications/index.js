const sdk = require("node-appwrite");

module.exports = async function ({ req, res, log, error }) {
  log("Starting generic Push Notification function...");

  const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
  const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
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
  const messaging = new sdk.Messaging(client);

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

    if (deviceTokens.length === 0) {
      log(
        `No device tokens found for user ${userId}. Not sending a notification.`
      );
      return res.json({ success: true, message: "No device tokens found." });
    }

    // FINAL CORRECTED CALL: Pass the populated deviceTokens array to targets
    const message = await messaging.createPush(
      sdk.ID.unique(),
      title,
      body,
      [], // topics
      [], // users
      deviceTokens, // targets
      payload, // data
      null, // action
      null, // image
      null, // icon
      null, // sound
      null, // color
      null, // tag
      1, // badge
      false, // critical
      "high", // priority
      false, // draft
      null // scheduledAt
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
