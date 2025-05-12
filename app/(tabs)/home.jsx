import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
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
} from "../../lib/appwrite";
import { router, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import UploadModal from "../../components/UploadModal";
import { PieChart } from "react-native-chart-kit";
import { FlashList } from "@shopify/flash-list"; // Import FlashList

const screenWidth = Dimensions.get("window").width;
const gradientColors = [
  "#D03957",
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
  const navigation = useNavigation();

  const greeting =
    hours < 12
      ? "Good Morning"
      : hours < 18
      ? "Good Afternoon"
      : "Good Evening";

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchData = useCallback(async () => {
    if (user?.$id) {
      setIsLoading(true);
      try {
        const [count, stats, allReceipts] = await Promise.all([
          countUnreadNotifications(user.$id),
          getReceiptStats(user.$id),
          fetchUserReceipts(user.$id),
        ]);
        setUnreadCount(count);
        setReceiptStats(stats);

        const spendingByCategory = {};
        let totalItemsPrice = 0;
        allReceipts.forEach((receipt) => {
          try {
            const items = JSON.parse(receipt.items);
            items.forEach((item) => {
              const category = item.category;
              const price = parseFloat(item.price);
              if (category && !isNaN(price)) {
                spendingByCategory[category] =
                  (spendingByCategory[category] || 0) + price;
                totalItemsPrice += price;
              }
            });
          } catch (error) {
            console.error("Error parsing items:", error);
          }
        });

        const chartData = Object.keys(spendingByCategory).map(
          (category, index) => ({
            name: category,
            population: spendingByCategory[category],
            color: gradientColors[index % gradientColors.length],
            legendFontColor: "#7F7F7F",
            legendFontSize: 12,
            percent:
              totalItemsPrice > 0
                ? (spendingByCategory[category] / totalItemsPrice) * 100
                : 0,
          })
        );
        setCategorySpendingData(chartData);

        const latest = await fetchUserReceipts(user.$id, 5);
        setLatestReceipts(latest);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
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
    return (
      <GradientBackground className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="white" />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <FlashList // Use FlashList here
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            paddingHorizontal: 28,
            paddingTop: 45,
            paddingBottom: 20,
          }}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View className="flex-row justify-between items-center mb-5">
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
              <View className=" p-4  mb-4 border-2 rounded-md border-[#182e4a]">
                <Text className="text-center text-black mb-2 text-lg font-pregular">
                  Total Receipts
                </Text>
                <Text className="text-center text-2xl font-bold text-gray-800 font-pbold">
                  Receipts : {receiptStats.totalCount}
                </Text>
                <Text className="text-center text-base font-pregular text-gray-600">
                  <Text className="text-center text-base font-pregular text-[#4E17B3] mt-1 underline">
                    {"("}
                    {receiptStats.thisMonthCount}
                    {") "}
                  </Text>
                  R this month | Monthly Spending EGP:
                  <Text className="text-center text-base font-pregular text-[#4E17B3] mt-1 underline">
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

              {/* Top Spending Insights */}
              {receiptStats.highestSpendingCategory && (
                <View className=" p-4  border-2 rounded-md border-[#902583] mb-4">
                  <Text className="text-lg font-pregular text-gray-700 mb-2">
                    Top Spending Insight
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
                  <Text className="text-sm text-gray-600 mt-1">
                    (
                    {receiptStats.highestSpendingCategory.percentage.toFixed(1)}
                    % of total)
                  </Text>
                </View>
              )}

              {/* Spending Categories */}
              <View className=" p-4  border-2 rounded-md border-[#373612] mb-4">
                <Text className="text-lg font-pregular text-gray-700 -mb-2">
                  Spending Categories |
                  <Text className="text-lg font-bold text-black font-pbold">
                    Total: EGP {receiptStats.monthlySpending.toFixed(2)}
                  </Text>
                </Text>

                {categorySpendingData.length > 0 ? (
                  <View className="flex-row items-center justify-center">
                    <View className="w-[220px] h-[150px] justify-center items-center ">
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
                        width={160}
                        height={160}
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

                    <View className="flex-1 flex-col">
                      {categorySpendingData.map((item) => (
                        <View
                          key={item.name}
                          className="flex-row items-center mb-2"
                        >
                          <View
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: item.color || "gray" }}
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
                  <Text className="text-gray-500 italic mt-4">
                    No spending data available.
                  </Text>
                )}
              </View>
            </>
          }
          data={latestReceipts}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between py-2 border-2 rounded-md border-[#e4e13a]">
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
                onPress={() => console.log(`Options for receipt ${item.$id}`)}
              >
                <Image source={icons.dots} className="w-6 h-6" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.$id}
          estimatedItemSize={100} // Add estimatedItemSize prop for FlashList
          ListEmptyComponent={
            <View className="py-4 items-center">
              <Text className="text-gray-500 italic mb-3">
                ✨ No receipts uploaded yet. Let's get started! ✨
              </Text>
              <TouchableOpacity
                className="bg-white rounded-full shadow-md items-center justify-center w-24 h-24 border-2 border-primary-500"
                onPress={() => setShowUploadModal(true)}
              >
                <Image
                  source={icons.camera}
                  className="w-8 h-8 tint-primary"
                  resizeMode="contain"
                />
                <Text className="text-primary-500 text-sm mt-2 font-semibold">
                  Upload
                </Text>
              </TouchableOpacity>
            </View>
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
