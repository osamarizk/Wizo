const sdk = require("node-appwrite");

module.exports = async function ({ req, res, log, error }) {
  log("Starting generic Push Notification function...");

  const {
    APPWRITE_API_KEY,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_DATABASE_ID,
    APPWRITE_USERS_COLLECTION_ID,
  } = process.env;

  const client = new sdk.Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);
  const messaging = new sdk.Messaging(client);

  let payload;
  try {
    payload = JSON.parse(req.body);
  } catch (parseError) {
    return res.json({ success: false, error: "Invalid JSON in request body." });
  }

  const { userId, title, body, data } = payload;

  if (!userId || !title || !body) {
    return res.json({ success: false, error: "Missing required parameters." });
  }

  try {
    // 1. Fetch the user document to get the stored raw device tokens.
    const userDoc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      userId
    );

    const rawDeviceTokens = userDoc.deviceTokens || [];

    if (rawDeviceTokens.length === 0) {
      log(
        `No raw device tokens found for user ${userId}. Not sending notification.`
      );
      return res.json({ success: true, message: "No devices registered." });
    }

    // 2. Register each raw token with Appwrite Messaging to get the target IDs.
    const targetIdPromises = rawDeviceTokens.map(async (token) => {
      try {
        // You'll need to know the platform (e.g., 'ios', 'android').
        // This example assumes iOS for simplicity.
        const device = await messaging.createDevice(
          sdk.ID.unique(),
          "ios",
          token
        );
        return device.$id;
      } catch (err) {
        // Log the error for this specific token but don't fail the whole operation.
        error(`Failed to create device for token ${token}: ${err.message}`);
        return null;
      }
    });

    const appwriteTargetIds = (await Promise.all(targetIdPromises)).filter(
      Boolean
    );

    if (appwriteTargetIds.length === 0) {
      log(
        "No valid Appwrite target IDs were generated. Not sending notification."
      );
      return res.json({
        success: true,
        message: "No valid devices to send to.",
      });
    }

    // 3. Use the newly created target IDs to send the push notification.
    const message = await messaging.createPush(
      sdk.ID.unique(),
      title,
      body,
      [],
      [],
      appwriteTargetIds, // The final, correct array of targets.
      data || {},
      null,
      null,
      null,
      null,
      null,
      null,
      1,
      false,
      "",
      false,
      false,
      sdk.MessagePriority.Normal
    );

    log("Push notification sent successfully.");
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
