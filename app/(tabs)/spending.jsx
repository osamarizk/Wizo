import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import UploadModal from "../../components/UploadModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../../context/GlobalProvider"; // Adjust path as needed
import { fetchUserReceipts, getAllCategories } from "../../lib/appwrite"; // Adjust path as needed
import { format } from "date-fns";
import icons from "../../constants/icons"; // Adjust path as needed
import GradientBackground from "../../components/GradientBackground";
const screenWidth = Dimensions.get("window").width;
import { useFocusEffect } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit"; // Import BarChart
import eventEmitter from "../../utils/eventEmitter";

const Spending = () => {
  const {
    user,
    isLoading: globalLoading,
    showUploadModal,
    setShowUploadModal,
  } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allReceipts, setAllReceipts] = useState([]);
  const [categories, setCategories] = useState([]);

  // State for Merchant Analysis
  const [merchantAnalysis, setMerchantAnalysis] = useState([]);
  const [showMerchantDetailsModal, setShowMerchantDetailsModal] =
    useState(false);
  const [selectedMerchantVisits, setSelectedMerchantVisits] = useState([]);
  const [selectedMerchantName, setSelectedMerchantName] = useState("");

  // State for Item Breakdown
  const [itemBreakdown, setItemBreakdown] = useState([]);
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false);
  const [selectedItemPurchases, setSelectedItemPurchases] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState("");

  const fetchData = useCallback(async () => {
    if (!user?.$id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [fetchedReceipts, fetchedCategories] = await Promise.all([
        fetchUserReceipts(user.$id),
        getAllCategories(),
      ]);
      setAllReceipts(fetchedReceipts);
      setCategories(fetchedCategories);

      // --- DEBUGGING: Log fetched receipts ---
      console.log("Fetched Receipts:", fetchedReceipts);

      // --- Process Data for Merchant Analysis ---
      const merchantMap = {};
      fetchedReceipts.forEach((receipt) => {
        const merchant = receipt.merchant || "Unknown Merchant";
        const total = parseFloat(receipt.total) || 0;
        const datetime = receipt.datetime;

        if (!merchantMap[merchant]) {
          merchantMap[merchant] = {
            totalAmount: 0,
            visits: 0,
            visitDates: [], // Store all dates for details
          };
        }
        merchantMap[merchant].totalAmount += total;
        merchantMap[merchant].visits += 1;
        merchantMap[merchant].visitDates.push(datetime);
      });

      const processedMerchantAnalysis = Object.keys(merchantMap).map(
        (merchantName) => ({
          merchant: merchantName,
          totalAmount: merchantMap[merchantName].totalAmount,
          visits: merchantMap[merchantName].visits,
          visitDates: merchantMap[merchantName].visitDates.sort(
            (a, b) => new Date(b) - new Date(a)
          ), // Sort dates descending
        })
      );

      // Sort by visits in descending order and limit to top 5 merchants
      const sortedAndLimitedMerchantAnalysis = processedMerchantAnalysis
        .sort((a, b) => b.visits - a.visits) // Sort by visits descending
        .slice(0, 5); // Take top 5 merchants

      setMerchantAnalysis(sortedAndLimitedMerchantAnalysis);

      // --- DEBUGGING: Log processed merchant analysis ---
      console.log(
        "Processed Merchant Analysis (for table and chart):",
        processedMerchantAnalysis
      );

      // --- Process Data for Item Breakdown ---
      const itemMap = {};
      fetchedReceipts.forEach((receipt) => {
        let itemsArray = [];
        // Check if receipt.items is a string and attempt to parse it
        if (typeof receipt.items === "string") {
          try {
            itemsArray = JSON.parse(receipt.items);
            // console.log(`Successfully parsed items for Receipt ID: ${receipt.$id || 'Unknown'}.`); // Optional: More detailed logging
          } catch (error) {
            console.error(
              `Error parsing items for Receipt ID: ${
                receipt.$id || "Unknown"
              }:`,
              receipt.items,
              error
            );
            // If parsing fails, itemsArray remains an empty array, preventing errors
          }
        } else if (Array.isArray(receipt.items)) {
          // If it's already an array (e.g., from a different data source or prior processing)
          itemsArray = receipt.items;
        } else {
          console.warn(
            `Receipt ID: ${
              receipt.$id || "Unknown"
            } does not have a valid 'items' field (neither string nor array). Found type: ${typeof receipt.items}. Value:`,
            receipt.items
          );
        }

        // Ensure itemsArray is actually an array before iterating
        if (Array.isArray(itemsArray) && itemsArray.length > 0) {
          itemsArray.forEach((item) => {
            // console.log("Processing item", item); // Uncomment for per-item debugging if needed
            const itemName = item.name || "Unknown Item";
            const itemPrice = parseFloat(item.price) || 0;
            const datetime = receipt.datetime;

            if (!itemMap[itemName]) {
              itemMap[itemName] = {
                totalSpend: 0,
                timesBought: 0,
                purchaseDates: [], // Store all dates for details
              };
            }
            itemMap[itemName].totalSpend += itemPrice;
            itemMap[itemName].timesBought += 1;
            itemMap[itemName].purchaseDates.push(datetime);
          });
        } else if (Array.isArray(itemsArray) && itemsArray.length === 0) {
          // console.log(`Receipt ID: ${receipt.$id || 'Unknown'} has an empty parsed 'items' array.`); // Optional: More detailed logging
        }
      });

      const processedItemBreakdown = Object.keys(itemMap).map((itemName) => ({
        item: itemName,
        totalSpend: itemMap[itemName].totalSpend,
        timesBought: itemMap[itemName].timesBought,
        purchaseDates: itemMap[itemName].purchaseDates.sort(
          (a, b) => new Date(b) - new Date(a)
        ), // Sort dates descending
      }));

      // Sort by total spend in descending order (or timesBought, based on preference)
      const sortedItemBreakdown = processedItemBreakdown.sort(
        (a, b) => b.totalSpend - a.totalSpend
      );
      console.log("processedItemBreakdown", sortedItemBreakdown); // Your requested log
      setItemBreakdown(sortedItemBreakdown);

      // --- DEBUGGING: Log processed item breakdown ---
      console.log("Processed Item Breakdown:", processedItemBreakdown);
    } catch (error) {
      console.error("Error fetching spending data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.$id]);

  // Use useEffect to listen for the global refresh event
  useEffect(() => {
    const handleGlobalRefresh = () => {
      console.log(
        "Spending: Global refresh event received. Triggering fetchData."
      );
      fetchData();
    };

    eventEmitter.on("refreshHome", handleGlobalRefresh); // Listen for 'refreshHome' event

    return () => {
      eventEmitter.off("refreshHome", handleGlobalRefresh);
    };
  }, [fetchData]);

  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  // This is the crucial part for refreshing when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // This will be called every time the Spending screen comes into focus
      setRefreshing(true);
      fetchData();
    }, [fetchData])
  );
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
  }, [fetchData]);

  const openMerchantDetails = (merchantName, visitDates) => {
    setSelectedMerchantName(merchantName);
    setSelectedMerchantVisits(visitDates);
    setShowMerchantDetailsModal(true);
  };

  const openItemDetails = (itemName, purchaseDates) => {
    setSelectedItemName(itemName);
    setSelectedItemPurchases(purchaseDates);
    setShowItemDetailsModal(true);
  };

  // Prepare data for the Merchant Visits Bar Chart
  // This will be created based on the current 'merchantAnalysis' state.
  const merchantVisitsChartData = {
    labels: merchantAnalysis.map((data) => data.merchant),
    datasets: [
      {
        data: merchantAnalysis.map((data) => data.visits),
      },
    ],
  };

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

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "#fff",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#fff",
    backgroundGradientToOpacity: 0,
    // color: gradientColors[index % gradientColors.length],
    // color: (opacity = 1) => `rgba(78, 23, 179,$[opacity])`, // #9F54B6
    color: (opacity = 1) => `rgba(255,0,0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, 1)`,
    // style: {
    //   borderRadius: 16,
    //   fontFamily: "Bogle-Regular",
    // },
    // // propsForBackgroundLines: {
    // //   strokeWidth: 6,
    // //   stroke: "#efefef",
    // //   strokeDasharray: "0",
    // // },
    // propsForLabels: {
    //   fontFamily: "Bogle-Regular",
    // },
    strokeWidth: 20, // optional, default 3
    barPercentage: 1.2,
    useShadowColorFromDataset: false, // optional
    fillShadowGradient: "#D03957", // Gradient color for the bars
    fillShadowGradientOpacity: 1, // Opacity for the gradient fill
    decimalPlaces: 0, // No decimal places for visits
    propsForLabels: {
      fontSize: 10, // Adjust label font size if names are long to prevent overlap
    },
    horizontalLabelRotation: 15,
    verticalLabelRotation: 35,
    // Optional: Add a small horizontal offset to labels if they overlap excessively.
    // This is a common issue with many labels on small screens.
    // labelCount: 5, // You could limit the number of labels if there are too many
  };

  if (isLoading || globalLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white mt-4 font-pextralight text-lg">
          Loading spending insights...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className=" flex-1">
        <ScrollView
          className="w-full h-full p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="flex-row justify-between items-center mb-6 mt-4  ">
            <Text className="text-lg font-pbold text-black">
              Spending Insights
            </Text>
            <Image
              source={icons.activity} // Use your eye icon
              className="w-5 h-5  right-48"
              tintColor="#9F54B6"
              resizeMode="contain"
            />
          </View>

          {allReceipts.length === 0 ? (
            <View className="flex-1 justify-center items-center h-[500px]">
              <Text className="text-gray-300 text-lg font-pmedium">
                No receipts uploaded yet. Start tracking your spending!
              </Text>
            </View>
          ) : (
            <>
              {/* Merchant Analysis Table */}
              <View className="p-4 border-2 rounded-md border-[#9F54B6] mb-4">
                {/* <Text className="text-lg font-bold text-black mb-4">
                  Merchant Analysis
                </Text> */}
                {/* Bar Chart for Merchant Visits */}
                {/* Ensure merchantAnalysis has data to render the chart */}
                {merchantAnalysis.length > 0 ? ( // Only render if there's data
                  <View className="mb-2">
                    <Text className="text-lg font-pbold text-black mb-1 text-center">
                      Merchant Visits Overview
                    </Text>
                    <Text className="text-sm text-gray-600 p-1 text-center">
                      Displaying top 5 merchants by visits (default). Chart
                      settings for this limit can be adjusted from the app's
                      settings section.
                    </Text>
                    <BarChart
                      data={merchantVisitsChartData}
                      showBarTops={false}
                      width={screenWidth - 64} // Adjust width to fit within padding
                      withInnerLines={true}
                      segments={3}
                      height={280}
                      yAxisLabel="" // Label for Y-axis (e.g., "Visits")
                      chartConfig={chartConfig}
                      verticalLabelRotation={25} // Rotate labels to fit more on X-axis
                      fromZero={true} // Start Y-axis from zero
                      showValuesOnTopOfBars={true} // Show actual values on top of bars
                      flatColor={true}
                      style={{
                        flex: 1,
                        paddingRight: 25,
                        marginVertical: 2,
                        borderRadius: 50,
                        marginBottom: 20,
                      }}
                      // If labels still overlap, you might need to adjust height or rotation
                      // or implement custom labels for better control.
                    />
                  </View>
                ) : (
                  <Text className="text-gray-500 italic text-center mb-4">
                    No merchant data available for charting.
                  </Text>
                )}

                <View className="flex-row bg-gray-300 py-2 px-3 border-b border-gray-300 rounded-t-md">
                  <Text className="flex-1 font-pbold text-black text-sm">
                    Merchant
                  </Text>
                  <Text className="w-1/4 font-pbold text-black text-sm text-right">
                    Total (EGP)
                  </Text>
                  <Text className="w-1/6 font-pbold text-black text-sm text-right">
                    Visits
                  </Text>
                  <Text className="w-1/6 font-pbold text-black text-sm text-center">
                    View
                  </Text>
                </View>
                {merchantAnalysis.length > 0 ? (
                  merchantAnalysis.map((data, index) => (
                    <View
                      key={data.merchant}
                      className={`flex-row py-2 px-3 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-b border-gray-200 last:border-none`}
                    >
                      <Text className="flex-1 text-gray-800 text-sm">
                        {data.merchant}
                      </Text>
                      <Text className="w-1/4 text-gray-800 text-sm text-right">
                        {data.totalAmount.toFixed(2)}
                      </Text>
                      <Text className="w-1/6 text-gray-800 text-sm text-right">
                        {data.visits}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          openMerchantDetails(data.merchant, data.visitDates)
                        }
                        className="w-1/6 items-center justify-center"
                      >
                        <Image
                          source={icons.eye} // Use your eye icon
                          className="w-5 h-5 tint-blue-500"
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View className="py-4 items-center bg-white rounded-b-md">
                    <Text className="text-gray-500 italic">
                      No merchant data available.
                    </Text>
                  </View>
                )}
              </View>

              {/* Items Break Down Table */}
              <View className="p-4 border-2 rounded-md border-[#9F54B6] mb-4">
                <Text className="text-lg font-bold text-black mb-4">
                  Items Break Down
                </Text>
                <View className="flex-row bg-gray-300 py-2 px-3 border-b border-gray-300 rounded-t-md">
                  <Text className="flex-1 font-pbold text-gray-700 text-sm">
                    Item
                  </Text>
                  <Text className="w-1/4 font-pbold text-gray-700 text-sm text-right">
                    Total Spend
                  </Text>
                  <Text className="w-1/6 font-pbold text-gray-700 text-sm text-right">
                    Times Bought
                  </Text>
                  <Text className="w-1/6 font-pbold text-gray-700 text-sm text-center">
                    View
                  </Text>
                </View>
                {itemBreakdown.length > 0 ? (
                  itemBreakdown.map((data, index) => (
                    <View
                      key={data.item}
                      className={`flex-row py-2 px-3 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-b border-gray-200 last:border-none`}
                    >
                      <Text className="flex-1 text-gray-800 text-sm">
                        {data.item}
                      </Text>
                      <Text className="w-1/4 text-gray-800 text-sm text-right">
                        {data.totalSpend.toFixed(2)}
                      </Text>
                      <Text className="w-1/6 text-gray-800 text-sm text-right">
                        {data.timesBought}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          openItemDetails(data.item, data.purchaseDates)
                        }
                        className="w-1/6 items-center justify-center"
                      >
                        <Image
                          source={icons.eye} // Use your eye icon
                          className="w-5 h-5 tint-blue-500"
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View className="py-4 items-center bg-white rounded-b-md">
                    <Text className="text-gray-500 italic">
                      No item data available.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* Merchant Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showMerchantDetailsModal}
          onRequestClose={() => setShowMerchantDetailsModal(false)}
        >
          <Pressable
            style={styles.centeredView}
            onPress={() => setShowMerchantDetailsModal(false)}
          >
            <View style={styles.modalView}>
              <Text className="text-xl font-pbold mb-4 text-center">
                Visits for {selectedMerchantName}
              </Text>
              <ScrollView className="w-full max-h-[300px] mb-4">
                {selectedMerchantVisits.length > 0 ? (
                  selectedMerchantVisits.map((date, index) => (
                    <Text key={index} className="text-base text-gray-700 py-1">
                      {format(new Date(date), "MMM dd,̋ - hh:mm a")}
                    </Text>
                  ))
                ) : (
                  <Text className="text-gray-500 italic text-center">
                    No visit dates available.
                  </Text>
                )}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowMerchantDetailsModal(false)}
                className="bg-red-500 p-3 rounded-lg w-full items-center"
              >
                <Text className="text-white font-pbold text-lg">Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Item Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showItemDetailsModal}
          onRequestClose={() => setShowItemDetailsModal(false)}
        >
          <Pressable
            style={styles.centeredView}
            onPress={() => setShowItemDetailsModal(false)}
          >
            <View style={styles.modalView}>
              <Text className="text-xl font-pbold mb-4 text-center">
                Purchases for {selectedItemName}
              </Text>
              <ScrollView className="w-full max-h-[300px] mb-4">
                {selectedItemPurchases.length > 0 ? (
                  selectedItemPurchases.map((date, index) => (
                    <Text key={index} className="text-base text-gray-700 py-1">
                      {format(new Date(date), "MMM dd,̋ - hh:mm a")}
                    </Text>
                  ))
                ) : (
                  <Text className="text-gray-500 italic text-center">
                    No purchase dates available.
                  </Text>
                )}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowItemDetailsModal(false)}
                className="bg-red-500 p-3 rounded-lg w-full items-center"
              >
                <Text className="text-white font-pbold text-lg">Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal
            visible={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={onRefresh}
          />
        )}
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
    width: screenWidth * 0.9,
  },
});

export default Spending;
