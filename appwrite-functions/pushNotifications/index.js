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

    const targetIdPromises = rawDeviceTokens.map(async (token) => {
      try {
        log(`Attempting to create target for token: ${token}`);
        const target = await users.createTarget(
          userId,
          sdk.ID.unique(),
          sdk.MessagingProviderType.Push,
          token,
          "689ccad400125f85a03e",
          "My App Device"
        );

        log(`Successfully created new target with ID: ${target.$id}`);
        return target.$id;
      } catch (err) {
        log(`Failed to create target for token ${token}:`, err);

        // Check if the error is a conflict (code 409).

        try {
          // Corrected: Use users.listTargets to find the existing target.
          const response = await users.listTargets(userId, [
            sdk.Query.equal("identifier", token),
            sdk.Query.equal("providerId", "689ccad400125f85a03e"),
          ]);

          if (response.targets.length > 0) {
            const existingTargetId = response.targets[0].$id;
            log(`Found existing target with ID: ${existingTargetId}`);
            return existingTargetId;
          }
        } catch (listErr) {
          error(`Failed to list targets for token ${token}:`, listErr);
        }

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

    // Now you can safely use appwriteTargetIds to send the push notification
    // --- NEW: Add a try-catch specifically for the createPush call ---
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
        "2025-08-17 00:00:00",
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
    error("Error sending push notification:", err.message);
    return res.json({ success: false, error: err.message });
  }
};
