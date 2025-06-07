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
} from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  addWalletTransaction,
  getWalletTransactions,
  updateWalletTransaction,
  deleteWalletTransaction,
} from "../../lib/appwrite";
import { format, isSameMonth, isSameYear } from "date-fns";
import icons from "../../constants/icons";
import GradientBackground from "../../components/GradientBackground";
import { useFocusEffect } from "@react-navigation/native";
// Removed: import { getCurrencySymbol } from "../../constants/currencies"; // This import is no longer needed

const screenWidth = Dimensions.get("window").width;

const Wallet = () => {
  const { user, isLoading: globalLoading } = useGlobalContext();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState("deposit");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // States for editing/deleting
  const [selectedTransactionForEdit, setSelectedTransactionForEdit] =
    useState(null);
  const [isConfirmDeleteModalVisible, setIsConfirmDeleteModalVisible] =
    useState(false);

  // States for Wallet Insights
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

      // Calculate monthly insights
      let currentMonthDeposits = 0;
      let currentMonthExpensesWithdrawals = 0;
      let totalCashExpensesAmount = 0;
      let cashExpenseCount = 0;
      const today = new Date();

      sortedTransactions.forEach((tx) => {
        const amount = parseFloat(tx.amount || 0);
        const txDate = new Date(tx.datetime);

        // Update overall balance
        if (tx.type === "deposit") {
          balance += amount;
        } else if (tx.type === "withdrawal" || tx.type === "manual_expense") {
          balance -= amount;
        }

        // Calculate monthly deposits/expenses for current month
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

      // Set states for insights
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
        console.log("handleSaveTransaction: New transaction ADD successful.");
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
        await deleteWalletTransaction(transactionId);
        Alert.alert("Success", "Transaction deleted successfully!");
        console.log("handleDeleteConfirm: Transaction DELETE successful.");
        await fetchWalletData();
      } catch (error) {
        console.error("handleDeleteConfirm: Deletion failed:", error);
        Alert.alert("Error", error.message || "Failed to delete transaction.");
      } finally {
        setIsProcessingTransaction(false);
        setIsConfirmDeleteModalVisible(false);
        setSelectedTransactionForEdit(null);
        console.log("handleDeleteConfirm: Finished processing.");
      }
    },
    [fetchWalletData, isProcessingTransaction]
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
        <Text className="text-white mt-4 font-pextralight text-lg">
          Loading your wallet...
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
          <View className="flex-row justify-between items-center mb-6 mt-4">
            <Text className="text-lg font-pbold text-black">My Wallet</Text>
            <Image
              source={icons.wallet}
              className="w-6 h-6"
              tintColor="#9F54B6"
              resizeMode="contain"
            />
          </View>

          <Text className="text-sm font-pregular text-gray-700 text-left mb-4 mt-2">
            Manage your cash balance here. You can add or withdraw funds, and
            see a history of all your wallet transactions.
          </Text>

          {/* Current Balance Card */}
          <View className="bg-transparent p-6 rounded-lg mb-2 border-t border-[#9F54B6]">
            <Text className="text-base font-pmedium text-gray-600 mb-2 text-center">
              Current Balance
            </Text>
            <Text className="text-4xl font-pbold text-center text-black">
              ${walletBalance.toFixed(2)} {/* Reverted to $ */}
            </Text>
          </View>

          {/* Monthly Cash Flow Summary */}
          <View className="bg-transparent p-4 rounded-lg mb-2 border-t border-[#9F54B6]">
            <Text className="text-lg font-pbold text-black mb-3">
              Monthly Cash Flow ({format(new Date(), "MMM, yyyy")}){" "}
              {/* Fixed format string */}
            </Text>
            <View className="flex-row justify-around items-center">
              <View className="items-center">
                <Text className="text-base font-pmedium text-gray-600">
                  Deposits
                </Text>
                <Text className="text-xl font-psemibold text-green-600">
                  +${monthlyDeposits.toFixed(2)} {/* Reverted to $ */}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-base font-pmedium text-gray-600">
                  Expenses/Withdrawals
                </Text>
                <Text className="text-xl font-psemibold text-red-600">
                  -${monthlyExpensesWithdrawals.toFixed(2)}{" "}
                  {/* Reverted to $ */}
                </Text>
              </View>
            </View>
            <Text className="text-sm font-pregular text-gray-700 text-center mt-3">
              Net Flow: $
              {(monthlyDeposits - monthlyExpensesWithdrawals).toFixed(2)}{" "}
              {/* Reverted to $ */}
            </Text>
          </View>

          {/* Average Cash Expense Card */}
          <View className="bg-transparent p-4 rounded-lg mb-6 border-t border-[#9F54B6]">
            <Text className="text-lg font-pbold text-black mb-3">
              Average Cash Expense (This Month)
            </Text>
            {averageCashExpense > 0 ? (
              <Text className="text-3xl font-psemibold text-center text-black">
                ${averageCashExpense.toFixed(2)} {/* Reverted to $ */}
              </Text>
            ) : (
              <Text className="text-gray-500 italic text-center">
                No cash expenses this month to calculate average.
              </Text>
            )}
          </View>

          {/* Single "Record Transaction" Button */}
          <TouchableOpacity
            onPress={() => openTransactionModal(null)}
            className="mb-2 w-full bg-[#D03957] rounded-md p-3 items-center justify-center"
          >
            <Text className="text-white font-psemibold text-lg">
              Record New Transaction
            </Text>
          </TouchableOpacity>

          {/* Recent Transactions List */}
          <View className="bg-transparent p-4 rounded-lg border-t border-[#9F54B6]">
            <Text className="text-lg font-pbold text-black mb-4">
              Recent Transactions
            </Text>
            {transactions.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-gray-500 italic">
                  No transactions yet.
                </Text>
              </View>
            ) : (
              transactions.map((tx) => (
                <View
                  key={tx.$id}
                  className="flex-row justify-between items-center py-3 border-b border-gray-200 last:border-none"
                >
                  <View className="flex-1">
                    <Text className="font-pmedium text-black text-base">
                      {tx.type === "deposit"
                        ? "Deposit"
                        : tx.type === "withdrawal"
                        ? "Withdrawal"
                        : "Manual Expense"}
                    </Text>
                    {tx.description ? (
                      <Text className="text-gray-600 text-sm">
                        {tx.description}
                      </Text>
                    ) : null}
                    <Text className="text-gray-400 text-xs mt-1">
                      {format(new Date(tx.datetime), "MMM dd,PPPP HH:mm")}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text
                      className={`font-psemibold text-base mr-2 ${
                        tx.type === "deposit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.type === "deposit" ? "+" : "-"} ${" "}
                      {/* Reverted to $ */}
                      {parseFloat(tx.amount).toFixed(2)}
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

        {/* Transaction Modal (Add/Edit) */}
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
                <View style={styles.modalView}>
                  <Text className="text-xl font-pbold text-black mb-6 text-center">
                    {selectedTransactionForEdit
                      ? "Edit Transaction"
                      : "Record New Transaction"}
                  </Text>

                  {/* Transaction Type Selector */}
                  <View className="flex-row justify-between w-full mb-2 bg-gray-100 rounded-lg p-1">
                    <TouchableOpacity
                      onPress={() => setTransactionType("deposit")}
                      className={`flex-1 p-2 rounded-md items-center ${
                        transactionType === "deposit" ? "bg-green-500" : ""
                      }`}
                    >
                      <Text
                        className={`font-psemibold text-base ${
                          transactionType === "deposit"
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        Deposit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTransactionType("withdrawal")}
                      className={`flex-1 p-2 rounded-md items-center mx-1 ${
                        transactionType === "withdrawal" ? "bg-red-500" : ""
                      }`}
                    >
                      <Text
                        className={`font-psemibold text-base ${
                          transactionType === "withdrawal"
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        Withdrawal
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTransactionType("manual_expense")}
                      className={`flex-1 p-2 rounded-md items-center ${
                        transactionType === "manual_expense"
                          ? "bg-blue-500"
                          : ""
                      }`}
                    >
                      <Text
                        className={`font-psemibold text-base ${
                          transactionType === "manual_expense"
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        Manual Expense
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Transaction Type Description */}
                  {transactionType && (
                    <Text className="text-xs text-gray-500 text-center mb-4">
                      {getTransactionTypeDescription()}
                    </Text>
                  )}

                  <TextInput
                    className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 mb-4 text-black text-base font-pregular"
                    placeholder={`Amount ($)`}
                    keyboardType="numeric"
                    value={transactionAmount}
                    onChangeText={setTransactionAmount}
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    className="w-full p-3 bg-gray-100 rounded-md border border-gray-300 mb-6 text-black text-base font-pregular"
                    placeholder="Description (Optional)"
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
                      <Text className="text-white font-pbold text-lg">
                        {selectedTransactionForEdit
                          ? "Update Transaction"
                          : "Record Transaction"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={closeModal}
                    className="p-3 rounded-lg w-full items-center bg-gray-300"
                  >
                    <Text className="text-gray-800 font-psemibold text-lg">
                      Cancel
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
            <View style={styles.actionSheetView}>
              <Text className="text-lg font-pbold text-black mb-4 text-center">
                Transaction Options
              </Text>

              <TouchableOpacity
                onPress={() => {
                  openTransactionModal(selectedTransactionForEdit);
                }}
                className="p-4 rounded-lg w-full items-center bg-blue-500 mb-2"
              >
                <Text className="text-white font-pbold text-lg">
                  Edit Transaction
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsConfirmDeleteModalVisible(true);
                }}
                className="p-4 rounded-lg w-full items-center bg-red-500 mb-4"
              >
                <Text className="text-white font-pbold text-lg">
                  Delete Transaction
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedTransactionForEdit(null)}
                className="p-3 rounded-lg w-full items-center bg-gray-300"
              >
                <Text className="text-gray-800 font-psemibold text-lg">
                  Cancel
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
            <View style={styles.modalView}>
              <Text className="text-xl font-pbold text-black mb-4 text-center">
                Confirm Deletion
              </Text>
              <Text className="text-base text-gray-700 text-center mb-6">
                Are you sure you want to delete this transaction? This action
                cannot be undone.
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
                  <Text className="text-white font-pbold text-lg">Delete</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsConfirmDeleteModalVisible(false)}
                className="p-3 rounded-lg w-full items-center bg-gray-300"
              >
                <Text className="text-gray-800 font-psemibold text-lg">
                  Cancel
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
