import { Client, Databases, Query } from "node-appwrite";

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

const { endpoint, appWriteKey, projectId, databaseId, userCollectionId } =
  config;

const client = new Client();
client
  .setEndpoint(endpoint) // Appwrite endpoint is usually available as env var
  .setProject(projectId) // Appwrite project ID is usually available as env var
  .setKey(appWriteKey); // Your API key with write permissions

const databases = new Databases(client);

export default async ({ req, res, log, error }) => {
  log("Monthly Receipt Count Reset Function triggered.");

  if (!databaseId || !userCollectionId) {
    error(
      "Appwrite database ID or users collection ID not set in environment variables."
    );
    return res.json(
      { success: false, message: "Server configuration error." },
      500
    );
  }

  let offset = 0;
  const limit = 100; // Process 100 users at a time
  let totalUsersUpdatedReceipt = 0;
  let totalUsersUpdatedDownload = 0;
  let totalUsersUpdated = 0;
  try {
    log("Starting to fetch and reset user counts...");

    // Loop to fetch all users in batches
    while (true) {
      const usersResponse = await databases.listDocuments(
        databaseId,
        userCollectionId,
        [
          Query.offset(offset),
          Query.limit(limit),
          // Add any other queries if you only want to reset specific users (e.g., free tier users)
        ]
      );

      if (usersResponse.documents.length === 0) {
        log("No more users to process. Exiting loop.");
        break;
      }

      log(
        `Processing batch of ${usersResponse.documents.length} users (offset: ${offset})...`
      );

      const updatePromises = usersResponse.documents.map((userDoc) => {
        let updateFields = {};
        let hasUpdate = false;

        // Reset receipt count if not already 0
        if (userDoc.currentMonthReceiptCount > 0) {
          updateFields.currentMonthReceiptCount = 0;
          hasUpdate = true;
        }

        // Reset download count if not already 0
        if (userDoc.currentMonthDownloadCount > 0) {
          // NEW: Check download count
          updateFields.currentMonthDownloadCount = 0; // NEW: Reset download count
          hasUpdate = true;
        }

        if (hasUpdate) {
          return databases
            .updateDocument(
              databaseId,
              userCollectionId,
              userDoc.$id,
              updateFields
            )
            .then(() => {
              if (userDoc.currentMonthReceiptCount > 0)
                totalUsersUpdatedReceipt++;
              if (userDoc.currentMonthDownloadCount > 0)
                totalUsersUpdatedDownload++; // NEW: Increment download counter
              log(`User ${userDoc.$id} counts reset.`);
            })
            .catch((updateError) => {
              error(
                `Failed to reset counts for user ${userDoc.$id}: ${updateError.message}`
              );
            });
        }
        return Promise.resolve(); // No update needed for this user
      });

      await Promise.all(updatePromises); // Wait for all updates in the current batch

      offset += limit; // Move to the next batch
    }

    log(
      `Finished. Total users whose receipt count was reset: ${totalUsersUpdatedReceipt}`
    );
    log(
      `Finished. Total users whose download count was reset: ${totalUsersUpdatedDownload}`
    ); // NEW: Log download total
    return res.json(
      {
        success: true,
        message: `Monthly counts reset for ${totalUsersUpdatedReceipt} receipts and ${totalUsersUpdatedDownload} downloads.`,
      },
      200
    );
  } catch (e) {
    error(`Error in Monthly Reset Function: ${e.message}`);
    return res.json(
      {
        success: false,
        message: `Server error during monthly reset: ${e.message}`,
      },
      500
    );
  }
};
