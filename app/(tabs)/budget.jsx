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
  I18nManager,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import GradientBackground from "../../components/GradientBackground";
import { useNavigation, useFocusEffect, router } from "expo-router";
// Collapsible is removed as it's no longer needed for "Your Current Budgets"
import icons from "../../constants/icons";

import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ar as arLocale } from "date-fns/locale";

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../../utils/fontUtils"; // Assumed to return direct font family name
import i18n from "../../utils/i18n";
// import useInternetConnection from "../../lib/useInternetConnection";

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
  getFutureDate,
  getAppwriteErrorMessageKey,
} from "../../lib/appwrite";

// Import the new modal components (ensure paths are correct relative to Budget.jsx)
import BudgetDetailsModal from "../../components/BudgetDetailsModal";
import BudgetSetupModal from "../../components/BudgetSetupModal";

// if (Platform.OS === "android") {
//   UIManager.setLayoutAnimationEnabledExperimental &&
//     UIManager.setLayoutLayoutAnimationEnabledExperimental(true);
// }

const screenWidth = Dimensions.get("window").width;

// Utility function to convert numbers to Arabic numerals (already exists in your provided code)
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

const mapCategoryNameToI18nKey = (categoryNameFromDB) => {
  if (!categoryNameFromDB) return ""; // Handle null or undefined input

  // Convert common database formats (e.g., "Food & Dining") to i18n keys (e.g., "foodDining")
  // This mapping needs to be comprehensive for ALL your categories.
  // Add more cases as needed for your specific category names from Appwrite.
  switch (categoryNameFromDB) {
    case "Food & Dining":
      return "foodDining";
    case "Transportation":
      return "transportation";
    case "Shopping":
      return "shopping";
    case "Health & Wellness":
      return "healthWellness";
    case "Bills & Utilities":
      return "billsUtilities";
    case "Entertainment & Leisure":
      return "entertainmentLeisure";
    case "Business Expenses":
      return "businessExpenses";
    case "Education":
      return "education";
    case "Financial Services":
      return "financialServices";
    case "Gifts & Donations":
      return "giftsDonations";
    case "Home Improvement":
      return "homeImprovement";
    case "Miscellaneous":
      return "miscellaneous";
    case "Household Items":
      return "householdItems";
    case "Clothing":
      return "clothing";
    // Add more cases for any other categories from your database
    default:
      // Fallback if no specific mapping, try a basic camelCase conversion
      // This handles cases like "Groceries" -> "groceries"
      return categoryNameFromDB
        .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) =>
          chr ? chr.toUpperCase() : ""
        )
        .replace(/^./, (match) => match.toLowerCase());
  }
};
const Budget = () => {
  // const isConnected = useInternetConnection();
  const { t } = useTranslation();

  const {
    user,
    isLoading: globalLoading,
    hasBudget,
    checkBudgetInitialization,
    updateUnreadCount,
    applicationSettings,
    preferredCurrencySymbol,
  } = useGlobalContext();
  const navigation = useNavigation();

  const [userBudgets, setUserBudgets] = useState([]);
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [monthlySpendingSummary, setMonthlySpendingSummary] = useState([]);
  const [activeBudgetsCount, setActiveBudgetsCount] = useState(0);

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
      const errorKey = getAppwriteErrorMessageKey(error);
      let errorMessage = t(errorKey);

      if (errorKey === "appwriteErrors.genericAppwriteError") {
        errorMessage = t(errorKey, { message: error.message });
      }

      Alert.alert(t("common.errorTitle"), errorMessage);
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

      // --- START NEW: Count active budgets ---
      const activeBudgets = budgets.filter((b) => b.is_active);
      setActiveBudgetsCount(activeBudgets.length);
      console.log(
        "fetchBudgetData: Active budgets count:",
        activeBudgets.length
      );
      // --- END NEW ---

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
      const errorKey = getAppwriteErrorMessageKey(error);
      let errorMessage = t(errorKey);

      if (errorKey === "appwriteErrors.genericAppwriteError") {
        errorMessage = t(errorKey, { message: error.message });
      }

      Alert.alert(t("common.errorTitle"), errorMessage);
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
    // --- START NEW: Active Budget Limit Check ---
    if (!user || !applicationSettings) {
      // Replaced Alert.alert with i18n translations
      Alert.alert(
        t("common.errorTitle"),
        t("common.userOrSettingsNotLoaded") // New i18n key for this
      );
      return;
    }

    const freeBudgetLimit = applicationSettings.free_tier_budget_count || 0;

    if (!user.isPremium && activeBudgetsCount >= freeBudgetLimit) {
      Alert.alert(
        t("budget.budgetLimitReachedTitle"), // Translated title
        t("budget.budgetLimitReachedMessage", {
          // Translated message with interpolation
          limit: freeBudgetLimit,
          // You might need to pass `router` from `useNavigation`
          // router: router // If router is directly passed or imported
        }),
        [
          { text: t("common.later"), style: "cancel" }, // Translated
          {
            text: t("common.upgradeNow"), // Translated
            onPress: () => {
              // Assuming 'router' is available in this scope, e.g., from useNavigation hook

              router.push("/upgrade-premium");
            },
          },
        ]
      );
      // Optional: Create a notification for the user about the limit
      // try {
      //     await createNotification({
      //         user_id: user.$id,
      //         title: t("budget.budgetLimitReachedNotificationTitle"),
      //         message: t("budget.budgetLimitReachedNotificationMessage", { limit: freeBudgetLimit }),
      //         type: "limit_reached",
      //         expiresAt: getFutureDate(30),
      //     });
      //     const updatedUnreadCount = await countUnreadNotifications(user.$id);
      //     updateUnreadCount(updatedUnreadCount);
      // } catch (notificationError) {
      //     console.warn("Failed to create budget limit notification:", notificationError);
      // }
      return; // Stop budget setup
    }
    // --- END NEW: Active Budget Limit Check ---

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

  const handleDeleteBudget = useCallback(
    async (budgetId) => {
      // Renamed parameter to budgetId for clarity
      setShowActionMenuModal(false); // Close menu immediately
      Alert.alert(
        t("budget.confirmDeletionTitle"),
        t("budget.confirmDeletionMessage", {
          categoryName:
            actionMenuBudgetData?.categoryName || t("common.unknownCategory"),
        }), // Use actionMenuBudgetData for category name here
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("budget.deleteButton"),
            onPress: async () => {
              try {
                // --- DEBUGGING START ---
                console.log(
                  "Attempting to delete budget. ID received directly:",
                  budgetId
                );
                // --- DEBUGGING END ---

                if (!budgetId) {
                  console.error(
                    "Critical: Budget ID is null or undefined for deletion!"
                  );
                  Alert.alert(
                    t("common.errorTitle"),
                    t("budget.budgetDeleteFailed", {
                      error: t("common.unknownError"),
                    })
                  );
                  return; // Stop execution if ID is missing
                }

                // Fetch the budget details BEFORE deleting it, so we can use its properties for the notification
                const budgetDetailsForNotification = userBudgets.find(
                  (b) => b.$id === budgetId
                );

                await deleteBudget(budgetId); // Pass the ID directly to the appwrite function
                Alert.alert(
                  t("common.success"),
                  t("budget.budgetDeleteSuccess")
                );

                // Create notification for delete action with specific details
                if (budgetDetailsForNotification) {
                  const categoryNameForNotif = getCategoryName(
                    budgetDetailsForNotification.category_id
                  );
                  const currencySymbol = preferredCurrencySymbol;

                  await createNotification({
                    user_id: user.$id,
                    title: t("budget.budgetDeletedNotificationTitle"),
                    message: t("budget.budgetDeletedNotificationMessage", {
                      categoryName: categoryNameForNotif,
                      amount: parseFloat(
                        budgetDetailsForNotification.amount
                      ).toFixed(2), // Use amount from fetched details
                      currencySymbol: currencySymbol,
                    }),
                    type: "budget",
                    expiresAt: getFutureDate(7),
                    budget_id: budgetDetailsForNotification.$id, // Still link for historical context if needed
                    deleted_budget_amount: parseFloat(
                      budgetDetailsForNotification.amount
                    ),
                    deleted_budget_category_id:
                      budgetDetailsForNotification.category_id,
                  });
                  const updatedUnreadCount = await countUnreadNotifications(
                    user.$id
                  );
                  updateUnreadCount(updatedUnreadCount);
                } else {
                  console.warn(
                    "Deleted budget details not found for notification creation. Notification will be generic."
                  );
                  // Create a generic notification if details couldn't be found
                  await createNotification({
                    user_id: user.$id,
                    title: t("budget.budgetDeletedNotificationTitle"),
                    message: t("budget.budgetDeletedNotificationMessage", {
                      categoryName: t("common.unknownCategory"),
                      amount: "N/A",
                      currencySymbol: currencySymbol,
                    }),
                    type: "budget",
                    expiresAt: getFutureDate(7),
                  });
                }

                await onRefresh(); // Refresh the list after deletion
              } catch (error) {
                const errorKey = getAppwriteErrorMessageKey(error);
                let errorMessage = t(errorKey);

                if (errorKey === "appwriteErrors.genericAppwriteError") {
                  errorMessage = t(errorKey, { message: error.message });
                }

                Alert.alert(t("common.errorTitle"), errorMessage);
                try {
                  await createNotification({
                    user_id: user.$id,
                    title: t("budget.budgetActionFailedNotificationTitle"),
                    message: t("budget.budgetActionFailedNotificationMessage", {
                      error: error.message || t("common.unknownError"),
                    }),
                    type: "error",
                    expiresAt: getFutureDate(14),
                  });
                  const updatedUnreadCount = await countUnreadNotifications(
                    user.$id
                  );
                  updateUnreadCount(updatedUnreadCount);
                } catch (error) {
                  const errorKey = getAppwriteErrorMessageKey(error);
                  let errorMessage = t(errorKey);

                  if (errorKey === "appwriteErrors.genericAppwriteError") {
                    errorMessage = t(errorKey, { message: error.message });
                  }

                  Alert.alert(t("common.errorTitle"), errorMessage);
                }
              }
            },
          },
        ]
      );
    },
    [
      user?.$id,
      onRefresh,
      updateUnreadCount,
      getCategoryName,
      t,
      userBudgets,
      actionMenuBudgetData,
    ]
  );

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
          <Text
            className="text-white mt-4 text-lg"
            style={{ fontFamily: getFontClassName("extralight") }}
          >
            {t("budget.loadingBudgets")} {/* Translated */}
          </Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1 mt-6">
        {/* {isConnected === false && (
          <View className="bg-red-500 p-2 items-center">
            <Text
              className="text-white text-sm"
              style={{ fontFamily: getFontClassName("regular") }}
            >
              {t("common.noInternetMessage")}
            </Text>
          </View>
        )} */}
        <ScrollView
          className="w-full h-full p-4 mt-6"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header with "My Budgets" and "Add New Budget" button */}
          <View
            className={`flex-row justify-between items-center mb-2 mt-4 ${
              I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse header for RTL
            }`}
          >
            <Text
              className="text-lg text-black" // Removed font-pbold
              style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
            >
              {t("budget.myBudgetsTitle")} {/* Translated */}
            </Text>
            {/* The "Set New Budget" button should generally always be visible to allow creation */}
            <TouchableOpacity
              onPress={() => handleSetupBudget()} // Call openBudgetModal with null for new budget
              className="bg-[#2A9D8F] rounded-md px-4 py-2 items-center justify-center" // Smaller button style
            >
              <Text
                className="text-white text-base" // Removed font-psemibold
                style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
              >
                {t("budget.setNewBudgetButton")} {/* Translated */}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Budget Description */}
          <Text
            className={`text-base text-gray-700 mb-4 mt-2 ${
              I18nManager.isRTL ? "text-right" : "text-left" // Align description
            }`} // Removed font-pregular
            style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
          >
            {t("budget.budgetDescription")} {/* Translated */}
          </Text>

          {/* --- START NEW: Active Budget Tracker Card --- */}
          {user && hasBudget && !user.isPremium && applicationSettings && (
            <View
              className={`bg-white rounded-xl p-4 mx-0 mb-6 shadow-md border border-gray-200 ${
                I18nManager.isRTL ? "items-end" : "items-start" // Align card content based on RTL
              }`}
            >
              <Text
                className={`text-lg text-gray-800 mb-2 ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align title
                }`} // Removed font-pbold
                style={{ fontFamily: getFontClassName("bold") }} // Apply font
              >
                {t("budget.activeBudgetTrackerTitle")}
              </Text>

              <Text
                className={`text-sm text-gray-600 mb-4 ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align description
                }`} // Removed font-pregular
                style={{ fontFamily: getFontClassName("regular") }} // Apply font
              >
                {t("budget.activeBudgetTrackerDescription")} {/* Translated */}
              </Text>

              {(() => {
                const currentActive = activeBudgetsCount || 0;
                const limit = applicationSettings.free_tier_budget_count || 0;
                const percentageUsed =
                  limit > 0 ? (currentActive / limit) * 100 : 0;
                const isOverLimit = currentActive >= limit;
                const remainingBudgets = limit - currentActive;

                return (
                  <View
                    className={`mb-2 w-full ${
                      I18nManager.isRTL ? "items-end" : "items-start"
                    }`}
                  >
                    <Text
                      className={`text-base text-gray-800 mb-1 ${
                        I18nManager.isRTL ? "text-right" : "text-left" // Align text
                      }`} // Removed font-pbold
                      style={{ fontFamily: getFontClassName("bold") }} // Apply font
                    >
                      {t("budget.activeBudgetsCount")}{" "}
                      {/* Translated "Active Budgets:" */}
                      <Text
                        className={`text-sm text-gray-700 ${
                          I18nManager.isRTL ? "text-right" : "text-left" // Align text
                        }`} // Removed font-pbold
                        style={{ fontFamily: getFontClassName("bold") }} // Apply font
                      >
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(currentActive)
                          : currentActive}{" "}
                        {limit > 0 && (
                          <Text
                            className={
                              isOverLimit ? "text-red-500" : "text-gray-600"
                            }
                          >
                            /{" "}
                            {i18n.language.startsWith("ar")
                              ? convertToArabicNumerals(limit)
                              : limit}{" "}
                          </Text>
                        )}
                      </Text>
                    </Text>

                    {limit > 0 && (
                      <View className="h-3 bg-gray-200 rounded-full w-full overflow-hidden">
                        <View
                          className={`h-full ${
                            isOverLimit ? "bg-red-500" : "bg-[#9F54B6]" // Using the provided purple color
                          } rounded-full`}
                          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                        />
                      </View>
                    )}

                    <View
                      className={`flex-row justify-between items-center w-full mt-2 ${
                        I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          isOverLimit ? "text-red-600" : "text-green-600"
                        } ${I18nManager.isRTL ? "text-right" : "text-left"}`} // Align text
                        style={{ fontFamily: getFontClassName("regular") }} // Apply font
                      >
                        {isOverLimit
                          ? t("budget.limitReachedMessageSmall") // Translated "Limit Reached!"
                          : t("budget.remainingBudgets", {
                              count: i18n.language.startsWith("ar")
                                ? convertToArabicNumerals(remainingBudgets)
                                : remainingBudgets,
                            })}{" "}
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          // Assuming 'router' is imported via useNavigation or other means

                          router.push("/upgrade-premium");
                        }}
                        className="flex-row items-center justify-center p-2 px-3 rounded-md bg-[#9F54B6] shadow-sm" // Using the provided purple color
                      >
                        <Image
                          source={icons.star}
                          className={`w-4 h-4 tint-white ${
                            I18nManager.isRTL ? "ml-1" : "mr-1"
                          }`} // Adjust margin for RTL
                          resizeMode="contain"
                          style={{ tintColor: "white" }} // Explicit tint color
                        />
                        <Text
                          className="text-white text-xs" // Removed font-psemibold
                          style={{ fontFamily: getFontClassName("semibold") }} // Apply font
                        >
                          {t("common.upgradeToPremium")} {/* Translated */}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })()}
            </View>
          )}

          {/* NEW: Button to navigate to Budget Insights */}
          {userBudgets.length > 0 && ( // Conditional render if there are any budgets
            <TouchableOpacity
              onPress={() => router.push("/budget-insights")} // Use router.push as confirmed by user
              className="bg-[#264653] rounded-md p-3 items-center justify-center mt-1 mb-6 w-full" // Dark Blue from your palette
            >
              <Text
                className="text-white text-base" // Removed font-psemibold
                style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
              >
                {t("budget.viewBudgetInsightsButton")} {/* Translated */}
              </Text>
            </TouchableOpacity>
          )}

          {monthlySpendingSummary.length > 0 && (
            <View className="bg-primary p-4 border-t border-[#9F54B6]">
              <Text
                className={`text-base text-black mb-2 ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align title
                }`} // Removed font-pbold
                style={{ fontFamily: getFontClassName("bold") }} // Apply font
              >
                {t("budget.monthlySpendingOverviewTitle")} {/* Translated */}
              </Text>
              <Text
                className={`text-sm text-gray-600 mb-4 ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align description
                }`} // Removed font-pregular
                style={{ fontFamily: getFontClassName("regular") }} // Apply font
              >
                {t("budget.monthlySpendingOverviewDescription")}{" "}
                {/* Translated */}
              </Text>

              {monthlySpendingSummary.map((item, index) => (
                <View
                  key={item.categoryId || index}
                  className={`mb-4 ${
                    I18nManager.isRTL ? "items-end" : "items-start"
                  }`}
                >
                  <Text
                    className={`text-base text-gray-800 mb-1 ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`}
                    style={{ fontFamily: getFontClassName("bold") }}
                  >
                    {/* UPDATED: Use mapCategoryNameToI18nKey to get the correct i18n key */}
                    {t(
                      `categories.${mapCategoryNameToI18nKey(
                        item.categoryName
                      )}`
                    )}
                  </Text>
                  <Text
                    className={`text-sm text-gray-700 mb-1 ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`}
                    style={{ fontFamily: getFontClassName("bold") }}
                  >
                    {t("budget.spent")}:{" "}
                    {i18n.language.startsWith("ar")
                      ? convertToArabicNumerals(item.spent.toFixed(2))
                      : item.spent.toFixed(2)}{" "}
                    {preferredCurrencySymbol}
                    {item.budgetedAmount > 0 && (
                      <Text
                        className={
                          item.isOverBudget ? "text-red-500" : "text-gray-600"
                        }
                      >
                        {" "}
                        / {t("budget.budgeted")}:{" "}
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(
                              item.budgetedAmount.toFixed(2)
                            )
                          : item.budgetedAmount.toFixed(2)}{" "}
                        {preferredCurrencySymbol}
                      </Text>
                    )}
                  </Text>
                  {item.budgetedAmount > 0 && (
                    <View className="h-4 bg-gray-200 rounded-md w-full overflow-hidden">
                      <View
                        className={`h-full ${
                          item.isOverBudget ? "bg-red-500" : "bg-green-500"
                        } rounded-md`}
                        style={{
                          width: `${Math.min(item.percentageOfBudget, 100)}%`,
                        }}
                      />
                    </View>
                  )}
                  {item.budgetedAmount > 0 && (
                    <Text
                      className={`text-sm mt-1 ${
                        item.isOverBudget ? "text-red-600" : "text-green-600"
                      } ${I18nManager.isRTL ? "text-right" : "text-left"}`}
                      style={{ fontFamily: getFontClassName("regular") }}
                    >
                      {item.isOverBudget
                        ? t("budget.overBy", {
                            amount: i18n.language.startsWith("ar")
                              ? convertToArabicNumerals(
                                  Math.abs(item.remaining).toFixed(2)
                                )
                              : Math.abs(item.remaining).toFixed(2),
                            currencySymbol: preferredCurrencySymbol,
                          })
                        : t("budget.remainingAmount", {
                            amount: i18n.language.startsWith("ar")
                              ? convertToArabicNumerals(
                                  item.remaining.toFixed(2)
                                )
                              : item.remaining.toFixed(2),
                            currencySymbol: preferredCurrencySymbol,
                          })}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {userBudgets.length > 0 ? (
            <View className="p-4 mb-1  rounded-xl border-t border-purple-400">
              <Text
                className={`text-lg text-black mb-4 ${
                  I18nManager.isRTL ? "text-right" : "text-left" // Align title
                }`} // Removed font-pbold
                style={{ fontFamily: getFontClassName("bold") }} // Apply font
              >
                {t("budget.yourCurrentBudgetsTitle")} {/* Translated */}
              </Text>
              <View className="mt-2">
                {userBudgets.map((budget) => (
                  <View
                    key={budget.$id}
                    className="p-4 mb-3 border border-gray-200 rounded-lg bg-slate-200 shadow-xs flex-row justify-between items-center"
                  >
                    <View className="flex-1">
                      <Text
                        className={`text-base text-black mb-1 ${
                          I18nManager.isRTL ? "text-right" : "text-left" // Align text
                        }`} // Removed font-psemibold
                        style={{ fontFamily: getFontClassName("semibold") }} // Apply font
                      >
                        {/* Use mapCategoryNameToI18nKey here too */}
                        {t("budget.budgetFor", {
                          categoryName: t(
                            `categories.${mapCategoryNameToI18nKey(
                              getCategoryName(budget.categoryId)
                            )}`
                          ), // Translated category name
                        })}{" "}
                      </Text>

                      <Text
                        className={`text-sm text-gray-700 ${
                          I18nManager.isRTL ? "text-right" : "text-left" // Align text
                        }`}
                        style={{ fontFamily: getFontClassName("regular") }} // Apply font
                      >
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(
                              parseFloat(budget.budgetAmount).toFixed(2)
                            )
                          : parseFloat(budget.budgetAmount).toFixed(2)}{" "}
                        {preferredCurrencySymbol}
                      </Text>
                      <Text
                        className={`text-xs text-gray-600 mt-1 ${
                          I18nManager.isRTL ? "text-right" : "text-left" // Align text
                        }`}
                        style={{ fontFamily: getFontClassName("regular") }} // Apply font
                      >
                        {format(new Date(budget.startDate), "MMM dd,yyyy", {
                          locale: i18n.language.startsWith("ar")
                            ? arLocale
                            : undefined,
                        })}{" "}
                        -{" "}
                        {format(new Date(budget.endDate), "MMM dd,yyyy", {
                          locale: i18n.language.startsWith("ar")
                            ? arLocale
                            : undefined,
                        })}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={(event) => toggleActionMenu(event, budget)}
                      className="p-2"
                    >
                      <Image
                        source={icons.dots}
                        className="w-5 h-5"
                        tintColor="#9F54B6"
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="bg-transparent py-4 px-2.5 mb-2 border-2 border-[#9F54B6] rounded-xl">
              <Text
                className="text-base text-gray-600 text-center mb-3"
                style={{ fontFamily: getFontClassName("medium") }}
              >
                {t("budget.noBudgetsYetCallToAction")}
              </Text>

              <TouchableOpacity
                onPress={handleSetupBudget}
                className="w-full bg-[#2A9D8F] rounded-md px-4 py-2 items-center justify-center mt-3"
              >
                <Text
                  className="text-white text-base"
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {t("budget.createNewBudgetButton")}
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
          <TouchableWithoutFeedback
            onPress={() => setShowActionMenuModal(false)}
          >
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
              {/* Ensure actionMenuPosition and actionMenuBudgetData states are correctly managed elsewhere */}
              {actionMenuPosition && (
                <View
                  style={{
                    position: "absolute",
                    // Position below the dots icon, adjusted for RTL
                    top: actionMenuPosition.y + actionMenuPosition.height + 5,
                    left: I18nManager.isRTL
                      ? actionMenuPosition.x - 150 + actionMenuPosition.width
                      : actionMenuPosition.x,
                    backgroundColor: "white",
                    borderRadius: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    width: 150, // Fixed width for the menu
                    paddingVertical: 5,
                  }}
                >
                  <TouchableOpacity
                    style={{ padding: 10 }}
                    onPress={() => {
                      setShowActionMenuModal(false); // Close this modal
                      // Assuming handleViewBudgetDetails and selectedBudgetIdForDetails are defined
                      // and actionMenuBudgetData contains the $id
                      handleViewBudgetDetails(actionMenuBudgetData?.$id);
                    }}
                  >
                    <Text style={{ fontFamily: getFontClassName("regular") }}>
                      {t("common.viewDetails")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ padding: 10 }}
                    onPress={() => {
                      setShowActionMenuModal(false); // Close this modal
                      // Assuming handleUpdateBudget is defined and takes the full budget object
                      handleUpdateBudget(actionMenuBudgetData);
                    }}
                  >
                    <Text style={{ fontFamily: getFontClassName("regular") }}>
                      {t("common.update")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ padding: 10 }}
                    onPress={() => {
                      setShowActionMenuModal(false); // Close this modal
                      // Assuming handleDeleteBudget is defined and takes the budget $id
                      handleDeleteBudget(actionMenuBudgetData?.$id);
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: getFontClassName("regular"),
                        color: "red",
                      }}
                    >
                      {t("common.delete")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
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
