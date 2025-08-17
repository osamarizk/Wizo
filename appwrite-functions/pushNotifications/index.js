const sdk = require("node-appwrite");
const apn = require("apn");

module.exports = async function ({ req, res, log, error }) {
  log("Starting direct APNs push notification function...");

  // IMPORTANT: Ensure these environment variables are set in Appwrite.
  const {
    APPWRITE_API_KEY,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_DATABASE_ID,
    APPWRITE_USERS_COLLECTION_ID,
    APNS_KEY_FILE, // The content of your .p8 key file
  } = process.env;

  const client = new sdk.Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);
  const users = new sdk.Users(client);

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

  // Use the configuration details from your Appwrite provider
  const provider = new apn.Provider({
    token: {
      key: APNS_KEY_FILE,
      keyId: "RJBRA6J6GY", // From your screenshot
      teamId: "R3YHRSZ7T2", // From your screenshot
    },
    // Set to 'false' for sandbox as per your Appwrite provider settings
    production: false,
  });

  try {
    // Step 1: Fetch the user document to get the device tokens.
    const userDoc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      userId
    );

    const deviceTokens = userDoc.deviceTokens || [];
    log(`Found ${deviceTokens.length} device tokens for user ${userId}.`);

    if (deviceTokens.length === 0) {
      log("No device tokens found. Not sending notification.");
      provider.shutdown();
      return res.json({ success: true, message: "No devices registered." });
    }

    // Step 2: Iterate through each token and send the push notification.
    const promises = deviceTokens.map(async (token) => {
      log(`Attempting to send notification to token: ${token}`);

      const notification = new apn.Notification();
      notification.alert = {
        title: title,
        body: body,
      };
      notification.topic = "com.o7.rn1";
      notification.badge = 1;
      notification.payload = data || {};

      const result = await provider.send(notification, token);

      if (result.failed.length > 0) {
        const failed = result.failed[0];
        error(
          `APNs failed to send: reason=${
            failed.response.reason || "No reason provided"
          }, error=${failed.error || "No error provided"}`
        );
        return {
          success: false,
          details: failed.response.reason || failed.error,
        };
      }

      log(`Successfully sent to token ${token}.`);
      return { success: true };
    });

    await Promise.all(promises);

    provider.shutdown();
    return res.json({
      success: true,
      message: "Push notifications sent.",
    });
  } catch (err) {
    error("Error sending push notification via APNs:", err);
    provider.shutdown();
    return res.json({ success: false, error: err.message });
  }
};
