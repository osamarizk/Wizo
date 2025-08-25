import { Client, Databases, Users, Query } from "node-appwrite";
import fetch from "node-fetch";

// Re-creating the necessary functions from your appwrite.js file for the server-side
// environment.
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.DATABASE_ID;
const USER_PROFILES_COLLECTION_ID = process.env.USER_PROFILES_COLLECTION_ID;
const RECEIPTS_COLLECTION_ID = process.env.RECEIPTS_COLLECTION_ID;
const BUDGETS_COLLECTION_ID = process.env.BUDGETS_COLLECTION_ID;
const CATEGORIES_COLLECTION_ID = process.env.CATEGORIES_COLLECTION_ID;
const WALLET_TRANSACTIONS_COLLECTION_ID =
  process.env.WALLET_TRANSACTIONS_COLLECTION_ID;

// Replicate the client-side Appwrite functions here for server-side use.
const getReceiptStats = async (databases, userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      RECEIPTS_COLLECTION_ID,
      [Query.equal("user_id", userId)]
    );
    return {
      totalCount: response.total,
    };
  } catch (error) {
    console.error(`Error getting receipt stats for user ${userId}:`, error);
    return { totalCount: 0 };
  }
};

const fetchUserReceipts = async (databases, userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      RECEIPTS_COLLECTION_ID,
      [Query.equal("user_id", userId), Query.limit(50)]
    );
    return response.documents;
  } catch (error) {
    console.error(`Error fetching user receipts for user ${userId}:`, error);
    return [];
  }
};

const getCategories = async (databases, userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(100)]
    );
    return response.documents;
  } catch (error) {
    console.error(`Error getting categories for user ${userId}:`, error);
    return [];
  }
};

const getUserBudgets = async (databases, userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      BUDGETS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(100)]
    );
    return response.documents;
  } catch (error) {
    console.error(`Error getting user budgets for user ${userId}:`, error);
    return [];
  }
};

const getWalletTransactions = async (databases, userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      WALLET_TRANSACTIONS_COLLECTION_ID,
      [
        Query.equal("user_id", userId),
        Query.orderDesc("datetime"),
        Query.limit(100),
      ]
    );
    return response.documents;
  } catch (error) {
    console.error(
      `Error getting wallet transactions for user ${userId}:`,
      error
    );
    return [];
  }
};

/**
 * The core logic for processing a single user's data and sending a notification.
 * This is now a standalone function that will be called in parallel for each user.
 * @param {object} user - The Appwrite user object.
 * @param {object} databases - The Appwrite Databases service instance.
 * @param {Function} log - The log function provided by Appwrite.
 */
async function processUser(user, databases, log) {
  const userId = user.$id;
  log(`Starting processing for user: ${user.name || "User"} (${userId}).`);

  try {
    // Fetch user profile to get the deviceTokens
    const userProfileResponse = await databases.listDocuments(
      DATABASE_ID,
      USER_PROFILES_COLLECTION_ID,
      [Query.equal("accountid", userId), Query.limit(1)]
    );
    const userProfile = userProfileResponse.documents[0];

    const deviceTokens = userProfile?.deviceTokens;
    const userName = userProfile?.name || "User";
    const pushToken = Array.isArray(deviceTokens)
      ? deviceTokens[0]
      : deviceTokens; // Handle both string and array of tokens

    if (!pushToken) {
      log(`No push token found for user ${userName} (${userId}). Skipping.`);
      return; // Exit the function for this user
    }

    log(`Processing financial data for user: ${userName} (${userId}).`);

    // Fetch and process all financial data for the user
    // We can also run these in parallel to speed things up
    const [
      receiptStats,
      allReceipts,
      allCategories,
      userBudgetsRaw,
      userWallets,
    ] = await Promise.all([
      getReceiptStats(databases, userId),
      fetchUserReceipts(databases, userId),
      getCategories(databases, userId),
      getUserBudgets(databases, userId),
      getWalletTransactions(databases, userId),
    ]);

    let overallSpending = 0;
    const categorySpendingById = {};
    const categoryIdToNameMap = {};
    const merchantVisits = {};
    const itemOccurrences = {};

    allCategories.forEach((cat) => {
      if (cat.$id) {
        categoryIdToNameMap[cat.$id] = cat.name;
      }
    });

    allReceipts.forEach((receipt) => {
      let items = receipt.items;
      let parsedItems = [];
      if (typeof items === "string") {
        try {
          parsedItems = JSON.parse(items);
          if (!Array.isArray(parsedItems)) {
            parsedItems = [];
          }
        } catch (e) {
          log(
            `Error parsing receipt items for insights for user ${userName}: ${e.message}`
          );
          parsedItems = [];
        }
      } else if (Array.isArray(items)) {
        parsedItems = items;
      }

      const totalReceiptAmount = parseFloat(receipt.total || 0);
      if (!isNaN(totalReceiptAmount) && totalReceiptAmount > 0) {
        overallSpending += totalReceiptAmount;
      }

      const merchantName = receipt.merchant;
      if (merchantName) {
        merchantVisits[merchantName] = (merchantVisits[merchantName] || 0) + 1;
      }

      if (parsedItems.length > 0) {
        parsedItems.forEach((item) => {
          const categoryId = item.category_id;
          const itemPrice = parseFloat(item.price || 0);
          const itemName = item.name;

          if (categoryId && !isNaN(itemPrice) && itemPrice > 0) {
            categorySpendingById[categoryId] =
              (categorySpendingById[categoryId] || 0) + itemPrice;
            if (!categoryIdToNameMap[categoryId]) {
              categoryIdToNameMap[categoryId] = item.category;
            }
          }
          if (itemName) {
            itemOccurrences[itemName] = (itemOccurrences[itemName] || 0) + 1;
          }
        });
      }
    });

    const safeCategorySpendingById =
      categorySpendingById && typeof categorySpendingById === "object"
        ? categorySpendingById
        : {};
    const sortedCategories = Object.entries(safeCategorySpendingById)
      .map(([id, amount]) => ({
        name: categoryIdToNameMap[id] || "Unknown Category",
        amount: amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const safeMerchantVisits =
      merchantVisits && typeof merchantVisits === "object"
        ? merchantVisits
        : {};
    const topFrequentMerchants = Object.entries(safeMerchantVisits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const safeItemOccurrences =
      itemOccurrences && typeof itemOccurrences === "object"
        ? itemOccurrences
        : {};
    const topFrequentItems = Object.entries(safeItemOccurrences)
      .filter(([, count]) => count > 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const budgetPerformance = userBudgetsRaw
      .map((budget) => {
        const budgetedAmount = parseFloat(budget.budgetAmount || 0);
        const categoryId = budget.categoryId;
        const categoryName =
          categoryIdToNameMap[categoryId] || "Unknown Category";
        const categoryTotalSpent = categorySpendingById[categoryId] || 0;
        const status = categoryTotalSpent > budgetedAmount ? "over" : "under";
        return {
          category: categoryName,
          budgeted: budgetedAmount,
          spent: parseFloat(categoryTotalSpent || 0),
          status: status,
        };
      })
      .filter((budget) => budget.spent > 0);

    const totalWalletBalance = userWallets.reduce((sum, transaction) => {
      if (
        transaction.type === "withdrawal" ||
        transaction.type === "manual_expense"
      ) {
        return sum - parseFloat(transaction.amount || 0);
      } else {
        return sum + parseFloat(transaction.amount || 0);
      }
    }, 0);

    // Create a tailored notification message
    let notificationBody;
    const insights = [
      `You've spent a total of ${overallSpending.toFixed(2)}.`,
      `Your top spending category is ${
        sortedCategories[0]?.name || "uncategorized"
      } with ${sortedCategories[0]?.amount.toFixed(2)}.`,
      `Your current wallet balance is ${totalWalletBalance.toFixed(2)}.`,
      `You've visited ${topFrequentMerchants[0]?.name || "various merchants"} ${
        topFrequentMerchants[0]?.count || "a few"
      } times recently.`,
      `You've purchased ${topFrequentItems[0]?.name || "several items"} ${
        topFrequentItems[0]?.count || "a few"
      } times.`,
    ];

    const overBudgetInsight = budgetPerformance.find(
      (b) => b.status === "over"
    );
    if (overBudgetInsight) {
      notificationBody = `Alert: You've gone over your budget for ${
        overBudgetInsight.category
      } by ${(overBudgetInsight.spent - overBudgetInsight.budgeted).toFixed(
        2
      )}!`;
    } else {
      notificationBody = insights[Math.floor(Math.random() * insights.length)];
    }

    log(`Generated notification message: "${notificationBody}"`);

    const message = {
      to: pushToken,
      sound: "default",
      title: "Financial Insight 📊",
      body: notificationBody,
      data: {},
      _displayInForeground: true,
    };

    const sendResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const sendResult = await sendResponse.json();
    log(
      `Notification sent for user ${userName}. Expo response: ${JSON.stringify(
        sendResult
      )}`
    );
  } catch (err) {
    // Log the error for this specific user but don't stop the entire function
    log(`Error processing data for user ${user.$id}: ${err.message}`);
  }
}

// The main function that Appwrite will execute on a schedule.
export default async ({ req, res, log, error }) => {
  // --- Step 1: Initialize Appwrite Client and Services ---
  const client = new Client();
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // Use a server-side API key

  const databases = new Databases(client);
  const users = new Users(client);

  log("Appwrite client and services initialized.");

  try {
    // --- Step 2: Fetch all users from the Appwrite server ---
    const usersList = await users.list();
    const userDocuments = usersList.users;

    log(`Found ${userDocuments.length} users.`);

    // --- Step 3: Map each user to a promise and process them in parallel ---
    const promises = userDocuments.map((user) =>
      processUser(user, databases, log)
    );
    await Promise.all(promises);

    return res.json({
      success: true,
      message: `Successfully processed and sent notifications for ${userDocuments.length} users.`,
    });
  } catch (err) {
    error(`An error occurred in the scheduled function: ${err.message}`);
    return res.json(
      {
        success: false,
        message: `An internal server error occurred: ${err.message}`,
      },
      500
    );
  }
};
