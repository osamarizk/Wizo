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
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import SearchFilter from "../../components/SearchFilter";

import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import GradientBackground from "../../components/GradientBackground";
import { useGlobalContext } from "../../context/GlobalProvider";
import icons from "../../constants/icons";
import CustomButton from "../../components/CustomButton";
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

const Home = () => {
  const hours = new Date().getHours();
  // Global context for user and notification count
  const {
    user,
    showUploadModal,
    setShowUploadModal,
    loading: globalLoading,
    checkBudgetInitialization,
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
  const [isDeleting, setIsDeleting] = useState(false); // Add this new state
  const [showReceiptDetailsModal, setShowReceiptDetailsModal] = useState(false); // New state for details modal

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

  const [refreshKey, setRefreshKey] = useState(0);

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
        const [count, stats, allReceipts, isBudgetInitialized] =
          await Promise.all([
            countUnreadNotifications(user.$id),
            getReceiptStats(user.$id),
            fetchUserReceipts(user.$id),
            checkBudgetInitialization(user.$id), // Fetch budget status
          ]);
        setUnreadCount(count);
        setReceiptStats(stats);
        setAllReceipts(allReceipts); // Set all receipts to state
        // console.log("stats", stats);
        // console.log("ReceiptStats...", stats);
        // console.log("allReceipts...", allReceipts);

        const spendingByCategory = stats.monthlyCategorySpendingBreakdown || {};
        const totalItemsPriceForMonth = Object.values(
          spendingByCategory
        ).reduce((sum, val) => sum + val, 0); // Calculate total from breakdown

        const chartData = Object.keys(spendingByCategory).map(
          (categoryName, index) => {
            // 'categoryName' is already the name
            return {
              name: categoryName,
              population: spendingByCategory[categoryName],
              color: gradientColors[index % gradientColors.length],
              legendFontColor: "#7F7F7F",
              legendFontSize: 12,
              percent:
                totalItemsPriceForMonth > 0
                  ? (spendingByCategory[categoryName] /
                      totalItemsPriceForMonth) *
                    100
                  : 0,
              id: categoryName, // Use name as ID for consistency
              value: spendingByCategory[categoryName],
            };
          }
        );
        setChartData(chartData);
        setCategorySpendingData(chartData);

        const latest = await fetchUserReceipts(user.$id, 5);
        setLatestReceipts(latest);

        // const isBudgetInitialized = await checkBudgetInitialization(user.$id);
        const hasReceipts = allReceipts.length > 0; // Check if there are any receipts
        setShowBudgetPrompt(!isBudgetInitialized && hasReceipts); // set budget prompt here

        fetchBudget();
        fetchCategories();
        // console.log(showBudgetPrompt);

        // NEW: Fetch user points and badges

        const userPointsDocs = await getUserPoints(user.$id);
        if (userPointsDocs.length > 0) {
          const historyString = userPointsDocs[0].history;
          const history = JSON.parse(historyString);

          const totalPoints = history.reduce(
            (sum, entry) => sum + (entry.points || 0),
            0
          );
          setUserTotalPoints(totalPoints || 0);
          console.log("Total Points from history:", totalPoints);
        } else {
          setUserTotalPoints(0);
          console.log("No points document found for this user.");
        }

        const earnedBadges = await getUserEarnedBadges(user.$id);
        setUserBadges(earnedBadges);
        setIsSearchFilterExpanded(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);
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
        //  <- Replace with your actual admin check
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
          <Text className="text-black mt-4 font-pextralight text-lg">
            Loading your dashboard...
          </Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePieChartPress = (item) => {
    setSelectedCategory(item);
    setShowSpendingModal(true);

    // Retrieve pre-calculated merchant analysis for the selected category from receiptStats
    // receiptStats.monthlyCategoryMerchantAnalysis is structured as:
    // { "CategoryName": { "MerchantName": { totalSpending: X, numberOfVisits: Y } } }
    const merchantsForSelectedCategory =
      receiptStats.monthlyCategoryMerchantAnalysis[item.name] || {};

    console.log("merchantsForSelectedCategory", merchantsForSelectedCategory);
    // Convert the aggregated object for the specific category into an array for rendering
    const merchantAnalysisArray = Object.keys(merchantsForSelectedCategory).map(
      (merchantName) => ({
        merchantName: merchantName,
        totalSpending: merchantsForSelectedCategory[merchantName].totalSpending,
        numberOfVisits:
          merchantsForSelectedCategory[merchantName].numberOfVisits,
      })
    );

    setCategoryMerchantAnalysis(merchantAnalysisArray);
  };

  const renderMerchantAnalysisTable = () => {
    if (categoryMerchantAnalysis.length === 0) {
      return (
        <Text className="text-gray-500 italic mt-4 text-center">
          No merchant data for this category.
        </Text>
      );
    }

    console.log("categoryMerchantAnalysis", categoryMerchantAnalysis);
    return (
      <View className="w-full mt-4 border border-gray-300 rounded-md overflow-hidden">
        {/* Table Header */}
        <View className="flex-row bg-gray-200 py-2 px-3 border-b border-gray-300">
          <Text className="flex-1 font-pbold text-gray-700 text-sm">
            Merchant
          </Text>
          <Text className="w-1/4 font-pbold text-gray-700 text-sm text-right">
            Total (EGP)
          </Text>
          <Text className="w-1/4 font-pbold text-gray-700 text-sm text-right">
            Visits
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
            <Text className="flex-1 text-gray-800 text-sm">
              {data.merchantName}
            </Text>
            <Text className="w-1/4 text-gray-800 text-sm text-right">
              {data.totalSpending.toFixed(2)}
            </Text>
            <Text className="w-1/4 text-gray-800 text-sm text-right">
              {data.numberOfVisits}
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
        <Text className="text-gray-500 italic mt-4">
          No spending data available.
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
        yAxisLabel="EGP "
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
      Alert.alert("Info", "No image available for this receipt.");
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
    } catch (error) {
      console.error("Error fetching receipt image:", error);
      Alert.alert("Error", `Failed to load receipt image: ${error.message}`);
      setShowReceiptDetailsModal(false); // Ensure modal doesn't open on error
      setDisplayedReceiptImageUri(null); // Clear image URI on error
    } finally {
      setIsFetchingImage(false); // Stop image loading indicator
    }
  };

  const handleDowanLoadReceipt = async () => {
    if (!selectedReceipt || !selectedReceipt.image_file_id) {
      Alert.alert(
        "Error",
        "Receipt image information is missing. Cannot download."
      );
      return;
    }

    setIsDownloading(true); // <--- Set loading to true when download starts

    try {
      const fileUrlString = await getReceiptImageDownloadUrl(
        selectedReceipt.image_file_id
      );

      if (!fileUrlString) {
        Alert.alert("Error", "Failed to retrieve receipt image download URL.");
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
        Alert.alert("Error", "Sharing is not available on your platform.");
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/jpeg",
        UTI: "public.jpeg",
      });

      // Alert.alert("Success", "Receipt image downloaded and shared!");
    } catch (error) {
      console.error("Error in handleDowanLoadReceipt:", error);
      Alert.alert(
        "Error",
        `Failed to download or share receipt image: ${error.message}`
      );
    } finally {
      setIsDownloading(false); // <--- Set loading to false when download finishes (success or error)
    }
  };

  const handleDeleteReceipt = () => {
    if (!selectedReceipt) return;
    setIsDeleting(true); // <--- Set loading to true when download starts

    Alert.alert(
      "Delete Receipt",
      `Are you sure you want to delete the receipt from ${selectedReceipt.merchant}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setShowReceiptOptionsModal(false), // Close modal if cancelled
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReceiptById(selectedReceipt.$id); // Implement this Appwrite function
              Alert.alert("Success", "Receipt deleted successfully.");
              onRefresh(); // Refresh the list to reflect deletion
            } catch (error) {
              console.error("Error deleting receipt:", error);
              Alert.alert(
                "Error",
                "Failed to delete receipt. Please try again."
              );
            } finally {
              setShowReceiptOptionsModal(false); // Always close modal
              setSelectedReceipt(null);
              setIsDeleting(false); // <--- Set loading to false when download finishes (success or error)
            }
          },
        },
      ],
      { cancelable: false }
    );
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

  const greeting =
    hours < 12
      ? "Good Morning"
      : hours < 18
      ? "Good Afternoon"
      : "Good Evening";

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
            paddingHorizontal: 15,
            paddingTop: 40,
            paddingBottom: 20,
          }}
          ListHeaderComponent={
            <>
              {/* Header Section */}
              <View className="flex-row justify-between items-center mb-2 mt-1 ">
                <View>
                  <Text className="text-base text-gray-500 font-pregular">
                    {greeting}
                  </Text>
                  <Text className="text-xl font-bold text-center font-pbold">
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
                <TouchableOpacity
                  onPress={() => router.push("/notification")}
                  className="relative p-2 rounded-full mt-1"
                >
                  <Image source={icons.notification} className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Points Display */}
              {(userTotalPoints > 0 || userBadges.length > 0) && (
                <View className="flex-row items-center justify-between mb-3 mt-3">
                  <View className=" mt-1">
                    <Text className="text-gray-600 font-pmedium text-lg">
                      Your Points:{" "}
                      <Text className="font-pbold text-xl">
                        {userTotalPoints}
                      </Text>{" "}
                      ✨
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        showCustomModal(
                          "Your Badges",
                          "View your earned achievements!"
                        )
                      }
                      className="mt-2"
                    >
                      <Text className="text-gray-600 font-psemibold text-base underline">
                        View My Badges ({userBadges.length})
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* NEW: Set Up Budget Prompt (Moved to a more visible location) */}
                  {showBudgetPrompt && (
                    <View className="mx-4 p-2 rounded-xl backdrop-blur-sm bg-transparent items-left">
                      {/* <Text className="text-gray-700 font-pregular text-base text-center">
                        {`Set up your budget Now \n to track your spending!`}
                      </Text> */}
                      <TouchableOpacity
                        onPress={SetupBudget}
                        className="mb-2 w-full bg-[#D03957] rounded-md p-3 items-center justify-center" // Adjust className for your desired style
                      >
                        <Text className="text-white font-pmedium text-base">
                          Setup Budget
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              {/* Custom Modal for Points/Badges */}
              <Modal
                animationType="fade"
                transparent={true}
                visible={showPointsBadgeModal}
                onRequestClose={closeCustomModal}
              >
                <Pressable
                  style={styles.centeredView}
                  onPress={closeCustomModal}
                >
                  <View
                    style={styles.modalView}
                    onStartShouldSetResponder={() => true}
                  >
                    <Text style={styles.modalTitle}>{modalTitle}</Text>
                    <Text style={styles.modalMessage}>{modalMessage}</Text>
                    {modalTitle === "Your Badges" && (
                      <ScrollView style={styles.badgeList}>
                        {userBadges.length > 0 ? (
                          userBadges.map((badge, index) => (
                            <View key={index} style={styles.badgeItem}>
                              {/* You might want to fetch badge details from the 'badges' collection using badge.badge_id */}
                              {/* For now, let's just display the ID or a placeholder */}
                              <Text style={styles.badgeName}>
                                • Badge ID: {badge.badge_id} (Earned on:{" "}
                                {new Date(badge.earned_at).toLocaleDateString()}
                                )
                              </Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.noBadgesText}>
                            No badges earned yet. Keep using the app!
                          </Text>
                        )}
                      </ScrollView>
                    )}
                    <TouchableOpacity
                      style={[styles.button, styles.buttonClose]}
                      onPress={closeCustomModal}
                    >
                      <Text style={styles.textStyle}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Modal>

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
                    <Text className="text-xl font-bold text-center mb-4">
                      Receipt Details
                    </Text>

                    {isFetchingImage ? (
                      <View className="items-center justify-center py-10">
                        <ActivityIndicator size="large" color="#4E17B3" />
                        <Text className="mt-2 text-gray-600 font-pregular">
                          Loading image...
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
                              <Text className="font-psemibold text-base text-white">
                                Tap to view full
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
                      <Text className="text-center text-gray-500">
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

              {/* Receipt Summary */}
              <View className="  mb-4 border-2 rounded-md border-[#9F54B6]">
                <TouchableOpacity
                  onPress={() => router.push("/notification")}
                  className="relative p-2 rounded-full mt-1"
                >
                  <Text className="text-center text-gray-600 mb-2  font-pregular">
                    Total Receipts
                  </Text>

                  <Text className="text-center text-2xl font-pbold text-gray-800 ">
                    💁 Receipts : {receiptStats.totalCount}
                  </Text>

                  <Text
                    className="text-center text-base font-pregular text-gray-600"
                    style={{
                      fontSize: Platform.select({
                        // <--- Use Platform.select for fontSize
                        ios: 14, // Smaller font size for iOS (e.g., original text-xs)
                        android: 12, // Slightly larger for Android if needed, or keep 10
                      }),
                    }}
                  >
                    <Text className="text-center text-base font-pregular text-[#4E17B3] mt-2 ">
                      {"("}
                      {receiptStats.thisMonthCount}
                      {") "}
                    </Text>
                    R on {monthName} | {monthName} Spending : {""}
                    <Text className="text-center text-base font-pregular text-[#4E17B3] mt-1 ">
                      EGP {receiptStats.monthlySpending.toFixed(2)}
                    </Text>
                  </Text>
                  <Text className="text-center text-base font-pregular text-gray-600 mt-1">
                    Last Receipt Date:
                    <Text className="text-center text-base font-pregular text-[#4E17B3] mt-1 ">
                      {" "}
                      {receiptStats.latestDate}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Spending Categories Charts */}
              {receiptStats.monthlySpending > 0 && (
                <View
                  className=" p-2  border-2 rounded-md border-[#9F54B6] mb-4"
                  style={{
                    fontSize: Platform.select({
                      // <--- Use Platform.select for fontSize
                      ios: 14, // Smaller font size for iOS (e.g., original text-xs)
                      android: 11, // Slightly larger for Android if needed, or keep 10
                    }),
                  }}
                >
                  <Text className="text-base font-pregular text-black -mb-1">
                    Spending Categories of{" "}
                    <Text className="font-psemibold text-xl text-[#b31731]">
                      {monthName}
                    </Text>
                    <Text
                      className="text-xl font-pbold text-black  mt-2"
                      style={{
                        fontSize: Platform.select({
                          // <--- Use Platform.select for fontSize
                          ios: 18, // Smaller font size for iOS (e.g., original text-xs)
                          android: 14, // Slightly larger for Android if needed, or keep 10
                        }),
                      }}
                    >
                      {" : "}
                      EGP {receiptStats.monthlySpending.toFixed(2)}
                    </Text>
                  </Text>

                  {categorySpendingData.length > 0 ? (
                    <View className="flex-row items-center justify-center gap-2">
                      <View className="w-[150px] h-[150px] justify-center items-center ">
                        {renderPieChart()}
                      </View>

                      <View className="flex-1 flex-col">
                        <Text className="font-psemibold mb-2 text-blue-800 text-base">
                          👇 View details 👇
                        </Text>
                        {categorySpendingData.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => handlePieChartPress(item)}
                            className="flex-row items-center mb-2 "
                          >
                            <View
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color || "gray" }}
                            />
                            <Text className="text-md font-pregular text-gray-700 underline">
                              {item.name} (
                              {typeof item.percent === "number"
                                ? item.percent.toFixed(1)
                                : "0"}
                              %)
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ) : (
                    <Text className="text-gray-500 italic mt-4">
                      No spending data available.
                    </Text>
                  )}
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
                      onPress={() => {}}
                    >
                      <Text className="font-pextrabold text-xl ">
                        {selectedCategory.name} Details
                      </Text>
                      <Text className="font-pregular text-base mb-2">
                        Total Spending:{" "}
                        {parseFloat(selectedCategory.population).toFixed(2)} EGP
                      </Text>
                      <Text className="text-lg font-bold ">
                        Merchant Breakdown
                      </Text>
                      <Text className="text-sm font-pregular text-gray-600 mb-2 italic">
                        Merchant spending figures are calculated based on the
                        individual item prices from your receipts, prior to any
                        discounts, VAT, or other service charges.
                      </Text>
                      {renderMerchantAnalysisTable()}
                      <TouchableOpacity
                        onPress={closeModal}
                        className="mt-5 py-2.5 px-5 bg-[#4E17B3] rounded-md"
                      >
                        <Text className="text-white text-center">Close</Text>
                      </TouchableOpacity>
                    </Pressable>
                  </Pressable>
                </Modal>
              )}

              {/* Top Spending Insights */}
              {receiptStats.highestSpendingCategory && (
                <View className=" p-4  border-2 rounded-md border-[#9F54B6] mb-4">
                  <Text className="text-base font-pregular text-black mb-2">
                    Top Spending Insight of{" "}
                    <Text className="font-psemibold text-xl text-[#b31731]">
                      {monthName}
                    </Text>
                  </Text>
                  <Text className="text-sm font-pregular text-gray-600 mb-2 italic">
                    Calculation based on the individual item prices from your
                    receipts, prior to any discounts, VAT, or other service
                    charges.
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
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
                      <Text className="text-lg font-semibold text-gray-800 font-psemibold">
                        {receiptStats.highestSpendingCategory.name}
                      </Text>
                    </View>
                    <Text className="text-xl font-bold text-primary-500 font-pbold">
                      EGP{" "}
                      {receiptStats.highestSpendingCategory.amount.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-md text-gray-600 mt-1">
                    (
                    {receiptStats.highestSpendingCategory.percentage.toFixed(1)}
                    % of total)
                  </Text>
                </View>
              )}
              {/* Consolidated Receipts Latest Upload and Search Display Section */}
              {/* Collapsible Search Filter Section */}
              <View className="p-2  mb-1">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-psemibold text-black">
                    Search & Filter
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
                        isSearchFilterExpanded ? icons.action : icons.action
                      } // Toggle icon
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

              {/* Consolidated Receipts Display Section */}
              <View className="p-4 border-2 rounded-md border-[#9F54B6] mb-4  ">
                <Text className="text-lg font-psemibold text-black mb-2">
                  {isSearchActive
                    ? "Search Results"
                    : "Latest Uploaded Receipts"}
                </Text>

                {isSearching ? (
                  <View className="flex-1 justify-center items-center py-8">
                    <ActivityIndicator size="large" color="#9F54B6" />
                    <Text className="text-gray-600 mt-2">Searching...</Text>
                  </View>
                ) : isSearchActive ? (
                  filteredReceipts.length > 0 ? (
                    filteredReceipts.map((item) => (
                      <View
                        key={item.$id}
                        className="flex-row items-center justify-between py-2 border-b border-gray-200 last:border-none"
                      >
                        <View className="flex-row items-center flex-1">
                          <View className="rounded-md p-2 mr-2">
                            <Image
                              source={icons.bill}
                              resizeMode="contain"
                              className="w-7 h-7"
                            />
                          </View>
                          <View className="flex-1">
                            <Text
                              className="text-lg font-semibold text-gray-800 font-psemibold"
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {item.merchant || "Unknown Merchant"}
                            </Text>
                            {item.datetime && (
                              <Text className="text-sm text-gray-600">
                                {new Date(item.datetime).toLocaleDateString()} |
                                {item.total
                                  ? ` EGP ${parseFloat(item.total).toFixed(2)}`
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
                          <Image source={icons.dots} className="w-6 h-6" />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View className="py-4 items-center">
                      <Text className="text-black italic mb-3">
                        No receipts found matching your search criteria.
                      </Text>
                    </View>
                  )
                ) : latestReceipts.length > 0 ? (
                  latestReceipts.map((item) => (
                    <View
                      key={item.$id}
                      className="flex-row items-center justify-between py-2 border-b border-gray-200 last:border-none"
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="rounded-md p-2 mr-2">
                          <Image
                            source={icons.bill}
                            resizeMode="contain"
                            className="w-7 h-7"
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-lg font-semibold text-gray-800 font-psemibold"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {item.merchant || "Unknown Merchant"}
                          </Text>
                          {item.datetime && (
                            <Text className="text-sm text-gray-600">
                              {new Date(item.datetime).toLocaleDateString()} |
                              {item.total
                                ? ` EGP ${parseFloat(item.total).toFixed(2)}`
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
                        <Image source={icons.dots} className="w-6 h-6" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View className="py-4 items-center">
                    <Text className="text-black italic mb-3">
                      ✨ No receipts uploaded yet. Let's get started! ✨
                    </Text>
                    <TouchableOpacity
                      className=" rounded-full   items-center justify-center w-24 h-24 border-2 bg-[#D24726] border-gray-100"
                      onPress={() => setShowUploadModal(true)}
                    >
                      <Image
                        source={icons.camera}
                        className="w-8 h-8 tint-primary"
                        resizeMode="contain"
                        tintColor="#fff"
                      />
                      <Text className="text-white text-sm mt-2 font-semibold">
                        Upload
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

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
                      setShowSearchFilterModal={setShowSearchFilterModal} // <--- Pass the new prop
                    />
                  </Pressable>
                </Pressable>
              </Modal>

              {/* Budget Display/Prompt */}
              {userBudget && userBudget.length > 0 && (
                <View className=" flex  p-4  mb-4    rounded-xl  border-2 border-[#9F54B6] ">
                  <Text className="text-lg font-psemibold text-black mb-2">
                    My Budgets
                  </Text>
                  <View className="w-full max-w-md justify-center items-center">
                    <TouchableOpacity
                      onPress={toggleExpanded} // Toggle expansion on press
                      className="w-full flex flex-row items-center justify-between"
                    >
                      <Text className="text-center text-base font-pregular text-black  mb-4 underline">
                        👇 Expand to Check My Budgets 👇
                      </Text>
                      {/* {isExpanded ? (
                        <>
                          <Image
                            source={icons.up}
                            className="w-6 h-6"
                            // tintColor="#000"
                          />
                        </>
                      ) : (
                        <>
                          <Image
                            source={icons.down}
                            className="w-6 h-6"
                            // tintColor="#000"
                          />
                        </>
                      )} */}
                    </TouchableOpacity>
                    <Collapsible collapsed={!isExpanded}>
                      {isExpanded && (
                        <View>
                          {userBudget.map((budget) => (
                            <TouchableOpacity
                              key={budget.$id}
                              onPress={() => ViewBudget(budget.$id)}
                              className="p-4  mb-4 border-2 rounded-md border-[#fff]"
                            >
                              <Text className="text-[#15493a] text-center font-psemibold text-base">
                                {/* Display category or identifier */}
                                Budget for {getCategoryName(budget.categoryId)}:
                                EGP {budget.budgetAmount.toFixed(2)}
                              </Text>
                              <Text className="text-blue-800 text-center text-sm">
                                View Details
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </Collapsible>
                    {/* <TouchableOpacity
                      onPress={SetupBudget}
                      className=" flex px-4 py-2 items-center justify-center w-28 h-28 border-x-4 border-[#9F54B6] rounded-full mt-2"
                    >
                      <Text className="text-blue-700 text-center font-semibold text-base">
                        Add New Budget
                      </Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity
                      onPress={SetupBudget}
                      className=" p-4 items-center  justify-center "
                    >
                      <Image
                        source={icons.pie} // Reusing pie icon, or use a new one for budget prompt
                        className="w-12 h-12 "
                        resizeMode="contain"
                        tintColor="#15493a" // A color that stands b-4
                      />
                      <Text className="text-[#15493a] font-psemibold text-base text-center">
                        Add New Budget
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {/* {!showBudgetPrompt && (
                  <Text className="text-white italic mb-3">
                    ✨ No receipts uploaded yet. to setup Budget! ✨
                  </Text>
                )} */}
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
              <Text className="text-xl font-bold text-center">
                Receipt Options
              </Text>
              {selectedReceipt && (
                <Text className="text-base text-center font-pregular text-gray-600 mb-2 mt-1">
                  {selectedReceipt.merchant} - EGP{" "}
                  {parseFloat(selectedReceipt.total).toFixed(2)}
                </Text>
              )}
              <TouchableOpacity
                onPress={handleViewDetails}
                className="mt-3 w-full bg-[#4E17B3] rounded-md p-3 items-center justify-center" // Adjust className for your desired style
              >
                <Text className="text-white font-pmedium text-base">
                  View Receipt
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDowanLoadReceipt(selectedReceipt)}
                disabled={isDownloading} // Disable button while downloading
                className="mt-5 w-full bg-[#335a69] rounded-md p-3 items-center justify-center "
              >
                <Text className="text-white font-pmedium text-base">
                  Download Receipt
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteReceipt(selectedReceipt.$id)} // Ensure you pass the correct ID for deletion
                disabled={isDeleting} // Disable button while deleting
                className="mt-5 w-full bg-[#D03957] rounded-md p-3 items-center justify-center"
              >
                <Text className="text-white font-pmedium text-base">
                  Delete Receipt
                </Text>
              </TouchableOpacity>

              {isDownloading && (
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
                  <Text style={{ color: "#FFFFFF", marginTop: 10 }}>
                    Downloading...
                  </Text>
                </View>
              )}

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
                  <ActivityIndicator size="large" color="##FFFFFF" />
                  <Text style={{ color: "#FFFFFF", marginTop: 10 }}>
                    Deleting...
                  </Text>
                </View>
              )}

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

        {/* Optionally, for a full-screen overlay */}

        {/* <--- END NEW: Receipt Options Modal ---/> */}
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
  // --- END NEW STYLES ---
});
export default Home;
