import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Users,
  Storage,
  InputFile,
  Functions,
} from "appwrite";
import { format } from "date-fns"; // <--- ADD THIS IMPORT

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
  appSettingsCollectionId: "685023dd000183656d60",
  appSettingsDocumentId: "app_config",
  avatarStorgaeId: "686d25e4000760d8aeee",
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
  userwalletTransactions,
  appSettingsCollectionId,
  appSettingsDocumentId,
  avatarStorgaeId,
} = config;
// Init your React Native SDK
const client = new Client();

client.setEndpoint(endpoint).setProject(projectId);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

const functions = new Functions(client);

export function getAppwriteErrorMessageKey(error) {
  const errorMessage = error.message || "";
  const errorCode = error.code; // AppwriteException often has a 'code' property for HTTP status
  const errorType = error.type; // AppwriteException can have a 'type' property (e.g., 'user_not_found')

  // --- IMPORTANT MODIFICATION START ---
  // Prioritize checking for specific 'type' or exact message for user not found
  if (
    errorType === "user_not_found" ||
    errorMessage === "User with the requested ID could not be found."
  ) {
    return "appwriteErrors.userNotFound"; // This will now correctly map to the userNotFound key
  }
  // --- IMPORTANT MODIFICATION END ---

  // Prioritize specific Appwrite error messages/codes
  if (
    errorMessage.includes(
      "A user with the same id, email, or phone already exists"
    )
  ) {
    return "appwriteErrors.userExists";
  }
  if (errorMessage.includes("Invalid credentials")) {
    return "appwriteErrors.invalidCredentials";
  }
  // The existing 'User not found' check might be redundant after the above,
  // but keeping it for robustness if other 'User not found' messages appear.
  if (errorMessage.includes("User not found")) {
    return "appwriteErrors.userNotFound";
  }
  if (errorMessage.includes("Session not found")) {
    return "appwriteErrors.sessionNotFound";
  }
  if (errorMessage.includes("Network request failed")) {
    return "appwriteErrors.networkRequestFailed";
  }
  if (
    errorMessage.includes("Invalid OTP") ||
    errorMessage.includes("expired OTP")
  ) {
    return "appwriteErrors.invalidOtp";
  }
  if (errorMessage.includes("Failed to send OTP")) {
    return "appwriteErrors.otpSendFailed";
  }
  if (errorMessage.includes("Account creation failed")) {
    return "appwriteErrors.accountCreationFailed";
  }
  if (errorMessage.includes("Failed to sign in")) {
    return "appwriteErrors.signInFailed";
  }
  if (errorMessage.includes("Failed to send password reset email")) {
    return "appwriteErrors.passwordResetFailed";
  }
  if (errorMessage.includes("Failed to save receipt")) {
    return "appwriteErrors.receiptSaveFailed";
  }
  if (errorMessage.includes("Failed to edit receipt")) {
    return "appwriteErrors.receiptEditFailed";
  }
  if (errorMessage.includes("Failed to upload receipt image")) {
    return "appwriteErrors.receiptUploadFailed";
  }
  if (errorMessage.includes("Failed to get receipt image download URL")) {
    return "appwriteErrors.receiptDownloadUrlFailed";
  }
  if (errorMessage.includes("Failed to update your profile data")) {
    return "appwriteErrors.userUpdateFailed"; // This covers saveUserPreferences
  }
  if (errorMessage.includes("Failed to save budget")) {
    return "appwriteErrors.budgetSaveFailed";
  }
  if (errorMessage.includes("Failed to fetch budget details")) {
    return "appwriteErrors.budgetFetchFailed";
  }
  if (errorMessage.includes("Failed to create notification")) {
    return "appwriteErrors.notificationCreateFailed";
  }
  if (errorMessage.includes("Failed to mark notification as read")) {
    return "appwriteErrors.notificationMarkReadFailed";
  }
  if (errorMessage.includes("Failed to load application settings")) {
    return "appwriteErrors.appSettingsFetchFailed";
  }
  if (errorMessage.includes("Invalid document ID")) {
    return "appwriteErrors.invalidDocumentId";
  }
  if (errorMessage.includes("permission denied")) {
    return "appwriteErrors.permissionDenied";
  }
  // NEW ADDITIONS FOR SPECIFIC APPWRITE ERRORS (based on common Appwrite responses and your app's needs)
  if (
    errorMessage.includes("Failed to process data due to an invalid format")
  ) {
    return "appwriteErrors.dataParsingError";
  }
  if (errorMessage.includes("Failed to export data")) {
    return "appwriteErrors.exportDataFailed";
  }
  if (errorMessage.includes("Failed to delete account")) {
    return "appwriteErrors.accountDeleteFailed";
  }
  if (errorMessage.includes("Sharing is not available on this device")) {
    return "appwriteErrors.exportSharingUnavailable";
  }
  if (errorMessage.includes("Failed to load wallet data")) {
    return "appwriteErrors.walletDataLoadFailed";
  }
  if (errorMessage.includes("Failed to save your wallet transaction")) {
    return "appwriteErrors.walletTransactionSaveFailed";
  }
  if (errorMessage.includes("Failed to update your wallet transaction")) {
    return "appwriteErrors.walletTransactionUpdateFailed";
  }
  if (errorMessage.includes("Failed to delete your wallet transaction")) {
    return "appwriteErrors.walletTransactionDeleteFailed";
  }
  if (
    errorMessage.includes("Failed to fetch receipts for the specified period")
  ) {
    return "appwriteErrors.receiptsFetchFailed";
  }
  if (errorMessage.includes("Failed to check budget initialization status")) {
    return "appwriteErrors.budgetInitializationFailed";
  }
  if (errorMessage.includes("Failed to fetch categories")) {
    return "appwriteErrors.categoryFetchFailed";
  }
  if (errorMessage.includes("Failed to save user preferences")) {
    return "appwriteErrors.userPreferencesSaveFailed";
  }
  if (errorMessage.includes("Failed to verify session or fetch user data")) {
    return "appwriteErrors.sessionCheckFailed";
  }
  // The generic 'Document with the requested ID was not found' might still be useful for non-user documents
  if (errorMessage.includes("Document with the requested ID was not found")) {
    return "appwriteErrors.documentNotFound";
  }
  if (errorMessage.includes("Invalid parameters")) {
    return "appwriteErrors.invalidParameters";
  }
  if (errorMessage.includes("You are not authorized to perform this action")) {
    return "appwriteErrors.unauthorized";
  }
  if (errorMessage.includes("Access denied")) {
    return "appwriteErrors.forbidden";
  }
  if (errorMessage.includes("The requested resource was not found")) {
    return "appwriteErrors.notFound";
  }
  if (errorMessage.includes("A conflict occurred")) {
    return "appwriteErrors.conflict";
  }
  if (errorMessage.includes("Too many requests")) {
    return "appwriteErrors.tooManyRequests";
  }
  if (errorMessage.includes("Internal server error")) {
    return "appwriteErrors.internalServerError";
  }

  // Fallback for generic Appwrite errors or unknown errors based on HTTP status codes
  if (errorCode) {
    switch (errorCode) {
      case 400:
        return "appwriteErrors.invalidParameters"; // Or a more specific badRequest
      case 401:
        return "appwriteErrors.unauthorized";
      case 403:
        return "appwriteErrors.forbidden";
      case 404:
        // This 404 case will now be hit *after* the specific 'user_not_found' check
        // So it will only catch other types of 404s (e.g., document not found for non-user resources)
        return "appwriteErrors.notFound";
      case 409:
        return "appwriteErrors.conflict";
      case 429:
        return "appwriteErrors.tooManyRequests";
      case 500:
        return "appwriteErrors.internalServerError";
      default:
        return "appwriteErrors.genericAppwriteError";
    }
  }

  // Final fallback if nothing else matches
  return "common.unknownError";
}

export async function saveDeviceToken(userId, pushToken, platform) {
  try {
    if (!userId || !pushToken) {
      throw new Error("User ID and push token are required.");
    }

    // 1. Create a unique device ID to use as a reference.
    const deviceId = ID.unique();

    // 2. Register the device with Appwrite Messaging. This creates the target.
    const device = await messaging.createDevice(deviceId, platform, pushToken);
    console.log(`Device registered in Appwrite with ID: ${device.id}`);

    // 3. Fetch the current user document
    const userDoc = await databases.getDocument(
      config.databaseId,
      config.userCollectionId,
      userId
    );

    // Get the existing list of device IDs from the user document.
    const existingDeviceIds = userDoc.deviceTokens || [];

    // 4. Prevent duplicates by checking if the Appwrite-generated device ID already exists.
    if (existingDeviceIds.includes(device.$id)) {
      console.log(
        "Appwrite device ID already exists for this user, skipping save."
      );
      return userDoc;
    }

    // 5. Save the Appwrite-generated device ID (device.$id) in the user document.
    const updatedDeviceIds = [...existingDeviceIds, device.$id];
    const updatedUser = await databases.updateDocument(
      config.databaseId,
      config.userCollectionId,
      userId,
      { deviceTokens: updatedDeviceIds }
    );

    console.log(`Device ID saved for user ${userId}: ${device.$id}`);
    return updatedUser;
  } catch (error) {
    console.error("Failed to save device token:", error);
    throw new Error(
      `Failed to save device token: ${error.message || "Unknown error"}`
    );
  }
}

// This function now removes the Appwrite-generated device ID from the user's document
export async function removeDeviceToken(userId, deviceId) {
  try {
    if (!userId || !deviceId) {
      throw new Error("User ID and device ID are required.");
    }

    // 1. Fetch current user document
    const userDoc = await databases.getDocument(
      config.databaseId,
      config.userCollectionId,
      userId
    );

    // 2. Remove the deviceId from the array.
    const existingTokens = userDoc.deviceTokens || [];
    const updatedTokens = existingTokens.filter((id) => id !== deviceId);

    // 3. Update the user document
    const updatedUser = await databases.updateDocument(
      config.databaseId,
      config.userCollectionId,
      userId,
      { deviceTokens: updatedTokens }
    );

    console.log(`Device token removed for user ${userId}: ${deviceId}`);

    // Optional: also delete device from Messaging
    try {
      await messaging.deleteDevice(deviceId);
      console.log(`Device ${deviceId} deleted from Appwrite Messaging`);
    } catch (msgErr) {
      console.warn(`Failed to delete device from Messaging: ${msgErr.message}`);
    }

    return updatedUser;
  } catch (error) {
    console.error("Failed to remove device token:", error);
    throw new Error(
      `Failed to remove device token: ${error.message || "Unknown error"}`
    );
  }
}

export const callPushNotificationFunction = async (functionId, payload) => {
  try {
    const response = await functions.createExecution(
      functionId,
      JSON.stringify(payload)
    );
    console.log("Appwrite function execution started:", response);
    return response;
  } catch (error) {
    console.error("Error calling Appwrite Function:", error);
    throw new Error(`Failed to execute function: ${error.message}`);
  }
};
export async function getApplicationSettings() {
  try {
    const response = await databases.getDocument(
      databaseId,
      appSettingsCollectionId,
      appSettingsDocumentId // Fetch the single document with fixed ID
    );
    console.log("Fetched Application Settings:", response);
    return response;
  } catch (error) {
    console.error("Error fetching application settings:", error);
    // Return default values or throw error based on criticality
    // For app settings, it's often safer to return sensible defaults if the fetch fails
    return {
      free_tier_receipt_limit: 15,
      free_tier_budget_count: 3,
      free_tier_data_exports_monthly: 1,
      free_tier_data_downloads_monthly: 10,
      premium_feature_advanced_analytics: true,
      premium_feature_priority_support: true,
      default_currency_code: "EGP",
      premium_receipt_limit_text: "Unlimited",
      premium_budget_count_text: "Unlimited",
      premium_data_exports_text: "Unlimited",
      premium_data_downloads_text: "Unlimited",
    };
  }
}

export async function updateUserDownloadCount(userId, currentDownloadCount) {
  try {
    if (!userId) {
      throw new Error("User ID is required to update download count.");
    }
    const updatedUser = await databases.updateDocument(
      databaseId,
      userCollectionId,
      userId,
      {
        currentMonthDownloadCount: currentDownloadCount + 1,
      }
    );
    console.log(
      `User ${userId}'s download count incremented to: ${updatedUser.currentMonthDownloadCount}`
    );
    return updatedUser;
  } catch (error) {
    console.error("Error incrementing user download count:", error);
    throw new Error(
      `Failed to update download count: ${error.message || "Unknown error"}`
    );
  }
}

export async function saveUserPreferences(userId, preferences) {
  try {
    if (!userId) {
      throw new Error("User ID is required to save preferences.");
    }
    // Assuming your user profile document's $id is the same as the Appwrite account ID (userId)
    const updatedUser = await databases.updateDocument(
      databaseId,
      userCollectionId,
      userId,
      {
        // Merge new preferences with existing user data
        ...preferences,
      }
    );
    console.log(`User ${userId} preferences updated:`, preferences);
    return updatedUser;
  } catch (error) {
    console.error("Error saving user preferences:", error);
    throw new Error(
      `Failed to save preferences: ${error.message || "Unknown error"}`
    );
  }
}

// 1- Check Session
export async function checkSession() {
  try {
    const session = await account.getSession("current");
    return session;
  } catch (error) {
    return null; // No session (user is guest)
  }
}

export const getFutureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
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

    console.log("currentUser.documents[0]====>>>", currentUser.documents[0]);
    return currentUser.documents[0];
  } catch (error) {
    console.log("getCurrentUser Error:", error);
    return null;
  }
}

export const updateUserPremiumStatus = async (
  userId,
  isPremium,
  subscriptionType = null, // "monthly" or "annual"
  renewalDate = null, // ISO date string
  premiumStartDate = null // ISO date string
) => {
  try {
    // We explicitly cast isPremium to a boolean to prevent type errors.
    const finalIsPremium = !!isPremium;

    const updateData = {
      isPremium: finalIsPremium,
      subscriptionType: finalIsPremium ? subscriptionType : null,
      renewalDate: finalIsPremium ? renewalDate : null,
      premiumStartDate: finalIsPremium ? premiumStartDate : null,
    };

    const updatedUser = await databases.updateDocument(
      databaseId,
      userCollectionId,
      userId,
      updateData
    );

    console.log(
      `User ${userId} premium status updated: ${JSON.stringify(updateData)}`
    );
    return updatedUser;
  } catch (error) {
    console.error("Error updating user premium status:", error);
    throw new Error(
      `Failed to update premium status: ${error.message || "Unknown error"}`
    );
  }
};

export const createUser = async (
  email,
  password,
  username,
  currencyPreference
) => {
  // Updated signature
  try {
    const userId = ID.unique(); // This ID is for the Appwrite account (users collection)

    const newAccount = await account.create(
      userId,
      email,
      password,
      username,
      currencyPreference
    );

    if (!newAccount) throw new Error("Account creation failed."); // More specific error

    const avatarUrl = avatars.getInitials(username);

    // Immediately sign in the new user to create a session
    // This is crucial for their app to function immediately after signup
    await signIn(email, password); // This function will also delete any existing session first

    // IMPORTANT: Create the user profile document using newAccount.$id as the document ID
    // This ensures consistency with updateAccountPremiumStatus and getCurrentUser
    const newUserProfileDocument = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      newAccount.$id, // Use the Appwrite account ID as the document ID for the user profile
      {
        accountid: newAccount.$id, // Link to the Appwrite account ID
        email: email,
        username: username,
        currencyPreference: currencyPreference,
        avatar: avatarUrl,
        // Do NOT store 'pwd' here. Appwrite handles the password securely.
        isPremium: false, // Default new users to non-premium
        // Add any other default user profile fields here
      }
    );

    console.log("Appwrite Account Created:", newAccount.$id);
    console.log("User Profile Document Created:", newUserProfileDocument.$id);

    return newUserProfileDocument; // Return the full user profile document
  } catch (error) {
    console.error("Appwrite createUser error:", error);
    // console.error("createUser error:", error); // Log the full error
    // Appwrite often returns useful error messages.
    // For example, "A user with the same email already exists."
    throw new Error(error.message || "Failed to create user account.");
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
    // console.error("SignIn Error:", error);
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
export async function sendOTPToEmail(userId, email) {
  try {
    console.log("passed Email to Appwrite", email);
    // const userId = ID.unique();
    const tokenResponse = await account.createEmailSession(email, userId);
    console.log(tokenResponse);
    return tokenResponse; // contains userId and expires
  } catch (error) {
    console.log("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
}

export async function getUserIdbyEmail(email) {
  try {
    const response = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [
        //changed
        Query.equal("email", email),
      ]
    );
    console.log("Response accountid....", response.documents[0].accountid);
    if (response.accountid) {
      // Found a user with the given email
      const userFound = response.documents[0].accountid;
      // log(`Found user ID: ${userFound.$id} for email: ${email}`);
      return userFound;
    } else {
      // No user found with that email
      console.log(`No user found for email: ${email}`);
    }
  } catch (error) {
    console.log(`Error fetching user by email: ${error}`);
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

export async function requestPasswordReset(email, url) {
  try {
    const recovery = await account.createRecovery(email, url);
    console.log("Reset password  email sent:", recovery);
    return recovery;
  } catch (error) {
    // console.error("Error sending recovery email:", error);
    // throw error;
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
    // console.error("Error updating password field:", error);
    throw new Error("Failed to update password field");
  }
}

export async function getAvatarDownloadUrl(fileId) {
  try {
    const fileUrlObject = storage.getFileDownload(avatarStorgaeId, fileId); // Use config.storageId or your dedicated avatar bucket ID

    const fileUrlString = fileUrlObject.toString();
    return fileUrlString;
  } catch (error) {
    console.error("getAvatarDownloadUrl error:", error);
    throw new Error(
      error.message || "Failed to get avatar image download URL."
    );
  }
}

export async function uploadAvatar(fileUri, fileName, mimeType) {
  try {
    const fileId = ID.unique(); // Generate a unique ID for the avatar file

    const formData = new FormData();
    formData.append("fileId", fileId);
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: mimeType || "image/jpeg", // Default to image/jpeg if not provided
    });

    const response = await fetch(
      `https://cloud.appwrite.io/v1/storage/buckets/${avatarStorgaeId}/files`, // Use your 'storageId' (main bucket for now, assuming avatars are in it)
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Appwrite-Project": projectId,
          // No API key needed here if user is authenticated via session
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("uploadAvatar error details:", result);
      throw new Error(
        `Avatar upload failed: ${result.message || "Unknown error"}`
      );
    }

    return result; // Returns the file object with $id (e.g., { $id: "...", bucketId: "...", ... })
  } catch (error) {
    console.error("uploadAvatar error:", error);
    throw new Error("Failed to upload avatar image.");
  }
}

// Receipt  Setup
export async function createReceipt(data, userId, currentReceiptCount) {
  let receiptDoc = null;
  let updatedUserDoc = null;
  try {
    const receiptDoc = await databases.createDocument(
      databaseId,
      receiptCollectionId,
      ID.unique(),
      data
    );

    // If payment method is 'cash' or if it's not specified (null/undefined), add a corresponding wallet transaction
    if (isCashPaymentMethod(receiptDoc.payment_method)) {
      console.log(isCashPaymentMethod(receiptDoc.payment_method));
      try {
        await addWalletTransaction(
          receiptDoc.user_id,
          parseFloat(receiptDoc.total),
          "manual_expense", // Treat as manual expense from receipt
          `Receipt: ${receiptDoc.merchant || "Unknown"} (${format(
            new Date(receiptDoc.datetime),
            "MMM dd,PPPP"
          )})`,
          receiptDoc.$id // Link to the new receipt's ID
        );
        console.log(
          "Wallet transaction added for new cash receipt:",
          receiptDoc.$id
        );
      } catch (walletError) {
        console.warn(
          "Could not create wallet transaction for new receipt:",
          walletError
        );
      }
    }

    // --- START NEW: Increment user's currentMonthReceiptCount after successful receipt creation ---
    if (userId) {
      // Ensure userId is provided
      try {
        const updatedUserDoc = await databases.updateDocument(
          databaseId,
          userCollectionId,
          userId, // The user document ID to update
          {
            currentMonthReceiptCount: currentReceiptCount + 1,
          }
        );
        console.log(
          `User ${userId}'s receipt count incremented to: ${updatedUserDoc.currentMonthReceiptCount}`
        );
      } catch (updateError) {
        console.error("Error incrementing user receipt count:", updateError);
        // Important: This error should ideally not prevent the receipt from being saved,
        // but you might want to log it for administrative review.
        // Consider adding a notification to the user if this critically fails.
      }
    }
    return { receipt: receiptDoc, updatedUser: updatedUserDoc };
  } catch (error) {
    console.error("createReceipt error:", error);
    throw new Error("Failed to save receipt.");
  }
}

// --- NEW: editReceipt function ---
export async function editReceipt(receiptId, updatedFields) {
  if (!receiptId || !updatedFields) {
    throw new Error("Receipt ID and updated fields are required.");
  }

  try {
    // Fetch the existing receipt to get old values and other necessary fields
    const existingReceipt = await databases.getDocument(
      databaseId,
      receiptCollectionId,
      receiptId
    );

    const oldTotal = parseFloat(existingReceipt.total);
    const newTotal = parseFloat(updatedFields.total);

    // Update the receipt document
    const updatedReceipt = await databases.updateDocument(
      databaseId,
      receiptCollectionId,
      receiptId,
      updatedFields
    );

    // --- Handle Wallet Transaction Adjustment if payment method was cash and total changed ---
    // Assuming wallet transactions are linked by receipt_id and payment_method is stored on the receipt
    if (
      isCashPaymentMethod(existingReceipt.payment_method) &&
      oldTotal !== newTotal
    ) {
      const difference = newTotal - oldTotal; // Positive if new total is higher, negative if lower

      if (difference !== 0) {
        const transactionType =
          difference > 0
            ? "receipt_correction_add"
            : "receipt_correction_subtract";
        const description = `Correction for Receipt: ${
          updatedReceipt.merchant || "Unknown"
        } (Old: ${oldTotal.toFixed(2)}, New: ${newTotal.toFixed(2)})`;

        try {
          // Create a new wallet transaction for the difference
          await addWalletTransaction(
            updatedReceipt.user_id, // Use user_id from the updated receipt
            Math.abs(difference), // Amount is always positive, type defines add/subtract
            transactionType,
            description,
            updatedReceipt.$id // Link back to the receipt
          );
          console.log(
            `Wallet adjusted by ${difference.toFixed(
              2
            )} for receipt ${receiptId}`
          );
        } catch (walletError) {
          console.warn(
            `Failed to adjust wallet for receipt ${receiptId}:`,
            walletError
          );
          // Decide if you want to re-throw or just log. For non-critical wallet sync, logging might be enough.
        }
      }
    }

    console.log("Receipt updated successfully:", updatedReceipt);
    return updatedReceipt;
  } catch (error) {
    // console.error("Error editing receipt:", error);
    throw new Error(
      `Failed to edit receipt: ${error.message || "Unknown error"}`
    );
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
      // console.error("upload error details:", result);
      throw new Error("Upload failed");
    }

    return result;
  } catch (error) {
    // console.error("uploadReceiptImage error:", error);
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
    // console.error("Appwrite: Error getting receipt image download URL:", error);
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
    // console.error("Error checking duplicate receipt:", error);
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
    // console.error("Error fetching receipt:", error);
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
    // console.error("Error fetching user receipts:", error);
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
        // console.error("Error parsing items in receipt:", error);
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
    // console.error("getReceiptStats error:", error);
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

export const getMonthlyReceiptSummary = async (userId) => {
  try {
    const receipts = await databases.listDocuments(
      databaseId,
      receiptCollectionId,
      [
        Query.equal("user_id", userId),
        Query.orderDesc("datetime"),
        Query.limit(1000),
      ] // Increased limit to ensure all relevant receipts are fetched
    );

    // console.log("Monthly receipts raw data:", receipts.documents); // Debug log
    const monthlyData = {};
    const currentYear = new Date().getFullYear(); // Get the current year

    receipts.documents.forEach((receipt) => {
      const receiptDate = new Date(receipt.datetime);
      const year = receiptDate.getFullYear();
      const month = String(receiptDate.getMonth() + 1).padStart(2, "0");
      const monthKey = `${year}-${month}`; // e.g., "2024-05"

      // Only process receipts from the current year
      if (year === currentYear) {
        // <--- NEW CONDITION
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey, // e.g., "2025-06"
            totalSpending: 0,
            numberOfReceipts: 0,
          };
        }

        monthlyData[monthKey].totalSpending += receipt.total || 0;
        monthlyData[monthKey].numberOfReceipts += 1;
      }
    });

    // Convert the object to an array and sort by month (oldest first for chronological chart)
    const sortedMonthlySummary = Object.values(monthlyData).sort((a, b) => {
      return a.month.localeCompare(b.month);
    });

    console.log(
      "Processed Monthly Summary (current year only):",
      sortedMonthlySummary
    ); // Debug log
    return sortedMonthlySummary;
  } catch (error) {
    // console.error("Error fetching monthly receipt summary:", error);
    return [];
  }
};
export async function countUserReceipts(userId) {
  try {
    const response = await databases.listDocuments(
      databaseId,
      receiptCollectionId,
      [Query.equal("user_id", userId)]
    );
    return response.total; // total count of matching documents
  } catch (error) {
    // console.error("Error counting user receipts:", error);
    return 0;
  }
}
export async function updateReceipt(receiptId, updates) {
  if (!receiptId) {
    throw new Error("Receipt ID is required to update.");
  }
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("No updates provided for the receipt.");
  }

  let originalReceipt = null;
  try {
    originalReceipt = await databases.getDocument(
      databaseId,
      receiptCollectionId,
      receiptId
    );
  } catch (error) {
    // console.error("Failed to fetch original receipt for update:", error);
    throw new Error("Could not find original receipt to update.");
  }

  try {
    const updatedDoc = await databases.updateDocument(
      databaseId,
      receiptCollectionId,
      receiptId,
      updates
    );

    // Determine current and new cash status based on robust check
    const wasCash = isCashPaymentMethod(originalReceipt.payment_method);
    const isNowCash = isCashPaymentMethod(
      updates.payment_method !== undefined
        ? updates.payment_method
        : originalReceipt.payment_method
    );

    const originalTotal = parseFloat(originalReceipt.total || 0);
    const newTotal = parseFloat(updates.total || originalTotal || 0); // Use updatedDoc.total for newTotal for consistency
    const userId = originalReceipt.user_id;

    let linkedWalletTx = await findWalletTransactionBySourceReceiptId(
      receiptId
    );

    // Scenario 1: Payment method changed TO cash (and was not cash before)
    if (isNowCash && !wasCash) {
      if (!linkedWalletTx) {
        // Only add if no existing linked transaction
        try {
          await addWalletTransaction(
            userId,
            newTotal,
            "manual_expense",
            `Receipt: ${updatedDoc.merchant || "Unknown"} (${format(
              new Date(updatedDoc.datetime),
              "MMM dd,PPPP"
            )})`,
            updatedDoc.$id
          );
          console.log(
            "Wallet transaction added for receipt (method changed to cash):",
            updatedDoc.$id
          );
        } catch (walletError) {
          console.warn(
            "Could not add wallet transaction on method change to cash:",
            walletError
          );
        }
      } else {
        // Edge case: if a linked transaction already exists (e.g. data inconsistency), update it.
        try {
          await updateWalletTransaction(linkedWalletTx.$id, {
            amount: newTotal,
            type: "manual_expense",
            description: `Receipt: ${
              updatedDoc.merchant || "Unknown"
            } (${format(new Date(updatedDoc.datetime), "MMM dd,PPPP")})`,
          });
          console.log(
            "Existing wallet transaction updated on method change to cash (edge case):",
            updatedDoc.$id
          );
        } catch (walletError) {
          console.warn(
            "Could not update existing wallet transaction on method change to cash (edge case):",
            walletError
          );
        }
      }
    }
    // Scenario 2: Payment method changed FROM cash to something else
    else if (!isNowCash && wasCash) {
      if (linkedWalletTx) {
        try {
          await deleteWalletTransaction(linkedWalletTx.$id);
          console.log(
            "Wallet transaction deleted for receipt (method changed from cash):",
            updatedDoc.$id
          );
        } catch (walletError) {
          console.warn(
            "Could not delete wallet transaction on method change from cash:",
            walletError
          );
        }
      }
    }
    // Scenario 3: Payment method remained cash, but total amount changed
    else if (isNowCash && wasCash && originalTotal !== newTotal) {
      if (linkedWalletTx) {
        try {
          await updateWalletTransaction(linkedWalletTx.$id, {
            amount: newTotal,
            type: "manual_expense", // Ensure type remains manual_expense
            description: `Receipt: ${
              updatedDoc.merchant || "Unknown"
            } (${format(new Date(updatedDoc.datetime), "MMM dd,PPPP")})`,
          });
          console.log(
            "Wallet transaction amount updated for cash receipt:",
            updatedDoc.$id
          );
        } catch (walletError) {
          console.warn(
            "Could not update wallet transaction amount for cash receipt:",
            walletError
          );
        }
      } else {
        // Edge case: cash method, but no linked transaction found - create one
        try {
          await addWalletTransaction(
            userId,
            newTotal,
            "manual_expense",
            `Receipt: ${updatedDoc.merchant || "Unknown"} (${format(
              new Date(updatedDoc.datetime),
              "MMM dd,PPPP"
            )})`,
            updatedDoc.$id
          );
          console.log(
            "Wallet transaction created for existing cash receipt with no link:",
            updatedDoc.$id
          );
        } catch (walletError) {
          console.warn(
            "Could not add missing wallet transaction for updated cash receipt:",
            walletError
          );
        }
      }
    }
    // Scenario 4: Payment method remained non-cash
    // No wallet action needed.

    return updatedDoc;
  } catch (error) {
    // console.error("updateReceipt error:", error);
    throw new Error("Failed to update receipt.");
  }
}
export async function deleteReceiptById(receiptId) {
  try {
    const receipt = await databases.getDocument(
      config.databaseId,
      config.receiptCollectionId,
      receiptId
    );

    // Delete the receipt document from the database
    await databases.deleteDocument(
      config.databaseId,
      config.receiptCollectionId,
      receiptId
    );

    // If the original receipt was paid with cash (or was null/undefined), delete the associated wallet transaction
    if (isCashPaymentMethod(receipt.payment_method)) {
      try {
        const linkedWalletTx = await findWalletTransactionBySourceReceiptId(
          receiptId
        );
        if (linkedWalletTx) {
          await deleteWalletTransaction(linkedWalletTx.$id);
          console.log(
            "Wallet transaction deleted for deleted cash receipt:",
            receiptId
          );
        }
      } catch (walletError) {
        console.warn(
          "Could not delete wallet transaction associated with receipt:",
          walletError
        );
      }
    }

    // Optional: Delete the associated image from Appwrite Storage
    if (receipt.image_file_id) {
      try {
        await storage.deleteFile(config.storageId, receipt.image_file_id);
        console.log(`Deleted image file: ${receipt.image_file_id}`);
      } catch (storageError) {
        console.warn("Could not delete image file from storage:", storageError);
      }
    }

    // Delete associated notifications
    const notificationsToDelete = await databases.listDocuments(
      config.databaseId,
      config.notificationCollectionId,
      [Query.equal("receipt_id", receiptId)]
    );

    for (const notification of notificationsToDelete.documents) {
      try {
        await databases.deleteDocument(
          config.databaseId,
          config.notificationCollectionId,
          notification.$id
        );
        console.log(
          `Deleted notification: ${notification.$id} related to receipt ${receiptId}`
        );
      } catch (notificationError) {
        console.warn(
          "Could not delete associated notification:",
          notificationError
        );
      }
    }

    return true;
  } catch (error) {
    // console.error("Error deleting receipt:", error);
    throw new Error(error.message);
  }
}

export const getReceiptsForPeriod = async (
  userId,
  startDateISO,
  endDateISO
) => {
  try {
    const queries = [
      Query.equal("user_id", userId),
      Query.greaterThanEqual("datetime", startDateISO), // Assuming your receipt has a 'timestamp' attribute
      Query.lessThanEqual("datetime", endDateISO),
      Query.limit(5000), // Max receipts for a period to prevent excessive fetches
    ];

    const response = await databases.listDocuments(
      databaseId,
      receiptCollectionId, // Ensure receiptCollectionId is defined at the top of this file
      queries
    );
    return response.documents;
  } catch (error) {
    // console.error("Error fetching receipts for period:", error);
    return [];
  }
};

// NEW HELPER FUNCTION: Check if a payment method indicates cash, including null/undefined
const isCashPaymentMethod = (method) => {
  return (
    method?.toLowerCase() === "cash" ||
    method === null ||
    typeof method === "undefined"
  );
};
// Notification Setup

// Create a notification
export async function createNotification({
  user_id,
  title,
  message,
  receipt_id = null,
  budget_id = null,
  type = "system", // Default type if not provided
  expiresAt = null, // New parameter for expiry
}) {
  try {
    const data = {
      user_id,
      title,
      message,
      read: false,
      receipt_id,
      budget_id,
      type, // Include the new type field
    };

    // Convert Date object to ISO string if provided
    if (expiresAt instanceof Date) {
      data.expiresAt = expiresAt.toISOString();
    } else if (expiresAt !== null) {
      // If it's not a Date object but also not null, log a warning
      console.warn(
        "createNotification: expiresAt must be a Date object or null."
      );
    }

    return await databases.createDocument(
      config.databaseId,
      config.notificationCollectionId,
      ID.unique(),
      data
    );
  } catch (error) {
    // console.error("Error creating notification:", error);
    throw error;
  }
}
// Fetch notifications for user
export async function fetchNotifications(userId, limit = 100) {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.notificationCollectionId,
      [
        Query.equal("user_id", userId),
        Query.orderDesc("$createdAt"), // Order by creation date, most recent first
        Query.limit(limit), // Apply the limit
      ]
    );
    return response.documents; // <--- IMPORTANT: Return only the documents array
  } catch (error) {
    // console.error("Error fetching notifications:", error);
    throw error; // Re-throw to be caught by the UI
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
    // console.error("Error counting notifications:", error);
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
    // console.error("Error marking notification as read:", error);
    throw error;
  }
}

// --- Budget Functions ---

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

    // After successful budget creation, check if this is the user's FIRST budget.
    const allUserBudgets = await getUserBudgets(userId);

    if (allUserBudgets.length === 1) {
      // If this is the first budget created
      console.log(
        `First budget created for user ${userId}. Updating hasBudgetSetup flag.`
      );
      await updateUserSetupFlag(userId, "hasBudgetSetup", true);
    }

    return budget;
  } catch (error) {
    // console.error("Error creating budget:", error);
    throw error;
  }
};

export async function fetchBudget(budgetId) {
  if (!budgetId) {
    console.warn("fetchBudget: Budget ID is undefined or null.");
    return null;
  }
  try {
    const budget = await databases.getDocument(
      databaseId,
      budgetCollectionId, // Use your budget collection ID
      budgetId
    );
    return budget;
  } catch (error) {
    // Appwrite throws if document not found. Log it but return null.
    // console.error("Error fetching budget by ID:", budgetId, error);
    return null;
  }
}
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

export const updateUserSetupFlag = async (userId, flagName, value) => {
  try {
    // Assuming appwriteConfig is defined globally or imported in this file
    // and contains your databaseId and usersCollectionId.

    if (!databaseId || !userCollectionId) {
      // console.error("Appwrite databaseId or usersCollectionId is undefined.");
      throw new Error("Appwrite configuration missing for user flags update.");
    }

    const payload = {
      [flagName]: value, // Dynamically set the flag (e.g., { hasWalletSetup: true })
    };

    const response = await databases.updateDocument(
      databaseId,
      userCollectionId,
      userId, // The user's document ID in the users collection
      payload
    );
    console.log(
      `Successfully updated user ${flagName} for ${userId}:`,
      response
    );
    return response;
  } catch (error) {
    // console.error(`Error updating user ${flagName} for ${userId}:`, error);
    throw new Error(`Failed to update user ${flagName}.`);
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
    // console.error("Error updating budget:", error);
    throw error;
  }
};
// Add this function to your appwrite.js file
export const deleteBudget = async (budgetId) => {
  try {
    if (!budgetId) {
      throw new Error("Budget ID is required for deletion.");
    }
    // Assuming 'databases' and 'config.databaseId', 'config.budgetCollectionId' are accessible
    await databases.deleteDocument(
      config.databaseId,
      config.budgetCollectionId,
      budgetId
    );
    return true; // Indicate successful deletion
  } catch (error) {
    // console.error("Error deleting budget:", error);
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
    // console.error("Error checking budget initialization:", error);
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

export const initializeUserCategories = async (userId) => {
  try {
    // A hypothetical function to get a list of default categories that are not user-specific.
    // This could be a new function that queries a separate collection of "template" categories.
    // This is the core change to address your point.
    const defaultCategories = await getAllCategories();

    console.log("Default Categories to initialize:>>>", defaultCategories);

    for (const category of defaultCategories) {
      await databases.createDocument(
        databaseId,
        categoryCollectionId,
        "unique()", // Appwrite will generate a unique ID
        {
          name: category.name,
          description: category.description,
          userId: userId, // CRITICAL: Assign the new category to the new user
        }
      );
    }
    console.log(
      `Default categories successfully initialized for user ${userId}`
    );
  } catch (error) {
    console.error("Error initializing default categories:", error);
    // You might want to handle this error gracefully.
  }
};

// In your ../../lib/appwrite.js file
export const getCategories2Bud = async () => {
  // Removed userId parameter
  try {
    const response = await databases.listDocuments(
      databaseId,
      categoryCollectionId,
      // No Query.equal("userId", userId) filter here.
      // Add a limit if you have many categories to avoid fetching too much data.
      [Query.limit(200)]
    );
    return response.documents;
  } catch (error) {
    // console.error("Error getting categories: ", error);
    throw error;
  }
};
export const getCategoriesById = async (categoryId) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      subcategoryCollectionId,
      [
        //changed
        Query.equal("$id", categoryId),
      ]
    );
    return response.documents;
  } catch (error) {
    // console.error("Error getting subcategories: ", error);
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
    // console.error("Error getting categories: ", error);
    throw error;
  }
};

export const getCategoriesByIdAdv = async (categoryId) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      categoryCollectionId,
      [
        //changed
        Query.equal("$id", categoryId),
      ]
    );
    console.log(
      "Catefories by ID response>>>>>for Advise:",
      response.documents
    );
    return response.documents;
  } catch (error) {
    // console.error("Error getting categories: ", error);
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
    // console.error("Error getting subcategories: ", error);
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
    // console.error("Error getting subcategories: ", error);
    throw error;
  }
};

export const getSubcategoriesByName = async (subcategoryName) => {
  try {
    console.log("subcategoryName", subcategoryName);
    const response = await databases.listDocuments(
      databaseId,
      subcategoryCollectionId,
      [
        // Use Query.search for "like" functionality.
        // Requires a Fulltext index on the 'name' attribute.

        Query.search("name", subcategoryName),
        // Limit the results to only the first document found
        Query.limit(1),
      ]
    );

    // Return the first document if the array is not empty, otherwise return null
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    // console.error("Error getting subcategories by name (search): ", error);
    throw error;
  }
};

export const getSubcategoriesBySubId = async (subcategoryId) => {
  try {
    // FIX: Corrected $id to be a string literal for Query.equal
    const response = await databases.listDocuments(
      databaseId,
      subcategoryCollectionId,
      [Query.equal("$id", subcategoryId)]
    );
    return response.documents;
  } catch (error) {
    // console.error("Error getting subcategories: ", error);
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
      // console.error(`Error creating subcategory: ${subcategory.name}`, error);
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
    // console.error("Error getting category by ID:", error);
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
    // console.error("Error getting all categories:", error);
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
    // console.error("Error getting subcategory by ID:", error);
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
    // console.error("Error getting all subcategories:", error);
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
  console.log("User ID for Points....:", userId);
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
    // console.error("Error updating user points:", error);
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
    // console.error("Error fetching badge definitions:", error);
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
    const earnedBadgesResponse = await databases.listDocuments(
      databaseId,
      userBadgesCollectionId,
      [Query.equal("user_id", userId), Query.limit(100)]
    );

    const earnedBadgesDocuments = earnedBadgesResponse.documents;
    const fullBadgeDetails = [];

    for (const earnedBadgeDoc of earnedBadgesDocuments) {
      let badgeId;
      // FIX: More robust way to get badgeId, checking for both direct attribute and relationship
      if (
        earnedBadgeDoc.badge_id &&
        typeof earnedBadgeDoc.badge_id === "string"
      ) {
        badgeId = earnedBadgeDoc.badge_id; // If badge_id is a direct string
      } else if (
        earnedBadgeDoc.badge_id &&
        typeof earnedBadgeDoc.badge_id === "object" &&
        earnedBadgeDoc.badge_id.$id
      ) {
        badgeId = earnedBadgeDoc.badge_id.$id; // If badge_id is a relationship object
      }

      if (badgeId) {
        try {
          const badgeDetail = await databases.getDocument(
            databaseId,
            badgesCollectionId,
            badgeId
          );

          fullBadgeDetails.push({
            ...badgeDetail,
            $id: earnedBadgeDoc.$id, // Use the ID of the specific earned badge document
            earnedAt: earnedBadgeDoc.$createdAt, // Assuming $createdAt is when the user earned it
          });
        } catch (badgeError) {
          console.warn(
            `Could not fetch details for badgeId ${badgeId}:`,
            badgeError
          );
          fullBadgeDetails.push({
            $id: earnedBadgeDoc.$id,
            name: "Unknown Badge",
            description: "Details not available.",
            icon_url: null,
            points: 0,
          });
        }
      } else {
        console.warn("Skipping badge without a valid badgeId:", earnedBadgeDoc);
      }
    }
    return fullBadgeDetails;
  } catch (error) {
    // console.error("Error fetching user earned badges:", error);
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
    // console.error("Error fetching user earned badges:", error);
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
    // console.error(
    //   `Error awarding badge '${badge.name}' to user ${userId}:`,
    //   error
    // );
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

    // NEW FUNCTION: Fetch receipts for calculating spending insights
    const userReceipts = await getReceiptsForPeriod(
      userId,
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString(), // Start of current month
      new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).toISOString() // End of current month
    );

    // Placeholder for aggregated data (replace with actual calculations if needed)
    const totalReceiptsCount = userReceipts.length; // Now correctly counting fetched receipts
    let totalSpendingOverall = 0;
    userReceipts.forEach((receipt) => {
      const total = parseFloat(receipt.total);
      if (!isNaN(total)) {
        totalSpendingOverall += total;
      }
    });

    const userBudgets = await databases.listDocuments(
      // Still using direct Appwrite call for budgets here
      databaseId,
      budgetCollectionId,
      [Query.equal("userId", userId), Query.limit(100)]
    );

    let completedBudgetGoalsCount = 0;
    if (userBudgets.documents.length > 0) {
      completedBudgetGoalsCount = userBudgets.documents.length;
    }

    for (const badge of badgeDefinitions) {
      if (!earnedBadgeIds.has(badge.$id)) {
        const criteria = JSON.parse(badge.criteria);

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
            // You'll need to implement actual logic based on your budget data
            // For example: if (completedBudgetGoalsCount >= criteria.count) { isCriteriaMet = true; }
            break;
          case "feature_usage":
            // Example: if (criteria.feature === "budget_set" && userBudgets.documents.length > 0) { isCriteriaMet = true; }
            break;
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
    // console.error("Error checking and awarding badges:", error);
  }
  return newlyEarnedBadges;
}
// Wallet Transactions
// 1-addWalletTransaction
export async function addWalletTransaction(
  userId,
  amount,
  type,
  description = "",
  sourceReceiptId = null
) {
  if (!userId) {
    throw new Error("User ID is required to add a wallet transaction.");
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }
  if (!["deposit", "withdrawal", "manual_expense"].includes(type)) {
    throw new Error(
      "Invalid transaction type. Must be 'deposit', 'withdrawal', or 'manual_expense'."
    );
  }

  console.log(
    "Adding wallet Tranaction from Receipt:",
    userId,
    amount,
    type,
    description,
    sourceReceiptId
  );
  try {
    const data = {
      user_id: userId,
      amount: amount,
      type: type,
      description: description,
      datetime: new Date().toISOString(),
    };
    if (sourceReceiptId) {
      data.sourceReceiptId = sourceReceiptId; // Add sourceReceiptId if provided
    }

    const newTransaction = await databases.createDocument(
      config.databaseId,
      config.userwalletTransactions,
      ID.unique(),
      data
    );

    // After successful wallet creation, check if this is the user's FIRST wallet.
    const allUserWallets = await getUserWallets(userId);
    if (allUserWallets.length === 1) {
      // If this is the first wallet created
      console.log(
        `First wallet created for user ${userId}. Updating hasWalletSetup flag.`
      );
      await updateUserSetupFlag(userId, "hasWalletSetup", true);
    }

    // console.log("Wallet transaction added:", newTransaction);
    return newTransaction;
  } catch (error) {
    // console.error("Error adding wallet transaction:", error);
    throw new Error(`Failed to add wallet transaction: ${error.message}`);
  }
}
// 2- getWalletTransactions
export async function getWalletTransactions(userId) {
  if (!userId) {
    console.warn("getWalletTransactions: User ID is undefined or null.");
    return [];
  }

  try {
    const response = await databases.listDocuments(
      databaseId,
      userwalletTransactions,
      [
        Query.equal("user_id", userId),
        Query.orderDesc("datetime"),
        Query.limit(100),
      ]
    );
    console.log("Fetched wallet transactions:", response.documents);
    return response.documents;
  } catch (error) {
    // console.error("Error fetching wallet transactions:", error);
    return [];
  }
}

export async function updateWalletTransaction(transactionId, updates) {
  if (!transactionId) {
    throw new Error("Transaction ID is required to update a transaction.");
  }
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("No updates provided for the transaction.");
  }

  if (
    updates.amount !== undefined &&
    (typeof updates.amount !== "number" || updates.amount <= 0)
  ) {
    throw new Error("Updated amount must be a positive number.");
  }
  if (
    updates.type !== undefined &&
    !["deposit", "withdrawal", "manual_expense"].includes(updates.type)
  ) {
    throw new Error(
      "Invalid updated transaction type. Must be 'deposit', 'withdrawal', or 'manual_expense'."
    );
  }

  try {
    const updatedTransaction = await databases.updateDocument(
      config.databaseId,
      config.userwalletTransactions,
      transactionId,
      updates
    );
    console.log("Wallet transaction updated:", updatedTransaction);
    return updatedTransaction;
  } catch (error) {
    // console.error("Error updating wallet transaction:", error);
    throw new Error(`Failed to update wallet transaction: ${error.message}`);
  }
}
export async function deleteWalletTransaction(transactionId) {
  if (!transactionId) {
    throw new Error("Transaction ID is required to delete a transaction.");
  }

  try {
    await databases.deleteDocument(
      config.databaseId,
      config.userwalletTransactions,
      transactionId
    );
    console.log("Wallet transaction deleted:", transactionId);
  } catch (error) {
    // console.error("Error deleting wallet transaction:", error);
    throw new Error(`Failed to delete wallet transaction: ${error.message}`);
  }
}

async function findWalletTransactionBySourceReceiptId(receiptId) {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.userwalletTransactions,
      [Query.equal("sourceReceiptId", receiptId), Query.limit(1)]
    );
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    // console.error(
    //   "Error finding wallet transaction by source receipt ID:",
    //   error
    // );
    return null;
  }
}

export const getUserWallets = async (userId) => {
  if (!userId) {
    console.warn("getUserWallets: User ID is undefined or null.");
    return [];
  }
  try {
    const response = await databases.listDocuments(
      databaseId,
      userwalletTransactions, // <--- Make sure this ID is correct in your appwriteConfig
      [Query.equal("user_id", userId)] // Assuming your wallet documents have a 'user_id' attribute
    );
    return response.documents;
  } catch (error) {
    // console.error("Error getting user wallets:", error);
    // Do not throw if it's just about checking existence; return empty array
    return [];
  }
};

export { projectId, categoriesData, subcategoriesData, account }; // Add this
