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

    // FINAL CORRECTED CALL
    const message = await messaging.createPush(
      sdk.ID.unique(),
      title,
      body,
      [], // topics
      [], // users
      [], // targets
      payload, // data
      null, // action: Optional action for the notification (e.g., deep link)
      null, // image: Optional image URL (e.g., bucketId:fileId from Appwrite Storage)
      null, // icon: Optional icon URL (Android/Web)
      null, // sound: Optional sound file name (Android/iOS)
      "#4CAF50", // color: Optional color for the notification (Android)
      null, // tag: Optional tag for the notification (Android)
      1, // badge: Optional badge count (iOS)
      false, // critical: Optional iOS-only parameter for critical alerts
      "high", // priority: Optional priority level ('normal' or 'high')
      false // draft: Optional boolean to save as draft
    );

    // Log the successful response, including the payload you sent
    log("Push notification sent successfully.");
    log("Payload sent:", payload);

    return res.json({
      success: true,
      message: "Push notifications sent.",
      response: message,
      sent_payload: payload, // Add payload to the function's response body
    });
  } catch (err) {
    error("Error sending push notification:", err);
    return res.json({ success: false, error: err.message });
  }
};
