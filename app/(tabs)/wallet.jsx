import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Image,
  Pressable,
  I18nManager,
} from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  addWalletTransaction,
  getWalletTransactions,
  updateWalletTransaction,
  deleteWalletTransaction,
  createNotification, // <--- IMPORTANT: Ensure createNotification is imported
  countUnreadNotifications, // <--- IMPORTANT: Ensure countUnreadNotifications is imported
  getFutureDate,
} from "../../lib/appwrite";
import { format, isSameMonth, isSameYear } from "date-fns";
import { ar as arLocale } from "date-fns/locale";
import icons from "../../constants/icons";
import GradientBackground from "../../components/GradientBackground";
import { useFocusEffect } from "@react-navigation/native";

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../../utils/fontUtils"; // Assumed to return direct font family name
import i18n from "../../utils/i18n";

const screenWidth = Dimensions.get("window").width;

const convertToArabicNumerals = (num) => {
  const numString = String(num || 0); // Defensive check for null/undefined
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

const Wallet = () => {
  const { t } = useTranslation();
  // Ensure updateUnreadCount is destructured from useGlobalContext
  const {
    user,
    isLoading: globalLoading,
    updateUnreadCount,
  } = useGlobalContext();

  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState("deposit");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedTransactionForEdit, setSelectedTransactionForEdit] =
    useState(null);
  const [isConfirmDeleteModalVisible, setIsConfirmDeleteModalVisible] =
    useState(false);

  const [monthlyDeposits, setMonthlyDeposits] = useState(0);
  const [monthlyExpensesWithdrawals, setMonthlyExpensesWithdrawals] =
    useState(0);
  const [averageCashExpense, setAverageCashExpense] = useState(0);

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchWalletData = useCallback(async () => {
    if (!user?.$id) {
      if (isMounted.current) setIsLoadingData(false);
      console.log("fetchWalletData: No user ID, skipping fetch.");
      return;
    }

    if (!refreshing && isMounted.current) {
      setIsLoadingData(true);
    }
    console.log("fetchWalletData: Starting data fetch for user:", user.$id);

    try {
      const fetchedTransactions = await getWalletTransactions(user.$id);

      if (!isMounted.current) {
        console.log(
          "fetchWalletData: Component unmounted during fetch, aborting state update."
        );
        return;
      }

      let balance = 0;
      const sortedTransactions = fetchedTransactions.sort(
        (a, b) => new Date(b.datetime) - new Date(a.datetime)
      );

      let currentMonthDeposits = 0;
      let currentMonthExpensesWithdrawals = 0;
      let totalCashExpensesAmount = 0;
      let cashExpenseCount = 0;
      const today = new Date();

      sortedTransactions.forEach((tx) => {
        const amount = parseFloat(tx.amount || 0);
        const txDate = new Date(tx.datetime);

        if (tx.type === "deposit") {
          balance += amount;
        } else if (tx.type === "withdrawal" || tx.type === "manual_expense") {
          balance -= amount;
        }

        if (isSameMonth(txDate, today) && isSameYear(txDate, today)) {
          if (tx.type === "deposit") {
            currentMonthDeposits += amount;
          } else if (tx.type === "withdrawal" || tx.type === "manual_expense") {
            currentMonthExpensesWithdrawals += amount;
            totalCashExpensesAmount += amount;
            cashExpenseCount += 1;
          }
        }
      });

      setWalletBalance(balance);
      setTransactions(sortedTransactions);

      setMonthlyDeposits(currentMonthDeposits);
      setMonthlyExpensesWithdrawals(currentMonthExpensesWithdrawals);
      setAverageCashExpense(
        cashExpenseCount > 0 ? totalCashExpensesAmount / cashExpenseCount : 0
      );

      console.log("fetchWalletData: Data fetched and set successfully.");
    } catch (error) {
      console.error("fetchWalletData: Failed to fetch wallet data:", error);
      if (isMounted.current)
        Alert.alert("Error", "Failed to load wallet data.");
    } finally {
      if (isMounted.current) {
        setIsLoadingData(false);
        setRefreshing(false);
        console.log("fetchWalletData: Finished loading state updates.");
      }
    }
  }, [user?.$id, refreshing]);

  useFocusEffect(
    useCallback(() => {
      console.log("Wallet: useFocusEffect triggered (screen focused).");
      fetchWalletData();

      return () => {
        console.log("Wallet: useFocusEffect cleanup (screen blurred).");
        setIsModalVisible(false);
        setSelectedTransactionForEdit(null);
        setIsConfirmDeleteModalVisible(false);
        setTransactionAmount("");
        setTransactionDescription("");
        setTransactionType("deposit");
      };
    }, [fetchWalletData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
  }, []);

  const handleSaveTransaction = useCallback(async () => {
    console.log("handleSaveTransaction: Initiated.");
    console.log(
      "handleSaveTransaction: selectedTransactionForEdit:",
      selectedTransactionForEdit
    );
    console.log("handleSaveTransaction: transactionAmount:", transactionAmount);
    console.log("handleSaveTransaction: transactionType:", transactionType);

    if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive amount.");
      return;
    }
    if (!transactionType) {
      Alert.alert("Missing Type", "Please select a transaction type.");
      return;
    }

    if (!user?.$id) {
      Alert.alert("Authentication Error", "User not logged in.");
      return;
    }

    if (isProcessingTransaction) {
      console.log(
        "handleSaveTransaction: Already processing, preventing double submission."
      );
      return;
    }

    setIsProcessingTransaction(true);
    try {
      const amount = parseFloat(transactionAmount);
      let notificationTitle = "";
      let notificationMessage = "";
      let notificationType = "wallet"; // Default type for wallet actions

      if (selectedTransactionForEdit) {
        const updates = {
          amount: amount,
          type: transactionType,
          description: transactionDescription,
        };
        console.log("handleSaveTransaction: Attempting to UPDATE transaction.");
        console.log(
          "handleSaveTransaction: Transaction ID to update:",
          selectedTransactionForEdit.$id
        );
        console.log("handleSaveTransaction: Updates:", updates);
        await updateWalletTransaction(selectedTransactionForEdit.$id, updates);
        Alert.alert("Success", "Transaction updated successfully!");
        notificationTitle = "Wallet Transaction Updated";
        notificationMessage = `Your ${transactionType} transaction for $${amount.toFixed(
          2
        )} has been updated.`;
        console.log("handleSaveTransaction: Transaction UPDATE successful.");
      } else {
        console.log(
          "handleSaveTransaction: Attempting to ADD new transaction."
        );
        await addWalletTransaction(
          user.$id,
          amount,
          transactionType,
          transactionDescription
        );
        Alert.alert("Success", "Transaction recorded successfully!");
        notificationTitle = "New Wallet Transaction";
        notificationMessage = `A new ${transactionType} transaction of $${amount.toFixed(
          2
        )} has been recorded.`;
        console.log("handleSaveTransaction: New transaction ADD successful.");
      }

      // Create notification for successful transaction save/update
      try {
        await createNotification({
          user_id: user.$id,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          expiresAt: getFutureDate(7), // <--- Expiry: 7 days for success notifications
        });
        // Update the unread notification count in the global context
        const updatedUnreadCount = await countUnreadNotifications(user.$id);
        updateUnreadCount(updatedUnreadCount);
      } catch (notificationError) {
        console.warn(
          "Failed to create wallet transaction notification:",
          notificationError
        );
      }

      console.log("handleSaveTransaction: Re-fetching all wallet data...");
      await fetchWalletData();

      closeModal();
    } catch (error) {
      console.error("handleSaveTransaction: Transaction save failed:", error);
      Alert.alert(
        "Failed",
        error.message || "Could not save transaction. Please try again."
      );
      // Create notification for transaction save/update failure
      try {
        await createNotification({
          user_id: user.$id,
          title: "Wallet Transaction Failed",
          message: `Failed to save your wallet transaction: ${
            error.message || "Unknown error"
          }.`,
          type: "error", // Use 'error' type for failures
          expiresAt: getFutureDate(14), // <--- Expiry: 7 days for success notifications
        });
        // Update the unread notification count in the global context
        const updatedUnreadCount = await countUnreadNotifications(user.$id);
        updateUnreadCount(updatedUnreadCount);
      } catch (notificationError) {
        console.warn(
          "Failed to create wallet transaction failure notification:",
          notificationError
        );
      }
    } finally {
      setIsProcessingTransaction(false);
      console.log("handleSaveTransaction: Finished processing.");
    }
  }, [
    user?.$id,
    transactionAmount,
    transactionType,
    transactionDescription,
    selectedTransactionForEdit,
    fetchWalletData,
    isProcessingTransaction,
    updateUnreadCount, // Add updateUnreadCount to dependencies
  ]);

  const openTransactionModal = (transaction = null) => {
    if (transaction) {
      setSelectedTransactionForEdit(transaction);
      setTransactionAmount(transaction.amount.toString());
      setTransactionDescription(transaction.description || "");
      setTransactionType(transaction.type);
      console.log("Opening EDIT modal for transaction:", transaction.$id);
    } else {
      setSelectedTransactionForEdit(null);
      setTransactionAmount("");
      setTransactionDescription("");
      setTransactionType("deposit");
      console.log("Opening ADD modal.");
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedTransactionForEdit(null);
    setTransactionAmount("");
    setTransactionDescription("");
    setTransactionType("deposit");
    console.log("Transaction modal closed and states reset.");
  };

  const handleDeleteConfirm = useCallback(
    async (transactionId) => {
      console.log("handleDeleteConfirm: Initiated for ID:", transactionId);
      if (isProcessingTransaction) return;
      setIsProcessingTransaction(true);
      try {
        // Find the transaction to get details for the notification before deleting
        const transactionToDelete = transactions.find(
          (tx) => tx.$id === transactionId
        );

        await deleteWalletTransaction(transactionId);
        Alert.alert("Success", "Transaction deleted successfully!");
        console.log("handleDeleteConfirm: Transaction DELETE successful.");

        // Create notification for successful deletion
        if (transactionToDelete) {
          try {
            await createNotification({
              user_id: user.$id,
              title: "Wallet Transaction Deleted",
              message: `Your ${
                transactionToDelete.type
              } transaction for $${parseFloat(
                transactionToDelete.amount
              ).toFixed(2)} has been deleted.`,
              type: "wallet", // Use 'wallet' type
              expiresAt: getFutureDate(7), // <--- Expiry: 7 days for success notifications
            });
            // Update the unread notification count in the global context
            const updatedUnreadCount = await countUnreadNotifications(user.$id);
            updateUnreadCount(updatedUnreadCount);
          } catch (notificationError) {
            console.warn(
              "Failed to create delete notification:",
              notificationError
            );
          }
        }

        await fetchWalletData();
      } catch (error) {
        console.error("handleDeleteConfirm: Deletion failed:", error);
        Alert.alert("Error", error.message || "Failed to delete transaction.");
        // Create notification for deletion failure
        try {
          await createNotification({
            user_id: user.$id,
            title: "Wallet Transaction Deletion Failed",
            message: `Failed to delete your wallet transaction: ${
              error.message || "Unknown error"
            }.`,
            type: "error", // Use 'error' type for failures
            expiresAt: getFutureDate(14), // <--- Expiry: 7 days for success notifications
          });
          // Update the unread notification count in the global context
          const updatedUnreadCount = await countUnreadNotifications(user.$id);
          updateUnreadCount(updatedUnreadCount);
        } catch (notificationError) {
          console.warn(
            "Failed to create deletion failure notification:",
            notificationError
          );
        }
      } finally {
        setIsProcessingTransaction(false);
        setIsConfirmDeleteModalVisible(false);
        setSelectedTransactionForEdit(null);
        console.log("handleDeleteConfirm: Finished processing.");
      }
    },
    // Ensure all dependencies are included
    [
      fetchWalletData,
      isProcessingTransaction,
      transactions,
      user?.$id,
      updateUnreadCount,
    ]
  );

  const getTransactionTypeDescription = () => {
    switch (transactionType) {
      case "deposit":
        return "Funds received into your wallet (e.g., salary, cash deposit).";
      case "withdrawal":
        return "Cash taken out of your wallet for general use, not a specific purchase (e.g., ATM withdrawal, moving cash).";
      case "manual_expense":
        return "An expense paid in cash or not recorded via receipt (e.g., small purchases, tips).";
      default:
        return "";
    }
  };

  if (isLoadingData || globalLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text
          className="text-white mt-4" // Removed font-pextralight from className
          style={{ fontFamily: getFontClassName("extralight") }} // Apply font directly
        >
          {t("wallet.loadingWallet")} {/* Translated */}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView
          className="w-full h-full p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="flex-row justify-between items-center mb-6 mt-4 mr-8">
            <Text
              className="text-lg text-black" // Removed font-pbold from className
              style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
            >
              {t("wallet.myWalletTitle")} {/* Translated */}
            </Text>
            <Image
              source={icons.wallet}
              className="w-6 h-6"
              tintColor="#9F54B6"
              resizeMode="contain"
            />
          </View>

          <Text
            className={`text-sm text-gray-700 mb-4 mt-1 mr-4 ${
              I18nManager.isRTL ? "text-right" : "text-left" // Align description
            }`} // Removed font-pregular from className
            style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
          >
            {t("wallet.walletDescription")} {/* Translated */}
          </Text>

          {/* Current Balance Card */}
          <View className="bg-transparent p-6 rounded-lg mb-2 border-t border-[#9F54B6]">
            <Text
              className="text-base text-gray-600 mb-2 text-center" // Removed font-pmedium
              style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
            >
              {t("wallet.currentBalance")} {/* Translated */}
            </Text>
            <Text
              className="text-3xl text-center text-black" // Removed font-pbold
              style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
            >
              {i18n.language.startsWith("ar")
                ? convertToArabicNumerals(walletBalance.toFixed(2))
                : walletBalance.toFixed(2)}{" "}
              {t("common.currency_symbol_short")}
            </Text>
          </View>

          {/* Monthly Cash Flow Summary */}
          <View className="bg-transparent p-4 rounded-lg mb-2 border-t border-[#9F54B6]">
            <Text
              className={`text-lg text-black mb-3 ${
                I18nManager.isRTL ? "text-right" : "text-left" // Align title
              }`} // Removed font-pbold
              style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
            >
              {t("wallet.monthlyCashFlow", {
                // Translated with variables for month/year
                month: format(new Date(), "MMM", {
                  locale: i18n.language.startsWith("ar") ? arLocale : undefined,
                }),
                year: format(new Date(), "yyyy", {
                  locale: i18n.language.startsWith("ar") ? arLocale : undefined,
                }),
              })}
            </Text>
            <View className="flex-row justify-around items-center">
              <View className="items-center">
                <Text
                  className="text-base text-gray-600" // Removed font-pmedium
                  style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                >
                  {t("wallet.deposits")} {/* Translated */}
                </Text>
                <Text
                  className="text-xl text-green-600" // Removed font-psemibold
                  style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
                >
                  +
                  {i18n.language.startsWith("ar")
                    ? convertToArabicNumerals(monthlyDeposits.toFixed(2))
                    : monthlyDeposits.toFixed(2)}{" "}
                  {t("common.currency_symbol_short")}
                </Text>
              </View>
              <View className="items-center">
                <Text
                  className="text-base text-gray-600" // Removed font-pmedium
                  style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                >
                  {t("wallet.expensesWithdrawals")} {/* Translated */}
                </Text>
                <Text
                  className="text-xl text-red-600" // Removed font-psemibold
                  style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
                >
                  -
                  {i18n.language.startsWith("ar")
                    ? convertToArabicNumerals(
                        monthlyExpensesWithdrawals.toFixed(2)
                      )
                    : monthlyExpensesWithdrawals.toFixed(2)}{" "}
                  {t("common.currency_symbol_short")}
                </Text>
              </View>
            </View>
            <Text
              className={`text-sm text-gray-700 text-center mt-3 ${
                I18nManager.isRTL ? "text-right" : "text-left" // Align net flow
              }`} // Removed font-pregular
              style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
            >
              {t("wallet.netFlow")}: {/* Translated */}
              {i18n.language.startsWith("ar")
                ? convertToArabicNumerals(
                    (monthlyDeposits - monthlyExpensesWithdrawals).toFixed(2)
                  )
                : (monthlyDeposits - monthlyExpensesWithdrawals).toFixed(
                    2
                  )}{" "}
              {t("common.currency_symbol_short")}
            </Text>
          </View>

          {/* Average Cash Expense Card */}
          <View className="bg-transparent p-4 rounded-lg mb-1 border-t border-[#9F54B6]">
            <Text
              className={`text-lg text-black mb-3 ${
                I18nManager.isRTL ? "text-right" : "text-left" // Align title
              }`} // Removed font-pbold
              style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
            >
              {t("wallet.averageCashExpenseTitle")} {/* Translated */}
            </Text>
            {averageCashExpense > 0 ? (
              <Text
                className="text-3xl text-center text-black" // Removed font-psemibold
                style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
              >
                {i18n.language.startsWith("ar")
                  ? convertToArabicNumerals(averageCashExpense.toFixed(2))
                  : averageCashExpense.toFixed(2)}{" "}
                {t("common.currency_symbol_short")}
              </Text>
            ) : (
              <Text
                className="text-gray-500 italic text-center" // Removed font-pregular
                style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
              >
                {t("wallet.noCashExpensesThisMonth")} {/* Translated */}
              </Text>
            )}
          </View>
          {/* Single "Record Transaction" Button */}
          <View className="bg-transparent p-4 rounded-lg mb-3 ">
            <TouchableOpacity
              onPress={() => openTransactionModal(null)}
              className="mb-2 w-full bg-[#D03957] rounded-md p-3 items-center justify-center "
            >
              <Text
                className="text-white text-lg" // Removed font-psemibold
                style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
              >
                {t("wallet.recordNewTransaction")} {/* Translated */}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Transactions List */}
          <View className="bg-transparent p-4 rounded-lg border-t border-[#9F54B6]">
            <Text
              className={`text-lg text-black mb-4 ${
                I18nManager.isRTL ? "text-right" : "text-left" // Align title
              }`} // Removed font-pbold
              style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
            >
              {t("wallet.recentTransactions")} {/* Translated */}
            </Text>
            {transactions.length === 0 ? (
              <View className="items-center py-8">
                <Text
                  className="text-gray-500 italic" // Removed font-pmedium
                  style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                >
                  {t("wallet.noTransactionsYet")} {/* Translated */}
                </Text>
              </View>
            ) : (
              transactions.map((tx) => (
                <View
                  key={tx.$id}
                  className={`flex-row justify-between items-center py-3 border-b border-gray-200 last:border-none ${
                    I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse transaction row for RTL
                  }`}
                >
                  <View className="flex-1">
                    <Text
                      className={`text-black text-base ${
                        I18nManager.isRTL ? "text-right" : "text-left" // Align text
                      }`} // Removed font-pmedium
                      style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                    >
                      {tx.type === "deposit"
                        ? t("wallet.transactionTypeDeposit")
                        : tx.type === "withdrawal"
                        ? t("wallet.transactionTypeWithdrawal")
                        : t("wallet.transactionTypeManualExpense")}{" "}
                      {/* Translated transaction type */}
                    </Text>
                    {tx.description ? (
                      <Text
                        className={`text-[#264653] text-sm ${
                          I18nManager.isRTL ? "text-right" : "text-left" // Align description
                        }`}
                        style={{ fontFamily: getFontClassName("regular") }} // Apply font
                      >
                        {tx.description}
                      </Text>
                    ) : null}
                    <Text
                      className={`text-[#4E17B3] text-xs mt-1 ${
                        I18nManager.isRTL ? "text-right" : "text-left" // Align date
                      }`}
                      style={{ fontFamily: getFontClassName("semibold") }} // Apply font
                    >
                      {format(new Date(tx.datetime), "MMM dd,yyyy HH:mm", {
                        locale: i18n.language.startsWith("ar")
                          ? arLocale
                          : undefined, // Localize date format
                      })}
                    </Text>
                  </View>
                  <View
                    className={`flex-row items-center ${
                      I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse amount and dots icon for RTL
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        tx.type === "deposit"
                          ? "text-green-600"
                          : "text-red-600"
                      } ${I18nManager.isRTL ? "ml-2" : "mr-2"}`} // Adjust margin for RTL
                      style={{ fontFamily: getFontClassName("semibold") }} // Apply font
                    >
                      {tx.type === "deposit" ? "+" : "-"}{" "}
                      {i18n.language.startsWith("ar")
                        ? convertToArabicNumerals(
                            parseFloat(tx.amount).toFixed(2)
                          )
                        : parseFloat(tx.amount).toFixed(2)}{" "}
                      {t("common.currency_symbol_short")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedTransactionForEdit(tx)}
                      className="p-1 rounded-full"
                    >
                      <Image
                        source={icons.dots}
                        className="w-5 h-5"
                        tintColor="#9F54B6"
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.centeredView}>
                <View
                  style={styles.modalView}
                  onStartShouldSetResponder={() => true} // Keep to prevent closing on tap inside
                >
                  <Text
                    className={`text-xl text-black mb-6 text-center ${
                      I18nManager.isRTL ? "text-right" : "text-left" // Align title
                    }`} // Removed font-pbold
                    style={{ fontFamily: getFontClassName("bold") }} // Apply font
                  >
                    {selectedTransactionForEdit
                      ? t("wallet.editTransactionTitle")
                      : t("wallet.recordNewTransactionTitle")}{" "}
                    {/* Translated */}
                  </Text>

                  {/* Transaction Type Selector */}
                  <View
                    className={`flex-row justify-between w-full mb-2 bg-gray-100 rounded-lg p-1 ${
                      I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse buttons for RTL
                    }`}
                  >
                    <TouchableOpacity
                      onPress={() => setTransactionType("deposit")}
                      className={`flex-1 p-2 rounded-md items-center ${
                        I18nManager.isRTL ? "ml-1" : "mr-1" // Adjust margin
                      } ${transactionType === "deposit" ? "bg-green-500" : ""}`}
                    >
                      <Text
                        className={`text-base ${
                          transactionType === "deposit"
                            ? "text-white"
                            : "text-gray-700"
                        }`} // Removed font-psemibold
                        style={{ fontFamily: getFontClassName("semibold") }} // Apply font
                      >
                        {t("wallet.transactionTypeDeposit")} {/* Translated */}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTransactionType("withdrawal")}
                      className={`flex-1 p-2 rounded-md items-center mx-1 ${
                        transactionType === "withdrawal" ? "bg-red-500" : ""
                      }`}
                    >
                      <Text
                        className={`text-base ${
                          transactionType === "withdrawal"
                            ? "text-white"
                            : "text-gray-700"
                        }`} // Removed font-psemibold
                        style={{ fontFamily: getFontClassName("semibold") }} // Apply font
                      >
                        {t("wallet.transactionTypeWithdrawal")}{" "}
                        {/* Translated */}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTransactionType("manual_expense")}
                      className={`flex-1 p-2 rounded-md items-center ${
                        I18nManager.isRTL ? "mr-1" : "ml-1" // Adjust margin
                      } ${
                        transactionType === "manual_expense"
                          ? "bg-blue-500"
                          : ""
                      }`}
                    >
                      <Text
                        className={`text-base ${
                          transactionType === "manual_expense"
                            ? "text-white"
                            : "text-gray-700"
                        }`} // Removed font-psemibold
                        style={{ fontFamily: getFontClassName("semibold") }} // Apply font
                      >
                        {t("wallet.transactionTypeManualExpense")}{" "}
                        {/* Translated */}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Transaction Type Description */}
                  {transactionType && (
                    <Text
                      className={`text-xs text-gray-500 text-center mb-4 ${
                        I18nManager.isRTL ? "text-right" : "text-left" // Align description
                      }`}
                      style={{ fontFamily: getFontClassName("regular") }} // Apply font
                    >
                      {/* Use a switch or object for localized descriptions */}
                      {(() => {
                        switch (transactionType) {
                          case "deposit":
                            return t("wallet.depositDescription");
                          case "withdrawal":
                            return t("wallet.withdrawalDescription");
                          case "manual_expense":
                            return t("wallet.manualExpenseDescription");
                          default:
                            return "";
                        }
                      })()}
                    </Text>
                  )}

                  <TextInput
                    className={`w-full p-3 bg-gray-100 rounded-md border border-gray-300 mb-4 text-black text-base ${
                      I18nManager.isRTL ? "text-right" : "text-left" // Align text input
                    }`} // Removed font-pregular
                    style={{ fontFamily: getFontClassName("regular") }} // Apply font
                    placeholder={t("wallet.amountPlaceholder", {
                      currencySymbol: t("common.currency_symbol_short"),
                    })} // Translated placeholder with currency
                    keyboardType="numeric"
                    value={transactionAmount}
                    onChangeText={setTransactionAmount}
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    className={`w-full p-3 bg-gray-100 rounded-md border border-gray-300 mb-6 text-black text-base ${
                      I18nManager.isRTL ? "text-right" : "text-left" // Align text input
                    }`} // Removed font-pregular
                    style={{ fontFamily: getFontClassName("regular") }} // Apply font
                    placeholder={t("wallet.descriptionPlaceholder")} // Translated placeholder
                    value={transactionDescription}
                    onChangeText={setTransactionDescription}
                    placeholderTextColor="#999"
                    maxLength={100}
                  />

                  <TouchableOpacity
                    onPress={handleSaveTransaction}
                    className={`p-4 rounded-lg w-full items-center mb-3 ${
                      isProcessingTransaction ? "bg-gray-400" : "bg-blue-500"
                    }`}
                    disabled={isProcessingTransaction}
                  >
                    {isProcessingTransaction ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text
                        className="text-white text-lg" // Removed font-pbold
                        style={{ fontFamily: getFontClassName("bold") }} // Apply font
                      >
                        {selectedTransactionForEdit
                          ? t("wallet.updateTransaction")
                          : t("wallet.recordTransaction")}{" "}
                        {/* Translated */}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={closeModal}
                    className="p-3 rounded-lg w-full items-center bg-gray-300"
                  >
                    <Text
                      className="text-gray-800 text-lg" // Removed font-psemibold
                      style={{ fontFamily: getFontClassName("semibold") }} // Apply font
                    >
                      {t("wallet.cancel")} {/* Translated */}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>

        {/* Transaction Action Sheet Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={
            !!selectedTransactionForEdit &&
            !isModalVisible &&
            !isConfirmDeleteModalVisible
          }
          onRequestClose={() => setSelectedTransactionForEdit(null)}
        >
          <Pressable
            style={styles.centeredView}
            onPress={() => setSelectedTransactionForEdit(null)}
          >
            <View
              style={styles.actionSheetView}
              onStartShouldSetResponder={() => true} // Keep to prevent closing on tap inside
            >
              <Text
                className={`text-lg text-black mb-4 text-center ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align title
                }`} // Removed font-pbold
                style={{ fontFamily: getFontClassName("bold") }} // Apply font
              >
                {t("wallet.transactionOptions")} {/* Translated */}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  openTransactionModal(selectedTransactionForEdit);
                }}
                className="p-4 rounded-lg w-full items-center bg-blue-500 mb-2"
              >
                <Text
                  className="text-white text-lg" // Removed font-pbold
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font
                >
                  {t("wallet.editTransactionButton")} {/* Translated */}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsConfirmDeleteModalVisible(true);
                }}
                className="p-4 rounded-lg w-full items-center bg-red-500 mb-4"
              >
                <Text
                  className="text-white text-lg" // Removed font-pbold
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font
                >
                  {t("wallet.deleteTransactionButton")} {/* Translated */}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedTransactionForEdit(null)}
                className="p-3 rounded-lg w-full items-center bg-gray-300"
              >
                <Text
                  className="text-gray-800 text-lg" // Removed font-psemibold
                  style={{ fontFamily: getFontClassName("semibold") }} // Apply font
                >
                  {t("wallet.cancel")} {/* Translated */}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Confirm Delete Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isConfirmDeleteModalVisible}
          onRequestClose={() => setIsConfirmDeleteModalVisible(false)}
        >
          <Pressable
            style={styles.centeredView}
            onPress={() => setIsConfirmDeleteModalVisible(false)}
          >
            <View
              style={styles.modalView}
              onStartShouldSetResponder={() => true} // Keep to prevent closing on tap inside
            >
              <Text
                className={`text-xl text-black mb-4 text-center ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align title
                }`} // Removed font-pbold
                style={{ fontFamily: getFontClassName("bold") }} // Apply font
              >
                {t("wallet.confirmDeletionTitle")} {/* Translated */}
              </Text>
              <Text
                className={`text-base text-gray-700 text-center mb-6 ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align message
                }`}
                style={{ fontFamily: getFontClassName("regular") }} // Apply font
              >
                {t("wallet.confirmDeletionMessage")} {/* Translated */}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  handleDeleteConfirm(selectedTransactionForEdit?.$id)
                }
                className={`p-4 rounded-lg w-full items-center mb-3 ${
                  isProcessingTransaction ? "bg-gray-400" : "bg-red-500"
                }`}
                disabled={isProcessingTransaction}
              >
                {isProcessingTransaction ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    className="text-white text-lg" // Removed font-pbold
                    style={{ fontFamily: getFontClassName("bold") }} // Apply font
                  >
                    {t("wallet.delete")} {/* Translated */}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsConfirmDeleteModalVisible(false)}
                className="p-3 rounded-lg w-full items-center bg-gray-300"
              >
                <Text
                  className="text-gray-800 text-lg" // Removed font-psemibold
                  style={{ fontFamily: getFontClassName("semibold") }} // Apply font
                >
                  {t("wallet.cancel")} {/* Translated */}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: screenWidth * 0.85,
    maxHeight: screenWidth * 1.2,
  },
  actionSheetView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: screenWidth * 0.75,
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default Wallet;
