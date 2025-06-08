// Function Name: cleanupExpiredNotifications
// Runtime: Node.js (e.g., Node.js 18.0)
// Variables (add these to your Appwrite Function's settings):
// APPWRITE_API_KEY (type: secret) - Your Appwrite API Key with 'documents.write' permission for your database
// APPWRITE_DATABASE_ID (type: text) - Your database ID
// APPWRITE_NOTIFICATIONS_COLLECTION_ID (type: text) - Your notifications collection ID

import { Client, Databases, Query } from "appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.o7.rn1",
  projectId: "67e3491900328f083bc0",
  databaseId: "67e34bb5003c3f91afd3",
  userCollectionId: "67e34c5e002496cf2424",
  videoCollectionId: "67e34cd00033f6e902e3",
  storageId: "681b497d002dd1bf94c5",
  notificationCollectionId: "681e22a10030e2d94363",
  receiptCollectionId: "receipt_id",
  budgetCollectionId: "682335b2002ee5519599", // ADD THIS LINE with your actual budget collection ID
  categoryCollectionId: "categoryId",
  subcategoryCollectionId: "subcategoryId",
  userPointsCollectionId: "682e97f80010fe717763",
  badgesCollectionId: "682e9a590014484dd922",
  userBadgesCollectionId: "682e9b1f0030cc63b31e",
  userwalletTransactions: "68438f07003b8d6951f6",
  appWriteKey:
    "standard_78f5c63c97744a04e0a9bf9e6a8a229151411cc57590c7d597161d5c7f04676cb4658950a84d5b3a94920c8aadfef0aa04b8977e600c5b206018952a562b1b82ab821a443fa57a588173f56f9fbe2bb549dd036e1f8ef1883ef5d13d0fdfb2f72ea639e8cb70a3cf53ee810cca22f6914f01c2d2bb7cc338f0245e9df3b95c87",
};

const {
  endpoint,
  appWriteKey,
  projectId,
  databaseId,
  notificationCollectionId,
} = config;
export default async ({ req, res, log, error }) => {
  log("Starting cleanupExpiredNotifications function...");

  const client = new Client();
  client
    .setEndpoint(endpoint) // Appwrite endpoint is usually available as env var
    .setProject(projectId) // Appwrite project ID is usually available as env var
    .setKey(appWriteKey); // Your API key with write permissions

  const databases = new Databases(client);

  //   const databaseId = process.env.APPWRITE_DATABASE_ID;
  //   const notificationsCollectionId =
  //     process.env.APPWRITE_NOTIFICATIONS_COLLECTION_ID;

  if (!databaseId || !notificationCollectionId) {
    error(
      "Missing Appwrite environment variables: APPWRITE_DATABASE_ID or APPWRITE_NOTIFICATIONS_COLLECTION_ID"
    );
    return res.json({ success: false, message: "Configuration error" }, 500);
  }

  const now = new Date();
  const nowISO = now.toISOString();

  log(`Checking for notifications expired before: ${nowISO}`);

  try {
    let hasMore = true;
    let offset = 0;
    const limit = 100; // Process 100 documents at a time to avoid memory issues

    while (hasMore) {
      const response = await databases.listDocuments(
        databaseId,
        notificationsCollectionId,
        [
          Query.lessThanEqual("expiresAt", nowISO), // Notifications whose expiry date is in the past
          Query.limit(limit),
          Query.offset(offset),
        ]
      );

      if (response.documents.length === 0) {
        log("No more expired notifications found.");
        hasMore = false;
        break;
      }

      log(
        `Found ${response.documents.length} expired notifications to delete.`
      );

      for (const doc of response.documents) {
        try {
          await databases.deleteDocument(
            databaseId,
            notificationCollectionId,
            doc.$id
          );
          log(`Deleted notification: ${doc.$id} (Expires: ${doc.expiresAt})`);
        } catch (deleteError) {
          error(
            `Failed to delete notification ${doc.$id}: ${deleteError.message}`
          );
        }
      }

      // If the number of documents returned is less than the limit, it means
      // we've processed the last batch.
      if (response.documents.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    log("Expired notifications cleanup complete.");
    return res.json({
      success: true,
      message: "Expired notifications cleaned up successfully.",
    });
  } catch (err) {
    error(`Error during cleanup: ${err.message}`);
    return res.json(
      { success: false, message: `Cleanup failed: ${err.message}` },
      500
    );
  }
};
