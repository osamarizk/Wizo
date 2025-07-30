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
  I18nManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router"; // For navigation.goBack()
import { useFocusEffect, router } from "expo-router"; // Import useFocusEffect and router
import GradientBackground from "../../components/GradientBackground"; // Adjust path as needed
import { useGlobalContext } from "../../context/GlobalProvider"; // Adjust path as needed
import {
  getReceiptStats,
  fetchUserReceipts,
  deleteUserAccount,
  getAppwriteErrorMessageKey,
} from "../../lib/appwrite"; // Adjust this path as needed to your appwrite functions file
import * as FileSystem from "expo-file-system"; // For file export
import * as Sharing from "expo-sharing"; // For sharing files
import icons from "../../constants/icons"; // Make sure to import icons here (download, trash, arrowRight)

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../../utils/fontUtils"; // Adjust path as needed for THIS file
import i18n from "../../utils/i18n"; // Adjust path as needed for THIS file
import { format } from "date-fns"; // For date formatting
import { ar as arLocale } from "date-fns/locale";

const convertToArabicNumerals = (num) => {
  const numString = String(num || 0);
  if (typeof numString !== "string") return String(numString);
  const arabicNumeralsMap = {
    0: "٠",
    1: "١",
    2: "٢",
    3: "٣",
    4: "٤",
    5: "٥",
    6: "٦",
    7: "٧",
    8: "٨",
    9: "٩",
  };
  return numString.replace(/\d/g, (digit) => arabicNumeralsMap[digit] || digit);
};

const ManageData = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, setUser, preferredCurrencySymbol } = useGlobalContext();
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
      setRefreshing(false);
      return;
    }

    if (!refreshing) setIsLoading(true);

    try {
      const currentStats = await getReceiptStats(user.$id);
      console.log("Fetched currentStats in ManageData:", currentStats);

      const allUserReceipts = await fetchUserReceipts(user.$id);
      console.log(
        "Fetched allUserReceipts for overall spending:",
        allUserReceipts.length
      );

      let calculatedOverallSpending = 0;
      allUserReceipts.forEach((receipt) => {
        let items = receipt.items;
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch (error) {
            const errorKey = getAppwriteErrorMessageKey(error);
            let errorMessage = t(errorKey);

            if (errorKey === "appwriteErrors.genericAppwriteError") {
              errorMessage = t(errorKey, { message: error.message });
            }

            Alert.alert(t("common.errorTitle"), errorMessage);
            items = [];
          }
        }
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
        totalReceipts: currentStats?.totalCount || 0,
        totalSpendingOverall: calculatedOverallSpending,
        // Format date using date-fns and translate for locale
        lastUploadDate: currentStats?.latestDate
          ? format(new Date(currentStats.latestDate), "PPP", {
              locale: i18n.language.startsWith("ar") ? arLocale : undefined,
            })
          : t("common.notApplicable"), // Assuming 'N/A' is translated as 'Not Applicable'
      });
    } catch (error) {
      const errorKey = getAppwriteErrorMessageKey(error);
      let errorMessage = t(errorKey);

      if (errorKey === "appwriteErrors.genericAppwriteError") {
        errorMessage = t(errorKey, { message: error.message });
      }

      Alert.alert(t("common.errorTitle"), errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.$id, refreshing, t, i18n.language]);

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
      const allReceipts = await fetchUserReceipts(user.$id);
      console.log("Fetched receipts for export:", allReceipts.length);

      const currencySymbol = preferredCurrencySymbol; // Get translated currency symbol

      // Convert data to CSV format
      const header = `${t("common.id")},${t("common.date")},${t(
        "common.merchant"
      )},${t("common.total")},${t("common.category")},${t(
        "common.subcategory"
      )},${t("common.items")}\n`;
      // You'll need to add common.id, common.date, common.merchant, common.total, common.category, common.subcategory, common.items to your i18n common section.

      const csvContent = allReceipts
        .map((r) => {
          let itemsString = "";
          if (typeof r.items === "string") {
            try {
              const parsedItems = JSON.parse(r.items);
              itemsString = parsedItems
                .map((item) => {
                  const itemName = String(item.name || "N/A");
                  const itemPrice =
                    i18n.language.startsWith("ar") &&
                    !isNaN(parseFloat(item.price))
                      ? convertToArabicNumerals(
                          parseFloat(item.price).toFixed(2)
                        )
                      : item.price || "N/A";
                  return `${itemName} (${itemPrice} ${currencySymbol})`;
                })
                .join("; ");
            } catch (error) {
              const errorKey = getAppwriteErrorMessageKey(error);
              let errorMessage = t(errorKey);

              if (errorKey === "appwriteErrors.genericAppwriteError") {
                errorMessage = t(errorKey, { message: error.message });
              }

              Alert.alert(t("common.errorTitle"), errorMessage);
              itemsString = String(r.items);
            }
          } else if (Array.isArray(r.items)) {
            itemsString = r.items
              .map((item) => {
                const itemName = String(item.name || "N/A");
                const itemPrice =
                  i18n.language.startsWith("ar") &&
                  !isNaN(parseFloat(item.price))
                    ? convertToArabicNumerals(parseFloat(item.price).toFixed(2))
                    : item.price || "N/A";
                return `${itemName} (${itemPrice} ${currencySymbol})`;
              })
              .join("; ");
          }

          // Basic sanitation for CSV to handle commas/quotes in data
          const escapeCsv = (text) =>
            `"${String(text || "").replace(/"/g, '""')}"`;

          // Ensure field names match your Appwrite schema for receipts (e.g., 'total' vs 'amount', 'datetime' vs 'timestamp')
          const receiptDate = new Date(r.datetime).toISOString().split("T")[0]; // Assuming 'datetime' field
          const totalAmount =
            i18n.language.startsWith("ar") && !isNaN(parseFloat(r.total))
              ? convertToArabicNumerals(parseFloat(r.total).toFixed(2))
              : r.total || "0.00"; // Assuming 'total' field

          return `${escapeCsv(r.$id)},${escapeCsv(receiptDate)},${escapeCsv(
            r.merchant || ""
          )},${escapeCsv(totalAmount)},${escapeCsv(
            r.category || ""
          )},${escapeCsv(r.subcategory || "")},${escapeCsv(itemsString)}`;
        })
        .join("\n");
      const fullCsv = header + csvContent;

      const fileUri = FileSystem.cacheDirectory + "my_receipt_data.csv";
      await FileSystem.writeAsStringAsync(fileUri, fullCsv);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: t("manageData.exportSuccessTitle"), // Translated dialog title
        });
        // Translated Alert.alert
        Alert.alert(
          t("manageData.exportSuccessTitle"),
          t("manageData.exportSuccessMessage")
        );
      } else {
        // Translated Alert.alert
        Alert.alert(
          t("manageData.exportErrorTitle"),
          t("manageData.exportSharingUnavailable")
        );
      }
    } catch (error) {
      const errorKey = getAppwriteErrorMessageKey(error);
      let errorMessage = t(errorKey);

      if (errorKey === "appwriteErrors.genericAppwriteError") {
        errorMessage = t(errorKey, { message: error.message });
      }

      Alert.alert(t("common.errorTitle"), errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("manageData.deleteAccountAlertTitle"), // Translated
      t("manageData.deleteAccountAlertMessage"), // Translated
      [
        {
          text: t("manageData.cancelDelete"), // Translated
          style: "cancel",
        },
        {
          text: t("manageData.confirmDelete"), // Translated
          style: "destructive",
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              await deleteUserAccount(user.$id); // Call your existing deleteUserAccount function
              setUser(null); // Clear user from global context
              router.replace("/sign-in"); // Navigate to sign-in screen
              // Translated Alert.alert
              Alert.alert(
                t("manageData.accountDeletedTitle"),
                t("manageData.accountDeletedMessage")
              );
            } catch (error) {
              const errorKey = getAppwriteErrorMessageKey(error);
              let errorMessage = t(errorKey);

              if (errorKey === "appwriteErrors.genericAppwriteError") {
                errorMessage = t(errorKey, { message: error.message });
              }

              Alert.alert(t("common.errorTitle"), errorMessage);
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
          <Text
            className="mt-4 text-gray-700" // Removed font class from className
            style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
          >
            {t("manageData.loadingDataSummary")} {/* Translated */}
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
          className="mr-2 ml-2 mt-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#9F54B6" // Tint color for the spinner
            />
          }
        >
          {/* Header */}
          <View
            className={`flex-row items-center justify-between mb-8 mt-4 ${
              I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse header for RTL
            }`}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text
                className="text-blue-600 text-lg"
                style={{ fontFamily: getFontClassName("medium") }}
              >
                {t("common.back")} {/* Translated */}
              </Text>
            </TouchableOpacity>
            <Text
              className="text-3xl text-black"
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("manageData.pageTitle")} {/* Translated */}
            </Text>
            {/* Spacer for symmetrical layout */}
            <View className="w-10" />
          </View>

          {/* Data Summary Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text
              className={`text-xl text-gray-800 mb-4 ${
                I18nManager.isRTL ? "text-right" : "text-left" // Align title
              }`}
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("manageData.dataSummaryTitle")} {/* Translated */}
            </Text>

            {/* Total Receipts Uploaded */}
            <View
              className={`flex-row items-center justify-between py-2 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("manageData.totalReceiptsUploaded")}: {/* Translated */}
              </Text>
              <Text
                className="text-lg text-gray-800"
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {i18n.language.startsWith("ar")
                  ? convertToArabicNumerals(dataSummary.totalReceipts)
                  : dataSummary.totalReceipts}{" "}
                {/* Numeral conversion */}
              </Text>
            </View>

            {/* Overall Spending Recorded */}
            <View
              className={`flex-row items-center justify-between py-2 border-b border-gray-100 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("manageData.overallSpendingRecorded")}: {/* Translated */}
              </Text>
              <Text
                className="text-lg text-gray-800"
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {preferredCurrencySymbol}{" "}
                {i18n.language.startsWith("ar")
                  ? convertToArabicNumerals(
                      dataSummary.totalSpendingOverall.toFixed(2)
                    )
                  : dataSummary.totalSpendingOverall.toFixed(2)}{" "}
                {/* Numeral conversion and currency */}
              </Text>
            </View>

            {/* Last Receipt Uploaded */}
            <View
              className={`flex-row items-center justify-between py-2 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
              }`}
            >
              <Text
                className="text-lg text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("manageData.lastReceiptUploaded")}: {/* Translated */}
              </Text>
              <Text
                className="text-lg text-gray-800"
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {dataSummary.lastUploadDate}{" "}
                {/* Already localized by fetchDataSummary */}
              </Text>
            </View>
          </View>

          {/* Data Actions Section */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text
              className={`text-xl text-gray-800 mb-4 ${
                I18nManager.isRTL ? "text-right" : "text-left" // Align title
              }`}
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("manageData.dataActionsTitle")} {/* Translated */}
            </Text>

            {/* Export Data Button */}
            <TouchableOpacity
              onPress={handleExportData}
              className={`flex-row items-center justify-center p-4 rounded-md mb-4 ${
                isExporting ? "bg-gray-400" : "bg-[#2A9D8F]" // Teal for active, Gray for loading
              } ${I18nManager.isRTL ? "flex-row-reverse" : "flex-row"}`} // Reverse for RTL
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  className={`${I18nManager.isRTL ? "ml-2" : "mr-2"}`} // Adjust margin
                />
              ) : (
                <Image
                  source={icons.download}
                  className={`w-6 h-6 tint-white ${
                    I18nManager.isRTL ? "ml-2" : "mr-2"
                  }`} // Adjust margin
                  resizeMode="contain"
                />
              )}
              <Text
                className="text-white text-lg"
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {isExporting
                  ? t("manageData.preparingDataButton")
                  : t("manageData.exportMyDataButton")}
                {/* Translated */}
              </Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className={`flex-row items-center justify-center p-4 rounded-md ${
                isDeletingAccount ? "bg-red-300" : "bg-[#D03957]" // Red for active, Light Red for loading
              } ${I18nManager.isRTL ? "flex-row-reverse" : "flex-row"}`} // Reverse for RTL
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  className={`${I18nManager.isRTL ? "ml-2" : "mr-2"}`} // Adjust margin
                />
              ) : (
                <Image
                  source={icons.trash}
                  className={`w-6 h-6 tint-white ${
                    I18nManager.isRTL ? "ml-2" : "mr-2"
                  }`} // Adjust margin
                  resizeMode="contain"
                />
              )}
              <Text
                className="text-white text-lg"
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {isDeletingAccount
                  ? t("manageData.deletingAccountButton")
                  : t("manageData.deleteMyAccountButton")}
                {/* Translated */}
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
