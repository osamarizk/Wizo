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
  Alert, // Keep Alert for confirmation dialog
  LayoutAnimation, // Still needed for other animations if any
  UIManager,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import GradientBackground from "../../components/GradientBackground";
import { useNavigation, useFocusEffect } from "expo-router";
// Collapsible is removed as it's no longer needed for "Your Current Budgets"
import icons from "../../constants/icons";

import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

import {
  getUserBudgets,
  chkBudgetInitialization,
  getCategories2Bud,
  getUserPoints,
  getUserEarnedBadges,
  getReceiptsForPeriod,
  deleteBudget,
  createNotification,
  countUnreadNotifications,
} from "../../lib/appwrite";

// Import the new modal components (ensure paths are correct relative to Budget.jsx)
import BudgetDetailsModal from "../../components/BudgetDetailsModal";
import BudgetSetupModal from "../../components/BudgetSetupModal";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutLayoutAnimationEnabledExperimental(true);
}

const Budget = () => {
  const {
    user,
    isLoading: globalLoading,
    hasBudget,
    checkBudgetInitialization,
    updateUnreadCount,
  } = useGlobalContext();
  const navigation = useNavigation();

  const [userBudgets, setUserBudgets] = useState([]);
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [monthlySpendingSummary, setMonthlySpendingSummary] = useState([]);

  const [showPointsBadgeModal, setShowPointsBadgeModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState(""); // Corrected: ensure useState is used

  // States to control the new dedicated modals
  const [showBudgetDetailsModal, setShowBudgetDetailsModal] = useState(false);
  const [selectedBudgetIdForDetails, setSelectedBudgetIdForDetails] =
    useState(null);

  const [showBudgetSetupModal, setShowBudgetSetupModal] = useState(false);
  const [initialBudgetDataForSetup, setInitialBudgetDataForSetup] =
    useState(null);

  // State for the action menu (3 dots) - now also controlled as a modal
  const [showActionMenuModal, setShowActionMenuModal] = useState(false);
  const [actionMenuBudgetData, setActionMenuBudgetData] = useState(null); // The budget object for the currently open menu
  const [actionMenuPosition, setActionMenuPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

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

  const fetchAllCategories = useCallback(async () => {
    if (!user?.$id) {
      console.log("fetchAllCategories: User ID not available.");
      return {};
    }
    console.log("fetchAllCategories: Attempting to fetch categories...");
    try {
      const categories = await getCategories2Bud();
      const map = {};
      categories.forEach((cat) => {
        map[cat.$id] = cat.name;
      });
      setCategoriesMap(map);
      console.log(
        "fetchAllCategories: Fetched categories successfully. Map size:",
        Object.keys(map).length
      );
      console.log("Categories Map contents:", map);
      return map;
    } catch (error) {
      console.error(
        "fetchAllCategories: Error fetching all categories:",
        error
      );
      Alert.alert("Error", "Failed to load categories.");
      return {};
    }
  }, [user?.$id]);

  const getCategoryName = (categoryId, providedCategoriesMap) => {
    const mapToUse = providedCategoriesMap || categoriesMap;
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

    if (!refreshing) {
      console.log("fetchBudgetData: Setting isLoadingData to TRUE.");
      setIsLoadingData(true);
    }

    try {
      console.log(
        "fetchBudgetData: Calling fetchAllCategories and getting returned map for immediate use..."
      );
      const latestCategoriesMap = await fetchAllCategories();

      console.log(
        "fetchBudgetData: Checking budget initialization globally..."
      );
      const initialized = await checkBudgetInitialization(user.$id);
      console.log(
        "fetchBudgetData: Budget initialized status (global):",
        initialized
      );

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

      // ONLY include categories that have an active budget for monthly spending summary
      const categoriesWithActiveBudgets = new Set(
        budgets.map((b) => b.categoryId)
      );
      console.log(
        "fetchBudgetData: Categories with active budgets:",
        Array.from(categoriesWithActiveBudgets)
      );

      console.log(
        "fetchBudgetData: Processing spending summary using latestCategoriesMap and active budgets..."
      );
      const summary = Array.from(categoriesWithActiveBudgets) // Iterate only over categories with active budgets
        .map((categoryId) => {
          const categoryName = getCategoryName(categoryId, latestCategoriesMap);
          const spent = spendingByCat[categoryId] || 0; // Get spending for this category
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
        .sort((a, b) => b.spent - a.spent); // Sort by amount spent

      setMonthlySpendingSummary(summary);
      console.log("monthlySpendingSummary:.", monthlySpendingSummary);
    } catch (error) {
      console.error("fetchBudgetData: !!! ERROR during data fetch !!!", error);
      Alert.alert("Error", "Failed to load budget data.");
    } finally {
      console.log(
        "fetchBudgetData: Setting isLoadingData to FALSE in finally block."
      );
      setIsLoadingData(false);
      setRefreshing(false);
      console.log("fetchBudgetData: Function finished.");
    }
  }, [user?.$id, refreshing, fetchAllCategories]);

  useFocusEffect(
    useCallback(() => {
      console.log(
        "useFocusEffect: Budget screen focused, triggering data fetch..."
      );
      fetchBudgetData();
      return () => {
        console.log("useFocusEffect: Budget screen unfocused.");
        // Ensure all modals and menus are closed on unfocus
        closeCustomModal();
        setShowActionMenuModal(false); // Close action menu modal
        setActionMenuBudgetData(null);
        setShowBudgetDetailsModal(false);
        setSelectedBudgetIdForDetails(null);
        setShowBudgetSetupModal(false);
        setInitialBudgetDataForSetup(null);
      };
    }, [fetchBudgetData])
  );

  const onRefresh = useCallback(async () => {
    console.log("onRefresh: Triggered.");
    setRefreshing(true);
    setShowActionMenuModal(false); // Close action menu on refresh
    setActionMenuBudgetData(null);
    await fetchBudgetData();
  }, [fetchBudgetData]);

  const handleSetupBudget = () => {
    setInitialBudgetDataForSetup(null);
    setShowBudgetSetupModal(true);
  };

  const handleViewBudgetDetails = (budgetId) => {
    setSelectedBudgetIdForDetails(budgetId);
    setShowBudgetDetailsModal(true);
  };

  const handleUpdateBudget = (budget) => {
    setInitialBudgetDataForSetup(budget);
    setShowBudgetSetupModal(true);
  };

  const handleDeleteBudget = async (budgetToDelete) => {
    // Changed from budgetId to budgetToDelete object
    setShowActionMenuModal(false); // Close menu immediately
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this budget? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteBudget(budgetToDelete.$id); // Use the ID from the object
              Alert.alert("Success", "Budget deleted successfully.");

              // Create notification for delete action with specific details
              await createNotification({
                user_id: user.$id,
                title: "Budget Deleted",
                message: `The budget for ${getCategoryName(
                  budgetToDelete.categoryId
                )} ($${parseFloat(budgetToDelete.budgetAmount).toFixed(
                  2
                )}) from ${format(
                  new Date(budgetToDelete.startDate),
                  "PPP"
                )} to ${format(
                  new Date(budgetToDelete.endDate),
                  "PPP"
                )} has been deleted.`,
                budget_id: budgetToDelete.$id, // Still link for historical context if needed
                // Add specific fields for deleted budget details
                deleted_budget_amount: parseFloat(budgetToDelete.budgetAmount),
                deleted_budget_category_id: budgetToDelete.categoryId,
                deleted_budget_start_date: budgetToDelete.startDate,
                deleted_budget_end_date: budgetToDelete.endDate,
              });
              // Update unread count
              const updatedUnreadCount = await countUnreadNotifications(
                user.$id
              );
              updateUnreadCount(updatedUnreadCount);

              onRefresh(); // Refresh the list after deletion
            } catch (error) {
              console.error("Error deleting budget:", error);
              Alert.alert("Error", "Failed to delete budget.");
            }
          },
        },
      ]
    );
  };

  const toggleActionMenu = (event, budget) => {
    // Measure the position of the touched element to position the modal correctly
    event.target.measure((x, y, width, height, pageX, pageY) => {
      setActionMenuPosition({ x: pageX, y: pageY, width, height });
      setActionMenuBudgetData(budget);
      // console.log("Action of Menue Delete data", actionMenuBudgetData);
      setShowActionMenuModal(true);
    });
  };

  const showBudgetPrompt = !hasBudget;

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
            {hasBudget && (
              <TouchableOpacity
                onPress={handleSetupBudget}
                className="bg-red-600 rounded-md p-3 items-center justify-center mt-3 w-60"
              >
                <Text className="text-white font-psemibold text-base">
                  Add New Budget
                </Text>
              </TouchableOpacity>
            )}
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
                <View className="flex-row justify-around items-center bg-transparent py-4 px-2.5 mb-2 border-2 border-[#9F54B6] rounded-xl">
                  <View className="flex-row items-center">
                    <Image
                      source={icons.star}
                      className="w-8 h-8 mr-2"
                      tintColor="red"
                    />
                    <Text className="text-base font-pmedium text-slate-800">
                      Points:{" "}
                      <Text className="font-pbold text-lg text-red-600">
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
                    className="flex-row items-center bg-blue-300 rounded-lg py-2 px-3 ml-2"
                  >
                    <Image source={icons.medal} className="w-8 h-8 mr-2" />
                    <Text className="text-base font-pmedium text-black">
                      Badges:{" "}
                      <Text className="font-pbold text-lg text-black">
                        {userBadges.length}
                      </Text>
                    </Text>
                    <Image source={icons.arrowRight} className="w-4 h-4 ml-2" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* NEW: Button to navigate to Budget Insights */}
          {hasBudget && (
            <TouchableOpacity
              onPress={() => navigation.navigate("budget-insights")} // Assuming "BudgetInsights" is the route name
              className="bg-purple-600 rounded-md p-3 items-center justify-center mt-3 mb-6"
            >
              <Text className="text-white font-psemibold text-base">
                View Budget Insights 📊
              </Text>
            </TouchableOpacity>
          )}

          {monthlySpendingSummary.length > 0 && (
            <View className="bg-transparent p-4  border-t border-[#9F54B6]">
              <Text className="text-base font-pbold text-black mb-2">
                Monthly Spending Overview
              </Text>
              <Text className="text-sm font-pregular text-gray-600  mb-4">
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
                    <View className="h-4 bg-white rounded-md  w-full overflow-hidden">
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
            <View className="p-2 mb-4 rounded-xl border-t border-purple-400">
              <Text className="text-base font-pbold text-black mb-4 ">
                Your Current Budgets
              </Text>
              <View className="mt-2">
                {userBudgets.map((budget) => (
                  <View
                    key={budget.$id}
                    className="p-4 mb-3 border border-gray-200 rounded-lg bg-slate-200 shadow-xs flex-row justify-between items-center"
                  >
                    <View className="flex-1">
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
                    </View>

                    <TouchableOpacity
                      onPress={(event) => toggleActionMenu(event, budget)}
                      className="p-2"
                    >
                      <Image
                        source={icons.dots}
                        className="w-5 h-5"
                        tintColor="#777"
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {!hasBudget && (
            <View className="bg-transparent py-4 px-2.5 mb-2 border-2 border-[#9F54B6] rounded-xl">
              <Text className="text-base font-pmedium text-gray-600 text-center mb-3">
                No budgets or spending data yet.
              </Text>

              <TouchableOpacity
                onPress={handleSetupBudget}
                className="mb-4 w-full bg-red-600 rounded-md py-3 items-center justify-center"
              >
                <Text className="text-white font-pmedium text-base">
                  Start Your First Budget
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>

      {/* Modal for Points/Badges */}
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

      {/* Action Menu Modal (for 3 dots) */}
      {showActionMenuModal && actionMenuBudgetData && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showActionMenuModal}
          onRequestClose={() => setShowActionMenuModal(false)}
        >
          <Pressable
            className="flex-1"
            onPress={() => setShowActionMenuModal(false)}
          >
            <View
              style={{
                position: "absolute",
                top: actionMenuPosition.y + actionMenuPosition.height + 5, // Position below the icon
                left: Math.max(
                  10,
                  actionMenuPosition.x + actionMenuPosition.width - 120
                ), // Adjusted left to prevent going off-screen and align right
                // Removed the duplicate 'left' key
              }}
              className="bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-32"
              onStartShouldSetResponder={() => true} // Prevent closing when tapping inside the menu
            >
              <TouchableOpacity
                onPress={() => {
                  setShowActionMenuModal(false);
                  handleViewBudgetDetails(actionMenuBudgetData.$id);
                }}
                className="px-4 py-2 border-b border-gray-100"
              >
                <Text className="text-gray-800 font-pregular">
                  View Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowActionMenuModal(false);
                  handleUpdateBudget(actionMenuBudgetData);
                }}
                className="px-4 py-2 border-b border-gray-100"
              >
                <Text className="text-gray-800 font-pregular">Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowActionMenuModal(false);
                  handleDeleteBudget(actionMenuBudgetData.$id);
                }}
                className="px-4 py-2"
              >
                <Text className="text-red-500 font-pregular">Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Budget Details Modal */}
      <BudgetDetailsModal
        isVisible={showBudgetDetailsModal}
        onClose={() => setShowBudgetDetailsModal(false)}
        budgetId={selectedBudgetIdForDetails}
        onUpdate={(budgetData) => {
          setShowBudgetDetailsModal(false);
          handleUpdateBudget(budgetData);
        }}
      />

      {/* Budget Setup/Update Modal */}
      <BudgetSetupModal
        isVisible={showBudgetSetupModal}
        onClose={() => setShowBudgetSetupModal(false)}
        initialBudgetData={initialBudgetDataForSetup}
        onSaveSuccess={() => {
          onRefresh();
          setShowBudgetSetupModal(false);
        }}
      />
    </GradientBackground>
  );
};

export default Budget;
