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
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import GradientBackground from "../../components/GradientBackground";
import { useGlobalContext } from "../../context/GlobalProvider";
import icons from "../../constants/icons";
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
} from "../../lib/appwrite";
import { router, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import UploadModal from "../../components/UploadModal";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import { FlashList } from "@shopify/flash-list"; // Import FlashList
import Collapsible from "react-native-collapsible"; // Import the collapsible component
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"; // Added

const screenWidth = Dimensions.get("window").width;
const gradientColors = [
  "#D03957", // Red
  "#F4A261", // Orange
  "#2A9D8F", // Teal
  "#F9C74F", //Yellow
  "#90BE6D", // Green
  "#4E17B3", // Purple
  "#8AC926", // Lime Green
  "#9F54B6", // Darker Purple
  "#E76F51", // Coral
  "#264653", // Dark Blue
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

  // NEW STATE FOR POINTS AND BADGES
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [showPointsBadgeModal, setShowPointsBadgeModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [showReceiptOptionsModal, setShowReceiptOptionsModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null); // Stores the receipt object when dots are clicked

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
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };
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
        const currentPoints = await getUserPoints(user.$id);
        setUserTotalPoints(currentPoints?.points || 0);

        const earnedBadges = await getUserEarnedBadges(user.$id);
        setUserBadges(earnedBadges);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

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
  useEffect(() => {
    if (user?.$id && !globalLoading) {
      fetchData();
      // uploadInitialData();
    }
  }, [user, fetchData, globalLoading]);

  useFocusEffect(
    useCallback(() => {
      if (user?.$id && !globalLoading) {
        fetchData();
      }
    }, [user, fetchData, globalLoading])
  );

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
  // Monthly data
  // const handlePieChartPress = (item) => {
  //   setSelectedCategory(item); // Store the selected category data
  //   setShowSpendingModal(true);

  //   // Process data for the bar chart
  //   const monthlyData = {};
  //   allReceipts.forEach((receipt) => {
  //     try {
  //       const items = JSON.parse(receipt.items);
  //       const receiptDate = new Date(receipt.datetime);
  //       const monthYear = `${receiptDate.getFullYear()}-${(
  //         receiptDate.getMonth() + 1
  //       )
  //         .toString()
  //         .padStart(2, "0")}`;

  //       items.forEach((receiptItem) => {
  //         if (receiptItem.category === item.name) {
  //           // Match by category name
  //           const price = parseFloat(receiptItem.price);
  //           if (!isNaN(price)) {
  //             monthlyData[monthYear] = (monthlyData[monthYear] || 0) + price;
  //           }
  //         }
  //       });
  //     } catch (error) {
  //       console.error("Error parsing items for monthly data:", error);
  //     }
  //   });

  //   // Sort months and prepare data for BarChart
  //   const sortedMonths = Object.keys(monthlyData).sort();
  //   const labels = sortedMonths.map((month) => {
  //     const [year, monthNum] = month.split("-");
  //     return new Date(year, monthNum - 1).toLocaleString("default", {
  //       month: "short",
  //     });
  //   });
  //   const dataPoints = sortedMonths.map((month) => monthlyData[month]);

  //   setCategoryMonthlySpending({
  //     labels: labels,
  //     datasets: [{ data: dataPoints }],
  //   });
  // };

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

  // Navigate to notification screen
  const goToNotifications = () => {
    router.push("/notifications");
  };

  // Navigate to wallet screen
  const goToWallet = () => {
    router.push("/wallet");
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
  const handleViewDetails = () => {
    if (selectedReceipt) {
      // Assuming you have a route like '/receipt-details/[id]'
      router.push(`/receipt-details/${selectedReceipt.$id}`);
    }
    setShowReceiptOptionsModal(false);
    setSelectedReceipt(null);
  };

  const handleEditReceipt = () => {
    if (selectedReceipt) {
      // Assuming you have a route like '/edit-receipt/[id]'
      router.push(`/edit-receipt/${selectedReceipt.$id}`);
    }
    setShowReceiptOptionsModal(false);
    setSelectedReceipt(null);
  };

  const handleDeleteReceipt = () => {
    if (!selectedReceipt) return;

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
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  // --- NEW RECEIPT OPTIONS HANDLERS END ---

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1 ">
        <FlashList // Use FlashList here
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            paddingHorizontal: 25,
            paddingTop: 25,
            paddingBottom: 40,
          }}
          ListHeaderComponent={
            <>
              {/* Header Section */}
              <View className="flex-row justify-between items-center mb-2 mt-1">
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
              <View className="flex-row items-center justify-between mb-2">
                <View className=" mt-2">
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
                  <View className="mx-4   p-4  rounded-xl backdrop-blur-sm bg-transparent items-center">
                    {/* <Image
                    source={icons.pie} // Reusing pie icon, or use a new one for budget prompt
                    className="w-12 h-12 mb-3"
                    resizeMode="contain"
                    tintColor="#9F54B6" // A color that stands b-4
                  />
                  <Text className="text-lg font-psemibold text-gray-800 text-center mb-3">
                    Ready to take control of your spending?
                  </Text> */}
                    {/* <Text className="text-base font-pregular text-gray-600 text-center mb-4">
                    Set up your first budget to track your expenses and achieve
                    your financial goals!
                  </Text> */}
                    <TouchableOpacity
                      onPress={SetupBudget}
                      className=" p-4 items-center  justify-center "
                    >
                      <Image
                        source={icons.pie} // Reusing pie icon, or use a new one for budget prompt
                        className="w-12 h-12 "
                        resizeMode="contain"
                        tintColor="#9F54B6" // A color that stands b-4
                      />
                      <Text className="text-gray-700 font-pregular text-base text-center">
                        {`Set up your budget Now \n to track your spending!`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
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
              {/* Receipt Summary */}
              <View className=" p-1  mb-4 border-2 rounded-md border-[#9F54B6]">
                <TouchableOpacity
                  onPress={() => router.push("/notification")}
                  className="relative p-2 rounded-full mt-1"
                >
                  <Text className="text-center text-gray-600 mb-2 text-base font-pregular">
                    Total Receipts
                  </Text>
                  <Text className="text-center text-2xl font-bold text-gray-800 ">
                    Receipts : {receiptStats.totalCount}
                  </Text>
                  <Text className="text-center text-base font-pregular text-gray-600">
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

              {/* Top Spending Insights */}
              {receiptStats.highestSpendingCategory && (
                <View className=" p-4  border-2 rounded-md border-[#9F54B6] mb-4">
                  <Text className="text-base font-pregular text-black mb-2">
                    Top Spending Insight of{" "}
                    <Text className="font-psemibold text-xl text-[#4E17B3]">
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

              {/* Spending Categories Charts */}
              {receiptStats.monthlySpending > 0 && (
                <View className=" p-2  border-2 rounded-md border-[#9F54B6] mb-4">
                  <Text className="text-base font-pregular text-black -mb-1">
                    Spending Categories of{" "}
                    <Text className="font-psemibold text-xl text-[#4E17B3]">
                      {monthName}
                    </Text>
                    <Text className="text-xl font-bold text-black font-pbold mt-2">
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
                        <Text className="font-psemibold mb-2 text-blue-600 text-base">
                          👇 check details 👇
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

              {/* Latest Receipts Section */}
              <View className="p-4 border-2 rounded-md border-[#9F54B6] mb-4">
                <Text className="text-lg font-semibold text-black mb-2">
                  Latest Uplaoded Receipts
                </Text>
                {latestReceipts.length > 0 ? (
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
                          setSelectedReceipt(item); // Set the selected receipt
                          setShowReceiptOptionsModal(true); // Show the modal
                        }}
                        className="p-2" // Add some padding for easier tap target
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
                        Expand to Check My Budgets
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
                              className="p-4  mb-4 border-2 rounded-md border-[#9F54B6]"
                            >
                              <Text className="text-black text-center font-pregular text-base">
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
                        tintColor="#000" // A color that stands b-4
                      />
                      <Text className="text-black font-pregular text-base text-center">
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
            onRefresh={onRefresh}
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
              style={styles.receiptOptionsModalView}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.modalTitle}>Receipt Options</Text>
              {selectedReceipt && (
                <Text style={styles.modalSubtitle}>
                  {selectedReceipt.merchant} - EGP{" "}
                  {parseFloat(selectedReceipt.total).toFixed(2)}
                </Text>
              )}

              <TouchableOpacity
                style={styles.modalOptionButton}
                onPress={handleViewDetails}
              >
                <Text style={styles.modalOptionText}>View Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOptionButton}
                onPress={handleEditReceipt}
              >
                <Text style={styles.modalOptionText}>Edit Receipt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalOptionButton,
                  { backgroundColor: "#ef4444" },
                ]} // Red background for delete
                onPress={handleDeleteReceipt}
              >
                <Text style={[styles.modalOptionText, { color: "white" }]}>
                  Delete Receipt
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonClose, { marginTop: 20 }]} // Reuse existing button style
                onPress={() => setShowReceiptOptionsModal(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
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
