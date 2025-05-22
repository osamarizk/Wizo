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
  "#D03957",
  "#F4A261",
  "#2A9D8F",
  "#4E17B3",
  "#8AC926",
  "#9F54B6",
  "#D24726",
  "#6D83F2",
  "#D24726",
  "#2A9D8F",
  "#4E17B3",
  "#8AC926",
  "#D03957",
  "#F4A261",
  "#2A9D8F",
];

const Home = () => {
  const hours = new Date().getHours();
  const {
    user,
    showUploadModal,
    setShowUploadModal,
    loading: globalLoading,
    checkBudgetInitialization,
  } = useGlobalContext();
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
    // New state for monthly spending data
    labels: [],
    datasets: [{ data: [] }],
  });

  const [showSpendingModal, setShowSpendingModal] = useState(true);
  const [categoryMerchantAnalysis, setCategoryMerchantAnalysis] = useState([]); // New state for merchant analysis

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
        console.log("stats", stats);
        // console.log("allReceipts", allReceipts);

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

  if (isLoading || globalLoading) {
    return (
      <GradientBackground className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="white" />
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
              {/* Header */}
              <View className="flex-row justify-between items-center mb-5 mt-3">
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
                  <Text className="text-center text-md font-pregular text-gray-600">
                    <Text className="text-center text-base font-pregular text-[#D03957] mt-1 underline">
                      {"("}
                      {receiptStats.thisMonthCount}
                      {") "}
                    </Text>
                    R on {monthName} | {monthName} Spending EGP:
                    <Text className="text-center text-base font-pregular text-[#D03957] mt-1 underline">
                      {receiptStats.monthlySpending.toFixed(2)}
                    </Text>
                  </Text>
                  <Text className="text-center text-base font-pregular text-black mt-1">
                    Last Receipt:
                    <Text className="text-center text-base font-pregular text-[#D03957] mt-1 underline">
                      {" "}
                      {receiptStats.latestDate}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Top Spending Insights */}
              {receiptStats.highestSpendingCategory && (
                <View className=" p-4  border-2 rounded-md border-[#9F54B6] mb-4">
                  <Text className="text-base font-pregular text-gray-700 mb-2">
                    Top Spending Insight of{" "}
                    <Text className="font-psemibold text-xl text-[#D03957]">
                      {monthName}
                    </Text>
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
              <View className=" p-2  border-2 rounded-md border-[#9F54B6] mb-4">
                <Text className="text-base font-pregular text-gray-700 -mb-1">
                  Spending Categories of{" "}
                  <Text className="font-psemibold text-xl text-[#D03957]">
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
                <Text className="text-lg font-semibold text-[#4E17B3] mb-2">
                  Latest Receipts
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
                        onPress={() =>
                          console.log(`Options for receipt ${item.$id}`)
                        }
                      >
                        <Image source={icons.dots} className="w-6 h-6" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View className="py-4 items-center">
                    <Text className="text-gray-500 italic mb-3">
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
              <View className=" flex items-center p-4  mb-4   backdrop-blur-sm shadow-md shadow-[#878fe7]  rounded-xl  border-2 border-[#9F54B6] ">
                {userBudget && userBudget.length > 0 ? (
                  <View className="w-full max-w-md justify-center items-center">
                    <TouchableOpacity
                      onPress={toggleExpanded} // Toggle expansion on press
                      className="w-full flex flex-row items-center justify-between"
                    >
                      <Text className="text-center text-xl font-pbold text-gray-800  mb-4">
                        Expand to Check Your Budgets
                      </Text>
                      {isExpanded ? (
                        <>
                          <Image
                            source={icons.up}
                            className="w-7 h-7"
                            tintColor="#9F54B6"
                          />
                        </>
                      ) : (
                        <>
                          <Image
                            source={icons.down}
                            className="w-7 h-7"
                            tintColor="#9F54B6"
                          />
                        </>
                      )}
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
                              <Text className="text-gray-700 text-center font-pregular text-base">
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
                    <TouchableOpacity
                      onPress={SetupBudget}
                      className=" flex px-4 py-2 items-center justify-center w-28 h-28 border-x-4 border-[#9F54B6] rounded-full mt-2"
                    >
                      <Text className="text-blue-700 text-center font-semibold text-base">
                        Add New Budget
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  showBudgetPrompt && (
                    <TouchableOpacity
                      onPress={SetupBudget}
                      className=" flex px-4 py-2 items-center justify-center w-28 h-28 border-x-4 border-[#9F54B6] rounded-full"
                    >
                      <Image
                        source={icons.pie}
                        className="w-12 h-12 "
                        resizeMode="contain"
                        tintColor="#fff"
                      />
                      <Text className="text-[#4E17B3] text-center font-psemibold text-base mt-2">
                        Set Up Budget
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
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
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Home;
