const sdk = require("node-appwrite");
const apn = require("apn");
const admin = require("firebase-admin");

module.exports = async function ({ req, res, log, error }) {
  log("Starting cross-platform push notification function...");

  const {
    APPWRITE_API_KEY,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_DATABASE_ID,
    APPWRITE_USERS_COLLECTION_ID,
    APNS_KEY_BASE64,
    APNS_KEY_ID,
    APNS_TEAM_ID,
    APNS_BUNDLE_ID,
    FCM_SERVICE_ACCOUNT_JSON, // New environment variable
  } = process.env;

  const client = new sdk.Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);

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

  // Initialize APNs and FCM providers
  let apnsProvider = null;
  let fcmApp = null;

  // Initialize APNs provider only if credentials are set
  if (APNS_KEY_BASE64 && APNS_KEY_ID && APNS_TEAM_ID && APNS_BUNDLE_ID) {
    try {
      const apnsKey = Buffer.from(APNS_KEY_BASE64, "base64").toString("utf-8");
      apnsProvider = new apn.Provider({
        token: {
          key: apnsKey,
          keyId: APNS_KEY_ID,
          teamId: APNS_TEAM_ID,
        },
        production: false,
      });
    } catch (decodeErr) {
      error("Error initializing APNs provider:", decodeErr);
    }
  }

  // Initialize FCM provider only if credentials are set
  if (FCM_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(FCM_SERVICE_ACCOUNT_JSON);
      fcmApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (parseErr) {
      error("Error initializing FCM provider:", parseErr);
    }
  }

  try {
    const userDoc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      userId
    );

    const deviceTokens = userDoc.deviceTokens || [];
    log(`Found ${deviceTokens.length} device tokens for user ${userId}.`);

    if (deviceTokens.length === 0) {
      log("No device tokens found. Not sending notification.");
      if (apnsProvider) apnsProvider.shutdown();
      if (fcmApp) await fcmApp.delete();
      return res.json({ success: true, message: "No devices registered." });
    }

    const promises = deviceTokens.map(async (token) => {
      // Check if the token is an iOS token (64 hex characters)
      if (token.length === 64 && /^[0-9a-fA-F]+$/.test(token)) {
        if (!apnsProvider) {
          log(
            `Skipping iOS token as APNs provider is not initialized: ${token}`
          );
          return;
        }
        log(`Attempting to send iOS notification to token: ${token}`);
        const notification = new apn.Notification();
        notification.alert = { title, body };
        notification.topic = APNS_BUNDLE_ID;
        notification.badge = 1;
        notification.payload = data || {};

        const result = await apnsProvider.send(notification, token);
        if (result.failed.length > 0) {
          const failed = result.failed[0];
          error(
            `APNs failed: reason=${failed.response.reason || "N/A"}, error=${
              failed.error || "N/A"
            }`
          );
        } else {
          log(`Successfully sent iOS notification to token ${token}.`);
        }
      } else {
        // Assume it's an Android/FCM token
        if (!fcmApp) {
          log(
            `Skipping Android token as FCM provider is not initialized: ${token}`
          );
          return;
        }
        log(`Attempting to send Android notification to token: ${token}`);
        const message = {
          notification: { title, body },
          data: data || {},
          token: token,
        };

        try {
          const result = await admin.messaging().send(message);
          log(`Successfully sent Android notification: ${result}`);
        } catch (fcmError) {
          error(`FCM failed to send: ${fcmError.message}`);
        }
      }
    });

    await Promise.all(promises);

    if (apnsProvider) apnsProvider.shutdown();
    if (fcmApp) await fcmApp.delete();

    return res.json({
      success: true,
      message: "Cross-platform push notifications sent.",
    });
  } catch (err) {
    error("Error sending push notification:", err);
    if (apnsProvider) apnsProvider.shutdown();
    if (fcmApp) await fcmApp.delete();
    return res.json({ success: false, error: err.message });
  }
};
