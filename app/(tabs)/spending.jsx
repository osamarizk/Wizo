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
  I18nManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  fetchUserReceipts,
  getAllCategories,
  getMonthlyReceiptSummary,
} from "../../lib/appwrite";
import { format, subMonths, isSameMonth, isSameYear } from "date-fns"; // Import isSameMonth, isSameYear
import { ar as arLocale } from "date-fns/locale";
import icons from "../../constants/icons";
import GradientBackground from "../../components/GradientBackground";
import { useFocusEffect } from "@react-navigation/native";
import SpendingHeatmap from "../../components/SpendingHeatmap";
import SpendingTrendsChart from "../../components/SpendingTrendsChart";

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../../utils/fontUtils";
import i18n from "../../utils/i18n";

const screenWidth = Dimensions.get("window").width;

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

const formatMonthName = (date, currentDateFormatLocale) => {
  return format(new Date(date), "MMM", {
    locale: currentDateFormatLocale,
  });
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

const Spending = () => {
  const { t } = useTranslation();
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

  // STATES FOR MONTHLY SUMMARY CHART AND MODAL
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [showMonthlyDetailsModal, setShowMonthlyDetailsModal] = useState(false);
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null);

  // States for Spending Comparison
  const [currentMonthSpending, setCurrentMonthSpending] = useState(0);
  const [previousMonthSpending, setPreviousMonthSpending] = useState(0);
  const [spendingChangePercentage, setSpendingChangePercentage] = useState(0);

  // NEW STATE for Average Receipt Value
  const [averageReceiptValue, setAverageReceiptValue] = useState(0);

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
          fetchUserReceipts(user.$id),
          getAllCategories(),
          getMonthlyReceiptSummary(user.$id),
        ]);

      if (!isMounted.current) return; // Exit if component unmounted during async operation

      setAllReceipts(fetchedReceipts);
      setCategories(fetchedCategories);
      setMonthlySummary(fetchedMonthlySummary);

      console.log("Fetched Monthly Summary:", fetchedMonthlySummary);

      // --- Process Data for Spending Comparison ---
      const today = new Date();
      const currentMonthKey = format(today, "yyyy-MM");
      const previousMonthDate = subMonths(today, 1); // Get date object for previous month
      const previousMonthKey = format(previousMonthDate, "yyyy-MM");

      const currentMonthData = fetchedMonthlySummary.find(
        (item) => item.month === currentMonthKey
      );
      const prevMonthData = fetchedMonthlySummary.find(
        (item) => item.month === previousMonthKey
      );

      const currentSpending = currentMonthData
        ? currentMonthData.totalSpending
        : 0;
      const previousSpending = prevMonthData ? prevMonthData.totalSpending : 0;

      setCurrentMonthSpending(currentSpending);
      setPreviousMonthSpending(previousSpending);

      if (previousSpending > 0) {
        const change =
          ((currentSpending - previousSpending) / previousSpending) * 100;
        setSpendingChangePercentage(change);
      } else if (currentSpending > 0) {
        setSpendingChangePercentage(100); // Spent something, but nothing last month
      } else {
        setSpendingChangePercentage(0); // No spending in both months
      }

      // --- NEW: Process Data for Average Receipt Value (Current Month) ---
      let totalCurrentMonthSpending = 0;
      let totalCurrentMonthReceipts = 0;
      fetchedReceipts.forEach((receipt) => {
        const receiptDate = new Date(receipt.datetime);
        // Ensure only receipts from the current month are counted for average
        if (isSameMonth(receiptDate, today) && isSameYear(receiptDate, today)) {
          totalCurrentMonthSpending += parseFloat(receipt.total || 0);
          totalCurrentMonthReceipts += 1;
        }
      });

      if (totalCurrentMonthReceipts > 0) {
        setAverageReceiptValue(
          totalCurrentMonthSpending / totalCurrentMonthReceipts
        );
      } else {
        setAverageReceiptValue(0);
      }

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

  const handleMonthClick = (data) => {
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
    "#264653",
    "#6D83F2",
    "#4E17B3",
    "#F9C74F",
    "#2A9D8F",
    "#D03957",
    "#9F54B6",
    "#E76F51",
    "#CBF3F0",
    "#FFBF69",
    "#A3B18A",
    "#588157",
    "#F2CC8F",
    "#E07A5F",
    "#3D405B",
    "#F4A261",
    "#90BE6D",
    "#8AC926",
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
  const currentYear = new Date().getFullYear();
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const monthNum = String(i + 1).padStart(2, "0");
    const monthKey = `${currentYear}-${monthNum}`;
    const existingData = monthlySummary.find((item) => item.month === monthKey);
    const assignedColor = gradientColors[i % gradientColors.length];
    return {
      name: formatMonthName(
        new Date(currentYear, i, 1),
        i18n.language.startsWith("ar") ? arLocale : undefined
      ),
      population: existingData ? existingData.numberOfReceipts : 0,
      color: assignedColor,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
      id: monthKey,
      totalSpending: existingData ? existingData.totalSpending : 0,
    };
  });

  const chartDisplayMonths = allMonths.filter((month) => month.population > 0);

  if (isLoading || globalLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text
          className="text-white mt-4" // Removed font-pextralight from className
          style={{ fontFamily: getFontClassName("extralight") }} // Apply font directly
        >
          {t("spending.loadingSpendingInsights")} {/* Translated */}
        </Text>
      </SafeAreaView>
    );
  }

  // Determine text color and icon for spending change
  const changeTextClass =
    spendingChangePercentage > 0
      ? "text-red-500" // Red for increase
      : spendingChangePercentage < 0
      ? "text-green-500" // Green for decrease
      : "text-gray-500"; // Gray for no change

  const changeIcon =
    spendingChangePercentage > 0
      ? icons.up // Assuming you have arrowUp icon
      : spendingChangePercentage < 0
      ? icons.down // Assuming you have arrowDown icon
      : null; // No icon for no change

  return (
    <GradientBackground>
      <SafeAreaView className=" flex-1">
        <ScrollView
          className="w-full h-full p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View
            className={`flex-row justify-between items-center mb-6 mt-4 mr-8 ${
              I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse header for RTL
            }`}
          >
            <Text
              className="text-lg text-black" // Removed font-pbold from className
              style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
            >
              {t("spending.spendingInsightsTitle")} {/* Translated */}
            </Text>
            <Image
              source={icons.activity}
              className="w-5 h-5 "
              tintColor="#9F54B6"
              resizeMode="contain"
            />
          </View>

          {allReceipts.length === 0 ? (
            <View className="flex-1 justify-center items-center h-[500px]">
              <Text
                className="text-gray-600 text-lg" // Removed font-pmedium from className
                style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
              >
                {t("spending.noReceiptsYet")} {/* Translated */}
              </Text>
            </View>
          ) : (
            <>
              {/* Receipts per Month Pie Chart */}
              <View className=" p-4 mb-4 rounded-md bg-transparent border-t border-[#9F54B6]">
                <Text
                  className={`text-base text-black -mb-1 ${
                    I18nManager.isRTL ? "text-right" : "text-left" // Align text
                  }`}
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                >
                  {t("spending.receiptsPerMonthChartTitle")} {/* Translated */}
                </Text>
                <Text
                  className={`text-sm text-gray-700 mb-4 mt-2 ${
                    I18nManager.isRTL ? "text-right" : "text-left" // Align description
                  }`}
                  style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                >
                  {t("spending.receiptsPerMonthChartDescription")}{" "}
                  {/* Translated */}
                </Text>

                {chartDisplayMonths.length > 0 ? (
                  <View
                    className={`flex-row items-center justify-center gap-2 ${
                      I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reorder chart and legend
                    }`}
                  >
                    <View
                      className={`w-[150px] h-[150px]    ${
                        I18nManager.isRTL ? "items-end" : "items-start" // Reorder chart and legend
                      }`}
                    >
                      <PieChart
                        data={chartDisplayMonths}
                        width={180}
                        height={150}
                        chartConfig={{
                          // backgroundColor: "#e26a00",
                          // backgroundGradientFrom: "#9F54B6",
                          // backgroundGradientTo: "#ffa726",
                          decimalPlaces: 0,
                          color: (opacity = 1) =>
                            `rgba(255, 255, 255, ${opacity})`,
                          style: {
                            borderRadius: 16,
                          },
                          propsForLabels: {
                            fontSize: 10,
                            fontFamily: getFontClassName("semibold"), // Apply font
                            fill: "white",
                          },
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"} // Keep chart background transparent
                        paddingLeft={0} // No padding needed here for direct slice coloring
                        center={[0, 0]}
                        hasLegend={false} // Legend is rendered manually below
                        innerRadius={50} // Changed from 90 to 50 for a more typical donut hole size
                        outerRadius={70} // Changed from 100 to 70 for typical donut size
                        stroke={"#E0E0E0"} // Stroke color for slice borders
                        strokeWidth={1} // Stroke width for slice borders
                        style={{ marginRight: 0 }}
                        onPress={handleMonthClick}
                        // Add withLabel to see values on slices if desired
                        //  withLabel={true}
                      />
                    </View>
                    <View className="flex-1 flex-col mr-8">
                      <Text
                        className={`mb-2 text-blue-800 text-base ${
                          I18nManager.isRTL ? "text-right" : "text-left" // Align text
                        }`} // Removed font-psemibold from className
                        style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
                      >
                        {t("spending.tapForDetails")} {/* Translated */}
                      </Text>
                      {chartDisplayMonths.map((item, index) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => handleMonthClick(item)}
                          className={`flex-row items-center mb-2 ${
                            I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reorder icon and text
                          }`}
                        >
                          <View
                            className={`w-3 h-3 rounded-full ${
                              I18nManager.isRTL ? "ml-2" : "mr-2"
                            }`} // Adjust margin for RTL
                            style={{ backgroundColor: item.color || "gray" }}
                          />
                          <Text
                            className={`text-base text-black underline ${
                              I18nManager.isRTL ? "text-right" : "text-left" // Align text
                            }`} // Removed font-pregular from className
                            style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
                          >
                            {" "}
                            {/* Format month name for display */}
                            {formatMonthName(
                              item.id,
                              i18n.language.startsWith("ar")
                                ? arLocale
                                : undefined
                            )}{" "}
                            (
                            {i18n.language.startsWith("ar")
                              ? convertToArabicNumerals(item.population)
                              : item.population}{" "}
                            {t("spending.receiptsCount", {
                              count: item.population,
                            })}
                            )
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text
                    className="text-gray-500 italic text-center mb-4" // Removed font-pregular
                    style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                  >
                    {t("spending.noReceiptsForCurrentYear")} {/* Translated */}
                  </Text>
                )}
              </View>
              {/* Spending Comparison Card */}
              <View className="p-4 mb-4 rounded-md bg-transparent border-t border-[#9F54B6] ">
                <Text
                  className={`text-lg text-black mb-1 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`} // Removed font-pbold
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                >
                  {t("spending.spendingComparisonTitle")} {/* Translated */}
                </Text>
                <Text
                  className={`text-sm text-gray-700 mb-4 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`} // Removed font-pregular
                  style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                >
                  {t("spending.spendingComparisonDescription")}{" "}
                  {/* Translated */}
                </Text>

                <View className="flex-row justify-around items-center">
                  <View className="items-center">
                    <Text
                      className="text-base text-gray-600" // Removed font-pmedium
                      style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                    >
                      {/* {formatMonthName(new Date(), arLocale)}{" "} */}
                      {formatMonthName(
                        new Date(),
                        i18n.language.startsWith("ar") ? arLocale : undefined
                      )}{" "}
                      {/* Translated Month */}
                    </Text>
                    <Text
                      className="text-xl text-black" // Removed font-psemibold
                      style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
                    >
                      {i18n.language.startsWith("ar")
                        ? convertToArabicNumerals(
                            currentMonthSpending.toFixed(2)
                          )
                        : currentMonthSpending.toFixed(2)}{" "}
                      {t("common.currency_symbol_short")}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text
                      className="text-base text-gray-600" // Removed font-pmedium
                      style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                    >
                      {/* {formatMonthName(subMonths(new Date(), 1), arLocale)}{" "} */}
                      {formatMonthName(
                        subMonths(new Date(), 1),
                        i18n.language.startsWith("ar") ? arLocale : undefined
                      )}{" "}
                      {/* Translated Month */}
                    </Text>
                    <Text
                      className="text-xl text-black" // Removed font-psemibold
                      style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
                    >
                      {i18n.language.startsWith("ar")
                        ? convertToArabicNumerals(
                            previousMonthSpending.toFixed(2)
                          )
                        : previousMonthSpending.toFixed(2)}{" "}
                      {t("common.currency_symbol_short")}
                    </Text>
                  </View>
                </View>

                {/* Conditional rendering for change indicator */}
                {previousMonthSpending > 0 || currentMonthSpending > 0 ? (
                  <View
                    className={`flex-row items-center justify-center mt-4 ${
                      I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reverse for RTL
                    }`}
                  >
                    <Text
                      className={`text-base mr-2 ${changeTextClass}`} // Removed font-pbold
                      style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                    >
                      {i18n.language.startsWith("ar")
                        ? convertToArabicNumerals(
                            spendingChangePercentage.toFixed(1)
                          )
                        : spendingChangePercentage.toFixed(1)}
                      %
                    </Text>
                    {changeIcon && (
                      <Image
                        source={changeIcon}
                        className={`w-4 h-4 ${
                          I18nManager.isRTL ? "ml-2" : "mr-2"
                        }`} // Adjust margin for RTL
                        tintColor={
                          spendingChangePercentage > 0 ? "#EF4444" : "#22C55E"
                        }
                        resizeMode="contain"
                      />
                    )}
                    <Text
                      className={`text-sm ml-1 ${changeTextClass} ${
                        I18nManager.isRTL ? "text-right" : "text-left" // Align text
                      }`} // Removed font-pregular
                      style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                    >
                      {spendingChangePercentage > 0
                        ? t("spending.increase")
                        : spendingChangePercentage < 0
                        ? t("spending.decrease")
                        : t("spending.noChange")}
                    </Text>
                  </View>
                ) : (
                  <Text
                    className="text-gray-500 italic text-center mt-4" // Removed font-pregular
                    style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                  >
                    {t("spending.notEnoughDataForComparison")}{" "}
                    {/* Translated */}
                  </Text>
                )}
              </View>

              {/* NEW: Average Receipt Value Card */}
              <View className="p-4 mb-4 rounded-md bg-transparent border-t border-[#9F54B6] ">
                <Text
                  className={`text-lg text-black mb-1 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`} // Removed font-pbold
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                >
                  {t("spending.averageReceiptValueTitle")} {/* Translated */}
                </Text>
                <Text
                  className={`text-sm text-gray-700 mb-4 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`} // Removed font-pregular
                  style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                >
                  {t("spending.averageReceiptValueDescription")}{" "}
                  {/* Translated */}
                </Text>
                {averageReceiptValue > 0 ? (
                  <View className="items-center">
                    <Text
                      className="text-xl text-black" // Removed font-psemibold
                      style={{ fontFamily: getFontClassName("semibold") }} // Apply font directly
                    >
                      {i18n.language.startsWith("ar")
                        ? convertToArabicNumerals(
                            averageReceiptValue.toFixed(2)
                          )
                        : averageReceiptValue.toFixed(2)}{" "}
                      {t("common.currency_symbol_short")}
                    </Text>
                  </View>
                ) : (
                  <Text
                    className="text-gray-500 italic text-center" // Removed font-pregular
                    style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                  >
                    {t("spending.noReceiptsForAverage")} {/* Translated */}
                  </Text>
                )}
              </View>

              {/* Spending Trends Chart */}
              <SpendingTrendsChart
                monthlySummary={monthlySummary}
                isLoading={isLoading}
              />

              {/* Spending Heatmap */}
              <SpendingHeatmap
                allReceipts={allReceipts}
                isLoading={isLoading}
              />

              {/* Merchant Analysis Table */}
              <View className="p-4 border-t border-[#9F54B6] mb-4">
                <Text
                  className={`text-lg text-black mb-4 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`} // Removed font-bold
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                >
                  {t("spending.merchantAnalysisTitle")} {/* Translated */}
                </Text>
                {merchantAnalysis.length > 0 ? (
                  <View className="mb-2">
                    <Text
                      className={`text-lg text-black mb-1 text-center ${
                        I18nManager.isRTL ? "text-right" : "text-left"
                      }`} // Removed font-pbold
                      style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                    >
                      {t("spending.merchantVisitsOverview")} {/* Translated */}
                    </Text>
                    <Text
                      className={`text-sm text-gray-600 p-1 text-center ${
                        I18nManager.isRTL ? "text-right" : "text-left"
                      }`} // Removed font-pregular
                      style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                    >
                      {t("spending.merchantChartDescription")}{" "}
                      {/* Translated */}
                    </Text>
                    <BarChart
                      data={merchantVisitsChartData}
                      showBarTops={false}
                      width={screenWidth - 64}
                      withInnerLines={true}
                      segments={3}
                      height={280}
                      yAxisLabel=""
                      chartConfig={{
                        ...chartConfig, // Use existing chartConfig and override
                        propsForLabels: {
                          fontSize: 10,
                          fontFamily: getFontClassName("semibold"), // Apply font
                        },
                        formatYLabel: (yValue) =>
                          i18n.language.startsWith("ar")
                            ? convertToArabicNumerals(yValue)
                            : yValue,
                        formatXLabel: (xValue) => xValue, // Merchant names are already text
                      }}
                      verticalLabelRotation={25}
                      fromZero={true}
                      showValuesOnTopOfBars={true}
                      flatColor={true}
                      style={{
                        flex: 1,
                        paddingRight: I18nManager.isRTL ? 25 : 25, // Keep as is for chart padding if it works
                        marginVertical: 2,
                        borderRadius: 50,
                        marginBottom: 20,
                      }}
                    />
                  </View>
                ) : (
                  <Text
                    className="text-gray-500 italic text-center mb-4" // Removed font-pregular
                    style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                  >
                    {t("spending.noMerchantData")} {/* Translated */}
                  </Text>
                )}

                {/* Merchant Table Headers */}
                <View
                  className={`flex-row bg-gray-300 py-2 px-3 border-b border-gray-300 rounded-t-md ${
                    I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reorder columns
                  }`}
                >
                  <Text
                    className={`flex-1 text-black text-sm ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`} // Removed font-pbold
                    style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                  >
                    {t("spending.merchant")} {/* Translated */}
                  </Text>
                  <Text
                    className={`w-1/4 text-black text-sm ${
                      I18nManager.isRTL ? "text-left" : "text-right"
                    }`} // Flipped for RTL currency
                    style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                  >
                    {t("spending.totalAmountShort")} {/* Translated */}
                  </Text>
                  <Text
                    className={`w-1/6 text-black text-sm ${
                      I18nManager.isRTL ? "text-left" : "text-right"
                    }`} // Flipped for RTL number
                    style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                  >
                    {t("spending.visits")} {/* Translated */}
                  </Text>
                  <Text
                    className={`w-1/6 text-black text-sm ${
                      I18nManager.isRTL ? "text-right" : "text-center"
                    }`} // Flipped for RTL view button
                    style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                  >
                    {t("spending.view")} {/* Translated */}
                  </Text>
                </View>

                {/* Merchant Table Rows */}
                {merchantAnalysis.length > 0 ? (
                  merchantAnalysis.map((data, index) => (
                    <View
                      key={data.merchant}
                      className={`flex-row py-2 px-3 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-b border-gray-200 last:border-none ${
                        I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reorder columns
                      }`}
                    >
                      <Text
                        className={`flex-1 text-gray-800 text-sm ${
                          I18nManager.isRTL ? "text-right" : "text-left"
                        }`} // Align merchant name
                        style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                      >
                        {data.merchant}
                      </Text>
                      <Text
                        className={`w-1/4 text-gray-800 text-sm ${
                          I18nManager.isRTL ? "text-left" : "text-right"
                        }`} // Align total
                        style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                      >
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(data.totalAmount.toFixed(2))
                          : data.totalAmount.toFixed(2)}{" "}
                        {t("common.currency_symbol_short")}
                      </Text>
                      <Text
                        className={`w-1/6 text-gray-800 text-sm ${
                          I18nManager.isRTL ? "text-left" : "text-right"
                        }`} // Align visits
                        style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                      >
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(data.visits)
                          : data.visits}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          openMerchantDetails(data.merchant, data.visitDates)
                        }
                        className="w-1/6 items-center justify-center"
                      >
                        <Image
                          source={icons.eye}
                          className="w-5 h-5" // Removed tint-blue-500
                          tintColor="#4E17B3" // Set a specific tint color for clarity
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View className="py-4 items-center bg-white rounded-b-md">
                    <Text
                      className="text-gray-500 italic" // Removed font-pmedium
                      style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                    >
                      {t("spending.noMerchantData")} {/* Translated */}
                    </Text>
                  </View>
                )}
              </View>

              {/* Items Break Down Table */}
              <View className="p-4 border-t border-[#9F54B6] mb-4">
                <Text
                  className={`text-lg text-black mb-4 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`} // Removed font-bold
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                >
                  {t("spending.itemsBreakdownTitle")} {/* Translated */}
                </Text>
                <View
                  className={`flex-row bg-gray-300 py-2 px-3 border-b border-gray-300 rounded-t-md ${
                    I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reorder columns
                  }`}
                >
                  <Text
                    className={`flex-1 text-gray-700 text-sm ${
                      I18nManager.isRTL ? "text-right" : "text-left"
                    }`} // Removed font-pbold
                    style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                  >
                    {t("spending.item")} {/* Translated */}
                  </Text>
                  <Text
                    className={`w-1/4 text-gray-700 text-sm ${
                      I18nManager.isRTL ? "text-left" : "text-right"
                    }`} // Flipped for RTL currency
                    style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                  >
                    {t("spending.totalSpend")} {/* Translated */}
                  </Text>
                  <Text
                    className={`w-1/6 text-gray-700 text-sm ${
                      I18nManager.isRTL ? "text-left" : "text-right"
                    }`} // Flipped for RTL number
                    style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                  >
                    {t("spending.timesBought")} {/* Translated */}
                  </Text>
                  <Text
                    className={`w-1/6 text-gray-700 text-sm ${
                      I18nManager.isRTL ? "text-right" : "text-center"
                    }`} // Flipped for RTL view button
                    style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                  >
                    {t("spending.view")} {/* Translated */}
                  </Text>
                </View>
                {itemBreakdown.length > 0 ? (
                  itemBreakdown.map((data, index) => (
                    <View
                      key={data.item}
                      className={`flex-row py-2 px-3 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-b border-gray-200 last:border-none ${
                        I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // Reorder columns
                      }`}
                    >
                      <Text
                        className={`flex-1 text-gray-800 text-sm ${
                          I18nManager.isRTL ? "text-right" : "text-left"
                        }`} // Align item name
                        style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                      >
                        {data.item}
                      </Text>
                      <Text
                        className={`w-1/4 text-gray-800 text-sm ${
                          I18nManager.isRTL ? "text-left" : "text-right"
                        }`} // Align total spend
                        style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                      >
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(data.totalSpend.toFixed(2))
                          : data.totalSpend.toFixed(2)}{" "}
                        {t("common.currency_symbol_short")}
                      </Text>
                      <Text
                        className={`w-1/6 text-gray-800 text-sm ${
                          I18nManager.isRTL ? "text-left" : "text-right"
                        }`} // Align times bought
                        style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                      >
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(data.timesBought)
                          : data.timesBought}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          openItemDetails(data.item, data.purchaseDates)
                        }
                        className="w-1/6 items-center justify-center"
                      >
                        <Image
                          source={icons.eye}
                          className="w-5 h-5" // Removed tint-blue-500
                          tintColor="#4E17B3" // Set a specific tint color for clarity
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View className="py-4 items-center bg-white rounded-b-md">
                    <Text
                      className="text-gray-500 italic" // Removed font-pmedium
                      style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                    >
                      {t("spending.noItemData")} {/* Translated */}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
        {/* Merchant Details Modal */}
        {/* Merchant Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showMerchantDetailsModal}
          onRequestClose={() => setShowMerchantDetailsModal(false)}
        >
          <Pressable
            className="flex-1 justify-center items-center bg-black/50" // Replaced style={styles.centeredView}
            onPress={() => setShowMerchantDetailsModal(false)}
          >
            <View
              className="bg-white rounded-lg p-6 w-[90%] max-w-sm shadow-lg" // Replaced style={styles.modalView}
              onStartShouldSetResponder={() => true} // Prevent closing on tap inside
            >
              <Text
                className={`text-xl mb-4 text-center ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`} // Removed font-pbold
                style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
              >
                {t("spending.visitsFor", {
                  merchantName: selectedMerchantName,
                })}{" "}
                {/* Translated with variable */}
              </Text>
              <ScrollView className="w-full max-h-[300px] mb-4">
                {selectedMerchantVisits.length > 0 ? (
                  selectedMerchantVisits.map((date, index) => (
                    <Text
                      key={index}
                      className={`text-base text-gray-700 py-1 ${
                        I18nManager.isRTL ? "text-right" : "text-left"
                      }`} // Align text
                      style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                    >
                      {format(new Date(date), "MMM dd,yyyy - hh:mm a", {
                        locale: i18n.language.startsWith("ar")
                          ? arLocale
                          : undefined,
                      })}
                    </Text>
                  ))
                ) : (
                  <Text
                    className="text-gray-500 italic text-center" // Removed font-pmedium
                    style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                  >
                    {t("spending.noVisitDates")} {/* Translated */}
                  </Text>
                )}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowMerchantDetailsModal(false)}
                className="bg-red-500 p-3 rounded-lg w-full items-center"
              >
                <Text
                  className="text-white text-lg" // Removed font-pbold
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                >
                  {t("common.close")} {/* Translated */}
                </Text>
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
            className="flex-1 justify-center items-center bg-black/50" // Replaced style={styles.centeredView}
            onPress={() => setShowItemDetailsModal(false)}
          >
            <View
              className="bg-white rounded-lg p-6 w-[90%] max-w-sm shadow-lg" // Replaced style={styles.modalView}
              onStartShouldSetResponder={() => true} // Prevent closing on tap inside
            >
              <Text
                className={`text-xl mb-4 text-center ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`} // Removed font-pbold
                style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
              >
                {t("spending.purchasesFor", { itemName: selectedItemName })}{" "}
                {/* Translated with variable */}
              </Text>
              <ScrollView className="w-full max-h-[300px] mb-4">
                {selectedItemPurchases.length > 0 ? (
                  selectedItemPurchases.map((date, index) => (
                    <Text
                      key={index}
                      className={`text-base text-gray-700 py-1 ${
                        I18nManager.isRTL ? "text-right" : "text-left"
                      }`} // Align text
                      style={{ fontFamily: getFontClassName("regular") }} // Apply font directly
                    >
                      {format(new Date(date), "MMM dd,yyyy - hh:mm a", {
                        locale: i18n.language.startsWith("ar")
                          ? arLocale
                          : undefined,
                      })}
                    </Text>
                  ))
                ) : (
                  <Text
                    className="text-gray-500 italic text-center" // Removed font-pmedium
                    style={{ fontFamily: getFontClassName("medium") }} // Apply font directly
                  >
                    {t("spending.noPurchaseDates")} {/* Translated */}
                  </Text>
                )}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowItemDetailsModal(false)}
                className="bg-red-500 p-3 rounded-lg w-full items-center"
              >
                <Text
                  className="text-white text-lg" // Removed font-pbold
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                >
                  {t("common.close")} {/* Translated */}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* NEW: Monthly Details Modal (completed) */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showMonthlyDetailsModal}
          onRequestClose={() => {
            setShowMonthlyDetailsModal(false);
            setSelectedMonthDetails(null);
          }}
        >
          <Pressable
            className="flex-1 justify-center items-center bg-black/50" // Replaced style={styles.centeredView}
            onPress={() => setShowMonthlyDetailsModal(false)}
          >
            <View
              className="bg-white rounded-lg p-6 w-[90%] max-w-sm shadow-lg" // Replaced style={styles.modalContent}
              onStartShouldSetResponder={() => true} // Prevent closing on tap inside
            >
              <Text
                className={`text-xl mb-4 text-center ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`} // Removed font-pbold
                style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
              >
                {t("spending.monthlySummaryFor")}{" "}
                {/* Translated "Monthly Summary for " */}
                {/* Format and translate month name, then add total spending */}
                {selectedMonthDetails && (
                  <>
                    {format(new Date(selectedMonthDetails.month), "MMMM", {
                      locale: i18n.language.startsWith("ar")
                        ? arLocale
                        : undefined,
                    })}
                    {"\n"} {/* New line for total spending */}
                    <Text
                      className="text-lg text-black mt-2" // Adjust text size/color as needed
                      style={{ fontFamily: getFontClassName("semibold") }}
                    >
                      {t("home.total")}:{" "}
                      {/* Assuming a 'total' key in common */}
                      {i18n.language.startsWith("ar")
                        ? convertToArabicNumerals(
                            selectedMonthDetails.totalSpending.toFixed(2)
                          )
                        : selectedMonthDetails.totalSpending.toFixed(2)}{" "}
                      {t("common.currency_symbol_short")}
                    </Text>
                  </>
                )}
              </Text>
              {/* Add more details here if needed, e.g., list of receipts for the month */}
              <TouchableOpacity
                onPress={() => {
                  setShowMonthlyDetailsModal(false);
                  setSelectedMonthDetails(null);
                }}
                className="bg-red-500 p-3 rounded-lg w-full items-center mt-4"
              >
                <Text
                  className="text-white text-lg" // Removed font-pbold
                  style={{ fontFamily: getFontClassName("bold") }} // Apply font directly
                >
                  {t("common.close")} {/* Translated */}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
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
  // Ensure modalContent is defined or remove its usage from Monthly Details Modal
  modalContent: {
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
    maxHeight: "80%", // Added from previous modalView definition
  },
});

export default Spending;
