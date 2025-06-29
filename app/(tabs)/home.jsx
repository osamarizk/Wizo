import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  I18nManager,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import SearchFilter from "../../components/SearchFilter";

import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import GradientBackground from "../../components/GradientBackground";
import { useGlobalContext } from "../../context/GlobalProvider";
import icons from "../../constants/icons";
import i18n from "../../utils/i18n";
import { ar as arLocale } from "date-fns/locale";

import {
  countUnreadNotifications,
  getReceiptStats,
  fetchUserReceipts,
  categoriesData,
  subcategoriesData,
  createCategories,
  createSubcategories,
  getUserBudgets,
  getAllCategories,
  getUserPoints,
  getUserEarnedBadges,
  deleteReceiptById,
  getReceiptImageDownloadUrl,
  getMonthlyReceiptSummary,
  createNotification,
  getFutureDate,
  updateUserDownloadCount,
} from "../../lib/appwrite";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import UploadModal from "../../components/UploadModal";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import { FlashList } from "@shopify/flash-list"; // Import FlashList
import Collapsible from "react-native-collapsible"; // Import the collapsible component
import ReceiptFull from "../../components/ReceiptFull";
import { format } from "date-fns";
import eventEmitter from "../../utils/eventEmitter";
import images from "../../constants/images";
import SpendingTrendsChart from "../../components/SpendingTrendsChart";
import EditReceiptModal from "../../components/EditReceiptModal";

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../../utils/fontUtils";

const screenWidth = Dimensions.get("window").width;
const gradientColors = [
  "#D03957", // Red
  "#264653", // Dark Blue
  "#F4A261", // Orange
  "#2A9D8F", // Teal
  "#F9C74F", //Yellow
  "#90BE6D", // Green
  "#4E17B3", // Purple
  "#8AC926", // Lime Green
  "#9F54B6", // Darker Purple
  "#E76F51", // Coral

  "#CBF3F0", // Light Blue
  "#FFBF69", // Gold
  "#A3B18A", // Olive Green
  "#588157", // Forest Green
  "#F2CC8F", // Cream
  "#E07A5F", // Salmon
  "#3D405B", // Dark Slate Blue
  "#6D83F2", // Light Slate Blue
];

const convertToArabicNumerals = (num) => {
  const numString = String(num);

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

const generateTranslationKey = (originalName) => {
  if (!originalName) return "";
  // Convert "Food & Dining" -> "foodDining", "Health & Wellness" -> "healthWellness"
  return originalName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove non-alphanumeric except spaces
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, ""); // Remove all spaces after capitalization
};

const Home = () => {
  const { t } = useTranslation();
  const hours = new Date().getHours();
  // Global context for user and notification count
  const {
    user,
    showUploadModal,
    setShowUploadModal,
    loading: globalLoading,
    checkBudgetInitialization,
    applicationSettings,
    setUser,
    updateUnreadCount,
  } = useGlobalContext();

  // State variables for various data and UI controls
  const [latestReceipts, setLatestReceipts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [receiptStats, setReceiptStats] = useState({
    totalCount: 0,
    thisMonthCount: 0,
    monthlySpending: 0,
    latestDate: "N/A",
  });
  const [categorySpendingData, setCategorySpendingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBudgetPrompt, setShowBudgetPrompt] = useState(false); // State for budget prompt
  const [userBudget, setUserBudget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false); // State to manage expansion
  const [selectedCategory, setSelectedCategory] = useState(null); // new state for selected category
  const [chartData, setChartData] = useState([]);
  const [allReceipts, setAllReceipts] = useState([]); // State to store all receipts
  const [categoryMonthlySpending, setCategoryMonthlySpending] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [showSpendingModal, setShowSpendingModal] = useState(true);
  const [categoryMerchantAnalysis, setCategoryMerchantAnalysis] = useState([]); // New state for merchant analysis
  const [displayedReceiptImageUri, setDisplayedReceiptImageUri] =
    useState(null);
  const [isFetchingImage, setIsFetchingImage] = useState(false); // To show a loading indicator while fetching the image

  const [isDownloading, setIsDownloading] = useState(false); // Add this new state

  // NEW STATE FOR POINTS AND BADGES
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [showPointsBadgeModal, setShowPointsBadgeModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [showReceiptOptionsModal, setShowReceiptOptionsModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null); // Stores the receipt object when dots are clicked
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReceiptDetailsModal, setShowReceiptDetailsModal] = useState(false);
  const [showEditReceiptModal, setShowEditReceiptModal] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  // Search and Filter States:
  const [searchQuery, setSearchQuery] = useState(""); // For merchant search
  const [searchStartDate, setSearchStartDate] = useState(null);
  const [searchEndDate, setSearchEndDate] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedSearchCategory, setSelectedSearchCategory] = useState(null);
  const [selectedSearchSubcategory, setSelectedSearchSubcategory] =
    useState(null);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // <--- NEW STATE
  const [showSearchFilterModal, setShowSearchFilterModal] = useState(false); // <--- NEW STATE FOR SEARCH FILTER MODAL
  const [isSearchFilterExpanded, setIsSearchFilterExpanded] = useState(false); // <--- NEW STATE for collapsible filter
  const [monthlySummary, setMonthlySummary] = useState([]);

  const [refreshKey, setRefreshKey] = useState(0);

  const currentDateFormatLocale = i18n.language.startsWith("ar")
    ? arLocale
    : undefined; // `undefined` defaults to English (en-US)

  // Helper function to format date and convert numerals if needed
  const formatLocalizedDate = useCallback(
    (dateValue, formatStringKey = "common.dateFormatShort") => {
      if (
        !dateValue ||
        (typeof dateValue === "string" && dateValue === "N/A")
      ) {
        return t("common.not_available_short");
      }

      const dateObject = new Date(dateValue);
      // Add a robust check for "Invalid Date"
      if (isNaN(dateObject.getTime())) {
        return t("common.not_available_short"); // Return N/A for invalid dates
      }

      const formattedDate = format(dateObject, t(formatStringKey), {
        locale: currentDateFormatLocale,
      });

      // If current language is Arabic, convert Western numerals to Eastern Arabic numerals
      if (i18n.language.startsWith("ar")) {
        return convertToArabicNumerals(formattedDate);
      }
      return formattedDate;
    },
    [i18n.language, t, currentDateFormatLocale]
  ); // Dependencies for useCallback

  useEffect(() => {
    if (user?.$id && !globalLoading) {
      fetchData();

      // uploadInitialData();
    }
  }, [user, fetchData, globalLoading]);

  // Use useEffect to listen for the global refresh event
  useEffect(() => {
    const handleGlobalRefresh = () => {
      console.log("Home: Global refresh event received. Triggering fetchData.");
      fetchData();
    };

    eventEmitter.on("refreshHome", handleGlobalRefresh);

    return () => {
      eventEmitter.off("refreshHome", handleGlobalRefresh);
    };
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      if (user?.$id && !globalLoading) {
        fetchData();
      }
    }, [user, fetchData, globalLoading])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    setIsDeleting(false);
    setIsDownloading(false);
    console.log("onRefresh called, incrementing refreshKey...");
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);
  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch();
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [
    searchQuery,
    selectedSearchCategory,
    selectedSearchSubcategory,
    searchStartDate,
    searchEndDate,
    performSearch,
  ]);
  useEffect(() => {
    // This effect ensures search runs after allReceipts are loaded, but avoid running if a search is already active
    if (
      !isLoading &&
      !refreshing &&
      allReceipts.length > 0 &&
      !searchQuery &&
      !selectedSearchCategory &&
      !selectedSearchSubcategory &&
      !searchStartDate &&
      !searchEndDate
    ) {
      performSearch();
    }
  }, [
    allReceipts,
    performSearch,
    isLoading,
    refreshing,
    searchQuery,
    selectedSearchCategory,
    selectedSearchSubcategory,
    searchStartDate,
    searchEndDate,
  ]);

  // The handler passed to UploadModal
  const handleUploadSuccess = useCallback(() => {
    setShowUploadModal(false); // Close the modal
    // console.log("Upload successful, calling onRefresh...");
    onRefresh(); // This will increment refreshKey, triggering useFocusEffect
  }, [setShowUploadModal, onRefresh]);

  const fetchData = useCallback(async () => {
    if (user?.$id) {
      setIsLoading(true);
      try {
        const [
          unreadCount,
          stats, // This is from your existing getReceiptStats
          allReceipts, // This is from fetchUserReceipts, which provides ALL receipts
          fetchedMonthlySummary,
          isBudgetInitializedStatus, // Renamed to avoid conflict with isBudgetInitialized state
        ] = await Promise.all([
          countUnreadNotifications(user.$id),
          getReceiptStats(user.$id), // Assumed to return monthly stats, totalCount, and latestDate (possibly for monthly)
          fetchUserReceipts(user.$id), // This should fetch ALL user receipts, potentially for export/overall summary
          getMonthlyReceiptSummary(user.$id), // Fetch monthly summary
          checkBudgetInitialization(user.$id), // Fetch budget status
        ]);

        setUnreadCount(unreadCount);

        // --- Calculate Overall Spending from allReceipts ---
        let calculatedOverallSpending = 0;
        // Iterate through all fetched receipts to sum up total spending
        allReceipts.forEach((receipt) => {
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

        // Determine overall total receipts count and latest date from the `allReceipts` array
        // This is more reliable for *overall* summaries if fetchUserReceipts truly returns all.
        const overallTotalReceipts = allReceipts.length;

        const overallLatestDate =
          allReceipts.length > 0
            ? allReceipts[0].datetime // Store the original raw datetime string here
            : "N/A";

        // Update receiptStats state, merging existing stats and adding overall data
        setReceiptStats((prevStats) => ({
          ...prevStats, // Keep any other existing stats from prev state
          ...stats, // Overwrite with fresh monthly stats and totalCount/latestDate (if getReceiptStats provides overall)
          // Explicitly set overall metrics if getReceiptStats doesn't provide them reliably
          totalCount: overallTotalReceipts, // Use the count from fetchUserReceipts for overall
          overallSpending: calculatedOverallSpending, // Set the calculated overall spending
          latestDate: overallLatestDate, // Use the latest date from all receipts for overall
        }));

        setAllReceipts(allReceipts); // Set all receipts to state
        setMonthlySummary(fetchedMonthlySummary); // Set monthly summary data

        setLatestReceipts(allReceipts.slice(0, 5)); // Show latest 5 receipts

        const spendingByCategory = stats.monthlyCategorySpendingBreakdown || {};
        const totalItemsPriceForMonth = Object.values(
          spendingByCategory
        ).reduce((sum, val) => sum + val, 0); // Calculate total from breakdown

        const chartData = Object.keys(spendingByCategory).map(
          (categoryName, index) => {
            // --- CRITICAL FIX: Use the standardized generateTranslationKey function ---
            const categoryTranslationKey = generateTranslationKey(categoryName);

            // Example logging for debugging the generated key:
            console.log(
              `Home (Chart): Original category: "${categoryName}" -> Generated key: "${categoryTranslationKey}"`
            );

            // Ensure population and value are numbers, default to 0 if undefined
            const populationValue = spendingByCategory[categoryName] || 0;

            return {
              // Use the translated category name here
              name: t(`categories.${categoryTranslationKey}`, {
                defaultValue: categoryName,
              }), // Translate the category name
              population: populationValue,
              color: gradientColors[index % gradientColors.length],
              legendFontColor: "#7F7F7F",
              legendFontSize: 12,
              percent:
                totalItemsPriceForMonth > 0
                  ? (populationValue / totalItemsPriceForMonth) * 100
                  : 0,
              id: categoryName, // Keep original categoryName for ID
              value: populationValue,
            };
          }
        );
        setChartData(chartData);
        setCategorySpendingData(chartData); // Assuming categorySpendingData is a state variable

        // Using the renamed variable for budget initialization status
        const hasReceipts = allReceipts.length > 0; // Check if there are any receipts
        setShowBudgetPrompt(!isBudgetInitializedStatus && hasReceipts); // set budget prompt here (assuming setShowBudgetPrompt is a state setter)

        fetchBudget(); // Assuming fetchBudget is a function defined elsewhere in your component
        fetchCategories(); // Assuming fetchCategories is a function defined elsewhere in your component

        // NEW: Fetch user points and badges
        const userPointsDocs = await getUserPoints(user.$id);
        if (userPointsDocs.length > 0) {
          // Assuming history is a stringified JSON array in your Appwrite document
          const historyString = userPointsDocs[0].history;
          let history = [];
          try {
            history = JSON.parse(historyString);
          } catch (e) {
            console.error(
              "Error parsing user points history for Home Page:",
              e
            );
          }

          const totalPoints = history.reduce(
            (sum, entry) => sum + (entry.points || 0),
            0
          );
          setUserTotalPoints(totalPoints || 0); // Assuming setUserTotalPoints is a state setter
          console.log("Total Points from history:", totalPoints);
        } else {
          setUserTotalPoints(0);
          console.log("No points document found for this user.");
        }

        const earnedBadges = await getUserEarnedBadges(user.$id);
        setUserBadges(earnedBadges); // Assuming setUserBadges is a state setter
        setIsSearchFilterExpanded(false); // Assuming setIsSearchFilterExpanded is a state setter
      } catch (error) {
        console.error("Error fetching data in Home.jsx:", error);
        Alert.alert(
          t("common.dataLoadErrorTitle"), // Translated
          t("common.dataLoadErrorMessage") // Translated
        );
      } finally {
        setIsLoading(false); // Assuming setIsLoading is a state setter
        setRefreshing(false); // Assuming setRefreshing is a state setter
      }
    }
  }, [user, t, currentDateFormatLocale]); // Dependencies for useCallback

  const performSearch = useCallback(async () => {
    setIsSearching(true); // <--- Set loading to true when search starts

    try {
      let results = allReceipts; // Start with all receipts

      // Filter by merchant (case-insensitive)
      if (searchQuery) {
        results = results.filter((receipt) =>
          receipt.merchant.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by category
      if (selectedSearchCategory) {
        results = results.filter(
          (receipt) => receipt.category_id === selectedSearchCategory
        );
      }

      // Filter by subcategory (only if a category is also selected)
      if (selectedSearchSubcategory && selectedSearchCategory) {
        results = results.filter(
          (receipt) => receipt.subcategory_id === selectedSearchSubcategory
        );
      }

      // Filter by date range
      if (searchStartDate && searchEndDate) {
        const startOfDay = new Date(searchStartDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(searchEndDate);
        endOfDay.setHours(23, 59, 59, 999);

        results = results.filter((receipt) => {
          const receiptDate = new Date(receipt.datetime);
          return receiptDate >= startOfDay && receiptDate <= endOfDay;
        });
      } else if (searchStartDate) {
        const startOfDay = new Date(searchStartDate);
        startOfDay.setHours(0, 0, 0, 0);
        results = results.filter((receipt) => {
          const receiptDate = new Date(receipt.datetime);
          return receiptDate >= startOfDay;
        });
      } else if (searchEndDate) {
        const endOfDay = new Date(searchEndDate);
        endOfDay.setHours(23, 59, 59, 999);
        results = results.filter((receipt) => {
          const receiptDate = new Date(receipt.datetime);
          return receiptDate <= endOfDay;
        });
      }

      setFilteredReceipts(results);
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setIsSearching(false); // <--- Set loading to false when search completes (success or error)
    }
  }, [
    searchQuery,
    selectedSearchCategory,
    selectedSearchSubcategory,
    searchStartDate,
    searchEndDate,
    allReceipts,
  ]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedSearchCategory(null);
    setSelectedSearchSubcategory(null);
    setSearchStartDate(null);
    setSearchEndDate(null);
    setMarkedDates({}); // Clear marked dates
    setFilteredReceipts([]); // Clear filtered results to show all
    setIsSearching(false); // <--- Ensure loading state is false on clear
  }, []);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getAllCategories();
      // console.log("fetchedCategories",fetchedCategories)
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.$id === categoryId);
    return category ? category.name : "Unknown Category";
  };
  // Upload Initial Data one Time:

  const uploadInitialData = async () => {
    try {
      // Only upload if the user is an admin
      if (user?.email === "osama@gmail.com") {
        // <- Replace with your actual admin check
        console.log("Home: User is admin, proceeding with data upload.");
        await createCategories(categoriesData);
        await createSubcategories(subcategoriesData, categoriesData);
        console.log("Home: Initial category and subcategory data uploaded.");
      } else {
        console.log("Home: User is not admin, skipping data upload.");
      }
    } catch (error) {
      console.error("Home: Error uploading initial data:", error);
      // Handle the error appropriately in your app (e.g., show an alert)
    }
  };

  // New handleSetupBudget function
  const SetupBudget = () => {
    router.push({
      pathname: "/budget-set",
      params: { newBudgetCateogy: true },
    });
    setShowBudgetPrompt(false);
  };

  const ViewBudget = (budgetId) => {
    router.push({
      pathname: "/budget-dtl",
      params: { budgetId: budgetId },
    }); // Navigate to the new screen
  };

  const fetchBudget = useCallback(async () => {
    if (user) {
      try {
        const budgets = await getUserBudgets(user.$id);
        if (budgets && budgets.length > 0) {
          setUserBudget(budgets); // Get the first budget
          // console.log("budget", budgets);
        } else {
          setUserBudget(null); // No budget found
        }
      } catch (error) {
        console.error("Error fetching budget:", error);
        setUserBudget(null);
      }
    }
  }, [user]);

  if (isLoading || refreshing) {
    return (
      <GradientBackground colors={gradientColors}>
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text
            className={`text-black mt-4 text-lg`} // Removed font class from className
            style={{ fontFamily: getFontClassName("extralight") }} // Applied directly
          >
            {t("home.loadingDashboard")} {/* Translated */}
          </Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePieChartPress = (item) => {
    // `item` here comes from `categorySpendingData`, which has:
    // `name` (translated), `id` (original English name), `population`, `percent`, `value`, etc.
    setSelectedCategory(item); // selectedCategory.name will be the translated name

    // --- CRITICAL FIX: Use item.id (original English name) to lookup merchant analysis ---
    // receiptStats.monthlyCategoryMerchantAnalysis is structured as:
    // { "OriginalEnglishCategoryName": { "MerchantName": { totalSpending: X, numberOfVisits: Y } } }
    const merchantsForSelectedCategory =
      receiptStats.monthlyCategoryMerchantAnalysis[item.id] || {}; // Use item.id here!

    console.log("merchantsForSelectedCategory", merchantsForSelectedCategory);
    // Convert the aggregated object for the specific category into an array for rendering
    const merchantAnalysisArray = Object.keys(merchantsForSelectedCategory).map(
      (merchantName) => ({
        merchantName: merchantName, // Merchant names are typically not translated here
        totalSpending: merchantsForSelectedCategory[merchantName].totalSpending,
        numberOfVisits:
          merchantsForSelectedCategory[merchantName].numberOfVisits,
      })
    );

    setCategoryMerchantAnalysis(merchantAnalysisArray);
    setShowSpendingModal(true); // Moved this here to ensure data is set before modal opens
  };

  const renderMerchantAnalysisTable = () => {
    // Ensure 't', 'getFontClassName', 'i18n', 'convertToArabicNumerals', 'I18nManager'
    // are accessible in this scope.

    if (categoryMerchantAnalysis.length === 0) {
      return (
        <Text
          className={`text-gray-500 italic mt-4 text-center`} // Removed font class from className
          style={{ fontFamily: getFontClassName("regular") }} // Applied directly
        >
          {t("home.noMerchantData")} {/* Translated */}
        </Text>
      );
    }

    console.log("categoryMerchantAnalysis", categoryMerchantAnalysis);
    return (
      <View className="w-full mt-4 border border-gray-300 rounded-md overflow-hidden">
        {/* Table Header */}
        <View className="flex-row bg-gray-200 py-2 px-3 border-b border-gray-300">
          <Text
            className={`flex-1 text-gray-700 text-sm ${
              I18nManager.isRTL ? "text-right" : "text-left"
            }`} // Removed font class from className
            style={{ fontFamily: getFontClassName("bold") }} // Applied directly
          >
            {t("home.merchant")} {/* Translated */}
          </Text>
          <Text
            className={`w-1/4 text-gray-700 text-sm text-right ${
              I18nManager.isRTL ? "text-right" : "text-left"
            }`} // Removed font class from className
            style={{ fontFamily: getFontClassName("bold") }} // Applied directly
          >
            {t("home.total")} ({t("common.currency_symbol_short")}){" "}
            {/* Translated + Currency Symbol */}
          </Text>
          <Text
            className={`w-1/4 text-gray-700 text-sm text-right ${
              I18nManager.isRTL ? "text-right" : "text-left"
            }`} // Removed font class from className
            style={{ fontFamily: getFontClassName("bold") }} // Applied directly
          >
            {t("home.visits")} {/* Translated */}
          </Text>
        </View>

        {/* Table Rows */}
        {categoryMerchantAnalysis.map((data, index) => (
          <View
            key={data.merchantName}
            className={`flex-row py-2 px-3 ${
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            } border-b border-gray-200 last:border-none`}
          >
            <Text
              className={`flex-1 text-gray-800 text-sm ${
                I18nManager.isRTL ? "text-right" : "text-left"
              }`} // Removed font class from className
              style={{ fontFamily: getFontClassName("regular") }} // Applied directly
            >
              {/* Merchant name (assumed not translated unless specific mapping exists) */}
              {data.merchantName}
            </Text>
            <Text
              className={`w-1/4 text-gray-800 text-sm text-right ${
                I18nManager.isRTL ? "text-right" : "text-left"
              }`} // Removed font class from className
              style={{ fontFamily: getFontClassName("regular") }} // Applied directly
            >
              {/* Conditionally convert totalSpending to Arabic numerals */}
              {i18n.language.startsWith("ar")
                ? convertToArabicNumerals(data.totalSpending.toFixed(2))
                : data.totalSpending.toFixed(2)}
            </Text>
            <Text
              className={`w-1/4 text-gray-800 text-sm text-right ${
                I18nManager.isRTL ? "text-right" : "text-left"
              }`} // Removed font class from className
              style={{ fontFamily: getFontClassName("regular") }} // Applied directly
            >
              {/* Conditionally convert numberOfVisits to Arabic numerals */}
              {i18n.language.startsWith("ar")
                ? convertToArabicNumerals(data.numberOfVisits)
                : data.numberOfVisits}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPieChart = () => {
    // console.log("categorySpendingData", categorySpendingData);
    if (categorySpendingData.length === 0) {
      return (
        <Text
          className={`text-gray-500 italic mt-4`} // Removed font class from className
          style={{ fontFamily: getFontClassName("regular") }} // Applied directly
        >
          {t("home.noSpendingData")} {/* Translated */}
        </Text>
      );
    }
    const data = categorySpendingData;

    return (
      <View className="flex-1 ml-16">
        {/* <TouchableWithoutFeedback> */}

        <PieChart
          data={data}
          width={180}
          height={150}
          chartConfig={{
            color: (opacity = 1, index) =>
              data[index]?.color || `rgba(26, 142, 255, ${opacity})`,

            strokeWidth: 3,
            useShadowColorFromDataset: false,
            decimalPlaces: 1,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={0}
          center={[0, 0]}
          hasLegend={false}
          innerRadius={90}
          outerRadius={100}
          stroke={"#E0E0E0"}
          strokeWidth={2}
          style={{ marginRight: 0 }}
          // animatedRadius={animatedRadius} // Apply animated radius
        />
        {/* </TouchableOpacity> */}

        {/* </TouchableWithoutFeedback> */}
      </View>
    );
  };

  const renderCategoryLineChart = () => {
    // Renamed from renderCategoryBarChart
    if (categoryMonthlySpending.labels.length === 0) {
      return (
        <Text className="text-gray-500 italic mt-4">
          No monthly spending data for this category.
        </Text>
      );
    }

    const chartConfig = {
      backgroundColor: "#ffffff",
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(78, 23, 179, ${opacity})`, // Example purple color
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726",
      },
    };

    return (
      <LineChart // Changed to LineChart
        data={categoryMonthlySpending}
        width={screenWidth * 0.7} // Adjust width as needed for modal
        height={200}
        yAxisLabel="💵  "
        chartConfig={chartConfig}
        bezier // Makes the line smooth
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    );
  };

  // Function to show custom modal
  const showCustomModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowPointsBadgeModal(true);
  };

  // Function to close custom modal
  const closeCustomModal = () => {
    setShowPointsBadgeModal(false);
    setModalTitle("");
    setModalMessage("");
  };

  // <--- NEW RECEIPT OPTIONS HANDLERS ---

  const handleViewDetails = async () => {
    if (!selectedReceipt || !selectedReceipt.image_file_id) {
      Alert.alert(t("common.info"), t("receipts.noImageAvailable"));
      setShowReceiptOptionsModal(false); // Close the options modal
      return;
    }

    setIsFetchingImage(true); // Start image loading indicator
    setShowReceiptOptionsModal(false); // Close the options modal immediately

    try {
      const imageUrl = await getReceiptImageDownloadUrl(
        selectedReceipt.image_file_id
      );

      console.log("Image_URL", imageUrl);
      setDisplayedReceiptImageUri(imageUrl);
      setShowReceiptDetailsModal(true); // Open the details modal

      // NEW: Notification for successful view
      try {
        await createNotification({
          user_id: user.$id,
          title: t("notifications.receiptViewed"), // Translated
          message: t("notifications.receiptViewedMessage", {
            // Translated with interpolation
            merchant: selectedReceipt.merchant || t("home.unknownMerchant"),
            date: format(
              new Date(selectedReceipt.datetime),
              t("common.dateFormatShort"),
              { locale: currentDateFormatLocale }
            ),
          }),
          type: "receipt_action",
          expiresAt: getFutureDate(7), // <--- Expiry: 7 days for success notifications
          receipt_id: selectedReceipt.$id,
        });
        const updatedUnreadCount = await countUnreadNotifications(user.$id);

        setUnreadCount(updatedUnreadCount);
      } catch (notificationError) {
        console.warn(
          "Failed to create 'view receipt' notification:",
          notificationError
        );
      }
    } catch (error) {
      console.error("Error fetching receipt image:", error);
      Alert.alert(
        t("common.error"),
        t("receipts.failedToLoadReceiptImage", { error: error.message })
      ); // Translated
      setShowReceiptDetailsModal(false); // Ensure modal doesn't open on error
      setDisplayedReceiptImageUri(null); // Clear image URI on error
    } finally {
      setIsFetchingImage(false); // Stop image loading indicator
    }
  };

  const handleEditReceipt = () => {
    if (!selectedReceipt) {
      return;
    }
    setShowReceiptOptionsModal(false); // Close the options modal first
    setShowEditReceiptModal(true); // Open the edit modal
  };
  const handleDowanLoadReceipt = async () => {
    if (!selectedReceipt || !selectedReceipt.image_file_id) {
      Alert.alert(
        t("common.error"),
        t("receipts.receiptImageInfoMissing") // Translated
      );
      return;
    }

    // Access user and applicationSettings from global context

    // --- START NEW: Monthly Download Limit Check ---
    if (!user || !applicationSettings) {
      Alert.alert(
        t("common.error"),
        t("common.userOrAppSettingsNotLoaded") // Translated
      );
      return;
    }

    const userCurrentDownloadCount = user.currentMonthDownloadCount || 0;
    const freeDownloadLimit =
      applicationSettings.free_tier_data_downloads_monthly || 0;

    if (!user.isPremium && userCurrentDownloadCount >= freeDownloadLimit) {
      Alert.alert(
        t("notifications.downloadLimitReached"), // Translated
        t("notifications.downloadLimitReachedMessage", {
          limit: freeDownloadLimit,
        }), // Translated
        [
          { text: t("common.later"), style: "cancel" }, // Translated
          {
            text: t("common.upgradeNow"), // Translated
            onPress: () => {
              setShowReceiptOptionsModal(false);
              router.push("/upgrade-premium");
            },
          },
        ]
      );
      // Notification for Limit Reached
      try {
        await createNotification({
          user_id: user.$id,
          title: t("notifications.downloadLimitReached"), // Translated
          message: t("notifications.downloadLimitNotificationMessage", {
            limit: freeDownloadLimit,
          }),
          type: "limit_reached",
          expiresAt: getFutureDate(30),
          receipt_id: null,
        });
        const updatedUnreadCount = await countUnreadNotifications(user.$id);
        updateUnreadCount(updatedUnreadCount);
      } catch (notificationError) {
        console.warn(
          "Failed to create download limit notification:",
          notificationError
        );
      }
      setIsDownloading(false); // Ensure loading state is reset
      return; // Stop the download process
    }

    setIsDownloading(true); // <--- Set loading to true when download starts

    try {
      const fileUrlString = await getReceiptImageDownloadUrl(
        selectedReceipt.image_file_id
      );

      if (!fileUrlString) {
        Alert.alert(
          t("common.error"),
          t("receipts.failedToRetrieveDownloadUrl")
        );
        return;
      }

      const fileUrl = new URL(fileUrlString);

      const fileName = `receipt-${
        selectedReceipt.merchant
      }-${new Date().getTime()}.jpg`;
      const localUri = FileSystem.documentDirectory + fileName;

      const { uri } = await FileSystem.downloadAsync(
        fileUrl.toString(),
        localUri
      );

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(t("common.error"), t("common.sharingNotAvailable"));
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/jpeg",
        UTI: "public.jpeg",
      });

      try {
        const freshUser = await updateUserDownloadCount(
          user.$id,
          userCurrentDownloadCount
        );
        setUser(freshUser); // Update global user state with the latest count
        console.log(
          "Global user state updated with new download count:",
          freshUser.currentMonthDownloadCount
        );
      } catch (incrementError) {
        console.warn(
          "Failed to increment user download count:",
          incrementError
        );
        // Log the error but don't stop the main flow, as the download succeeded.
      }

      try {
        await createNotification({
          user_id: user.$id,
          title: t("notifications.receiptDownloaded"), // Translated
          message: t("notifications.receiptDownloadedMessage", {
            // Translated
            merchant: selectedReceipt.merchant || t("home.unknownMerchant"),
            date: format(
              new Date(selectedReceipt.datetime),
              t("common.dateFormatShort"),
              { locale: currentDateFormatLocale }
            ),
          }),
          type: "receipt_action",
          expiresAt: getFutureDate(7), // <--- Expiry: 7 days for success notifications
          receipt_id: selectedReceipt.$id,
        });
        const updatedUnreadCount = await countUnreadNotifications(user.$id);
        setUnreadCount(updatedUnreadCount);
      } catch (notificationError) {
        console.warn(
          "Failed to create 'download success' notification:",
          notificationError
        );
      }
      // Alert.alert("Success", "Receipt image downloaded and shared!");
    } catch (error) {
      console.error("Error in handleDowanLoadReceipt:", error);
      Alert.alert(
        t("common.error"),
        t("receipts.failedToDownloadReceipt", { error: error.message })
      );
    } finally {
      setIsDownloading(false); // <--- Set loading to false when download finishes (success or error)
    }
  };

  const handleDeleteReceipt = () => {
    if (!selectedReceipt) return;
    setIsDeleting(true); // <--- Set loading to true when download starts

    Alert.alert(
      t("receipts.confirmDeleteTitle"), // Translated
      t("receipts.confirmDeleteMessage"), // Translated
      [
        {
          text: t("common.noCancel"), // Translated
          style: "cancel",
          onPress: () => setShowReceiptOptionsModal(false), // Dismiss options modal if canceled
        },
        {
          text: t("common.yesDelete"), // Translated
          onPress: async () => {
            setIsDeleting(true);
            setShowReceiptOptionsModal(false); // Close the options modal immediately

            try {
              await deleteReceiptById(selectedReceipt.$id);
              Alert.alert(
                t("common.success"),
                t("receipts.receiptDeletedSuccess")
              ); // Translated
              onRefresh(); // Refresh the list
              try {
                await createNotification({
                  user_id: user.$id,
                  title: t("notifications.receiptDeleted"), // Translated
                  message: t("notifications.receiptDeletedMessage", {
                    // Translated
                    merchant:
                      selectedReceipt.merchant || t("home.unknownMerchant"),
                    date: format(
                      new Date(selectedReceipt.datetime),
                      t("common.dateFormatShort"),
                      { locale: currentDateFormatLocale }
                    ),
                  }),
                  type: "receipt_action",
                  expiresAt: getFutureDate(7),
                  receipt_id: selectedReceipt.$id,
                });
                const updatedUnreadCount = await countUnreadNotifications(
                  user.$id
                );
                updateUnreadCount(updatedUnreadCount);
              } catch (notificationError) {
                console.warn(
                  "Failed to create 'delete receipt' notification:",
                  notificationError
                );
              }
            } catch (error) {
              console.error("Error deleting receipt:", error);
              Alert.alert(
                t("common.error"),
                t("receipts.failedToDeleteReceipt", { error: error.message })
              ); // Translated
            } finally {
              setIsDeleting(false);
              setSelectedReceipt(null); // Clear selected receipt
            }
          },
        },
      ]
    );
  };

  const handleEditSuccess = async () => {
    setShowEditReceiptModal(false); // Close the edit modal
    onRefresh(); // Refresh data on Home screen
    // Add notification for edited receipt
    try {
      await createNotification({
        user_id: user.$id,
        title: "Receipt Edited",
        message: `The receipt for ${
          selectedReceipt.merchant || "Unknown Merchant"
        } has been updated.`,
        type: "receipt_action",
        expiresAt: getFutureDate(7),
        receipt_id: selectedReceipt.$id,
      });
      const updatedUnreadCount = await countUnreadNotifications(user.$id);
      updateUnreadCount(updatedUnreadCount);
    } catch (notificationError) {
      console.warn(
        "Failed to create edit receipt notification:",
        notificationError
      );
    }
  };

  const isSearchActive =
    searchQuery ||
    selectedSearchCategory ||
    selectedSearchSubcategory ||
    searchStartDate ||
    searchEndDate;

  const now = new Date();
  const monthOptions = { month: "long" };
  const monthName = now.toLocaleString("default", monthOptions); // 'default' uses the user's default locale

  const currentMonthDate = new Date();
  const currentMonthIndex = currentMonthDate.getMonth();

  const monthNamesEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthNamesAr = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const displayMonthName = t(
    `common.monthNames.${currentMonthIndex}`, // Using a common translation key for month names
    {
      defaultValue: i18n.language.startsWith("ar")
        ? monthNamesAr[currentMonthIndex]
        : monthNamesEn[currentMonthIndex],
    }
  );

  const greeting =
    hours < 12
      ? t("home.goodMorning")
      : hours < 18
      ? t("home.goodAfternoon")
      : t("home.goodEvening");

  const closeModal = () => {
    setShowSpendingModal(false);
    setSelectedCategory(null); // IMPORTANT: Reset selectedCategory when closing
  };

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1 ">
        <FlashList // Use FlashList here
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            paddingHorizontal: 5,
            paddingTop: 15,
            paddingBottom: 10,
          }}
          ListHeaderComponent={
            <>
              {/* Header Section */}
              <View className="flex-row justify-between items-center mb-4 mt-1 p-4">
                <View>
                  <Text
                    className="text-base text-gray-500 "
                    style={{ fontFamily: getFontClassName("regular") }}
                  >
                    {greeting}
                  </Text>
                  <Text
                    className="text-xl font-bold text-center"
                    style={{ fontFamily: getFontClassName("bold") }}
                  >
                    {user?.username
                      ? `${user.username
                          .charAt(0)
                          .toUpperCase()}${user.username.slice(1)}`
                      : user?.email
                      ? `${user.email
                          .charAt(0)
                          .toUpperCase()}${user.email.slice(1)}`
                      : "User"}
                  </Text>
                </View>
                {/* Notification icon */}
                <View className="flex-row items-center space-x-3">
                  <TouchableOpacity
                    onPress={() => router.push("/notification")}
                    className="relative p-2 rounded-full mt-1"
                  >
                    <Image
                      source={icons.notification}
                      className="w-6 h-6"
                      tintColor="#4E17B3"
                    />
                    {unreadCount > 0 && (
                      <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 items-center justify-center">
                        <Text
                          className="text-white text-xs"
                          style={{ fontFamily: getFontClassName("bold") }}
                        >
                          {unreadCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Settings */}
                  <TouchableOpacity
                    onPress={() => router.push("/account")} // Replace "/account-page" with your actual route for the Account/Profile screen
                    className="p-1"
                  >
                    <Image
                      source={icons.gear} // Assuming you have a 'profile' icon in your icons.js
                      className="w-7 h-7"
                      tintColor="#4E17B3" // Adjust tint color as needed
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/upgrade-premium")}
                    className="p-1 items-center"
                  >
                    <Image
                      source={icons.star}
                      className="w-7 h-7"
                      tintColor="#06d6a0" // Adjust tint color as needed
                      resizeMode="contain"
                    />
                    {/* premium */}
                    <Text
                      className="text-[#4E17B3]  text-xs mt-1"
                      style={{ fontFamily: getFontClassName("bold") }}
                    >
                      {t("settings.premium")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Logo */}
              {receiptStats.totalCount === 0 && (
                <View className="flex-1 justify-center items-center px-4 mt-5">
                  <Image
                    source={images.logoo7}
                    resizeMode="contain"
                    className="w-[230px] h-[105px] "
                    // style={{ width: width * 0.9, height: height * 0.35 }}
                  />
                  <View className="p-4  rounded-lg  mb-6">
                    <Text
                      className="text-lg  text-black mb-4"
                      style={{ fontFamily: getFontClassName("extrabold") }}
                    >
                      {t("home.welcome")} {user?.username || "Guest"}!
                    </Text>
                    <Text
                      className="text-base text-gray-700 mb-3"
                      style={{ fontFamily: getFontClassName("regular") }}
                    >
                      🔥 Wizo is your personal finance companion that turns your
                      everyday receipts into powerful insights. Snap a photo,
                      and Wizo instantly extracts key data — like merchants,
                      totals, and items — so you can track your spending, stay
                      within budget, and understand where your money really
                      goes.
                    </Text>

                    <Text className="text-base font-pregular text-gray-700 mb-3">
                      🔥 But Wizo doesn’t stop with helping users — it also
                      helps businesses make smarter decisions. With
                      user-consented, anonymized spending data, Wizo offers
                      valuable market insights to brands and retailers. It's a
                      win-win: users gain control over their finances, while
                      businesses get better tools to serve their customers.
                    </Text>
                    <Text className="text-base font-pregular text-gray-700 mb-3">
                      🔥 Effortlessly track expenses, gain insights into your
                      spending habits, and achieve your financial goals with
                      ease!
                    </Text>
                  </View>
                </View>
              )}
              {/* Receipt View Modal */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={showReceiptDetailsModal}
                onRequestClose={() => {
                  setShowReceiptDetailsModal(false);
                  setDisplayedReceiptImageUri(null); // Clear image on close
                  setSelectedReceipt(null); // Reset selectedReceipt
                }}
              >
                <Pressable
                  style={styles.centeredView} // Your existing style
                  onPress={() => {
                    setShowReceiptDetailsModal(false);
                    setDisplayedReceiptImageUri(null); // Clear image on close
                    setSelectedReceipt(null); // Reset selectedReceipt
                  }}
                >
                  <View
                    className="bg-slate-300 p-6 rounded-lg w-11/12 max-h-[75vh]"
                    onStartShouldSetResponder={() => true} // Prevents closing when tapping inside
                  >
                    <Text
                      className="text-xl  text-center mb-4"
                      style={{ fontFamily: getFontClassName("bold") }}
                    >
                      {t("receiptDetails.title")}
                    </Text>

                    {isFetchingImage ? (
                      <View className="items-center justify-center py-10">
                        <ActivityIndicator size="large" color="#4E17B3" />
                        <Text
                          className="mt-2 text-gray-600 "
                          style={{ fontFamily: getFontClassName("regular") }}
                        >
                          {/* Loading image... loadingImage */}
                          {t("receipts.loadingImage")}
                        </Text>
                      </View>
                    ) : selectedReceipt && displayedReceiptImageUri ? (
                      <ScrollView className="w-full">
                        {/* Display the Image */}
                        <View className="mb-4 items-center">
                          {console.log(
                            "DEBUG: Type of displayedReceiptImageUri:",
                            typeof displayedReceiptImageUri
                          )}
                          {console.log(
                            "DEBUG: Value of displayedReceiptImageUri:",
                            displayedReceiptImageUri
                          )}
                          {console.log(
                            "DEBUG: Is displayedReceiptImageUri truthy?",
                            !!displayedReceiptImageUri
                          )}
                          <TouchableOpacity
                            onPress={() => setShowFullImage(true)}
                            className="relative w-full"
                          >
                            <Image
                              source={{ uri: displayedReceiptImageUri }}
                              // className="w-full h-64 rounded-md" // Adjust size as needed, consider using Dimensions for dynamic sizing
                              style={{
                                width: Dimensions.get("window").width * 0.8,
                                height: 400,
                                borderRadius: 8,
                              }} // Example: 80% of screen width, fixed height, rounded corners
                              resizeMode="contain" // Ensures the whole image is visible
                              onError={(error) => {
                                console.error(
                                  `Image loading error:${displayedReceiptImageUri}`,
                                  error.nativeEvent.error
                                );
                                Alert.alert(
                                  "Image Error",
                                  "Failed to load receipt image. Please check your network."
                                );
                                // You might want to set displayedReceiptImageUri(null) here
                                // or show a placeholder image if the original fails.
                              }}
                              onLoad={() => {
                                console.log(
                                  "Receipt image loaded successfully!"
                                );
                              }}
                            />
                            <View className="absolute bottom-36 right-2 bg-black/70 px-2 py-1 rounded">
                              <Text
                                className="text-base text-white"
                                style={{
                                  fontFamily: getFontClassName("semibold"),
                                }}
                              >
                                {t("receiptProcess.tapToViewFull")}
                              </Text>
                            </View>
                          </TouchableOpacity>

                          <ReceiptFull
                            imageUri={displayedReceiptImageUri}
                            visible={showFullImage}
                            onClose={() => setShowFullImage(false)}
                          />
                        </View>
                      </ScrollView>
                    ) : (
                      <Text
                        className="text-center text-gray-500"
                        style={{ fontFamily: getFontClassName("regular") }}
                      >
                        No receipt data or image available.
                      </Text>
                    )}

                    <TouchableOpacity
                      className="absolute top-2 right-2 p-2 rounded-full"
                      // style={[styles.button, styles.buttonClose, { marginTop: 20 }]} // Reuse existing button style
                      onPress={() => {
                        setShowReceiptDetailsModal(false);
                        setDisplayedReceiptImageUri(null); // Clear image URI on close
                        setSelectedReceipt(null); // Reset selectedReceipt
                      }}
                    >
                      <Image
                        source={icons.close}
                        resizeMode="contain"
                        className="w-7 h-7 "
                      />
                      {/* <Text style={styles.textStyle}>Cancel</Text> */}
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Modal>
              {/* === START NEW: Combined Monthly Usage Tracker Card === */}
              {receiptStats.totalCount > 0 &&
                user &&
                !user.isPremium &&
                applicationSettings && (
                  <View className=" bg-transparent rounded-xl  mx-4">
                    {/* <Text className="text-lg font-pbold text-gray-800 mb-2">
                      Your Monthly Usage
                    </Text>
                    <Text className="text-sm font-pregular text-gray-600 mb-2">
                      Track your free tier limits and upgrade for unlimited
                      access!
                    </Text> */}

                    {/* Monthly Tracking */}
                    {(() => {
                      const renderTrackerRow = (title, currentCount, limit) => {
                        const percentageUsed =
                          limit > 0 ? (currentCount / limit) * 100 : 0;
                        const isOverLimit = currentCount >= limit;
                        const remaining = limit - currentCount;

                        return (
                          <View className="mb-4 items-start w-full">
                            <Text
                              className="text-base  text-gray-800 mb-1"
                              style={{ fontFamily: getFontClassName("bold") }}
                            >
                              {title}:{" "}
                              <Text
                                className="text-base  text-[#4E17B3]"
                                style={{
                                  fontFamily: getFontClassName("extrabold"),
                                }}
                              >
                                {" "}
                                {i18n.language.startsWith("ar")
                                  ? convertToArabicNumerals(currentCount)
                                  : currentCount}
                                {limit > 0 && (
                                  <Text
                                    className={
                                      isOverLimit
                                        ? "text-red-500"
                                        : "text-gray-600"
                                    }
                                  >
                                    {"/"}{" "}
                                    {i18n.language.startsWith("ar")
                                      ? convertToArabicNumerals(limit)
                                      : limit}
                                  </Text>
                                )}
                              </Text>
                            </Text>

                            {limit > 0 && (
                              <View className="h-3 bg-gray-300 rounded-full w-full overflow-hidden">
                                <View
                                  className={`h-full ${
                                    isOverLimit ? "bg-red-500" : "bg-[#9F54B6]"
                                  } rounded-full`}
                                  style={{
                                    width: `${Math.min(percentageUsed, 100)}%`,
                                  }}
                                />
                              </View>
                            )}

                            <Text
                              className={`text-sm mt-1  ${
                                isOverLimit ? "text-red-600" : "text-[#4E17B3]"
                              } ${
                                I18nManager.isRTL ? "text-right" : "text-left"
                              }`} // Conditional text alignment
                              style={{
                                fontFamily: getFontClassName("semibold"),
                              }}
                            >
                              {isOverLimit
                                ? t("home.limitReached") // Translated "Limit Reached!"
                                : `${t("budget.remaining")} ${
                                    i18n.language.startsWith("ar")
                                      ? convertToArabicNumerals(remaining)
                                      : remaining
                                  } ${t("receipts.receipts")}`}{" "}
                              {/* Translated and conditionally converted remaining count */}
                            </Text>
                          </View>
                        );
                      };

                      return (
                        <>
                          {/* Monthly Receipts Upload */}
                          {renderTrackerRow(
                            t("home.monthlyReceiptsUploads"),
                            user.currentMonthReceiptCount || 0,
                            applicationSettings.free_tier_receipt_limit || 0
                          )}
                          {/* Monthly Data Downloads */}
                          {renderTrackerRow(
                            t("home.monthlyReceiptsDownloads"),
                            user.currentMonthDownloadCount || 0,
                            applicationSettings.free_tier_data_downloads_monthly ||
                              0
                          )}
                        </>
                      );
                    })()}
                  </View>
                )}

              {/* === END NEW: Combined Monthly Usage Tracker Card === */}
              {/* Receipt Summary */}
              {receiptStats.totalCount > 0 && (
                <View className="p-2  mb-2 rounded-md border-t border-[#9F54B6] border-opacity-50 ">
                  <TouchableOpacity
                    onPress={() => router.push("/notification")}
                    className="relative p-2 rounded-full mt-1"
                  >
                    {/* <Text className="text-center text-gray-600 mb-2  font-pregular">
                      Total Receipts
                    </Text> */}

                    <Text
                      // Keep general Tailwind classes, but remove font-specific ones
                      className="text-center text-2xl text-gray-800 mb-2"
                      style={{ fontFamily: getFontClassName("extrabold") }} // NEW: Apply font directly via style
                    >
                      <Text
                        className="text-2xl" // Remove font class from inner Text as well
                        style={{ fontFamily: getFontClassName("extralight") }} // Apply font directly
                      >
                        ®️
                      </Text>{" "}
                      {t("receipts.receipts")} :{" "}
                      {i18n.language.startsWith("ar")
                        ? convertToArabicNumerals(receiptStats.totalCount)
                        : receiptStats.totalCount}
                    </Text>
                    <Text
                      className={`text-base text-gray-600 ${
                        I18nManager.isRTL ? "text-right" : "text-left"
                      }`} // Dynamic font
                      style={{
                        fontSize: Platform.select({
                          ios: 14,
                          android: 12,
                        }),
                        fontFamily: getFontClassName("semibold"),
                      }}
                    >
                      <Text
                        className="text-base text-[#4E17B3] mt-4 "
                        style={{ fontFamily: getFontClassName("bold") }}
                      >
                        {" "}
                        {/* Dynamic font */}
                        🔥{"("}
                        {/* Conditionally convert thisMonthCount to Arabic numerals */}
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(receiptStats.thisMonthCount)
                          : receiptStats.thisMonthCount}
                        {")"}
                      </Text>{" "}
                      {t("home.receiptsOnMonth", {
                        monthName: displayMonthName,
                      })}{" "}
                      |{" "}
                      {t("home.monthSpending", { monthName: displayMonthName })}{" "}
                      : {""} {/* Translated parts with interpolation */}
                      <Text
                        className="text-base text-[#4E17B3] mt-4 "
                        style={{ fontFamily: getFontClassName("bold") }}
                      >
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(
                              receiptStats.monthlySpending.toFixed(2)
                            )
                          : receiptStats.monthlySpending.toFixed(2)}
                      </Text>
                    </Text>

                    <Text
                      // Apply text-right conditionally based on I18nManager.isRTL for correct alignment
                      className={`text-base text-gray-600 mt-1 ${
                        I18nManager.isRTL ? "text-right" : "text-left"
                      }`}
                      style={{ fontFamily: getFontClassName("semibold") }}
                    >
                      🔥 {t("home.lastReceiptDate")}:{" "}
                      <Text
                        // Removed 'text-center' from here, as the parent handles alignment
                        className={`text-base text-[#4E17B3] mt-4 ${getFontClassName(
                          "bold"
                        )}`}
                      >
                        {/* This logic attempts to format the date if valid, then converts numerals if Arabic */}
                        {
                          receiptStats.latestDate &&
                          receiptStats.latestDate !== "N/A" &&
                          !isNaN(new Date(receiptStats.latestDate))
                            ? i18n.language.startsWith("ar")
                              ? convertToArabicNumerals(
                                  format(
                                    new Date(receiptStats.latestDate),
                                    t("common.dateFormatShort"),
                                    { locale: arLocale }
                                  )
                                )
                              : format(
                                  new Date(receiptStats.latestDate),
                                  t("common.dateFormatShort")
                                )
                            : t("common.not_available_short") // Fallback to translated "N/A"
                        }
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Spending Categories Charts */}
              {receiptStats.monthlySpending > 0 && (
                <View
                  className="p-2 border-t border-[#9F54B6] border-opacity-50"
                  style={{
                    fontSize: Platform.select({
                      ios: 14,
                      android: 11,
                    }),
                  }}
                >
                  {/* Apply text-align dynamically to the main text container */}
                  <Text
                    className={`text-base text-black -mb-1 mt-2  ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`}
                    style={{ fontFamily: getFontClassName("regular") }}
                  >
                    {t("home.spendingCategoriesOf")} {/* Translated */}
                    <Text
                      className="text-xl text-[#b31731]"
                      style={{ fontFamily: getFontClassName("semibold") }}
                    >
                      {displayMonthName}
                    </Text>
                    <Text
                      className="text-xl text-black mt-2"
                      style={{
                        fontSize: Platform.select({
                          ios: 18,
                          android: 14,
                        }),
                        fontFamily: getFontClassName("bold"),
                      }}
                    >
                      {"  :  "}
                      {i18n.language.startsWith("ar")
                        ? convertToArabicNumerals(
                            receiptStats.monthlySpending.toFixed(2)
                          )
                        : receiptStats.monthlySpending.toFixed(2)}
                    </Text>
                  </Text>

                  {categorySpendingData.length > 0 ? (
                    <View className="flex-row items-center justify-center gap-2">
                      <View className="w-[150px] h-[150px] justify-center items-center ">
                        {renderPieChart()}
                      </View>

                      <View className="flex-1 flex-col">
                        {/* Apply text-align dynamically to this text also */}
                        <Text
                          className={`mb-2 text-blue-800 text-base  ${
                            I18nManager.isRTL ? "text-right" : "text-left"
                          }`}
                          style={{ fontFamily: getFontClassName("semibold") }}
                        >
                          {t("home.viewDetailsPrompt")}
                        </Text>

                        {categorySpendingData.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => handlePieChartPress(item)}
                            className="flex-row items-center mb-2"
                          >
                            <View
                              className="w-3 h-3 rounded-full mr-2" // Tailwind handles mr-2 to ml-2 for RTL
                              style={{ backgroundColor: item.color || "gray" }}
                            />

                            <Text
                              className={`text-base text-gray-700 underline  ${
                                I18nManager.isRTL ? "text-right" : "text-left"
                              }`} // Added text alignment
                              style={{
                                fontFamily: getFontClassName("regular"),
                              }}
                            >
                              {/* Translate item.name here using the generated key */}
                              {t(
                                `categories.${item.name
                                  .toLowerCase()
                                  .replace(/ & /g, "_")
                                  .replace(/ /g, "")}`,
                                { defaultValue: item.name }
                              )}{" "}
                              (
                              {typeof item.percent === "number"
                                ? // Conditionally apply convertToArabicNumerals
                                  i18n.language.startsWith("ar")
                                  ? convertToArabicNumerals(
                                      item.percent.toFixed(1)
                                    )
                                  : item.percent.toFixed(1)
                                : // Also conditionally apply for the default "0"
                                i18n.language.startsWith("ar")
                                ? convertToArabicNumerals("0")
                                : "0"}
                              %)
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ) : (
                    <Text
                      className="text-gray-500 italic mt-4"
                      style={{ fontFamily: getFontClassName("regular") }}
                    >
                      {t("home.noSpendingDataAvailable")} {/* Translated */}
                    </Text>
                  )}
                </View>
              )}

              {/* /* NEW: Spending Trends Chart */}
              {receiptStats.totalCount > 0 && (
                <View className="my-3 p-2">
                  {/* Pass monthlySummary and isLoading to the chart component */}
                  <SpendingTrendsChart
                    monthlySummary={monthlySummary}
                    isLoading={isLoading}
                  />
                </View>
              )}
              {/* Category Details Modal */}
              {selectedCategory && (
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={showSpendingModal}
                  onRequestClose={closeModal}
                >
                  <Pressable
                    className="flex-1 justify-center items-center bg-black/50"
                    onPress={closeModal}
                  >
                    <Pressable
                      className="bg-slate-100 p-10 w-80 rounded-md max-h-[80vh]"
                      onPress={(e) => e.stopPropagation()} // Prevent closing when pressing inside the modal content
                    >
                      {/* Modal Title: Category Name Details */}
                      <Text
                        className={`text-xl mb-2  ${
                          I18nManager.isRTL ? "text-right" : "text-left"
                        }`}
                        style={{ fontFamily: getFontClassName("extrabold") }}
                      >
                        {selectedCategory.name} {t("home.detailsTitle")}{" "}
                        {/* Translated " Details" */}
                      </Text>

                      {/* Total Spending */}
                      <Text
                        className={`text-base mb-2  ${
                          I18nManager.isRTL ? "text-right" : "text-left"
                        }`}
                        style={{ fontFamily: getFontClassName("regular") }}
                      >
                        {t("home.totalSpending")}: {/* Translated */}
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(
                              parseFloat(selectedCategory.population).toFixed(2)
                            )
                          : parseFloat(selectedCategory.population).toFixed(
                              2
                            )}{" "}
                        {t("common.currency_symbol_short")}{" "}
                        {/* Currency symbol */}
                      </Text>

                      {/* Merchant Breakdown Title */}
                      <Text
                        className={`text-lg  ${
                          I18nManager.isRTL ? "text-right" : "text-left"
                        }`}
                        style={{ fontFamily: getFontClassName("bold") }}
                      >
                        {t("home.merchantBreakdownTitle")} {/* Translated */}
                      </Text>

                      {/* Merchant Spending Figures Description */}
                      <Text
                        className={`text-sm text-gray-600 mb-2 italic  ${
                          I18nManager.isRTL ? "text-right" : "text-left"
                        }`}
                        style={{ fontFamily: getFontClassName("bold") }}
                      >
                        {t("home.merchantSpendingDescription")}{" "}
                        {/* Translated */}
                      </Text>

                      {/* Render Merchant Analysis Table - this function will need to be updated next! */}
                      {/* Pass selectedCategory.id (original English name) if renderMerchantAnalysisTable needs it to fetch data */}
                      {renderMerchantAnalysisTable(selectedCategory.id)}

                      {/* Close Button */}
                      <TouchableOpacity
                        onPress={closeModal}
                        className="mt-5 py-2.5 px-5 bg-[#4E17B3] rounded-md"
                      >
                        <Text
                          className="text-white text-center "
                          style={{ fontFamily: getFontClassName("regular") }}
                        >
                          {t("common.close")} {/* Translated "Close" */}
                        </Text>
                      </TouchableOpacity>
                    </Pressable>
                  </Pressable>
                </Modal>
              )}

              {/* Top Spending Insights */}
              {receiptStats.highestSpendingCategory && (
                <View className="p-4 mt-2 border-opacity-50 mb-4 border-t border-[#9F54B6]">
                  {/* Title text with conditional alignment and dynamic fonts */}
                  <Text
                    className={`text-base text-black mb-2 ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`}
                    style={{ fontFamily: getFontClassName("bold") }}
                  >
                    {t("home.topSpendingInsightOf")}{" "}
                    <Text
                      className="text-xl text-[#b31731] "
                      style={{ fontFamily: getFontClassName("semibold") }}
                    >
                      {displayMonthName}
                    </Text>
                  </Text>
                  {/* Description text with conditional alignment and dynamic fonts */}
                  <Text
                    className={`text-sm text-gray-600 mb-2 italic ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`}
                    style={{ fontFamily: getFontClassName("regular") }}
                  >
                    {t("home.spendingInsightDescription")}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    {/* Flex row automatically handles LTR/RTL ordering */}
                    <View className="flex-row items-center gap-2">
                      {/* ICON LOGIC: Use receiptStats.highestSpendingCategory.name for comparison (ORIGINAL ENGLISH) */}
                      {receiptStats.highestSpendingCategory.name ===
                        "Food & Dining" && (
                        <Image
                          source={icons.food}
                          className="w-6 h-6"
                          resizeMode="contain"
                        />
                      )}
                      {receiptStats.highestSpendingCategory.name ===
                        "Transportation" && (
                        <Image
                          source={icons.car}
                          className="w-6 h-6 tint-primary"
                          resizeMode="contain"
                        />
                      )}
                      {receiptStats.highestSpendingCategory.name ===
                        "Shopping" && (
                        <Image
                          source={icons.shopping}
                          className="w-6 h-6 tint-primary"
                          resizeMode="contain"
                        />
                      )}
                      {/* Category name with dynamic fonts - THIS WILL BE THE TRANSLATED NAME */}
                      <Text
                        className="text-lg text-gray-800"
                        style={{ fontFamily: getFontClassName("bold") }}
                      >
                        {/* CRITICAL FIX: Translate the category name here for display */}
                        {t(
                          `categories.${generateTranslationKey(
                            receiptStats.highestSpendingCategory.name
                          )}`,
                          {
                            defaultValue:
                              receiptStats.highestSpendingCategory.name,
                          }
                        )}
                      </Text>
                    </View>
                    {/* Amount with dynamic fonts and conditional numeral conversion */}
                    <Text
                      className="text-xl text-primary-500 "
                      style={{ fontFamily: getFontClassName("bold") }}
                    >
                      {i18n.language.startsWith("ar")
                        ? convertToArabicNumerals(
                            receiptStats.highestSpendingCategory.amount.toFixed(
                              2
                            )
                          )
                        : receiptStats.highestSpendingCategory.amount.toFixed(
                            2
                          )}
                    </Text>
                  </View>
                  {/* Percentage text with conditional alignment, dynamic fonts, and numeral conversion */}
                  <Text
                    className={`text-md text-gray-600 mt-1 ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`}
                    style={{ fontFamily: getFontClassName("bold") }}
                  >
                    (
                    {i18n.language.startsWith("ar")
                      ? convertToArabicNumerals(
                          receiptStats.highestSpendingCategory.percentage.toFixed(
                            1
                          )
                        )
                      : receiptStats.highestSpendingCategory.percentage.toFixed(
                          1
                        )}
                    {t("common.percentageSymbol")}){" "}
                  </Text>
                </View>
              )}

              {/* Collapsible Search Filter Section */}
              {receiptStats.totalCount > 0 && (
                <View className="p-2 mb-1 border-t border-[#9F54B6]">
                  <View className="flex-row justify-between items-center">
                    {/* Search & Filter Title with dynamic fonts and alignment */}
                    <Text
                      className={`text-lg text-black  ${
                        I18nManager.isRTL ? "text-right" : "text-left"
                      }`}
                      style={{ fontFamily: getFontClassName("semibold") }}
                    >
                      {t("home.searchFilterTitle")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        const isCurrentlyExpanded = isSearchFilterExpanded;
                        setIsSearchFilterExpanded(!isCurrentlyExpanded); // Toggle the expansion state

                        if (isCurrentlyExpanded) {
                          // If the filter was expanded and is now being closed
                          performSearch(); // Apply the currently set filters
                          clearSearch(); // THEN, clear the filter inputs
                        }
                      }}
                      className="p-2"
                    >
                      <Image
                        source={
                          icons.action // Keep existing icon for now as per your code
                        }
                        className="w-8 h-8 tint-gray-600"
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>

                  {isSearchFilterExpanded && (
                    <View>
                      {/* This View wraps the SearchFilter content to add some top margin */}
                      <SearchFilter
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedSearchCategory={selectedSearchCategory}
                        setSelectedSearchCategory={setSelectedSearchCategory}
                        selectedSearchSubcategory={selectedSearchSubcategory}
                        setSelectedSearchSubcategory={
                          setSelectedSearchSubcategory
                        }
                        searchStartDate={searchStartDate}
                        setSearchStartDate={setSearchStartDate}
                        searchEndDate={searchEndDate}
                        setSearchEndDate={setSearchEndDate}
                        showCalendarModal={showCalendarModal}
                        setShowCalendarModal={setShowCalendarModal}
                        markedDates={markedDates}
                        setMarkedDates={setMarkedDates}
                        categories={categories}
                        performSearch={performSearch}
                        clearSearch={clearSearch}
                        setIsSearchFilterExpanded={setIsSearchFilterExpanded} // Pass new prop for internal collapse
                      />
                    </View>
                  )}
                </View>
              )}
              {/* Consolidated Receipts Display Section */}
              {receiptStats.totalCount > 0 && (
                <View className="p-4 border rounded-md border-[#9F54B6] mb-4 border-x-0 ">
                  <Text
                    className={`text-lg text-black mb-2 ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`}
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    {isSearchActive
                      ? t("home.searchResults")
                      : t("home.latestUploadedReceipts")}
                  </Text>

                  {isSearching ? (
                    <View className="flex-1 justify-center items-center py-8">
                      <ActivityIndicator size="large" color="#9F54B6" />
                      <Text
                        className="text-gray-600 mt-2 "
                        style={{ fontFamily: getFontClassName("regular") }}
                      >
                        {t("common.searching")}
                      </Text>
                    </View>
                  ) : isSearchActive ? (
                    filteredReceipts.length > 0 ? (
                      // Replaced .map() with FlashList for performance, as per earlier full snippet
                      <FlashList
                        data={filteredReceipts}
                        keyExtractor={(item) => item.$id}
                        estimatedItemSize={100}
                        renderItem={({ item }) => (
                          <View
                            key={item.$id}
                            className="flex-row items-center justify-between py-2 border-b border-gray-200 last:border-none"
                          >
                            {/* Apply gap-2 here and remove mr-2 from the inner image View */}
                            <View className="flex-row items-center flex-1 gap-2">
                              {" "}
                              <View className="rounded-md p-2">
                                {" "}
                                <Image
                                  source={icons.bill}
                                  resizeMode="contain"
                                  className="w-7 h-7 tint-primary"
                                />
                              </View>
                              <View className="flex-1">
                                <Text
                                  className={`text-lg text-gray-800  ${
                                    I18nManager.isRTL
                                      ? "text-right"
                                      : "text-left"
                                  }`}
                                  style={{
                                    fontFamily: getFontClassName("semibold"),
                                  }}
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >
                                  {item.merchant || t("home.unknownMerchant")}
                                </Text>
                                {item.datetime && (
                                  <Text
                                    className={`text-sm text-gray-600  ${
                                      I18nManager.isRTL
                                        ? "text-right"
                                        : "text-left"
                                    }`}
                                    style={{
                                      fontFamily: getFontClassName("regular"),
                                    }}
                                  >
                                    {formatLocalizedDate(item.datetime)}{" "}
                                    {/* Using formatLocalizedDate */}
                                    {" | "}
                                    {item.total
                                      ? `${t("common.currency_symbol_short")} ${
                                          i18n.language.startsWith("ar")
                                            ? convertToArabicNumerals(
                                                parseFloat(item.total).toFixed(
                                                  2
                                                )
                                              )
                                            : parseFloat(item.total).toFixed(2)
                                        }`
                                      : ""}
                                  </Text>
                                )}
                              </View>
                            </View>
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedReceipt(item);
                                setShowReceiptOptionsModal(true);
                                setIsDeleting(false);
                                setIsDownloading(false);
                              }}
                              className="p-2"
                            >
                              <Image
                                source={icons.dots}
                                className="w-6 h-6 tint-gray-600"
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 0 }}
                      />
                    ) : (
                      <View className="py-4 items-center">
                        <Text
                          className="text-black italic mb-3 text-center "
                          style={{ fontFamily: getFontClassName("regular") }}
                        >
                          {t("home.noSearchResults")}
                        </Text>
                      </View>
                    )
                  ) : latestReceipts.length > 0 ? (
                    // Replaced .map() with FlashList for performance
                    <FlashList
                      data={latestReceipts}
                      keyExtractor={(item) => item.$id}
                      estimatedItemSize={100}
                      renderItem={({ item }) => (
                        <View
                          key={item.$id}
                          className="flex-row items-center justify-between py-2 border-b border-gray-200 last:border-none"
                        >
                          {/* Apply gap-2 here and remove mr-2 from the inner image View */}
                          <View className="flex-row items-center flex-1 gap-2">
                            <View className="rounded-md p-2">
                              <Image
                                source={icons.bill}
                                resizeMode="contain"
                                className="w-7 h-7 tint-primary" // Added tint for consistency
                              />
                            </View>
                            <View className="flex-1">
                              <Text
                                className={`text-lg text-gray-800  ${
                                  I18nManager.isRTL ? "text-right" : "text-left"
                                }`}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{
                                  fontFamily: getFontClassName("semibold"),
                                }}
                              >
                                {item.merchant || t("home.unknownMerchant")}
                              </Text>
                              {item.datetime && (
                                <Text
                                  className={`text-sm text-gray-600  ${
                                    I18nManager.isRTL
                                      ? "text-right"
                                      : "text-left"
                                  }`}
                                  style={{
                                    fontFamily: getFontClassName("regular"),
                                  }}
                                >
                                  {formatLocalizedDate(item.datetime)} {" | "}
                                  {item.total
                                    ? `${t("common.currency_symbol_short")} ${
                                        i18n.language.startsWith("ar")
                                          ? convertToArabicNumerals(
                                              parseFloat(item.total).toFixed(2)
                                            )
                                          : parseFloat(item.total).toFixed(2)
                                      }`
                                    : ""}
                                </Text>
                              )}
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedReceipt(item);
                              setShowReceiptOptionsModal(true);
                              setIsDeleting(false);
                              setIsDownloading(false);
                            }}
                            className="p-2"
                          >
                            <Image
                              source={icons.dots}
                              className="w-6 h-6 tint-gray-600"
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                      contentContainerStyle={{ paddingBottom: 0 }}
                    />
                  ) : (
                    <View className="py-4 items-center">
                      <Text
                        className="text-black italic mb-3 text-center "
                        style={{ fontFamily: getFontClassName("regular") }}
                      >
                        {t("home.noReceiptsUploadedYet")}
                      </Text>
                      <TouchableOpacity
                        className=" rounded-full items-center justify-center w-24 h-24 border-2 bg-slate-100 border-[#D24726]"
                        onPress={() => setShowUploadModal(true)}
                      >
                        <Image
                          source={icons.camera}
                          className="w-9 h-9 tint-primary"
                          resizeMode="contain"
                          tintColor="#D24726"
                        />
                        <Text
                          className="text-[#D24726] text-sm mt-2 "
                          style={{ fontFamily: getFontClassName("semibold") }}
                        >
                          {t("common.upload")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              {/* SearchFilter Modal */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={showSearchFilterModal} // Controlled by the new state
                onRequestClose={() => setShowSearchFilterModal(false)} // Allows closing with hardware back button on Android
              >
                <Pressable
                  style={styles.centeredView} // Dim background
                  onPress={() => setShowSearchFilterModal(false)} // Close modal on backdrop press
                >
                  <Pressable
                    style={styles.modalView}
                    onPress={(e) => e.stopPropagation()} // Prevent closing when pressing inside the modal content
                  >
                    <SearchFilter
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      selectedSearchCategory={selectedSearchCategory}
                      setSelectedSearchCategory={setSelectedSearchCategory}
                      selectedSearchSubcategory={selectedSearchSubcategory}
                      setSelectedSearchSubcategory={
                        setSelectedSearchSubcategory
                      }
                      searchStartDate={searchStartDate}
                      setSearchStartDate={setSearchStartDate}
                      searchEndDate={searchEndDate}
                      setSearchEndDate={setSearchEndDate}
                      showCalendarModal={showCalendarModal}
                      setShowCalendarModal={setShowCalendarModal}
                      markedDates={markedDates}
                      setMarkedDates={setMarkedDates}
                      categories={categories}
                      performSearch={performSearch}
                      clearSearch={clearSearch}
                      setShowSearchFilterModal={setShowSearchFilterModal} // Pass the new prop
                    />
                  </Pressable>
                </Pressable>
              </Modal>
            </>
          }
          data={latestReceipts}
          renderItem={({ item }) => null}
          keyExtractor={(item) => item.$id}
          estimatedItemSize={100}
          ListEmptyComponent={null}
        />

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal
            visible={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={handleUploadSuccess}
          />
        )}

        {/* <--- NEW: Receipt Options Modal ---/> */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showReceiptOptionsModal}
          onRequestClose={() => setShowReceiptOptionsModal(false)}
        >
          <Pressable
            style={styles.centeredView} // Reuse existing style
            onPress={() => setShowReceiptOptionsModal(false)} // Close when tapping outside
          >
            <View
              className="bg-slate-300 p-8 w-80 rounded-md max-h-[80vh] opacity-85"
              onStartShouldSetResponder={() => true}
            >
              <Text
                className="text-xl text-gray-800 mb-4 text-center"
                style={{ fontFamily: getFontClassName("bold") }}
              >
                {t("home.receiptOptions")}
              </Text>
              {selectedReceipt && (
                <Text
                  className="text-base text-gray-600 mb-4 mt-1 text-center "
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                >
                  {selectedReceipt.merchant || t("common.unknownMerchant")}{" "}
                  {i18n.language.startsWith("ar")
                    ? convertToArabicNumerals(
                        (selectedReceipt.total || 0).toFixed(2)
                      ) // Defensive check & Arabic numerals
                    : (selectedReceipt.total || 0).toFixed(2)}{" "}
                  {t("common.currency_symbol_short")}
                </Text>
              )}
              {/* View Receipt */}
              <TouchableOpacity
                onPress={handleViewDetails}
                className={`mt-3 w-full bg-[#4E17B3] rounded-md p-3 items-center justify-center gap-2 ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Image
                  source={icons.eye} // Assuming you have an eye icon in icons.js
                  className="w-5 h-5 mr-2"
                  resizeMode="contain"
                  tintColor="#FFFFFF"
                />
                <Text
                  className="text-white text-base"
                  style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                >
                  {t("home.viewDetails")} {/* Translated */}
                </Text>
              </TouchableOpacity>

              {/* Edit Receipt  */}
              <TouchableOpacity
                onPress={handleEditReceipt}
                className={`mt-3 w-full bg-[#2A9D8F] rounded-md p-3 items-center justify-center  ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Image
                  source={icons.edit} // Assuming you have an edit icon in icons.js
                  className="w-5 h-5 ml-2"
                  resizeMode="contain"
                  tintColor="#FFFFFF"
                />

                <Text
                  className="text-white text-base"
                  style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                >
                  {t("home.editReceipt")} {/* Translated */}
                </Text>
              </TouchableOpacity>

              {/* Download Receipt */}
              <TouchableOpacity
                onPress={() => handleDowanLoadReceipt()}
                disabled={isDownloading}
                className={`mt-3 w-full bg-[#335a69] rounded-md p-3 items-center justify-center ${
                  isDownloading ? "opacity-50" : ""
                } ${I18nManager.isRTL ? "flex-row-reverse" : "flex-row"}`} // Added flex-row-reverse for RTL
              >
                <Image
                  source={icons.download} // Assuming you have a download icon
                  className="w-5 h-5 ml-2"
                  resizeMode="contain"
                  tintColor="#FFFFFF"
                />
                <Text
                  className="text-white text-base"
                  style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                >
                  {isDownloading
                    ? t("common.downloading")
                    : t("home.downloadImage")}{" "}
                  {/* Translated, with loading state */}
                </Text>
              </TouchableOpacity>

              {/* Delete Receipt */}
              <TouchableOpacity
                onPress={() => handleDeleteReceipt()} // Adjusted to call main handler without passing ID directly here
                disabled={isDeleting}
                className={`mt-3 w-full bg-[#D03957] rounded-md p-3 items-center justify-center ${
                  isDeleting ? "opacity-50" : ""
                } ${I18nManager.isRTL ? "flex-row-reverse" : "flex-row"}`} // Added flex-row-reverse for RTL
              >
                <Image
                  source={icons.trash} // Assuming you have a trash icon
                  className="w-5 h-5 ml-2"
                  resizeMode="contain"
                  tintColor="#FFFFFF"
                />
                <Text
                  className="text-white text-base"
                  style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                >
                  {isDeleting ? t("common.deleting") : t("home.deleteReceipt")}{" "}
                  {/* Translated, with loading state */}
                </Text>
              </TouchableOpacity>

              {isDeleting && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
                    zIndex: 999, // Ensure it's on top
                  }}
                >
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      marginTop: 10,
                      fontFamily: getFontClassName("regular"), // Apply font directly
                      textAlign: i18n.language.startsWith("ar")
                        ? "right"
                        : "left", // Ensure text alignment for RTL
                      writingDirection: i18n.language.startsWith("ar")
                        ? "rtl"
                        : "ltr", // Explicit writing direction
                    }}
                  >
                    {t("common.deleting")} {/* Translated */}
                  </Text>
                </View>
              )}

              {/* Close Button */}
              <TouchableOpacity
                className="absolute top-2 right-2 p-2 rounded-full"
                // style={[styles.button, styles.buttonClose, { marginTop: 20 }]} // Reuse existing button style
                onPress={() => setShowReceiptOptionsModal(false)}
              >
                <Image
                  source={icons.close}
                  resizeMode="contain"
                  className="w-7 h-7 "
                />
                {/* <Text style={styles.textStyle}>Cancel</Text> */}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
        {/* Edit Receipt Model */}

        <EditReceiptModal
          isVisible={showEditReceiptModal}
          onClose={() => setShowEditReceiptModal(false)}
          initialReceiptData={selectedReceipt}
          onSaveSuccess={handleEditSuccess}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};

// Styles for the custom modal
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%", // Make modal responsive
    maxWidth: 400, // Max width for larger screens
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  modalMessage: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
  badgeList: {
    maxHeight: 200, // Limit height for scrollable badge list
    width: "100%",
    marginBottom: 20,
  },
  badgeItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  badgeName: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  noBadgesText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },

  // <--- NEW STYLES FOR RECEIPT OPTIONS MODAL ---
  receiptOptionsModalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "70%",
    maxWidth: 350,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOptionButton: {
    width: "100%",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent black background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20, // Reduced padding slightly for a tighter look
    width: "90%", // Adjusted width to be more responsive
    alignItems: "center", // Center content horizontally
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  // --- END NEW STYLES ---
});
export default Home;
