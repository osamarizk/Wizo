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

    const appwriteTargetIds = [];

    // Iterate through each raw token
    for (const token of rawDeviceTokens) {
      log(`Processing token: ${token}`);

      let targetId = null;

      try {
        // Step 1: Check if a target already exists for this token.
        const existingTargets = await users.listTargets(userId, [
          sdk.Query.equal("identifier", token),
          sdk.Query.equal("providerId", "689ccad400125f85a03e"),
          sdk.Query.equal("providerType", "push"),
        ]);

        if (existingTargets.targets.length > 0) {
          // If a target is found, use its ID.
          targetId = existingTargets.targets[0].$id;
          log(`Found existing target with ID: ${targetId}`);
        } else {
          // Step 2: If no target is found, create a new one.
          log(`No existing target found. Attempting to create a new one.`);
          const newTarget = await users.createTarget(
            userId,
            sdk.ID.unique(),
            sdk.MessagingProviderType.Push,
            token,
            "689ccad400125f85a03e",
            "My App Device"
          );
          targetId = newTarget.$id;
          log(`Successfully created new target with ID: ${targetId}`);
        }

        if (targetId) {
          appwriteTargetIds.push(targetId);
        }
      } catch (err) {
        error(`Failed to process token ${token}:`, err);
        // Continue to the next token on failure.
      }
    }

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

    // Now you can safely use appwriteTargetIds to send the push notification
    try {
      const message = await messaging.createPush(
        sdk.ID.unique(),
        title,
        body,
        [],
        [],
        appwriteTargetIds,
        data || {},
        null,
        null,
        null,
        null,
        null,
        null,
        1,
        false,
        null,
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
    } catch (pushErr) {
      error("Error sending push notification:", pushErr);
      return res.json({ success: false, error: pushErr.message });
    }
  } catch (err) {
    error("An unexpected error occurred:", err);
    return res.json({ success: false, error: err.message });
  }
};
