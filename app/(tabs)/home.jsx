import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import GradientBackground from "../../components/GradientBackground";
import { useGlobalContext } from "../../context/GlobalProvider";
import icons from "../../constants/icons";
import {
  countUnreadNotifications,
  getReceiptStats,
  fetchUserReceipts, // Import this function
} from "../../lib/appwrite";
import { router, useNavigation } from "expo-router"; // Import useNavigation
import { useFocusEffect } from "@react-navigation/native";
import UploadModal from "../../components/UploadModal";
import { PieChart } from "react-native-chart-kit"; // Import PieChart

const screenWidth = Dimensions.get("window").width;
const gradientColors = [
  "#9F54B6",
  "#2A9D8F",
  "#8AC926",
  "#D24726",
  "#6D83F2",
  "#F4A261",
];

const Home = () => {
  const hours = new Date().getHours();
  const {
    user,
    showUploadModal,
    setShowUploadModal,
    loading: globalLoading,
  } = useGlobalContext(); // Assuming you have a 'loading' state in your global context
  const [latestReceipts, setLatestReceipts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [receiptCount, setReceiptCount] = useState(0);
  const [receiptStats, setReceiptStats] = useState({
    totalCount: 0,
    thisMonthCount: 0,
    monthlySpending: 0,
    latestDate: "N/A",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categorySpendingData, setCategorySpendingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Local loading state
  const navigation = useNavigation(); // Get navigation object

  const greeting =
    hours < 12
      ? "Good Morning"
      : hours < 18
      ? "Good Afternoon"
      : "Good Evening";

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(); // Call fetchData on refresh
    setRefreshing(false);
  };

  const fetchData = useCallback(async () => {
    if (user?.$id) {
      setIsLoading(true); // Set local loading to true
      try {
        const [count, stats, allReceipts] = await Promise.all([
          countUnreadNotifications(user.$id),
          getReceiptStats(user.$id),
          fetchUserReceipts(user.$id), // Fetch all user receipts for category calculation
        ]);
        setUnreadCount(count);
        setReceiptStats(stats);

        // Process receipts for category spending
        const spendingByCategory = {};
        allReceipts.forEach((receipt) => {
          try {
            const items = JSON.parse(receipt.items);
            items.forEach((item) => {
              const category = item.category;
              const price = parseFloat(item.price);
              if (category && !isNaN(price)) {
                spendingByCategory[category] =
                  (spendingByCategory[category] || 0) + price;
              }
            });
          } catch (error) {
            console.error("Error parsing items:", error);
          }
        });

        const totalSpending = stats?.monthlySpending;

        const chartData = Object.keys(spendingByCategory).map(
          (category, index) => ({
            name: category,
            population: spendingByCategory[category],
            color: gradientColors[index % gradientColors.length],
            legendFontColor: "#7F7F7F",
            legendFontSize: 12,
            percent:
              typeof spendingByCategory[category] === "number" &&
              typeof totalSpending === "number" &&
              totalSpending !== 0
                ? (spendingByCategory[category] / totalSpending) * 100
                : 0,
          })
        );
        setCategorySpendingData(chartData);

        // Fetch latest 5 receipts separately
        const latest = await fetchUserReceipts(user.$id, 5);
        setLatestReceipts(latest);
        console.log("latest receipts", latest);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Set local loading to false
      }
    }
  }, [user]);

  useEffect(() => {
    if (user?.$id && !globalLoading) {
      fetchData();
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
    // Loading indicator
    return (
      <GradientBackground className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="white" />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 40,
            paddingBottom: 80,
          }}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-base text-gray-500 font-pregular">
                    {greeting}
                  </Text>
                  <Text className="text-xl font-pbold text-center">
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
                  <Image source={icons.notification} className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Receipt Summary */}
              <View className="bg-white p-4 rounded-xl mb-4 border-2 border-[#9F54B6]">
                <Text className="text-center text-black mb-2 text-base font-pregular">
                  Total Receipts
                </Text>
                <Text className="text-center text-2xl font-pbold text-gray-800">
                  Receipts : {receiptStats.totalCount}
                </Text>
                <Text className="text-center text-base font-pregular text-black">
                  <Text className="text-center text-base font-pregular  text-[#4E17B3] mt-1 underline">
                    {"("}
                    {receiptStats.thisMonthCount}
                    {") "}
                  </Text>
                  R this month | Monthly Spending EGP:{" "}
                  <Text className="text-center text-base font-pregular  text-[#4E17B3] mt-1 underline">
                    {receiptStats.monthlySpending.toFixed(2)}
                  </Text>
                </Text>
                <Text className="text-center text-base font-pregular text-black mt-1">
                  Last Receipt:
                  <Text className="text-center text-base font-pregular text-[#4E17B3] mt-1 underline">
                    {" "}
                    {receiptStats.latestDate}
                  </Text>
                </Text>
              </View>

              {/* Spending Categories */}
              <View className="bg-white p-4 rounded-2xl border-2 border-[#9F54B6] mb-4">
                <Text className="font-pregular text-base text-gray-700 mb-1">
                  Spending Categories |{" "}
                  <Text className="text-base font-pbold text-black ">
                    Total: EGP {receiptStats.monthlySpending.toFixed(2)}
                  </Text>
                </Text>

                {categorySpendingData.length > 0 ? (
                  <View className="flex-row items-center justify-center gap-2 ">
                    {/* Donut Chart Container */}
                    <View className="w-[220px] h-[170px] justify-center items-center -mr-9 ">
                      <PieChart
                        data={categorySpendingData.map((data) => ({
                          ...data,
                          percent:
                            typeof data.population === "number" &&
                            typeof receiptStats.monthlySpending === "number" &&
                            receiptStats.monthlySpending !== 0
                              ? (data.population /
                                  receiptStats.monthlySpending) *
                                100
                              : 0,
                        }))}
                        width={180}
                        height={190}
                        chartConfig={{
                          color: (opacity = 1, index) =>
                            categorySpendingData[index]?.color ||
                            `rgba(26, 142, 255, ${opacity})`,
                          strokeWidth: 2,
                          useShadowColorFromDataset: false,
                          decimalPlaces: 1,
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={0}
                        center={[0, 0]}
                        hasLegend={false}
                        innerRadius={70}
                        outerRadius={90}
                        stroke={"#E0E0E0"}
                        strokeWidth={2}
                        style={{ marginRight: 0 }}
                      />
                    </View>

                    {/* Legend Container */}
                    <View className="flex-col flex-1">
                      {categorySpendingData.map((item, index) => (
                        <View
                          key={item.name}
                          className="flex-row items-center mb-2"
                        >
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: item.color || "gray",
                              marginRight: 8,
                            }}
                          />
                          <Text className="text-md font-pregular text-gray-700">
                            {item.name} (
                            {typeof item.percent === "number"
                              ? item.percent.toFixed(1)
                              : "0"}
                            %)
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text className="text-gray-500 mt-5  text-base italic">
                    No spending data available.
                  </Text>
                )}
              </View>

              {/* Latest Receipts */}
              <View className="bg-white p-4 rounded-2xl border-2 border-[#9F54B6] mb-4">
                <Text className="font-pregular text-xl text-gray-700 mb-2 underline">
                  Latest Receipts
                </Text>
                {latestReceipts.length > 0 ? (
                  latestReceipts.map((receipt) => (
                    <View
                      key={receipt.$id}
                      className="flex-row items-center justify-between py-2"
                    >
                      <View className="flex-row items-center flex-1">
                        <View className=" rounded-md p-2 mr-2">
                          <Image
                            source={icons.bill}
                            resizeMode="contain"
                            style={{ width: 30, height: 30 }}
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="font-psemibold text-md text-gray-800"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {receipt.merchant || "Unknown Merchant"}
                          </Text>
                          {receipt.datetime && (
                            <Text className="text-sm text-gray-600">
                              {new Date(receipt.datetime).toLocaleDateString()}
                              {" |"}
                              {receipt.total
                                ? ` EGP ${parseFloat(receipt.total).toFixed(2)}`
                                : ""}
                            </Text>
                          )}
                        </View>
                      </View>
                      {/* Options Button */}
                      <TouchableOpacity
                        onPress={
                          () =>
                            console.log(`Options for receipt ${receipt.$id}`)
                          // Implement your logic to show options for this receipt (e.g., a modal or state update)
                        }
                      >
                        <Image
                          source={icons.dots}
                          style={{ width: 25, height: 25 }}
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View className="py-4 items-center">
                    <Text className="text-gray-500 italic mb-8  text-base">
                      ✨No receipts uploaded yet. Let's get started!✨
                    </Text>
                    {/* Circular Upload Button */}
                    <TouchableOpacity
                      className="bg-secondary rounded-full shadow-sm shadow-secondary items-center justify-center w-24 h-24 border-2 border-white"
                      onPress={() => setShowUploadModal(true)}
                    >
                      <Image
                        source={icons.camera} // Assuming you have a camera icon in your icons object
                        style={{ width: 35, height: 35, tintColor: "white" }} // Adjust tintColor to match your tab bar icon
                        resizeMode="contain"
                      />
                      <Text className="text-primary-500 text-base mt-1 font-pregular text-white">
                        Upload
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          }
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
