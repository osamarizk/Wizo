// Use CommonJS syntax to import the SDK
const sdk = require("node-appwrite");

module.exports = async function ({ req, res, log, error }) {
  log("Starting Push Notification function...");

  // Get environment variables from the Appwrite console.
  // This is the secure way to access your API key.
  const APPWRITE_API_KEY = req.env.APPWRITE_API_KEY;
  const APPWRITE_ENDPOINT = req.env.APPWRITE_ENDPOINT;
  const APPWRITE_PROJECT_ID = req.env.APPWRITE_PROJECT_ID;

  if (!APPWRITE_API_KEY || !APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
    console.warn("Environment variables are not set. Function cannot proceed.");
    return res.json({
      success: false,
      error: "Environment variables not set.",
    });
  }

  const client = new sdk.Client();
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY); // Use the key from the environment variable

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
    const message = await messaging.createPush(sdk.ID.unique(), title, body, [
      `user-${userId}`,
    ]);

    log("Push notification sent successfully.");
    return res.json({
      success: true,
      message: "Push notification sent.",
      response: message,
    });
  } catch (err) {
    error("Error sending push notification:", err);
    return res.json({ success: false, error: err.message });
  }
};
