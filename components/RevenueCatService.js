// RevenueCatService.js
import Purchases from "react-native-purchases";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Retrieve API keys from Expo's extra configuration
const REVENUECAT_APPLE_API_KEY =
  Constants.expoConfig.extra.REVENUECAT_APPLE_API_KEY;
const REVENUECAT_GOOGLE_API_KEY =
  Constants.expoConfig.extra.REVENUECAT_GOOGLE_API_KEY;

// Export the premium entitlement ID for consistent use across the app
export const PREMIUM_ENTITLEMENT_ID = "resynqent";

// A global variable to hold the reference to the customer info listener.
// This allows us to remove it if needed (e.g., during hot reloads in development).
let customerInfoListenerRef = null;

/**
 * Initializes the RevenueCat SDK and sets up a global listener for customer information updates.
 * This function MUST be called only ONCE in the entire application's lifecycle,
 * typically at the very root component (e.g., App.js or _layout.js in Expo Router).
 *
 * @param {Function} onCustomerInfoUpdatedCallback - A callback function that will be invoked
 * whenever RevenueCat's customer information updates. This callback will receive the
 * `customerInfo` object as its argument. This is where you'll trigger your Appwrite sync.
 */
export const initializeRevenueCat = (onCustomerInfoUpdatedCallback) => {
  // Set RevenueCat logging level to DEBUG for detailed console output during development.
  // This helps in understanding the SDK's behavior.
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

  // Configure RevenueCat with the appropriate API key based on the platform.
  // It's crucial to use the correct key for iOS or Android.
  if (Platform.OS === "ios") {
    Purchases.configure({ apiKey: REVENUECAT_APPLE_API_KEY });
  } else if (Platform.OS === "android") {
    Purchases.configure({ apiKey: REVENUECAT_GOOGLE_API_KEY });
  } else {
    // Warn if the platform is not supported or recognized for RevenueCat configuration.
    console.warn("RevenueCat not configured for this platform:", Platform.OS);
    return; // Exit if configuration is not possible.
  }

  // Before adding a new listener, remove any existing one. This is particularly
  // useful during development with hot reloading to prevent multiple listeners
  // from being attached, which can lead to unexpected behavior.
  if (customerInfoListenerRef) {
    Purchases.removeCustomerInfoUpdateListener(customerInfoListenerRef);
  }

  // Define and store the new listener function. This function will be called by
  // RevenueCat whenever the customer's subscription status or entitlements change.
  customerInfoListenerRef = (customerInfo) => {
    console.log(
      "RevenueCat: Customer info updated (Global Listener):",
      JSON.stringify(customerInfo, null, 2)
    );
    // Invoke the provided callback, which will typically handle updating global state
    // and syncing with your backend (Appwrite).
    if (onCustomerInfoUpdatedCallback) {
      onCustomerInfoUpdatedCallback(customerInfo);
    }
  };
  // Add the new customer info update listener to RevenueCat.
  Purchases.addCustomerInfoUpdateListener(customerInfoListenerRef);
  console.log("RevenueCat SDK initialized and global listener added.");
};

/**
 * Logs a user into RevenueCat with your application's unique user ID.
 * This should be called whenever your user authenticates in your app (e.g., after login).
 * RevenueCat uses this ID to associate purchases with your internal user accounts.
 *
 * @param {string} appUserId - Your unique user ID from Appwrite (or your authentication system).
 * @returns {Promise<Object>} A promise that resolves with the updated `customerInfo` object.
 */
export const loginRevenueCat = async (appUserId) => {
  try {
    const { customerInfo, created } = await Purchases.logIn(appUserId);
    console.log(`RevenueCat logged in user: ${appUserId}, created: ${created}`);
    return customerInfo;
  } catch (e) {
    console.error(`RevenueCat login error for user ${appUserId}:`, e);
    throw e; // Re-throw the error for handling in the calling component/context.
  }
};

/**
 * Fetches the current offerings (available subscription plans) and the latest
 * customer information from RevenueCat. This is useful for displaying products
 * to the user and checking their current subscription status.
 *
 * @returns {Promise<Object>} A promise that resolves with an object containing
 * `offerings` and `customerInfo`.
 */
export const fetchRevenueCatData = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    const customerInfo = await Purchases.getCustomerInfo();
    return { offerings, customerInfo };
  } catch (error) {
    console.error("RevenueCat data fetch error:", error);
    throw error; // Re-throw the error for handling in the calling component.
  }
};

/**
 * Initiates a purchase for a specific RevenueCat package.
 * This function should be called when a user selects a subscription plan to buy.
 *
 * @param {Object} productPackage - The RevenueCat `Package` object representing the plan to purchase.
 * @returns {Promise<Object>} A promise that resolves with the updated `customerInfo` object
 * after a successful purchase.
 */
export const purchaseRevenueCatPackage = async (productPackage) => {
  try {
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(
      productPackage
    );
    console.log(
      `Purchase successful for ${productIdentifier}:`,
      JSON.stringify(customerInfo, null, 2)
    );
    return customerInfo;
  } catch (e) {
    console.error("RevenueCat purchase error:", e);
    throw e; // Re-throw the error for handling in the calling component.
  }
};

/**
 * Restores a user's previous purchases. This is typically used when a user
 * reinstalls the app or switches devices and needs their entitlements restored.
 *
 * @returns {Promise<Object>} A promise that resolves with the updated `customerInfo` object
 * after a successful restore operation.
 */
export const restoreRevenueCatPurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log("Purchases restored:", JSON.stringify(customerInfo, null, 2));
    return customerInfo;
  } catch (e) {
    console.error("RevenueCat restore error:", e);
    throw e; // Re-throw the error for handling in the calling component.
  }
};

/**
 * Logs out the current user from RevenueCat. This should be called when your
 * user logs out of your application.
 */
export const logoutRevenueCat = async () => {
  try {
    await Purchases.logOut();
    console.log("RevenueCat logged out.");
  } catch (e) {
    console.error("RevenueCat logout error:", e);
    throw e; // Re-throw the error for handling in the calling component.
  }
};
