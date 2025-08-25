import { Client, Databases, Users, Query } from "node-appwrite";
import fetch from "node-fetch";

// Re-creating the necessary functions from your appwrite.js file for the server-side
// environment.
// Note: We're using 'node-appwrite' and 'node-fetch', not the client-side libraries.
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.DATABASE_ID;
const USER_PROFILES_COLLECTION_ID = process.env.USER_PROFILES_COLLECTION_ID;
const RECEIPTS_COLLECTION_ID = process.env.RECEIPTS_COLLECTION_ID;
const BUDGETS_COLLECTION_ID = process.env.BUDGETS_COLLECTION_ID;
const CATEGORIES_COLLECTION_ID = process.env.CATEGORIES_COLLECTION_ID;
const WALLET_TRANSACTIONS_COLLECTION_ID = process.env.WALLETS_COLLECTION_ID;

// Replicate the client-side Appwrite functions here for server-side use.
const getReceiptStats = async (databases, userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      RECEIPTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    return {
      totalCount: response.total,
    };
  } catch (error) {
    console.error("Error getting receipt stats:", error);
    return { totalCount: 0 };
  }
};

const fetchUserReceipts = async (databases, userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      RECEIPTS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(50)] // Fetch a reasonable number for processing.
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching user receipts:", error);
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
    console.error("Error getting categories:", error);
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
    console.error("Error getting user budgets:", error);
    return [];
  }
};

const getWalletTransactions = async (databases, userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      WALLET_TRANSACTIONS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(100)]
    );
    return response.documents;
  } catch (error) {
    console.error("Error getting wallet transactions:", error);
    return [];
  }
};

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

    // --- Step 3: Loop through each user to process their data and send a notification ---
    for (const user of userDocuments) {
      const userId = user.$id;

      const userProfile = await databases.listDocuments(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        [Query.equal("userId", userId), Query.limit(1)]
      );

      const pushToken = userProfile.documents[0]?.pushToken;
      const userName = userProfile.documents[0]?.name || "User";

      if (!pushToken) {
        log(`No push token found for user ${userName} (${userId}). Skipping.`);
        continue;
      }

      log(`Processing financial data for user: ${userName} (${userId}).`);

      // --- Step 4: Fetch and process all financial data for the user ---
      const receiptStats = await getReceiptStats(databases, userId);
      const totalReceipts = receiptStats?.totalCount || 0;

      const allReceipts = await fetchUserReceipts(databases, userId);

      let overallSpending = 0;
      const categorySpendingById = {};
      const categoryIdToNameMap = {};
      const recentExpenses = [];
      const merchantVisits = {};
      const itemOccurrences = {};

      let allCategories = await getCategories(databases, userId);
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
            console.error("Error parsing receipt items for insights:", e);
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
          merchantVisits[merchantName] =
            (merchantVisits[merchantName] || 0) + 1;
        }

        if (parsedItems.length > 0) {
          parsedItems.forEach((item) => {
            const categoryName = item.category;
            const categoryId = item.category_id;
            const itemPrice = parseFloat(item.price || 0);
            const itemName = item.name;

            if (categoryId && !isNaN(itemPrice) && itemPrice > 0) {
              categorySpendingById[categoryId] =
                (categorySpendingById[categoryId] || 0) + itemPrice;
              if (!categoryIdToNameMap[categoryId]) {
                categoryIdToNameMap[categoryId] = categoryName;
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

      const userBudgetsRaw = await getUserBudgets(databases, userId);
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

      const userWallets = await getWalletTransactions(databases, userId);
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

      // --- Step 5: Create a tailored notification message based on the data ---
      let notificationBody;
      const insights = [
        `You've spent a total of ${overallSpending.toFixed(2)}.`,
        `Your top spending category is ${
          sortedCategories[0]?.name || "uncategorized"
        } with ${sortedCategories[0]?.amount.toFixed(2)}.`,
        `Your current wallet balance is ${totalWalletBalance.toFixed(2)}.`,
        `You've visited ${
          topFrequentMerchants[0]?.name || "various merchants"
        } ${topFrequentMerchants[0]?.count || "a few"} times recently.`,
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
        notificationBody =
          insights[Math.floor(Math.random() * insights.length)];
      }

      log(`Generated notification message: "${notificationBody}"`);

      // --- Step 6: Use your existing logic to send the push notification ---
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
    }

    return res.json({
      success: true,
      message: `Successfully processed and sent notifications.`,
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
