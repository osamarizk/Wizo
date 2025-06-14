import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet, // You can remove this if no StyleSheet.create is used
  Image,
  RefreshControl, // Import RefreshControl for pull-to-refresh
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router"; // For navigation.goBack()
import { useFocusEffect, router } from "expo-router"; // Import useFocusEffect and router
import GradientBackground from "../../components/GradientBackground"; // Adjust path as needed
import { useGlobalContext } from "../../context/GlobalProvider"; // Adjust path as needed
import {
  getReceiptStats, // Your existing function for monthly stats and totalCount (overall receipts)
  fetchUserReceipts, // Your existing function to fetch user receipts, used here for overall spending calculation and export
  deleteUserAccount, // Your existing function for account deletion (assuming it's in your appwrite.js)
} from "../../lib/appwrite"; // Adjust this path as needed to your appwrite functions file
import * as FileSystem from "expo-file-system"; // For file export
import * as Sharing from "expo-sharing"; // For sharing files
import icons from "../../constants/icons"; // Make sure to import icons here (download, trash, arrowRight)

const ManageData = () => {
  const navigation = useNavigation();
  const { user, setUser } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // State for RefreshControl
  const [dataSummary, setDataSummary] = useState({
    totalReceipts: 0,
    totalSpendingOverall: 0, // This will now be calculated from all receipts
    lastUploadDate: "N/A",
  });

  // Function to fetch and update data summary
  const fetchDataSummary = useCallback(async () => {
    if (!user?.$id) {
      setIsLoading(false);
      setRefreshing(false); // Stop refreshing if no user
      return;
    }

    // Only show full loading indicator if it's the initial load, not a pull-to-refresh
    if (!refreshing) setIsLoading(true);

    try {
      // 1. Fetch current month's stats and overall total receipts count
      const currentStats = await getReceiptStats(user.$id);
      console.log("Fetched currentStats in ManageData:", currentStats); // For debugging

      // 2. Fetch ALL receipts to calculate overall spending
      // Assuming fetchUserReceipts without a 'limit' parameter fetches ALL user receipts.
      const allUserReceipts = await fetchUserReceipts(user.$id);
      console.log(
        "Fetched allUserReceipts for overall spending:",
        allUserReceipts.length
      );

      let calculatedOverallSpending = 0;
      allUserReceipts.forEach((receipt) => {
        let items = receipt.items;
        // Safely parse items if they are stored as JSON strings
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch (e) {
            console.error(
              "Error parsing receipt items for overall spending calculation:",
              e,
              receipt.items
            );
            items = []; // Fallback to empty array on parse error
          }
        }
        // Sum up prices from items array
        if (Array.isArray(items)) {
          items.forEach((item) => {
            const price = parseFloat(item.price);
            if (!isNaN(price)) {
              calculatedOverallSpending += price;
            }
          });
        }
      });

      setDataSummary({
        totalReceipts: currentStats?.totalCount || 0, // Assuming totalCount from getReceiptStats is the overall count
        totalSpendingOverall: calculatedOverallSpending, // Use the newly calculated overall spending
        lastUploadDate: currentStats?.latestDate || "N/A", // Use latestDate from getReceiptStats
      });
    } catch (error) {
      console.error("Failed to fetch data summary:", error);
      Alert.alert("Error", "Could not load data summary.");
      setDataSummary({
        totalReceipts: 0,
        totalSpendingOverall: 0,
        lastUploadDate: "N/A",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false); // Stop refreshing regardless of success/failure
    }
  }, [user?.$id, refreshing]); // Add 'refreshing' to dependency array

  // Use useFocusEffect to trigger data fetch when the screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log("ManageData screen focused, triggering data fetch.");
      fetchDataSummary();
      // Optional cleanup function if needed when the screen loses focus
      return () => {
        console.log("ManageData screen unfocused.");
      };
    }, [fetchDataSummary]) // Dependency: fetchDataSummary itself
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true); // Set refreshing to true to show the spinner
    // fetchDataSummary will be called automatically by useFocusEffect due to 'refreshing' state change
    // No need to call fetchDataSummary() directly here.
  }, []);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Use your existing fetchUserReceipts function, assuming it fetches all if limit is null/undefined
      const allReceipts = await fetchUserReceipts(user.$id);
      console.log("Fetched receipts for export:", allReceipts.length);

      // Convert data to CSV format
      const header = "ID,Date,Merchant,Total,Category,Subcategory,Items\n";
      const csvContent = allReceipts
        .map((r) => {
          let itemsString = "";
          // Safely parse items if they are stored as JSON strings
          if (typeof r.items === "string") {
            try {
              const parsedItems = JSON.parse(r.items);
              itemsString = parsedItems
                .map((item) => `${item.name} (${item.price || "N/A"})`)
                .join("; ");
            } catch (e) {
              console.error("Error parsing items for CSV export:", e, r.items);
              itemsString = r.items; // Fallback to raw string if parse fails
            }
          } else if (Array.isArray(r.items)) {
            itemsString = r.items
              .map((item) => `${item.name} (${item.price || "N/A"})`)
              .join("; ");
          }

          // Basic sanitation for CSV to handle commas/quotes in data
          const escapeCsv = (text) => `"${String(text).replace(/"/g, '""')}"`;

          // Adjust field names (e.g., 'total' vs 'amount', 'datetime' vs 'timestamp') to match your Appwrite schema
          return `${escapeCsv(r.$id)},${escapeCsv(
            new Date(r.datetime).toISOString().split("T")[0]
          )},${escapeCsv(r.merchant)},${escapeCsv(r.total)},${escapeCsv(
            r.category || ""
          )},${escapeCsv(r.subcategory || "")},${escapeCsv(itemsString)}`;
        })
        .join("\n");
      const fullCsv = header + csvContent;

      const fileUri = FileSystem.cacheDirectory + "my_receipt_data.csv";
      await FileSystem.writeAsStringAsync(fileUri, fullCsv);

      // Share the CSV file using Expo Sharing API
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Share your receipt data",
        });
        Alert.alert("Success", "Your data has been prepared for sharing.");
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Failed to export data:", error);
      Alert.alert("Error", "Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure you want to delete your account? This action is irreversible and all your data will be lost.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              // Call your existing deleteUserAccount function from appwrite.js
              await deleteUserAccount(user.$id);
              setUser(null); // Clear user from global context
              router.replace("/sign-in"); // Navigate to sign-in screen
              Alert.alert(
                "Account Deleted",
                "Your account and all associated data have been permanently deleted."
              );
            } catch (error) {
              console.error("Failed to delete account:", error);
              Alert.alert(
                "Error",
                `Failed to delete account: ${
                  error.message || "Please try again."
                }`
              );
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Show full loading indicator only on initial load or if not refreshing
  if (isLoading && !refreshing) {
    return (
      <GradientBackground>
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#9F54B6" />
          <Text className="mt-4 text-gray-700 font-pregular">
            Loading data summary...
          </Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="p-4"
          // Add RefreshControl to the ScrollView for pull-to-refresh
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8 mt-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text className="text-blue-600 text-lg font-pmedium">Back</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-pbold text-black">
              Manage My Data
            </Text>
            <View className="w-10" />
          </View>

          {/* Data Summary Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Your Data Summary
            </Text>
            <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Total Receipts Uploaded:
              </Text>
              <Text className="text-lg font-psemibold text-gray-800">
                {dataSummary.totalReceipts}
              </Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
              <Text className="text-lg font-pregular text-gray-700">
                Overall Spending Recorded:
              </Text>
              {/* Display overallSpending with 2 decimal places */}
              <Text className="text-lg font-psemibold text-gray-800">
                EGP {dataSummary.totalSpendingOverall.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-lg font-pregular text-gray-700">
                Last Receipt Uploaded:
              </Text>
              <Text className="text-lg font-psemibold text-gray-800">
                {dataSummary.lastUploadDate}
              </Text>
            </View>
          </View>

          {/* Data Actions Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-xl font-pbold text-gray-800 mb-4">
              Data Actions
            </Text>

            {/* Export Data Button */}
            <TouchableOpacity
              onPress={handleExportData}
              className={`flex-row items-center justify-center p-4 rounded-md mb-4 ${
                isExporting ? "bg-blue-300" : "bg-blue-500"
              }`}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  className="mr-2"
                />
              ) : (
                <Image
                  source={icons.download}
                  className="w-6 h-6 tint-white mr-2"
                  resizeMode="contain"
                />
              )}
              <Text className="text-white font-psemibold text-lg">
                {isExporting ? "Preparing Data..." : "Export My Data (CSV)"}
              </Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className={`flex-row items-center justify-center p-4 rounded-md ${
                isDeletingAccount ? "bg-red-300" : "bg-red-500"
              }`}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  className="mr-2"
                />
              ) : (
                <Image
                  source={icons.trash}
                  className="w-6 h-6 tint-white mr-2"
                  resizeMode="contain"
                />
              )}
              <Text className="text-white font-psemibold text-lg">
                {isDeletingAccount
                  ? "Deleting Account..."
                  : "Delete My Account"}
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

export default ManageData;
