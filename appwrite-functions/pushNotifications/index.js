const sdk = require("node-appwrite");

module.exports = async function ({ req, res, log, error }) {
  log("Starting generic Push Notification function...");

  // IMPORTANT: Access environment variables using process.env
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

    // New: First, create a message to send to the targets
    const message = await messaging.createMessage(
      sdk.ID.unique(),
      sdk.ID.unique(),
      "push",
      null, // Provider ID (null will use all)
      false, // Scheduled
      null, // Delivery Time
      null, // Targets (we'll set this later)
      title, // Title
      body, // Body
      payload, // Custom data
      "default", // Sound
      1 // Badge
    );

    // New: Loop through each device token, create a target, and send the message
    for (const token of deviceTokens) {
      try {
        await messaging.createPushTarget(
          sdk.ID.unique(),
          token, // The device token to target
          message.$id, // The message ID to send
          [], // Topics (not needed for direct token sending)
          [`user-${userId}`] // Target IDs
        );
        log(`Push notification sent successfully to token: ${token}`);
      } catch (tokenErr) {
        error(
          `Failed to send push notification to token ${token}: ${tokenErr.message}`
        );
        // Continue to the next token even if one fails
      }
    }

    return res.json({
      success: true,
      message: "Push notifications processed for all tokens.",
    });
  } catch (err) {
    error("Error sending push notification:", err);
    return res.json({ success: false, error: err.message });
  }
};
