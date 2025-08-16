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
  const users = new sdk.Users(client);
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
    log(
      `device tokens found for user ${userId}. is . ${rawDeviceTokens.length} tokens`
    );
    if (rawDeviceTokens.length === 0) {
      log(
        `No raw device tokens found for user ${userId}. Not sending notification.`
      );
      return res.json({ success: true, message: "No devices registered." });
    }

    // 2. Create a user target for each raw token to get the targetId.
    // The "pushToken" will be the "identifier" for the target.
    const targetIdPromises = rawDeviceTokens.map(async (token) => {
      try {
        log(`Attempting to create target for token: ${token}`);
        // Appwrite requires a provider type; we'll assume FCM for this example.
        // The providerId is optional.
        const target = await users.createTarget(
          userId,
          sdk.ID.unique(), // The targetId is not needed for the push token. Use a placeholder.
          sdk.MessagingProviderType.Push, // Assuming FCM for mobile push
          token, // The raw push token is the identifier
          "689ccad400125f85a03e", // providerId
          "My App Device" // A descriptive name
        );

        log(`Created target...  :${target}`);
        log(`Successfully created target with ID: ${target.$id}`);

        return target.$id;
      } catch (err) {
        error(`Failed to create target for token ${token}: ${err.message}`);
        // Log the error but continue with the next token.
        return null;
      }
    });

    const appwriteTargetIds = (await Promise.all(targetIdPromises)).filter(
      Boolean
    );

    log(`Generated ${appwriteTargetIds.length} valid Appwrite target IDs.`);

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
