import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  users,
  Storage,
  InputFile,
} from "appwrite";

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
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
  notificationCollectionId,
  receiptCollectionId,
  budgetCollectionId, // Use the variable
  categoryCollectionId,
  subcategoryCollectionId,
  userPointsCollectionId,
  badgesCollectionId,
  userBadgesCollectionId,
} = config;
// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(endpoint) // Your Appwrite Endpoint
  .setProject(projectId); // Your project ID
// .setPlatform(platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client); // 👈 Add this line

// 1- Check Session
export async function checkSession() {
  try {
    const session = await account.getSession("current");
    return session;
  } catch (error) {
    return null; // No session (user is guest)
  }
}
// 2- Get Current User
export async function getCurrentUser() {
  try {
    const session = await checkSession();
    if (!session) {
      console.log("No session found. User is guest.");
      return null;
    }

    const currentAccount = await getAccount();

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountid", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0) return null;

    return currentUser.documents[0];
  } catch (error) {
    console.log("getCurrentUser Error:", error);
    return null;
  }
}
export const createUser = async (email, password, username, pwd) => {
  try {
    // Generate a valid user ID
    // const userId = uuid.v4().toString().replace(/-/g, "").slice(0, 36);
    const randomString = Math.random().toString(36).substring(2, 15);

    const userId = ID.unique();

    // console.log("Generated User ID:", userId); // Check if it's valid
    const newAccount = await account.create(
      userId,
      email,
      password,
      username,
      pwd
    );

    if (!newAccount) throw Error;
    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const docId = ID.unique();
    console.log("Generated Doc ID:", docId);
    const newuser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      docId, // Ensure user ID is valid,
      {
        accountid: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
        pwd,
      }
    );
    console.log("Generated User ID:", newAccount.$id);
    return newuser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
export async function signIn(email, password) {
  try {
    console.log("Checking existing session...");

    // Check if a session already exists
    const existingSession = await checkSession();

    if (existingSession) {
      console.log("Existing session found. Deleting it...");
      await account.deleteSession("current");
    }

    // Create a new session
    const session = await account.createEmailSession(email, password);
    console.log("Session Created:", session);

    return session;
  } catch (error) {
    console.error("SignIn Error:", error);
    throw new Error(error.message || "Failed to sign in.");
  }
}
// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();
    // console.log("Cureent Account", currentAccount);

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Send a 6-digit OTP to user's email
export async function sendOTPToEmail(email) {
  try {
    console.log("passed Email to Appwrite", email);
    const userId = ID.unique();
    const tokenResponse = await account.createEmailToken(userId, email);
    console.log(tokenResponse);
    return tokenResponse; // contains userId and expires
  } catch (error) {
    console.log("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
}

// Verify OTP using userId and secret
export async function verifyOTP(userId, otp) {
  try {
    // Check for existing sessions
    let sessions;
    try {
      sessions = await account.listSessions();
    } catch (error) {
      console.log(
        "User not authenticated or session invalid, proceeding with login."
      );
      sessions = { total: 0 }; // Default to zero sessions
    }

    // If a session exists, log the user out first
    if (sessions.total > 0) {
      await account.deleteSession("current");
    }
    // Directly verify the OTP by creating a session
    const session = await account.createSession(userId, otp);

    // Return the session if successful
    return session;
  } catch (error) {
    console.log("Error verifying OTP:", error);
    throw new Error("Invalid OTP or expired OTP");
  }
}

// Rest Password
export async function resetPassword(newPassword, oldPassword) {
  try {
    const result = await account.updatePassword(newPassword, oldPassword);
    console.log("Password updated:", result);

    return result;
  } catch (error) {
    console.log("Error details:", JSON.stringify(error, null, 2));
  }
}

export async function resetPasswordWithOTP(email) {
  try {
    const recovery = await account.createRecovery(
      email,
      "https://your-app.com/reset-password" // your redirect URL (must match platform settings in Appwrite)
    );
    console.log("Recovery email sent:", recovery);
    return recovery;
  } catch (error) {
    console.log("Error sending recovery email:", error);
    throw new Error("Failed to send password recovery email");
  }
}

export async function requestPasswordReset(email) {
  try {
    const recovery = await account.createRecovery(
      email,
      "https://o7empower.com/reset-pwd"
    );
    console.log("Recovery email sent:", recovery);
    return recovery;
  } catch (error) {
    console.error("Error sending recovery email:", error);
    throw error;
  }
}

export async function updatePasswordField(userId, newPassword) {
  try {
    const updatedUser = await databases.updateDocument(
      databaseId, // Use your database ID from config
      userCollectionId, // Your users collection ID from config
      userId, // Document ID to update (could be same as created DocId)
      {
        pwd: newPassword, // Field you want to update (you called it "pwd" in createUser)
      }
    );

    console.log("Password field updated successfully:", updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("Error updating password field:", error);
    throw new Error("Failed to update password field");
  }
}

// Receipt  Setup
export async function createReceipt(data) {
  try {
    const doc = await databases.createDocument(
      databaseId,
      receiptCollectionId, // 🔁 Replace this with your actual Receipt Collection ID
      ID.unique(),
      data
    );
    return doc;
  } catch (error) {
    console.error("createReceipt error:", error);
    throw new Error("Failed to save receipt.");
  }
}

export async function uploadReceiptImage(fileUri, fileName, mimeType) {
  try {
    const fileId = ID.unique();

    const formData = new FormData();
    formData.append("fileId", fileId);
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: mimeType || "image/jpeg",
    });

    const response = await fetch(
      `https://cloud.appwrite.io/v1/storage/buckets/${config.storageId}/files`,
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Appwrite-Project": config.projectId,
          // ❗️Use session authentication (remove API key!)
          // no "X-Appwrite-Key" if you're signed in as a user
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("upload error details:", result);
      throw new Error("Upload failed");
    }

    return result;
  } catch (error) {
    console.error("uploadReceiptImage error:", error);
    throw new Error("Failed to upload receipt image.");
  }
}

export async function getReceiptImageDownloadUrl(fileId) {
  try {
    // Appwrite's storage.getFileDownload returns a URL object (e.g., an instance of URL class)
    const fileUrlObject = storage.getFileDownload(storageId, fileId);

    // Convert the URL object to a string
    const fileUrlString = fileUrlObject.toString(); // <--- THIS IS THE KEY CHANGE

    return fileUrlString; // Return the actual string URL
  } catch (error) {
    console.error("Appwrite: Error getting receipt image download URL:", error);
    throw new Error(
      error.message || "Failed to get receipt image download URL."
    );
  }
}

export const isDuplicateReceipt = async (userId, merchant, datetime, total) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      receiptCollectionId, // Replace with actual collection ID
      [
        Query.equal("user_id", userId),
        Query.equal("merchant", merchant),
        Query.equal("datetime", datetime),
        Query.equal("total", parseFloat(total)),
      ]
    );

    return response.documents.length > 0; // true if duplicate exists
  } catch (error) {
    console.error("Error checking duplicate receipt:", error);
    return false;
  }
};
export async function fetchReceipt(receiptId) {
  try {
    const res = await databases.getDocument(
      databaseId,
      receiptCollectionId, // replace with your actual collection ID
      receiptId
    );
    return res;
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return null;
  }
}
export async function fetchUserReceipts(userId, limit = null) {
  try {
    const queries = [
      Query.equal("user_id", userId),
      Query.orderDesc("datetime"),
    ];
    if (limit !== null && typeof limit === "number" && limit > 0) {
      queries.push(Query.limit(limit));
    }
    const res = await databases.listDocuments(
      databaseId,
      receiptCollectionId,
      queries
    );
    return res.documents; // returns an array of receipts
  } catch (error) {
    console.error("Error fetching user receipts:", error);
    return [];
  }
}
export async function getReceiptStats(userId) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0); // Ensure start of day
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999); // Ensure end of day

    const startOfMonthISO = startOfMonth.toISOString();
    const endOfMonthISO = endOfMonth.toISOString();

    // Get all user receipts (for totalCount)
    const allReceipts = await databases.listDocuments(
      databaseId,
      receiptCollectionId,
      [Query.equal("user_id", userId), , Query.limit(5000)]
    );

    // Get this month receipts (for monthly stats, category breakdown, and merchant analysis)
    const monthlyReceipts = await databases.listDocuments(
      databaseId,
      receiptCollectionId,
      [
        Query.equal("user_id", userId),
        Query.greaterThanEqual("datetime", startOfMonthISO),
        Query.lessThanEqual("datetime", endOfMonthISO),
      ]
    );

    const spendingByCategorySubtotal = {}; // Store subtotal for each category (for pie chart)
    let finalMonthlyTotal = 0; // Initialize variable to store sum of receipt totals for the month

    // NEW: Structure to hold merchant analysis per category for the current month
    // Example: { "Food & Dining": { "Restaurant A": { totalSpending: X, numberOfVisits: Y }, "Grocery B": {...} } }
    const monthlyCategoryMerchantAnalysis = {};

    monthlyReceipts.documents.forEach((doc) => {
      try {
        const items = JSON.parse(doc.items);

        // let receiptTotal = parseFloat(doc.total);

        // --- START: Your custom logic for receiptTotal ---
        let receiptTotal = parseFloat(doc.total); // Default to actual amount paid

        // If subtotal is greater than total, use subtotal for statistics
        // This means you want to track the pre-discount value when a discount exists.
        if (parseFloat(doc.subtotal) > parseFloat(doc.total)) {
          receiptTotal = parseFloat(doc.subtotal);
        }
        // Ensure it's a valid number
        if (isNaN(receiptTotal)) {
          receiptTotal = 0; // Default to 0 if parsing fails
        }
        // --- END: Your custom logic for receiptTotal ---

        const merchantName = doc.merchant || "Unknown Merchant";

        // Process items within the receipt to update category spending and merchant analysis
        items.forEach((item) => {
          const category = item.category;
          const price = parseFloat(item.price);

          if (category && !isNaN(price)) {
            // 1. Update overall category spending for the month (for pie chart)
            spendingByCategorySubtotal[category] =
              (spendingByCategorySubtotal[category] || 0) + price;

            // 2. Update merchant analysis for this specific category
            if (!monthlyCategoryMerchantAnalysis[category]) {
              monthlyCategoryMerchantAnalysis[category] = {};
            }
            if (!monthlyCategoryMerchantAnalysis[category][merchantName]) {
              monthlyCategoryMerchantAnalysis[category][merchantName] = {
                totalSpending: 0,
                numberOfVisits: 0,
              };
            }
            monthlyCategoryMerchantAnalysis[category][
              merchantName
            ].totalSpending += price;
          }
        });

        // Increment visit count for each merchant for categories that appeared in this receipt
        // This ensures a merchant visit is counted only once per receipt for a given category.
        const categoriesInThisReceipt = new Set(
          items.map((item) => item.category).filter(Boolean)
        );
        categoriesInThisReceipt.forEach((category) => {
          if (
            monthlyCategoryMerchantAnalysis[category] &&
            monthlyCategoryMerchantAnalysis[category][merchantName]
          ) {
            monthlyCategoryMerchantAnalysis[category][
              merchantName
            ].numberOfVisits += 1;
          }
        });

        finalMonthlyTotal += receiptTotal; // Sum up the total of each receipt for monthlySpending
      } catch (error) {
        console.error("Error parsing items in receipt:", error);
      }
    });

    // Find highest spending category for the month
    let highestSpendingCategory = null;
    let maxSpending = 0;
    for (const category in spendingByCategorySubtotal) {
      if (spendingByCategorySubtotal[category] > maxSpending) {
        maxSpending = spendingByCategorySubtotal[category];
        highestSpendingCategory = {
          name: category,
          amount: spendingByCategorySubtotal[category], // Use the aggregated subtotal for amount
        };
      }
    }
    // Calculate percentage for highest spending category
    let highestSpendingPercentage = 0;
    const totalSubtotalForMonth = Object.values(
      spendingByCategorySubtotal
    ).reduce((sum, val) => sum + val, 0);

    if (highestSpendingCategory && totalSubtotalForMonth > 0) {
      highestSpendingPercentage =
        (highestSpendingCategory.amount / totalSubtotalForMonth) * 100;
    }

    // Get latest receipt overall (not just current month)
    const latestReceipt = await databases.listDocuments(
      databaseId,
      receiptCollectionId,
      [
        Query.equal("user_id", userId),
        Query.orderDesc("datetime"),
        Query.limit(1),
      ]
    );
    const latest = latestReceipt.documents[0];

    return {
      totalCount: allReceipts.total, // Total receipts ever
      thisMonthCount: monthlyReceipts.total, // Total receipts this month
      monthlySpending: finalMonthlyTotal, // Total spending this month (from receipt totals)
      latestDate: latest
        ? new Date(latest.datetime).toDateString()
        : "No receipts",
      highestSpendingCategory: highestSpendingCategory
        ? {
            name: highestSpendingCategory.name,
            amount: highestSpendingCategory.amount,
            percentage: highestSpendingPercentage,
          }
        : null,
      monthlyCategorySpendingBreakdown: spendingByCategorySubtotal, // Return this for the pie chart
      monthlyCategoryMerchantAnalysis: monthlyCategoryMerchantAnalysis, // NEW: Return this for the modal
    };
  } catch (error) {
    console.error("getReceiptStats error:", error);
    return {
      totalCount: 0,
      thisMonthCount: 0,
      monthlySpending: 0,
      latestDate: "N/A",
      highestSpendingCategory: null,
      monthlyCategorySpendingBreakdown: {},
      monthlyCategoryMerchantAnalysis: {}, // Return empty object on error
    };
  }
}

export async function countUserReceipts(userId) {
  try {
    const response = await databases.listDocuments(
      databaseId,
      receiptCollectionId,
      [Query.equal("user_id", userId)]
    );
    return response.total; // total count of matching documents
  } catch (error) {
    console.error("Error counting user receipts:", error);
    return 0;
  }
}

export async function deleteReceiptById(receiptId) {
  try {
    // Optional: First get the receipt to get the image_file_id if you want to delete the image from storage too
    const receipt = await databases.getDocument(
      databaseId,
      receiptCollectionId,
      receiptId
    );

    // Delete the receipt document from the database
    await databases.deleteDocument(databaseId, receiptCollectionId, receiptId);

    // Optional: Delete the associated image from Appwrite Storage
    if (receipt.image_file_id) {
      await storage.deleteFile(storageId, receipt.image_file_id);
      console.log(`Deleted image file: ${receipt.image_file_id}`);
    }

    // 4. Delete associated notifications
    const notificationsToDelete = await databases.listDocuments(
      databaseId,
      notificationCollectionId,
      [Query.equal("receipt_id", receiptId)] // Assuming your notifications have a 'receipt_id' attribute
    );

    for (const notification of notificationsToDelete.documents) {
      await databases.deleteDocument(
        databaseId,
        notificationCollectionId,
        notification.$id
      );
      console.log(
        `Deleted notification: ${notification.$id} related to receipt ${receiptId}`
      );
    }

    return true; // Indicate success
  } catch (error) {
    console.error("Error deleting receipt:", error);
    throw new Error(error.message); // Re-throw for handling in UI
  }
}
// Notification Setup

// Create a notification
export async function createNotification({
  user_id,
  title,
  message,
  receipt_id = null,
  budget_id = null,
}) {
  try {
    return await databases.createDocument(
      databaseId,
      notificationCollectionId,
      ID.unique(),
      {
        user_id,
        title,
        message,
        read: false,
        receipt_id, // ✅ Add this field
        budget_id,
      }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Fetch notifications for user
export async function fetchNotifications(userId) {
  try {
    const res = await databases.listDocuments(
      databaseId,
      notificationCollectionId,
      [Query.equal("user_id", userId), Query.orderDesc("$createdAt")]
    );
    return res.documents;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

// Count unread notifications
export async function countUnreadNotifications(userId) {
  try {
    const res = await databases.listDocuments(
      databaseId,
      notificationCollectionId,
      [Query.equal("user_id", userId), Query.equal("read", false)]
    );
    return res.documents.length;
  } catch (error) {
    console.error("Error counting notifications:", error);
    return 0;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId) {
  try {
    return await databases.updateDocument(
      databaseId,
      notificationCollectionId,
      notificationId,
      { read: true }
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

// --- Budget Functions ---

/**
 * Creates a new budget.
 */
export const createBudget = async (
  userId,
  categoryId,
  budgetAmount,
  startDate,
  endDate,
  subcategoryId = null
) => {
  try {
    // Input validation remains similar, but now we validate categoryId
    if (
      !userId ||
      !categoryId ||
      typeof budgetAmount !== "number" ||
      budgetAmount <= 0 ||
      !startDate ||
      !endDate
    ) {
      throw new Error("Invalid input data.");
    }

    const budget = await databases.createDocument(
      databaseId,
      budgetCollectionId,
      ID.unique(),
      {
        // Use budgetCollectionId
        userId,
        categoryId,
        subcategoryId, // Include subcategoryId (may be null)
        budgetAmount,
        startDate,
        endDate,
      }
    );
    return budget;
  } catch (error) {
    console.error("Error creating budget:", error);
    throw error;
  }
};

/**
 * Gets budgets for a user, optionally filtered by category or subcategory.
 */
export const getUserBudgets = async (
  userId,
  categoryId = null,
  subcategoryId = null
) => {
  try {
    let queries = [Query.equal("userId", userId)];

    if (categoryId) {
      queries.push(Query.equal("categoryId", categoryId));
    }
    if (subcategoryId) {
      queries.push(Query.equal("subcategoryId", subcategoryId));
    }

    const response = await databases.listDocuments(
      databaseId,
      budgetCollectionId,
      queries
    ); // Use budgetCollectionId
    return response.documents;
  } catch (error) {
    console.error("Error getting user budgets:", error);
    throw error;
  }
};

export const updateBudget = async (
  budgetId,
  budgetAmount,
  startDate,
  endDate,
  categoryId,
  subcategoryId = null
) => {
  try {
    // Input validation
    if (
      !budgetId ||
      typeof budgetAmount !== "number" ||
      budgetAmount <= 0 ||
      !startDate ||
      !endDate ||
      !categoryId
    ) {
      throw new Error("Invalid input data for updating budget.");
    }

    const updatedBudget = await databases.updateDocument(
      databaseId,
      budgetCollectionId,
      budgetId, // Use budgetId to specify which document to update
      {
        budgetAmount,
        startDate,
        endDate,
        categoryId,
        subcategoryId,
      }
    );
    return updatedBudget;
  } catch (error) {
    console.error("Error updating budget:", error);
    throw error;
  }
};

/**
 * Checks if a user's budget is initialized.
 * @param userId
 * @returns {Promise<boolean>}
 */
export const chkBudgetInitialization = async (userId) => {
  try {
    const budgetDocuments = await databases.listDocuments(
      databaseId,
      budgetCollectionId,
      [Query.equal("userId", userId)]
    );
    const isInitialized = budgetDocuments.documents.length > 0;
    return isInitialized;
  } catch (error) {
    console.error("Error checking budget initialization:", error);
    return false;
  }
};
/**
 * Gets all categories for a specific user
 */
export const getCategories = async (userId) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      categoryCollectionId,
      [
        //changed
        Query.equal("userId", userId),
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error getting categories: ", error);
    throw error;
  }
};

export const getCategoriesByName = async (name) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      categoryCollectionId,
      [
        //changed
        Query.equal("name", name),
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error getting categories: ", error);
    throw error;
  }
};

export const getSubcategoriesByCategory = async (categoryId) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      subcategoryCollectionId,
      [
        //changed
        Query.equal("categoryId", categoryId),
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error getting subcategories: ", error);
    throw error;
  }
};

export const getSubcategoriesById = async (subcategoryId) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      subcategoryCollectionId,
      [
        //changed
        Query.equal("$id", subcategoryId),
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error getting subcategories: ", error);
    throw error;
  }
};

export const getSubcategoriesByName = async (subcategoryName) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      subcategoryCollectionId,
      [
        //changed
        Query.equal("name", subcategoryName),
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error getting subcategories: ", error);
    throw error;
  }
};

export const getSubcategoriesBySubId = async (subcategoryId) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      subcategoryCollectionId,
      [
        //changed
        Query.equal($id, subcategoryId),
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error getting subcategories: ", error);
    throw error;
  }
};

// Define your category and subcategory data here
const categoriesData = [
  {
    name: "Food & Dining",
    description: "Expenses related to food and eating out.",
    userId: "osama",
  },
  {
    name: "Transportation",
    description: "Expenses for getting around.",
    userId: "osama",
  },
  {
    name: "Shopping",
    description: "Expenses for purchased items.",
    userId: "osama",
  },
  {
    name: "Health & Wellness",
    description: "Expenses related to health and well-being.",
    userId: "osama",
  },
  {
    name: "Bills & Utilities",
    description: "Recurring expenses for essential services.",
    userId: "osama",
  },
  {
    name: "Entertainment & Leisure",
    description: "Expenses for recreational activities.",
    userId: "osama",
  },
  {
    name: "Business Expenses",
    description: "Expenses related to work or business.",
    userId: "osama",
  },
  {
    name: "Education",
    description: "Expenses related to learning and schooling.",
    userId: "osama",
  },
  {
    name: "Financial Services",
    description: "Expenses related to banking and finances.",
    userId: "osama",
  },
  {
    name: "Gifts & Donations",
    description: "Expenses for gifting and charity.",
    userId: "osama",
  },
  {
    name: "Home Improvement",
    description: "Expenses for home repair and upgrades",
    userId: "osama",
  },
  {
    name: "Miscellaneous",
    description: "Expenses that don't fit elsewhere.",
    userId: "osama",
  },
];

const subcategoriesData = [
  // Food & Dining
  { name: "Restaurants", categoryName: "Food & Dining", userId: "osama" },
  { name: "Groceries", categoryName: "Food & Dining", userId: "osama" },
  { name: "Cafes", categoryName: "Food & Dining", userId: "osama" },
  { name: "Fast Food", categoryName: "Food & Dining", userId: "osama" },
  { name: "Bars", categoryName: "Food & Dining", userId: "osama" },
  { name: "Delivery", categoryName: "Food & Dining", userId: "osama" },
  // Transportation
  { name: "Fuel", categoryName: "Transportation", userId: "osama" },
  { name: "Public Transport", categoryName: "Transportation", userId: "osama" },
  { name: "Taxi/Rideshare", categoryName: "Transportation", userId: "osama" },
  { name: "Parking", categoryName: "Transportation", userId: "osama" },
  {
    name: "Vehicle Maintenance",
    categoryName: "Transportation",
    userId: "osama",
  },
  { name: "Tolls", categoryName: "Transportation", userId: "osama" },
  // Shopping
  { name: "Clothing", categoryName: "Shopping", userId: "osama" },
  { name: "Electronics", categoryName: "Shopping", userId: "osama" },
  { name: "Household Items", categoryName: "Shopping", userId: "osama" },
  { name: "Personal Care", categoryName: "Shopping", userId: "osama" },
  { name: "Online Shopping", categoryName: "Shopping", userId: "osama" },
  { name: "Books", categoryName: "Shopping", userId: "osama" },
  { name: "Furniture", categoryName: "Shopping", userId: "osama" },
  // Health & Wellness
  { name: "Pharmacy", categoryName: "Health & Wellness", userId: "osama" },
  { name: "Doctor Visits", categoryName: "Health & Wellness", userId: "osama" },
  { name: "Fitness", categoryName: "Health & Wellness", userId: "osama" },
  { name: "Insurance", categoryName: "Health & Wellness", userId: "osama" },
  { name: "Dental Care", categoryName: "Health & Wellness", userId: "osama" },
  { name: "Vision Care", categoryName: "Health & Wellness", userId: "osama" },
  // Bills & Utilities
  { name: "Electricity", categoryName: "Bills & Utilities", userId: "osama" },
  { name: "Water", categoryName: "Bills & Utilities", userId: "osama" },
  { name: "Internet", categoryName: "Bills & Utilities", userId: "osama" },
  { name: "Mobile", categoryName: "Bills & Utilities", userId: "osama" },
  { name: "Rent/Mortgage", categoryName: "Bills & Utilities", userId: "osama" },
  {
    name: "Subscription Services",
    categoryName: "Bills & Utilities",
    userId: "osama",
  },
  { name: "Cable TV", categoryName: "Bills & Utilities", userId: "osama" },
  // Entertainment & Leisure
  { name: "Movies", categoryName: "Entertainment & Leisure", userId: "osama" },
  {
    name: "Concerts",
    categoryName: "Entertainment & Leisure",
    userId: "osama",
  },
  { name: "Events", categoryName: "Entertainment & Leisure", userId: "osama" },
  { name: "Hobbies", categoryName: "Entertainment & Leisure", userId: "osama" },
  { name: "Travel", categoryName: "Entertainment & Leisure", userId: "osama" },
  {
    name: "Streaming Services",
    categoryName: "Entertainment & Leisure",
    userId: "osama",
  },
  { name: "Sports", categoryName: "Entertainment & Leisure", userId: "osama" },
  // Business Expenses
  {
    name: "Office Supplies",
    categoryName: "Business Expenses",
    userId: "osama",
  },
  {
    name: "Business Travel",
    categoryName: "Business Expenses",
    userId: "osama",
  },
  { name: "Client Meals", categoryName: "Business Expenses", userId: "osama" },
  { name: "Subscriptions", categoryName: "Business Expenses", userId: "osama" },
  { name: "Software", categoryName: "Business Expenses", userId: "osama" },
  { name: "Advertising", categoryName: "Business Expenses", userId: "osama" },
  { name: "Training", categoryName: "Business Expenses", userId: "osama" },
  // Education
  { name: "Tuition Fees", categoryName: "Education", userId: "osama" },
  { name: "Books", categoryName: "Education", userId: "osama" },
  { name: "Courses", categoryName: "Education", userId: "osama" },
  { name: "School Supplies", categoryName: "Education", userId: "osama" },
  { name: "Student Loans", categoryName: "Education", userId: "osama" },
  // Financial Services
  { name: "Bank Fees", categoryName: "Financial Services", userId: "osama" },
  {
    name: "Loan Payments",
    categoryName: "Financial Services",
    userId: "osama",
  },
  { name: "Investments", categoryName: "Financial Services", userId: "osama" },
  {
    name: "Insurance Premiums",
    categoryName: "Financial Services",
    userId: "osama",
  },
  {
    name: "Credit Card Fees",
    categoryName: "Financial Services",
    userId: "osama",
  },
  // Gifts & Donations
  {
    name: "Charitable Donations",
    categoryName: "Gifts & Donations",
    userId: "osama",
  },
  { name: "Gifts", categoryName: "Gifts & Donations", userId: "osama" },
  {
    name: "Fundraising Events",
    categoryName: "Gifts & Donations",
    userId: "osama",
  },
  // Home Improvement
  { name: "Plumbing", categoryName: "Home Improvement", userId: "osama" },
  { name: "Electrician", categoryName: "Home Improvement", userId: "osama" },
  { name: "Gardening", categoryName: "Home Improvement", userId: "osama" },
  // Miscellaneous
  { name: "Miscellaneous", categoryName: "Miscellaneous", userId: "osama" },
];
/**
 * Creates category documents in the Appwrite database.
 * @param {Array} categories - An array of category objects to create.
 * @throws {Error} If there is an error creating a category document.
 */
export async function createCategories(categories) {
  const { databaseId, categoryCollectionId } = config; // Use config
  if (!categories || !Array.isArray(categories)) {
    throw new Error("Categories data is invalid.");
  }

  for (const category of categories) {
    try {
      await databases.createDocument(
        databaseId,
        categoryCollectionId,
        ID.unique(),
        category // Use the category object directly
      );
      console.log(`Category created: ${category.name}`);
    } catch (error) {
      console.error(`Error creating category: ${category.name}`, error);
      throw error; // Stop on error to prevent inconsistent data.
    }
  }
  console.log("All categories created successfully.");
}

/**
 * Creates subcategory documents in the Appwrite database.
 * @param {Array} subcategories - An array of subcategory objects to create.
 * @throws {Error} If there is an error creating a subcategory document.
 */

export async function createSubcategories(subcategories, categories) {
  const { databaseId, subcategoryCollectionId } = config; // Use config
  if (!subcategories || !Array.isArray(subcategories)) {
    throw new Error("Subcategories data is invalid.");
  }
  if (!categories || !Array.isArray(categories)) {
    throw new Error(
      "Categories data is invalid.  Required for category ID lookup."
    );
  }

  const categoryNameToIdMap = new Map();

  // Pre-fetch category IDs for efficiency
  for (const category of categories) {
    try {
      const categoryDocuments = await databases.listDocuments(
        databaseId,
        config.categoryCollectionId,
        [Query.equal("name", category.name)]
      );
      if (categoryDocuments.documents.length > 0) {
        categoryNameToIdMap.set(
          category.name,
          categoryDocuments.documents[0].$id
        );
      }
    } catch (error) {
      console.error(`Error fetching category ID for ${category.name}:`, error);
      throw error; //  Important:  Fail the whole process.
    }
  }

  for (const subcategory of subcategories) {
    try {
      const categoryId = categoryNameToIdMap.get(subcategory.categoryName); // Look up by name
      if (!categoryId) {
        console.warn(
          `Subcategory "${subcategory.name}" has an invalid categoryName "${subcategory.categoryName}". Skipping.`
        );
        continue; // Skip this subcategory
      }
      await databases.createDocument(
        databaseId,
        subcategoryCollectionId,
        ID.unique(),
        {
          name: subcategory.name, // Use subcategory.name
          categoryId: categoryId,
          userId: subcategory.userId,
        }
      );
      console.log(`Subcategory created: ${subcategory.name}`);
    } catch (error) {
      console.error(`Error creating subcategory: ${subcategory.name}`, error);
      throw error; // Stop on error.
    }
  }
  console.log("All subcategories created successfully.");
}

export async function getCategoryById(categoryId) {
  try {
    const category = await databases.getDocument(
      databaseId,
      categoryCollectionId, // Use the categoryCollectionId from config
      categoryId
    );
    return category;
  } catch (error) {
    console.error("Error getting category by ID:", error);
    throw error;
  }
}

export async function getAllCategories() {
  try {
    const categories = await databases.listDocuments(
      databaseId,
      categoryCollectionId // Use the categoryCollectionId from config
    );
    // console.log("categories.documents",categories.documents)
    return categories.documents;
  } catch (error) {
    console.error("Error getting all categories:", error);
    throw error;
  }
}

export async function getSubcategoryById(subcategoryId) {
  try {
    const subcategory = await databases.getDocument(
      databaseId,
      subcategoryCollectionId, // Use the subcategoryCollectionId
      subcategoryId
    );
    return subcategory;
  } catch (error) {
    console.error("Error getting subcategory by ID:", error);
    throw error;
  }
}

export async function getAllSubcategories() {
  try {
    const subcategories = await databases.listDocuments(
      databaseId,
      config.subcategoryCollectionId // Use the subcategoryCollectionId
    );
    return subcategories.documents;
  } catch (error) {
    console.error("Error getting all subcategories:", error);
    throw error;
  }
}

// Ponist and Badges Setup
/**
 * Updates a user's points in the UserPoints collection.
 * If the user doesn't have a points document, it creates one.
 *
 * @param {string} userId The ID of the user.
 * @param {number} pointsEarned The number of points to add.
 * @param {string} transactionType A string describing the reason for points (e.g., "receipt_upload", "goal_complete").
 */
export async function updateUserPoints(userId, pointsEarned, transactionType) {
  try {
    // 1. Try to get the user's existing points document
    const response = await databases.listDocuments(
      databaseId,
      userPointsCollectionId,
      [Query.equal("user_id", userId), Query.limit(1)]
    );

    let userPointsDoc = response.documents[0];
    let currentPoints = 0;
    let history = [];

    // Prepare the history entry (only add if not a 'receipt_upload')
    const newHistoryEntry = {
      type: transactionType,
      points: pointsEarned,
      timestamp: new Date().toISOString(),
    };

    if (userPointsDoc) {
      // User has an existing points document
      currentPoints = userPointsDoc.points;
      // Ensure history is parsed correctly, even if null or empty string
      try {
        history = JSON.parse(userPointsDoc.history || "[]");
      } catch (e) {
        console.warn(
          "Error parsing user points history, initializing empty array:",
          e
        );
        history = [];
      }

      // Only add to history if it's NOT a 'receipt_upload'
      if (transactionType !== "receipt_upload") {
        history.push(newHistoryEntry);
      }

      // Update existing document
      await databases.updateDocument(
        databaseId,
        userPointsCollectionId,
        userPointsDoc.$id,
        {
          points: currentPoints + pointsEarned,
          last_updated: new Date().toISOString(),
          history: JSON.stringify(history), // Save the potentially modified history
        }
      );
    } else {
      // User does not have a points document, create a new one
      // For creation, we still add the first entry to history if it's not a receipt upload.
      const initialHistory =
        transactionType !== "receipt_upload" ? [newHistoryEntry] : [];

      await databases.createDocument(
        databaseId,
        userPointsCollectionId,
        ID.unique(),
        {
          user_id: userId,
          points: pointsEarned,
          last_updated: new Date().toISOString(),
          history: JSON.stringify(initialHistory),
        }
      );
    }
    console.log(
      `User ${userId} points updated. Earned ${pointsEarned} for ${transactionType}.`
    );
  } catch (error) {
    console.error("Error updating user points:", error);
  }
}

/**
 * Fetches all defined badges from the Badges collection.
 * @returns {Promise<Array>} A promise that resolves to an array of badge definitions.
 */
export async function getAllBadgeDefinitions() {
  try {
    const response = await databases.listDocuments(
      databaseId,
      badgesCollectionId,
      [Query.limit(100)] // Adjust limit as needed for your number of badges
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching badge definitions:", error);
    return [];
  }
}

/**
 * Fetches badges already earned by a specific user.
 * @param {string} userId The ID of the user.
 * @returns {Promise<Array>} A promise that resolves to an array of UserBadges documents.
 */
export async function getUserEarnedBadges(userId) {
  try {
    const response = await databases.listDocuments(
      databaseId,
      userBadgesCollectionId,
      [Query.equal("user_id", userId), Query.limit(100)] // Limit for number of badges a user can earn
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching user earned badges:", error);
    return [];
  }
}

export async function getUserPoints(userId) {
  try {
    const response = await databases.listDocuments(
      databaseId,
      userPointsCollectionId,
      [Query.equal("user_id", userId), Query.limit(100)] // Limit for number of badges a user can earn
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching user earned badges:", error);
    return [];
  }
}

/**
 * Awards a badge to a user if criteria are met and they haven't already earned it.
 *
 * @param {string} userId The ID of the user.
 * @param {object} badge The badge definition object from the Badges collection.
 * @param {object} metadata Optional: additional data to store with the earned badge (e.g., specific goal amount).
 * @returns {Promise<object|null>} The newly created UserBadge document if awarded, otherwise null.
 */
export async function awardBadge(userId, badge, metadata = {}) {
  try {
    // Check if the user has already earned this badge
    const existingAward = await databases.listDocuments(
      databaseId,
      userBadgesCollectionId,
      [
        Query.equal("user_id", userId),
        Query.equal("badge_id", badge.$id),
        Query.limit(1),
      ]
    );

    if (existingAward.documents.length > 0) {
      console.log(`User ${userId} already has badge '${badge.name}'.`);
      return null; // Badge already earned
    }

    // Award the badge
    const newBadgeAward = await databases.createDocument(
      databaseId,
      userBadgesCollectionId,
      ID.unique(),
      {
        user_id: userId,
        badge_id: badge.$id,
        earned_at: new Date().toISOString(),
        metadata: JSON.stringify(metadata), // Store metadata as JSON string
      }
    );

    // If the badge has a points reward, update user points
    if (badge.points_reward && badge.points_reward > 0) {
      await updateUserPoints(
        userId,
        badge.points_reward,
        `badge_award_${badge.name.replace(/\s/g, "_").toLowerCase()}`
      );
    }

    console.log(`User ${userId} earned new badge: '${badge.name}'!`);
    return newBadgeAward;
  } catch (error) {
    console.error(
      `Error awarding badge '${badge.name}' to user ${userId}:`,
      error
    );
    return null;
  }
}

/**
 * Checks all badge criteria for a user and awards any newly earned badges.
 * This function will fetch all necessary data (user's receipts, budgets, etc.)
 * to evaluate badge criteria.
 *
 * @param {string} userId The ID of the user to check badges for.
 * @returns {Promise<Array>} A promise that resolves to an array of newly earned badge definitions.
 */
export async function checkAndAwardBadges(userId) {
  const newlyEarnedBadges = [];
  try {
    const badgeDefinitions = await getAllBadgeDefinitions();
    const userEarnedBadges = await getUserEarnedBadges(userId);
    const earnedBadgeIds = new Set(userEarnedBadges.map((ub) => ub.badge_id));

    // Fetch user's current stats and data needed for badge criteria evaluation
    const userReceipts = await databases.listDocuments(
      databaseId,
      receiptCollectionId,
      [Query.equal("user_id", userId), Query.limit(5000)] // Fetch all receipts for count/total spending criteria
    );
    const userBudgets = await databases.listDocuments(
      databaseId,
      budgetCollectionId,
      [Query.equal("userId", userId), Query.limit(100)] // Fetch user's budgets for goal criteria
    );

    // Aggregate data needed for criteria
    const totalReceiptsCount = userReceipts.total;
    let totalSpendingOverall = 0;
    userReceipts.documents.forEach((receipt) => {
      const total = parseFloat(receipt.total);
      if (!isNaN(total)) {
        totalSpendingOverall += total;
      }
    });

    // Track completed budget goals
    let completedBudgetGoalsCount = 0;
    userBudgets.documents.forEach((budget) => {
      // Assuming 'currentSpending' is a field in your budget document
      // or you need to calculate it from receipts related to that budget's category
      // For simplicity, let's assume a 'is_goal_achieved' flag or similar for now.
      // You'll need to implement the actual logic to check if a budget goal is met.
      // Example: if (budget.currentSpending <= budget.budgetAmount) { completedBudgetGoalsCount++; }
      // For now, let's just count budgets for a "Budget Setter" badge.
      // For actual 'Budget Master' badge, you'd need more sophisticated logic
      // to determine if a budget was "successfully managed" (e.g., stayed within budget for X months).
      // For demonstration, let's use a simple placeholder:
      if (budget.budgetAmount > 0) {
        // Simple check if a budget exists
        // You'd replace this with actual logic to determine if a budget goal was met
        // e.g., by comparing actual spending for that category against the budget amount.
        // This would require more complex data aggregation or a dedicated field in budget.
        // For now, let's just count if they have set up a budget.
        // For "Budget Master", you might need to check if they stayed within budget for X consecutive months.
        // This is a placeholder for future complex logic.
      }
    });
    // For a simple "Budget Setter" badge, just count active budgets
    if (userBudgets.documents.length > 0) {
      completedBudgetGoalsCount = userBudgets.documents.length; // Count unique budgets set
    }

    for (const badge of badgeDefinitions) {
      if (!earnedBadgeIds.has(badge.$id)) {
        // Only check for unearned badges
        const criteria = JSON.parse(badge.criteria); // Parse criteria JSON

        let isCriteriaMet = false;

        switch (criteria.type) {
          case "receipt_count":
            if (totalReceiptsCount >= criteria.value) {
              isCriteriaMet = true;
            }
            break;
          case "total_spending":
            if (totalSpendingOverall >= criteria.value) {
              isCriteriaMet = true;
            }
            break;
          case "spending_goal_achieved":
            // This is a placeholder. You'll need to implement robust logic here.
            // For example, if criteria.count is 5, check if 5 budget goals were completed.
            if (completedBudgetGoalsCount >= criteria.count) {
              isCriteriaMet = true;
            }
            break;
          case "feature_usage":
            // Example: if (criteria.feature === "budget_set" && userBudgets.documents.length > 0) { isCriteriaMet = true; }
            // You'll need to track feature usage (e.g., in user profile or a separate log)
            // For "Budget Master" example, let's say they have set up at least one budget.
            if (
              criteria.feature === "budget_set" &&
              userBudgets.documents.length > 0
            ) {
              isCriteriaMet = true;
            }
            break;
          // Add more cases for different badge types
          default:
            console.warn(`Unknown badge criteria type: ${criteria.type}`);
            break;
        }

        if (isCriteriaMet) {
          const awarded = await awardBadge(userId, badge, {
            criteriaMetValue: criteria.value,
          });
          if (awarded) {
            newlyEarnedBadges.push(badge);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking and awarding badges:", error);
  }
  return newlyEarnedBadges;
}

export { projectId, categoriesData, subcategoriesData }; // Add this
