import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider"; // Import useGlobalContext
import GradientBackground from "../../components/GradientBackground";
import { useNavigation, useFocusEffect } from "expo-router";
import Collapsible from "react-native-collapsible";
import icons from "../../constants/icons";

import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

import {
  getUserBudgets,
  chkBudgetInitialization,
  getCategories2Bud, // This is the function for global categories
  getUserPoints,
  getUserEarnedBadges,
  getReceiptsForPeriod,
} from "../../lib/appwrite";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutLayoutAnimationEnabledExperimental(true);
}

const Budget = () => {
  // Destructure hasBudget and checkBudgetInitialization from global context
  const {
    user,
    isLoading: globalLoading,
    hasBudget,
    checkBudgetInitialization,
  } = useGlobalContext();
  const navigation = useNavigation();

  const [userBudgets, setUserBudgets] = useState([]);
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true); // Manages component's local data fetching state
  const [refreshing, setRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState({}); // State for the categories map
  const [monthlySpendingSummary, setMonthlySpendingSummary] = useState([]);

  const [showPointsBadgeModal, setShowPointsBadgeModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  console.log(
    "Budget Component Rendered. isLoadingData:",
    isLoadingData,
    "refreshing:",
    refreshing
  );

  const showCustomModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowPointsBadgeModal(true);
  };

  const closeCustomModal = () => {
    setShowPointsBadgeModal(false);
    setModalTitle("");
    setModalMessage("");
  };

  // Modified fetchAllCategories to return the map directly
  const fetchAllCategories = useCallback(async () => {
    if (!user?.$id) {
      console.log("fetchAllCategories: User ID not available.");
      return {}; // Return empty map if user not available
    }
    console.log("fetchAllCategories: Attempting to fetch categories...");
    try {
      const categories = await getCategories2Bud();
      const map = {};
      categories.forEach((cat) => {
        map[cat.$id] = cat.name;
      });
      setCategoriesMap(map); // Still update state for other uses/re-renders
      console.log(
        "fetchAllCategories: Fetched categories successfully. Map size:",
        Object.keys(map).length
      );
      console.log("Categories Map contents:", map);
      return map; // Return the map immediately
    } catch (error) {
      console.error(
        "fetchAllCategories: Error fetching all categories:",
        error
      );
      Alert.alert("Error", "Failed to load categories.");
      return {}; // Return empty map on error
    }
  }, [user?.$id]);

  // getCategoryName now accepts an optional map argument
  const getCategoryName = (categoryId, providedCategoriesMap) => {
    const mapToUse = providedCategoriesMap || categoriesMap; // Use provided map first, fallback to state map
    const name = mapToUse[categoryId];
    console.log(
      "getCategoryName: Looking for categoryId:",
      categoryId,
      "in map. Found:",
      name || "N/A"
    );
    if (!name) {
      console.warn(
        `getCategoryName: Category ID '${categoryId}' not found in map. Displaying "Unknown Category".`
      );
    }
    return name || "Unknown Category";
  };

  const fetchBudgetData = useCallback(async () => {
    console.log("fetchBudgetData: Function started.");
    if (!user?.$id) {
      console.log(
        "fetchBudgetData: User ID not available, stopping data fetch."
      );
      setIsLoadingData(false);
      return;
    }

    // Only set to true if not already refreshing (from pull-to-refresh)
    // This prevents the spinner from flickering if multiple things trigger fetchBudgetData quickly
    if (!refreshing) {
      console.log("fetchBudgetData: Setting isLoadingData to TRUE.");
      setIsLoadingData(true);
    }

    try {
      // Get the categories map directly from the function's return value for immediate use
      console.log(
        "fetchBudgetData: Calling fetchAllCategories and getting returned map for immediate use..."
      );
      const latestCategoriesMap = await fetchAllCategories(); // This updates state AND returns the map

      console.log(
        "fetchBudgetData: Checking budget initialization globally..."
      );
      // Call the global function to update the hasBudget state in GlobalProvider
      const initialized = await checkBudgetInitialization(user.$id);
      console.log(
        "fetchBudgetData: Budget initialized status (global):",
        initialized
      );

      // Fetch budgets
      const budgets = initialized ? await getUserBudgets(user.$id) : [];
      setUserBudgets(budgets);
      console.log(
        "fetchBudgetData: Fetched user budgets, count:",
        budgets.length
      );

      console.log("fetchBudgetData: Fetching user points...");
      const userPointsDocs = await getUserPoints(user.$id);
      if (userPointsDocs && userPointsDocs.length > 0) {
        setUserTotalPoints(userPointsDocs[0].points || 0);
      } else {
        setUserTotalPoints(0);
      }
      console.log(
        "fetchBudgetData: User Total Points fetched:",
        userTotalPoints
      );

      console.log("fetchBudgetData: Fetching earned badges...");
      const earnedBadges = await getUserEarnedBadges(user.$id);
      setUserBadges(earnedBadges);
      console.log(
        "fetchBudgetData: User Badges fetched, count:",
        earnedBadges.length
      );

      console.log("fetchBudgetData: Fetching receipts for current month...");
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);

      const receipts = await getReceiptsForPeriod(
        user.$id,
        currentMonthStart.toISOString(),
        currentMonthEnd.toISOString()
      );
      console.log(
        "fetchBudgetData: Fetched receipts for period, count:",
        receipts.length
      );

      const spendingByCat = {};
      receipts.forEach((receipt) => {
        let items = receipt.items;
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch (e) {
            console.error(
              "Error parsing receipt items JSON:",
              e,
              receipt.items
            );
            items = [];
          }
        }

        if (Array.isArray(items)) {
          items.forEach((item) => {
            const categoryId = item.category_id;
            const amount = parseFloat(item.price);
            if (categoryId && !isNaN(amount)) {
              spendingByCat[categoryId] =
                (spendingByCat[categoryId] || 0) + amount;
              console.log(
                `Processing receipt item: categoryId=${categoryId}, amount=${amount}`
              );
            }
          });
        } else {
          console.warn(
            "Receipt items are not an array or valid JSON:",
            receipt.items
          );
        }
      });
      console.log(
        "fetchBudgetData: Raw spendingByCat aggregation:",
        spendingByCat
      );

      // Collect all unique category IDs from both spending and budgets
      const allCategoryIds = new Set([
        ...Object.keys(spendingByCat),
        ...budgets.map((b) => b.categoryId),
      ]);
      console.log(
        "fetchBudgetData: All unique category IDs to summarize:",
        Array.from(allCategoryIds)
      );

      console.log(
        "fetchBudgetData: Processing spending summary using latestCategoriesMap..."
      );
      const summary = Array.from(allCategoryIds)
        .map((categoryId) => {
          const categoryName = getCategoryName(categoryId, latestCategoriesMap);
          const spent = spendingByCat[categoryId] || 0;
          const budgetForCategory = budgets.find(
            (b) => b.categoryId === categoryId
          );
          const budgetedAmount = budgetForCategory
            ? parseFloat(budgetForCategory.budgetAmount)
            : 0;
          const percentageOfBudget =
            budgetedAmount > 0 ? (spent / budgetedAmount) * 100 : 0;
          const remaining = budgetedAmount - spent;

          return {
            categoryId,
            categoryName,
            spent,
            budgetedAmount,
            percentageOfBudget: Math.min(100, percentageOfBudget),
            isOverBudget: budgetedAmount > 0 && spent > budgetedAmount,
            remaining: remaining,
          };
        })
        .sort((a, b) => b.spent - a.spent);

      setMonthlySpendingSummary(summary);
      console.log("fetchBudgetData: Monthly spending summary updated.");
    } catch (error) {
      console.error("fetchBudgetData: !!! ERROR during data fetch !!!", error);
      Alert.alert("Error", "Failed to load budget data.");
    } finally {
      console.log(
        "fetchBudgetData: Setting isLoadingData to FALSE in finally block."
      );
      setIsLoadingData(false); // Crucially set to false here
      setRefreshing(false);
      console.log("fetchBudgetData: Function finished.");
    }
  }, [user?.$id, refreshing, fetchAllCategories]); // Dependency array

  useFocusEffect(
    useCallback(() => {
      console.log(
        "useFocusEffect: Budget screen focused, triggering data fetch..."
      );
      fetchBudgetData();
      return () => {
        console.log("useFocusEffect: Budget screen unfocused.");
        setIsExpanded(false);
        closeCustomModal();
      };
    }, [fetchBudgetData]) // fetchBudgetData is already a useCallback, so this is stable
  );

  const onRefresh = useCallback(async () => {
    console.log("onRefresh: Triggered.");
    setRefreshing(true);
    await fetchBudgetData();
  }, [fetchBudgetData]);

  const SetupBudget = () => {
    navigation.navigate("budget-set");
  };

  const ViewBudget = (budgetId) => {
    navigation.navigate("budget-dtl", { budgetId: budgetId });
  };

  const toggleExpanded = () => {
    LayoutAnimation.easeInEaseOut();
    setIsExpanded(!isExpanded);
  };

  // Use global hasBudget directly for conditional rendering
  const showBudgetPrompt = !hasBudget;

  // Simplified loading condition: only show loading when data is actively being fetched.
  // The presence or absence of budgets/data will be handled by rendering logic below.
  if (isLoadingData || globalLoading) {
    return (
      <GradientBackground>
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="text-white mt-4 font-pextralight text-lg">
            Loading your budgets...
          </Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, width: "100%", padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header with "My Budgets" and "Add New Budget" button */}
          <View className="flex-row justify-between items-center mb-2 mt-4">
            <Text className="text-lg font-pbold text-black">My Budgets</Text>
            {/* The "Add New Budget" button moved here */}
            <TouchableOpacity
              onPress={SetupBudget}
              className="bg-[#D03957] rounded-md p-3 items-center justify-center mt-3"
            >
              <Text className="text-white font-psemibold text-base">
                Add New Budget
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-pregular text-gray-600 text-left mb-4 mt-2">
            Set up and manage your budgets to keep track of your spending habits
            and financial goals.
          </Text>

          {(userTotalPoints > 0 ||
            userBadges.length > 0 ||
            showBudgetPrompt) && (
            <View className="mb-5">
              {(userTotalPoints > 0 || userBadges.length > 0) && (
                <View className="flex-row justify-around items-center bg-blue-50 rounded-xl py-4 px-2.5 mb-2 border border-blue-200 shadow-sm">
                  <View className="flex-row items-center">
                    <Image
                      source={icons.star}
                      className="w-6 h-6 mr-2 text-blue-700"
                    />
                    <Text className="text-base font-pmedium text-blue-800">
                      Points:{" "}
                      <Text className="font-pbold text-lg text-blue-900">
                        {userTotalPoints}
                      </Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      showCustomModal(
                        "Your Badges",
                        "View your earned achievements!"
                      )
                    }
                    className="flex-row items-center bg-blue-100 rounded-lg py-2 px-3 ml-2"
                  >
                    <Image
                      source={icons.medal}
                      className="w-6 h-6 mr-2 text-blue-700"
                    />
                    <Text className="text-base font-pmedium text-blue-800">
                      Badges:{" "}
                      <Text className="font-pbold text-lg text-blue-900">
                        {userBadges.length}
                      </Text>
                    </Text>
                    <Image
                      source={icons.arrowRight}
                      className="w-4 h-4 ml-2 text-blue-700"
                    />
                  </TouchableOpacity>
                </View>
              )}

              {showBudgetPrompt && (
                <View className="px-0">
                  <TouchableOpacity
                    onPress={SetupBudget}
                    className="mb-2 w-full bg-red-600 rounded-md py-3 items-center justify-center"
                  >
                    <Text className="text-white font-pmedium text-base">
                      Setup Budget
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {monthlySpendingSummary.length > 0 && (
            <View className="bg-transparent p-4 mb-5 border-t border-[#9F54B6]">
              <Text className="text-lg font-psemibold text-black mb-2 text-center">
                Monthly Spending Overview
              </Text>
              {/* New explanatory text for Monthly Spending Overview */}
              <Text className="text-sm font-pregular text-gray-600 text-center mb-4">
                Track your current month's spending across categories, comparing
                it to your set budgets. Stay on top of your financial goals!
              </Text>
              {monthlySpendingSummary.map((item, index) => (
                <View
                  key={item.categoryId || index}
                  className="mb-2 items-start"
                >
                  <Text className="text-base font-pbold text-gray-800 mb-1">
                    {item.categoryName}
                  </Text>
                  <Text className="text-sm font-pbold text-gray-700 mb-1">
                    ${item.spent.toFixed(2)}
                    {item.budgetedAmount > 0 && (
                      <Text
                        className={
                          item.isOverBudget ? "text-red-500" : "text-gray-600"
                        }
                      >
                        {" "}
                        / ${item.budgetedAmount.toFixed(2)}
                      </Text>
                    )}
                  </Text>
                  {item.budgetedAmount > 0 && (
                    <View className="h-3.5 bg-white rounded-md w-full overflow-hidden">
                      <View
                        className={`h-full ${
                          item.isOverBudget ? "bg-red-500" : "bg-green-500"
                        } rounded-md`}
                        style={{ width: `${item.percentageOfBudget}%` }}
                      />
                    </View>
                  )}
                  {item.budgetedAmount > 0 && (
                    <Text
                      className={`text-sm font-pregular mt-1 ${
                        item.isOverBudget ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {item.isOverBudget
                        ? `Over by $${Math.abs(item.remaining).toFixed(2)}`
                        : `Remaining: $${item.remaining.toFixed(2)}`}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {userBudgets.length > 0 && (
            <View className="p-4 mb-4 rounded-xl border-t border-purple-400">
              <Text className="text-lg font-psemibold text-black mb-4 text-center">
                Your Current Budgets
              </Text>

              <TouchableOpacity
                onPress={toggleExpanded}
                className="w-full flex-row items-center justify-center p-2 mb-4 bg-gray-100 rounded-lg"
              >
                <Text className="text-base font-pregular text-blue-700 text-center">
                  {isExpanded ? "Hide Budgets" : "Show My Budgets"}
                </Text>
                <Image
                  source={isExpanded ? icons.up : icons.down}
                  className="w-5 h-5 ml-2"
                  tintColor="#333"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <Collapsible collapsed={!isExpanded}>
                {isExpanded && (
                  <View className="mt-2">
                    {userBudgets.map((budget) => (
                      <TouchableOpacity
                        key={budget.$id}
                        onPress={() => ViewBudget(budget.$id)}
                        className="p-4 mb-3 border border-gray-200 rounded-lg bg-white shadow-xs"
                      >
                        <Text className="text-base font-psemibold text-black mb-1">
                          📊 Budget for {getCategoryName(budget.categoryId)}
                        </Text>
                        <Text className="text-sm text-gray-700">
                          ${parseFloat(budget.budgetAmount).toFixed(2)}
                        </Text>
                        <Text className="text-xs text-gray-600">
                          {format(new Date(budget.startDate), "MMM dd,yyyy")} -{" "}
                          {format(new Date(budget.endDate), "MMM dd,yyyy")}
                        </Text>
                        <Text className="text-sm text-blue-700 mt-2 text-right font-pmedium">
                          View Details
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Collapsible>
            </View>
          )}

          {!(userTotalPoints > 0 || userBadges.length > 0) &&
            userBudgets.length === 0 &&
            monthlySpendingSummary.length === 0 &&
            !hasBudget && ( // Use hasBudget here too
              <View className="bg-gray-100 p-6 rounded-lg mb-6 border border-gray-200 items-center">
                <Text className="text-base font-pmedium text-gray-600 text-center mb-3">
                  No budgets or spending data yet.
                </Text>
                <TouchableOpacity
                  onPress={SetupBudget}
                  className="bg-green-500 rounded-md py-3 px-4 items-center justify-center"
                >
                  <Text className="text-white font-psemibold text-lg">
                    Start Your First Budget
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showPointsBadgeModal}
        onRequestClose={closeCustomModal}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={closeCustomModal}
        >
          <View
            className="m-5 bg-white rounded-2xl p-9 items-center shadow-lg w-4/5 max-h-[70%]"
            onStartShouldSetResponder={() => true}
          >
            <Text className="mb-4 text-center text-2xl font-pbold text-gray-800">
              {modalTitle}
            </Text>
            <Text className="mb-4 text-center text-base font-pregular text-gray-700">
              {modalMessage}
            </Text>
            {modalTitle === "Your Badges" && (
              <ScrollView className="w-full max-h-[200px] mb-4">
                {userBadges.length > 0 ? (
                  userBadges.map((badge, index) => (
                    <View
                      key={index}
                      className="py-2 border-b border-gray-200 w-full"
                    >
                      <Text className="text-base font-pmedium text-gray-800">
                        • {badge.name || "Unnamed Badge"}
                        {badge.points ? ` (${badge.points} pts)` : ""}
                      </Text>
                      <Text className="text-sm font-pregular text-gray-600 mt-0.5">
                        {badge.description || "No description provided."}
                        {badge.earnedAt
                          ? ` (Earned on: ${format(
                              new Date(badge.earnedAt),
                              "MMM dd,yyyy"
                            )})`
                          : ""}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-base font-pregular text-gray-500 text-center mt-2.5">
                    No badges earned yet. Keep using the app!
                  </Text>
                )}
              </ScrollView>
            )}
            <TouchableOpacity
              className="rounded-xl p-2.5 bg-blue-500 mt-4"
              onPress={closeCustomModal}
            >
              <Text className="text-white font-pbold text-base text-center">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </GradientBackground>
  );
};

export default Budget;
