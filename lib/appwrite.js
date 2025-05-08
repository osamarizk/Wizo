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
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
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

export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get latest created video posts
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
      Query.limit(7),
    ]);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get video posts that matches search query
export async function searchPosts(query) {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search("title", query),
    ]);

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get video posts created by user
export async function getUserPosts(userId) {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("creator", userId),
    ]);

    return posts.documents;
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

export async function createReceipt(data) {
  try {
    const doc = await databases.createDocument(
      databaseId,
      "receipt_id", // 🔁 Replace this with your actual Receipt Collection ID
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

export const isDuplicateReceipt = async (userId, merchant, datetime, total) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      "receipt_id", // Replace with actual collection ID
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

export { projectId }; // Add this
