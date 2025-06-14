import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, router } from "expo-router";
import GradientBackground from "../components/GradientBackground"
import icons from "../constants/icons"
import { useGlobalContext } from "../context/GlobalProvider";
import { updateUserPremiumStatus } from "../lib/appwrite";

// --- START: REAL EXPO IAP IMPORTS & PRODUCT IDs ---
// In a REAL Expo project, you would uncomment this:
// import * as InAppPurchases from 'expo-in-app-purchases';

// IMPORTANT: Replace these with your ACTUAL Product IDs from App Store Connect and Google Play Console
const IOS_PRODUCT_ID = "com.yourcompany.yourapp.premium.monthly"; // Example: "com.o7.rn1.premium.monthly"
const ANDROID_PRODUCT_ID = "com.yourcompany.yourapp.premium.monthly"; // Example: "com.o7.rn1.premium.monthly"

const PRODUCT_IDS = Platform.select({
  ios: [IOS_PRODUCT_ID],
  android: [ANDROID_PRODUCT_ID],
  default: [],
});
// --- END: REAL EXPO IAP IMPORTS & PRODUCT IDs ---

const PremiumBenefits = [
  "Unlimited Receipt Uploads",
  "Advanced Spending Analytics",
  "Export Data to Excel/PDF",
  "Priority Customer Support",
  "No Ads (if applicable)",
  "Custom Budget Categories",
  // Add more compelling benefits here!
];

const UpgradePremium = () => {
  const navigation = useNavigation();
  const { user, setUser, checkSessionAndFetchUser } = useGlobalContext();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [localizedPrice, setLocalizedPrice] = useState("Loading Price...");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Ref to hold the purchase listener, allowing it to be cleaned up
  const purchaseListener = useRef(null);

  // Function to fetch product details and set up IAP listeners
  const initializeIAP = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      // --- REAL EXPO IAP: Connect to stores ---
      // await InAppPurchases.connectAsync();
      // console.log("InAppPurchases connected.");

      // --- REAL EXPO IAP: Add purchase listener ---
      // This listener will fire when a purchase completes, fails, or is updated
      // purchaseListener.current = InAppPurchases.addPurchaseListener(async ({ responseCode, results, errorCode }) => {
      //     if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      //         for (const purchase of results) {
      //             if (!purchase.acknowledged) { // Only process unacknowledged purchases
      //                 console.log("Purchase received (needs validation):", purchase);
      //                 // Call your backend for server-side validation and acknowledge
      //                 await handleServerSideValidationAndAcknowledgement(purchase);
      //             }
      //         }
      //     } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
      //         Alert.alert("Purchase Canceled", "You have canceled the purchase.");
      //         setIsSubscribing(false);
      //     } else if (responseCode === InAppPurchases.IAPResponseCode.DEFERRED) {
      //         Alert.alert("Purchase Pending", "Your purchase is pending. Please check back later.");
      //         setIsSubscribing(false);
      //     } else {
      //         console.error("IAP Response Error Code:", errorCode);
      //         Alert.alert("Purchase Failed", "An error occurred during the purchase process. Please try again.");
      //         setIsSubscribing(false);
      //     }
      // });

      // --- REAL EXPO IAP: Fetch product details ---
      // const { results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
      // if (results.length > 0) {
      //     setLocalizedPrice(results[0].localizedPrice);
      //     console.log("Fetched localized price:", results[0].localizedPrice);
      // } else {
      //     console.warn("No products found for IDs:", PRODUCT_IDS);
      //     setLocalizedPrice("Price not available");
      // }

      // --- SIMULATION for Canvas environment ---
      setLocalizedPrice("EGP 99.99/month");
      console.log("Simulated IAP initialization complete.");
      // --- END SIMULATION ---
    } catch (error) {
      console.error("IAP initialization error:", error);
      Alert.alert(
        "Error",
        "Could not connect to the store. Please try again later."
      );
      setLocalizedPrice("Price not available");
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Effect to run IAP initialization and cleanup
  useEffect(() => {
    initializeIAP();

    // Cleanup listener when component unmounts
    return () => {
      // InAppPurchases.removePurchaseListener(purchaseListener.current);
      // InAppPurchases.disconnectAsync(); // Disconnect from stores (Expo IAP)
      console.log("IAP listeners cleaned up (simulated).");
    };
  }, [initializeIAP]);

  // Handle incoming purchases (from listener)
  const handleServerSideValidationAndAcknowledgement = async (purchase) => {
    // This function would be called by the `addPurchaseListener` in a REAL app.
    // It's the BRIDGE to your Appwrite Function for validation.
    try {
      console.log("Sending purchase for server-side validation:", purchase);

      // In a REAL app, this is where you'd call your Appwrite Function:
      // const validationResponse = await YOUR_APPWRITE_FUNCTION_CALL_FOR_VALIDATION({
      //     platform: Platform.OS,
      //     productId: purchase.productId,
      //     purchaseTokenOrReceipt: Platform.OS === 'ios' ? purchase.receipt : purchase.purchaseToken,
      //     userId: user.$id,
      // });

      // Simulate Appwrite Function call and successful validation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const validationResponse = { success: true }; // Assume success for simulation

      if (validationResponse.success) {
        // Update user premium status in your Appwrite DB
        await updateUserPremiumStatus(user.$id, true);
        console.log(
          "User premium status updated in Appwrite after validation!"
        );

        // Acknowledge the purchase with the store (crucial for both Apple and Google)
        // await InAppPurchases.finishTransactionAsync(purchase, true); // REAL Expo IAP

        // Re-fetch global user data to update UI throughout the app
        await checkSessionAndFetchUser();

        Alert.alert(
          "Success!",
          "Congratulations! You are now a Premium member. Enjoy unlimited features!"
        );
        router.replace("/settings/app-settings");
      } else {
        Alert.alert(
          "Subscription Failed",
          "Purchase validation failed. Please contact support."
        );
      }
    } catch (error) {
      console.error(
        "Server-side validation and acknowledgement failed:",
        error
      );
      Alert.alert(
        "Subscription Failed",
        `Validation error: ${error.message || "Please try again."}`
      );
      // Important: Handle this error; user might have paid but not received premium.
      // You might need a retry mechanism or a way for users to restore purchases.
    } finally {
      setIsSubscribing(false); // Stop loading spinner
    }
  };

  // Check if user is already premium when they land on this page
  useEffect(() => {
    if (user?.isPremium) {
      Alert.alert(
        "Already Premium",
        "You already have access to premium features!"
      );
      router.replace("/settings/app-settings"); // Navigate back
    }
  }, [user, navigation]); // Dependency array to re-run when user changes

  const handleSubscribeButtonPress = async () => {
    setIsSubscribing(true);
    try {
      // --- REAL EXPO IAP: Initiate the purchase ---
      // const productIdToPurchase = Platform.OS === 'ios' ? IOS_PRODUCT_ID : ANDROID_PRODUCT_ID;
      // await InAppPurchases.purchaseItemAsync(productIdToPurchase);
      // The purchaseListener will then handle the result.

      // --- SIMULATED PURCHASE (for Canvas environment) ---
      console.log("Simulating purchase initiation...");
      // Directly call the validation handler after a delay to mimic immediate success.
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const simulatedPurchase = {
        productId: Platform.OS === "ios" ? IOS_PRODUCT_ID : ANDROID_PRODUCT_ID,
        purchaseToken: `sim_android_token_${Date.now()}`,
        receipt: `sim_ios_receipt_${Date.now()}`,
        acknowledged: false,
      };
      await handleServerSideValidationAndAcknowledgement(simulatedPurchase);
      // --- END SIMULATED PURCHASE ---
    } catch (error) {
      console.error("Purchase initiation failed:", error);
      Alert.alert(
        "Purchase Failed",
        `Could not start the purchase: ${error.message || "Please try again."}`
      );
      setIsSubscribing(false);
    }
  };

  // Show loading spinner if products are still being fetched or if global context is loading
  if (isLoadingProducts || globalLoading) {
    return (
      <GradientBackground>
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4E17B3" />
          <Text className="mt-2 text-gray-500">Loading premium details...</Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8 mt-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text className="text-blue-600 text-lg font-pmedium">Back</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-pbold text-black">Go Premium!</Text>
            <View className="w-10" />
          </View>

          {/* Premium Benefits Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-purple-200">
            <Text className="text-xl font-pbold text-purple-800 mb-4 text-center">
              Unlock Exclusive Features
            </Text>
            <Image
              source={icons.star}
              className="w-20 h-20 tint-yellow-500 self-center mb-6"
              resizeMode="contain"
            />

            {PremiumBenefits.map((benefit, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <Image
                  source={icons.check}
                  className="w-5 h-5 tint-green-500 mr-3"
                  resizeMode="contain"
                />
                <Text className="text-lg font-pregular text-gray-700 flex-1">
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          {/* Pricing Call to Action */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-purple-200">
            <Text className="text-2xl font-pbold text-center text-black mb-2">
              {localizedPrice}
            </Text>
            <Text className="text-base font-pregular text-gray-600 text-center mb-4">
              Cancel anytime.
            </Text>
            <TouchableOpacity
              onPress={handleSubscribeButtonPress} // Use the new handler
              className={`flex-row items-center justify-center p-4 rounded-md ${
                isSubscribing ? "bg-purple-300" : "bg-purple-600"
              }`}
              disabled={isSubscribing}
            >
              {isSubscribing ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  className="mr-2"
                />
              ) : (
                <Image
                  source={icons.star}
                  className="w-6 h-6 tint-white mr-2"
                  resizeMode="contain"
                />
              )}
              <Text className="text-white font-psemibold text-lg">
                {isSubscribing ? "Subscribing..." : "Subscribe Now"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spacer for bottom padding */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default UpgradePremium;
