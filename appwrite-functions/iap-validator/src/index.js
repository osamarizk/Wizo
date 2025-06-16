// Determine subscription end date based on purchase details
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

export default async ({ req, res, log, error }) => {
  log(" Determine subscription end date based on purchase details...");

  const client = new Client();
  client
    .setEndpoint(endpoint) // Appwrite endpoint is usually available as env var
    .setProject(projectId) // Appwrite project ID is usually available as env var
    .setKey(appWriteKey); // Your API key with write permissions

  const databases = new Databases(client);

  let endDate = new Date();
  let subscriptionType = "monthly"; // Default or parse from product ID

  if (productId === "com.yourcompany.monthly_premium") {
    endDate.setMonth(endDate.getMonth() + 1);
    subscriptionType = "monthly";
  } else if (productId === "com.yourcompany.yearly_premium") {
    endDate.setFullYear(endDate.getFullYear() + 1);
    subscriptionType = "yearly";
  } else if (productId === "com.yourcompany.lifetime_premium") {
    // For lifetime, set a very far future date or a specific "lifetime" marker
    endDate = new Date("2099-12-31T23:59:59Z"); // Example very far future
    subscriptionType = "lifetime";
  }

  await databases.updateDocument(
    databaseId,
    userCollectionId,
    user.$id, // User's document ID
    {
      isPremium: true,
      premiumStartDate: new Date().toISOString(),
      premiumEndDate: endDate.toISOString(), // NEW: Set the expiry date
      premiumSubscriptionType: subscriptionType, // NEW: Set the type
    }
  );
};
