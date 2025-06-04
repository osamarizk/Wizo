import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import { useGlobalContext } from "../../context/GlobalProvider"; // Adjust path as needed
import {
  fetchUserReceipts,
  getAllCategories,
  getMonthlyReceiptSummary,
} from "../../lib/appwrite"; // Adjust path as needed
import { format } from "date-fns";
import icons from "../../constants/icons"; // Adjust path as needed
import GradientBackground from "../../components/GradientBackground";
import { useFocusEffect } from "@react-navigation/native";
const screenWidth = Dimensions.get("window").width;

const Spending = () => {
  const { user, isLoading: globalLoading } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allReceipts, setAllReceipts] = useState([]);
  const [categories, setCategories] = useState([]);

  const isMounted = useRef(false);

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

  // NEW STATES FOR MONTHLY SUMMARY CHART AND MODAL
  const [monthlySummary, setMonthlySummary] = useState([]); // Stores data from getMonthlyReceiptSummary
  const [showMonthlyDetailsModal, setShowMonthlyDetailsModal] = useState(false);
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null); // Stores details of the clicked month

  useEffect(() => {
    isMounted.current = true;
    console.log("Spending: Component Mounted");
    return () => {
      isMounted.current = false; // Set to false on unmount
      console.log("Spending: Component Unmounted");
    };
  }, []);
  const fetchData = useCallback(async () => {
    if (!user?.$id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [fetchedReceipts, fetchedCategories, fetchedMonthlySummary] =
        await Promise.all([
          // <--- ADD fetchedMonthlySummary
          fetchUserReceipts(user.$id),
          getAllCategories(),
          getMonthlyReceiptSummary(user.$id), // <--- Call the new function
        ]);
      setAllReceipts(fetchedReceipts);
      setCategories(fetchedCategories);
      setMonthlySummary(fetchedMonthlySummary); // <--- Set the monthly summary state

      console.log("Fetched Monthly Summary:", monthlySummary);
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
      setMerchantAnalysis(processedMerchantAnalysis);

      // --- Process Data for Item Breakdown ---
      const itemMap = {};
      fetchedReceipts.forEach((receipt) => {
        try {
          const items = JSON.parse(receipt.items || "[]");
          const receiptDate = receipt.datetime;

          items.forEach((item) => {
            const itemName = item.name || "Unknown Item";
            const itemPrice = parseFloat(item.price) || 0;
            const itemQuantity = parseFloat(item.quantity) || 1; // Default quantity to 1

            if (!itemMap[itemName]) {
              itemMap[itemName] = {
                totalSpend: 0,
                timesBought: 0,
                purchaseDates: [], // Store all dates for details
              };
            }
            itemMap[itemName].totalSpend += itemPrice * itemQuantity;
            itemMap[itemName].timesBought += itemQuantity; // Count purchases by quantity
            itemMap[itemName].purchaseDates.push(receiptDate);
          });
        } catch (e) {
          console.error("Error parsing items for receipt:", receipt.$id, e);
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
      setItemBreakdown(processedItemBreakdown);
    } catch (error) {
      console.error("Error fetching spending data:", error);
    } finally {
      if (isMounted.current) {
        // <--- Crucial check before setting state
        setIsLoading(false);
        setRefreshing(false);
      } else {
        console.log(
          "Spending: Component unmounted, skipping loading/refreshing state updates in finally block."
        );
      }
      console.log("Spending: fetchData finished.");
    }
  }, [user?.$id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      console.log("Spending: useFocusEffect triggered (screen focused).");
      fetchData();

      return () => {
        console.log("Spending: useFocusEffect cleanup (screen blurred).");
        // Ensure all modals are closed when leaving the screen
        setShowMerchantDetailsModal(false);
        setShowItemDetailsModal(false);
        setShowMonthlyDetailsModal(false);
        setSelectedMonthDetails(null);
        setSelectedMerchantVisits([]);
        setSelectedItemPurchases([]);
      };
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

  // NEW: Function to handle month click on the Pie Chart
  const handleMonthClick = (data) => {
    // 'data' here will be the object passed from the PieChart's onPress callback
    // It contains 'id' (which is our monthKey like "YYYY-MM"), 'value' (totalSpending), etc.
    const clickedMonthDetails = monthlySummary.find(
      (item) => item.month === data.id
    );

    console.log("Clicked Month Details:", clickedMonthDetails);
    if (clickedMonthDetails) {
      setSelectedMonthDetails(clickedMonthDetails);
      setShowMonthlyDetailsModal(true);
    }
  };

  const merchantVisitsChartData = {
    labels: merchantAnalysis.map((data) => data.merchant),
    datasets: [
      {
        data: merchantAnalysis.map((data) => data.visits),
      },
    ],
  };

  const gradientColors = [
    "#264653", // Dark Blue
    "#4E17B3", // Purple
    "#F4A261", // Orange
    "#D03957", // Red
    "#2A9D8F", // Teal
    "#F9C74F", //Yellow
    "#90BE6D", // Green

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
    color: (opacity = 1) => `rgba(255,0,0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, 1)`,
    strokeWidth: 20,
    barPercentage: 1.2,
    useShadowColorFromDataset: false,
    fillShadowGradient: "#D03957",
    fillShadowGradientOpacity: 1,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
    horizontalLabelRotation: 15,
    verticalLabelRotation: 35,
  };

  // Prepare data for the Monthly Receipts Pie Chart
  // Ensure all 12 months are represented, even if no receipts
  const currentYear = new Date().getFullYear();
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const monthNum = String(i + 1).padStart(2, "0");
    const monthKey = `${currentYear}-${monthNum}`;
    const existingData = monthlySummary.find((item) => item.month === monthKey);
    return {
      name: format(new Date(currentYear, i, 1), "MMM"), // e.g., "Jan", "Feb"
      population: existingData ? existingData.numberOfReceipts : 0, // Number of receipts
      color: gradientColors[i % gradientColors.length], // Assign a color
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
      id: monthKey, // Use monthKey as ID for easy lookup
      totalSpending: existingData ? existingData.totalSpending : 0, // Include total spending for modal
    };
  });

  // Filter out months that have 0 receipts if you don't want them in the chart
  const chartDisplayMonths = allMonths.filter((month) => month.population > 0);

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
              className="w-5 h-5 "
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
              {/* NEW: Monthly Receipts Pie Chart */}
              <View className="p-4 mb-4 rounded-md bg-transparent border-t border-[#9F54B6]">
                <Text className="text-base font-pbold text-black -mb-1">
                  Receipts per Month (Current Year)
                </Text>
                {chartDisplayMonths.length > 0 ? (
                  <View className="flex-row items-center justify-center gap-2 ">
                    <View className="w-[150px] h-[150px] justify-center items-center ">
                      <PieChart
                        data={chartDisplayMonths}
                        width={180}
                        height={150}
                        chartConfig={{
                          backgroundColor: "#e26a00",
                          backgroundGradientFrom: "#9F54B6",
                          backgroundGradientTo: "#ffa726",
                          decimalPlaces: 0, // No decimal for receipt count
                          color: (opacity = 1, index) =>
                            chartDisplayMonths[index]?.color ||
                            `rgba(26, 142, 255, ${opacity})`,
                          style: {
                            borderRadius: 16,
                          },
                          propsForLabels: {
                            fontSize: 10,
                          },
                        }}
                        accessor={"population"} // Use 'population' for number of receipts
                        backgroundColor={"transparent"}
                        paddingLeft={0}
                        center={[0, 0]}
                        hasLegend={false}
                        innerRadius={90}
                        outerRadius={100}
                        stroke={"#E0E0E0"}
                        strokeWidth={2}
                        style={{ marginRight: 0 }}
                        onPress={handleMonthClick} // <--- Handle click on slice
                      />
                    </View>
                    <View className="flex-1 flex-col">
                      <Text className="font-psemibold mb-2 text-blue-800 text-base">
                        👇Tap for details
                      </Text>
                      {chartDisplayMonths.map((item, index) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => handleMonthClick(item)} // <--- Handle click on text
                          className="flex-row items-center mb-2 "
                        >
                          <View
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: item.color || "gray" }}
                          />
                          <Text className="text-md font-pregular text-gray-700 underline">
                            {item.name} ({item.population} receipts)
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text className="text-gray-500 italic text-center mb-4">
                    No receipts for the current year yet.
                  </Text>
                )}
              </View>

              {/* Merchant Analysis Table */}
              <View className="p-4 border-t border-[#9F54B6] mb-4">
                <Text className="text-lg font-bold text-black mb-4">
                  Merchant Analysis
                </Text>
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
              <View className="p-4 border-t border-[#9F54B6] mb-4">
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
                      {format(new Date(date), "MMM dd, yyyy - hh:mm a")}
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
                      {format(new Date(date), "MMM dd, yyyy - hh:mm a")}
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

        {/* NEW: Monthly Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showMonthlyDetailsModal}
          onRequestClose={() => setShowMonthlyDetailsModal(false)}
        >
          {/* Change the outer Pressable to a simple View with centering styles */}
          <View style={styles.centeredView}>
            {/* The modal content itself */}
            <View style={styles.modalView}>
              <Text className="text-xl font-pbold mb-4 text-center">
                Monthly Summary for{" "}
                {selectedMonthDetails
                  ? format(new Date(selectedMonthDetails.month), "MMMM yyyy")
                  : ""}
              </Text>
              <View style={styles.tableHeader}>
                <Text style={styles.headerText}>Month</Text>
                <Text style={styles.headerText}>Receipts</Text>
                <Text style={styles.headerText}>Total Amount</Text>
              </View>
              {selectedMonthDetails ? (
                <View style={styles.tableRow}>
                  <Text style={styles.rowText}>
                    {format(new Date(selectedMonthDetails.month), "MMM yyyy")}{" "}
                  </Text>
                  <Text style={styles.rowText}>
                    {selectedMonthDetails.numberOfReceipts}
                  </Text>
                  <Text style={styles.rowText}>
                    ${selectedMonthDetails.totalSpending.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <Text className="text-gray-500 italic text-center py-4">
                  No data for this month.
                </Text>
              )}
              <TouchableOpacity
                onPress={() => setShowMonthlyDetailsModal(false)}
                className="bg-red-500 p-3 rounded-lg w-full items-center mt-4"
              >
                <Text className="text-white font-pbold text-lg">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
    width: "100%",
  },
  headerText: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    color: "#333",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    width: "100%",
  },
  rowText: {
    flex: 1,
    textAlign: "center",
    color: "#555",
  },
});

export default Spending;
