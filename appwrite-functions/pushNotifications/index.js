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

  const { userId, title, body, data, deviceToken } = payload;

  if (!userId || !title || !body || !deviceToken) {
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
    log(`Attempting to send notification to token: ${deviceToken}`);

    // Create the notification payload
    const notification = new apn.Notification();
    notification.alert = {
      title: title,
      body: body,
    };
    notification.topic = "com.o7.rn1"; // From your screenshot
    notification.badge = 1;
    notification.payload = data || {};

    // Send the notification directly to APNs
    const result = await provider.send(notification, deviceToken);

    // Check for success or errors
    if (result.failed.length > 0) {
      const failed = result.failed[0];
      error(
        `APNs failed to send: reason=${
          failed.response.reason || "No reason provided"
        }, error=${failed.error || "No error provided"}`
      );
      return res.json({
        success: false,
        message: "Failed to send notification via APNs.",
        details: failed.response.reason || failed.error,
      });
    }

    log("Push notification sent successfully via direct APNs connection.");
    provider.shutdown();
    return res.json({
      success: true,
      message: "Push notifications sent.",
      response: result,
    });
  } catch (err) {
    error("Error sending push notification via APNs:", err);
    return res.json({ success: false, error: err.message });
  }
};
