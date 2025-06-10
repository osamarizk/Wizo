import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert,
    RefreshControl,
} from "react-native";
import { useGlobalContext } from "../context/GlobalProvider";
import GradientBackground from "../components/GradientBackground";
import { useNavigation, useFocusEffect } from "expo-router";
import {
    getUserBudgets,
    getReceiptsForPeriod,
    getCategories2Bud,
} from "../lib/appwrite";

import { LineChart, PieChart } from "react-native-chart-kit"; // Now using LineChart
import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    addMonths,
    eachMonthOfInterval,
    getYear,
    getMonth,
} from "date-fns";

const screenWidth = Dimensions.get("window").width;
const NUM_MONTHS_FOR_TREND = 6; // Display trends for the last 6 months

const BudgetInsights = () => {
    const { user } = useGlobalContext();
    const navigation = useNavigation();

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Used for Pie Chart's selected month
    const [spendingByCategoryData, setSpendingByCategoryData] = useState(null); // For selected month's pie chart
    const [historicalSpendingData, setHistoricalSpendingData] = useState(null); // For line chart (top categories)
    const [monthlyBudgetPerformance, setMonthlyBudgetPerformance] = useState(null); // For overall monthly performance
    const [categoriesMap, setCategoriesMap] = useState({});

    // Helper to get category name (uses categoriesMap state)
    const getCategoryName = useCallback(
        (categoryId) => {
            return categoriesMap[categoryId] || "Unknown";
        },
        [categoriesMap]
    );

    const fetchData = useCallback(async () => {
        if (!user?.$id) {
            setIsLoading(false);
            return;
        }

        if (!refreshing) setIsLoading(true);

        try {
            // 1. Fetch Categories first (for all data processing)
            const fetchedCategories = await getCategories2Bud();
            const map = {};
            fetchedCategories.forEach((cat) => {
                map[cat.$id] = cat.name;
            });
            setCategoriesMap(map); // Update the state with the fetched map
            const getCategoryNameLocal = (categoryId) => map[categoryId] || "Unknown"; // Local helper for this fetch cycle

            // Determine the date range for historical data (e.g., last 6 months including current)
            const today = new Date();
            const endDateForTrends = endOfMonth(today);
            const startDateForTrends = startOfMonth(subMonths(today, NUM_MONTHS_FOR_TREND - 1));
            const monthsInTrend = eachMonthOfInterval({ start: startDateForTrends, end: endDateForTrends });

            let allHistoricalReceipts = [];
            let allHistoricalBudgets = [];

            // Fetch receipts and budgets for the entire trend period
            for (const month of monthsInTrend) {
                const monthStart = startOfMonth(month);
                const monthEnd = endOfMonth(month);

                const monthlyReceipts = await getReceiptsForPeriod(
                    user.$id,
                    monthStart.toISOString(),
                    monthEnd.toISOString()
                );
                allHistoricalReceipts = [...allHistoricalReceipts, ...monthlyReceipts];

                const monthlyBudgets = await getUserBudgets(user.$id); // Fetch all budgets, then filter by month
                const relevantMonthlyBudgets = monthlyBudgets.filter(budget => {
                    const budgetStartDate = new Date(budget.startDate);
                    const budgetEndDate = new Date(budget.endDate);
                    return (budgetStartDate <= monthEnd && budgetEndDate >= monthStart);
                });
                allHistoricalBudgets = [...allHistoricalBudgets, ...relevantMonthlyBudgets];
            }

            // --- Insight 1: Spending by Category for Selected Month (Pie Chart) ---
            const currentMonthStart = startOfMonth(currentMonth);
            const currentMonthEnd = endOfMonth(currentMonth);

            const currentMonthReceipts = allHistoricalReceipts.filter(r => {
                const receiptDate = new Date(r.datetime);
                return receiptDate >= currentMonthStart && receiptDate <= currentMonthEnd;
            });

            const currentMonthBudgets = allHistoricalBudgets.filter(b => {
                const budgetStartDate = new Date(b.startDate);
                const budgetEndDate = new Date(b.endDate);
                return budgetStartDate <= currentMonthEnd && budgetEndDate >= currentMonthStart;
            });

            const currentMonthSpendingData = {};
            currentMonthBudgets.forEach(budget => {
                currentMonthSpendingData[budget.categoryId] = {
                    spent: 0,
                    budgeted: parseFloat(budget.budgetAmount),
                    categoryName: getCategoryNameLocal(budget.categoryId),
                };
            });

            currentMonthReceipts.forEach(receipt => {
                let items = receipt.items;
                if (typeof items === "string") {
                    try {
                        items = JSON.parse(items);
                    } catch (e) {
                        console.error("Error parsing current month receipt items JSON:", e, receipt.items);
                        items = [];
                    }
                }
                if (Array.isArray(items)) {
                    items.forEach(item => {
                        const categoryId = item.category_id;
                        const amount = parseFloat(item.price);
                        if (categoryId && !isNaN(amount) && currentMonthSpendingData[categoryId]) {
                            currentMonthSpendingData[categoryId].spent += amount;
                        }
                    });
                }
            });

            const pieChartData = Object.values(currentMonthSpendingData)
                .filter(item => item.spent > 0)
                .map((item, index) => ({
                    name: item.categoryName,
                    population: item.spent,
                    color: `hsl(${index * 60 % 360}, 70%, 50%)`,
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 14,
                }));
            setSpendingByCategoryData(pieChartData.length > 0 ? pieChartData : null);

            // --- Insight 2: Spending Trends by Top Categories (Line Chart) ---
            const monthlySpendingAggregation = {};
            const categoryTotals = {}; // To find top categories

            allHistoricalReceipts.forEach(receipt => {
                const receiptDate = new Date(receipt.datetime);
                const monthKey = format(startOfMonth(receiptDate), 'yyyy-MM'); // e.g., '2023-07'

                if (!monthlySpendingAggregation[monthKey]) {
                    monthlySpendingAggregation[monthKey] = {};
                }

                let items = receipt.items;
                if (typeof items === "string") {
                    try {
                        items = JSON.parse(items);
                    } catch (e) {
                        console.error("Error parsing historical receipt items JSON:", e, receipt.items);
                        items = [];
                    }
                }

                if (Array.isArray(items)) {
                    items.forEach(item => {
                        const categoryId = item.category_id;
                        const amount = parseFloat(item.price);
                        if (categoryId && !isNaN(amount)) {
                            monthlySpendingAggregation[monthKey][categoryId] =
                                (monthlySpendingAggregation[monthKey][categoryId] || 0) + amount;
                            categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + amount;
                        }
                    });
                }
            });

            // Get top N categories based on total spending over the period
            const sortedCategories = Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5); // Top 5 categories

            // FIX: Changed 'MMM YY' to 'MMM yy'
            const trendChartLabels = monthsInTrend.map(month => format(month, 'MMM yy')); // e.g., 'Jul 23'

            const historicalDatasets = sortedCategories.map(([categoryId, ]) => {
                const data = monthsInTrend.map(month => {
                    const monthKey = format(startOfMonth(month), 'yyyy-MM');
                    return monthlySpendingAggregation[monthKey]?.[categoryId] || 0;
                });
                return {
                    data: data,
                    color: (opacity = 1) => `hsl(${Math.random() * 360}, 70%, 50%, ${opacity})`, // Random distinct colors for each trend line
                    strokeWidth: 2,
                    legend: getCategoryNameLocal(categoryId),
                };
            });

            setHistoricalSpendingData(historicalDatasets.length > 0 ? {
                labels: trendChartLabels,
                datasets: historicalDatasets
            } : null);

            // --- Insight 3: Monthly Budget Performance (Line Chart - Surplus/Deficit) ---
            const monthlyPerformanceData = {};
            monthsInTrend.forEach(month => {
                const monthKey = format(startOfMonth(month), 'yyyy-MM');
                monthlyPerformanceData[monthKey] = { totalBudgeted: 0, totalSpent: 0 };
            });

            // Aggregate budgeted amounts by month
            allHistoricalBudgets.forEach(budget => {
                const budgetStartDate = new Date(budget.startDate);
                const budgetEndDate = new Date(budget.endDate);

                // For simplicity, prorate budget if it spans multiple months, or just use month of budget start
                // Here, we'll assign the full budget amount to the month it starts in if it falls within the trend period
                const budgetMonthKey = format(startOfMonth(budgetStartDate), 'yyyy-MM');
                if (monthlyPerformanceData[budgetMonthKey]) {
                    monthlyPerformanceData[budgetMonthKey].totalBudgeted += parseFloat(budget.budgetAmount);
                }
            });

            // Aggregate spent amounts by month
            allHistoricalReceipts.forEach(receipt => {
                const receiptDate = new Date(receipt.datetime);
                const monthKey = format(startOfMonth(receiptDate), 'yyyy-MM');

                if (monthlyPerformanceData[monthKey]) {
                    let items = receipt.items;
                    if (typeof items === "string") {
                        try {
                            items = JSON.parse(items);
                        } catch (e) {
                            console.error("Error parsing performance receipt items JSON:", e, receipt.items);
                            items = [];
                        }
                    }
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            const amount = parseFloat(item.price);
                            if (!isNaN(amount)) {
                                monthlyPerformanceData[monthKey].totalSpent += amount;
                            }
                        });
                    }
                }
            });

            // FIX: Changed 'MMM YY' to 'MMM yy'
            const performanceLabels = monthsInTrend.map(month => format(month, 'MMM yy'));
            const performanceBudgeted = monthsInTrend.map(month => monthlyPerformanceData[format(startOfMonth(month), 'yyyy-MM')]?.totalBudgeted || 0);
            const performanceSpent = monthsInTrend.map(month => monthlyPerformanceData[format(startOfMonth(month), 'yyyy-MM')]?.totalSpent || 0);
            const performanceSurplusDeficit = monthsInTrend.map(month => {
                const monthKey = format(startOfMonth(month), 'yyyy-MM');
                return (monthlyPerformanceData[monthKey]?.totalBudgeted || 0) - (monthlyPerformanceData[monthKey]?.totalSpent || 0);
            });

            const monthlyPerformanceDatasets = [
                {
                    data: performanceBudgeted,
                    color: (opacity = 1) => `rgba(159, 84, 182, ${opacity})`, // Purple
                    strokeWidth: 2,
                    legend: "Total Budgeted"
                },
                {
                    data: performanceSpent,
                    color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`, // Red
                    strokeWidth: 2,
                    legend: "Total Spent"
                },
                // Optional: Show surplus/deficit directly as a line
                // {
                //     data: performanceSurplusDeficit,
                //     color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green for surplus/red for deficit
                //     strokeWidth: 2,
                //     legend: "Surplus/Deficit"
                // }
            ];

            setMonthlyBudgetPerformance(monthlyPerformanceDatasets[0].data.length > 0 ? {
                labels: performanceLabels,
                datasets: monthlyPerformanceDatasets
            } : null);

        } catch (error) {
            console.error("Error fetching budget insights data:", error);
            Alert.alert("Error", "Failed to load budget insights.");
            setSpendingByCategoryData(null);
            setHistoricalSpendingData(null);
            setMonthlyBudgetPerformance(null);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user?.$id, currentMonth, refreshing]); // currentMonth still impacts the pie chart for selected month


    useFocusEffect(
        useCallback(() => {
            fetchData();
            return () => {
                setIsLoading(true);
                setSpendingByCategoryData(null);
                setHistoricalSpendingData(null);
                setMonthlyBudgetPerformance(null);
                setCategoriesMap({});
            };
        }, [fetchData])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
    }, [fetchData]);

    const navigateMonth = (direction) => {
        setIsLoading(true);
        setCurrentMonth((prevMonth) =>
            direction === "prev" ? subMonths(prevMonth, 1) : addMonths(prevMonth, 1)
        );
    };

    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientFromOpacity: 0.8,
        backgroundGradientTo: "#ffffff",
        backgroundGradientToOpacity: 0.8,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
        propsForLabels: {
            fontSize: 12,
            fontWeight: "bold",
        },
        propsForBackgroundLines: {
            strokeDasharray: "",
            stroke: "#e0e0e0",
        },
        fillShadowGradientFrom: "#9F54B6",
        fillShadowGradientTo: "#D03957",
        fillShadowGradientFromOpacity: 0.7,
        fillShadowGradientToOpacity: 0.3,
        withCustomBarColorFromData: true, // Keep this if we ever use a bar chart with custom colors again
        bezier: true, // For smooth lines in LineChart
    };

    return (
        <GradientBackground>
            <SafeAreaView className="flex-1">
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: 16,
                        paddingVertical: 20,
                    }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                            <Text className="text-blue-600 text-lg font-pmedium">Back</Text>
                        </TouchableOpacity>
                        <Text className="text-2xl font-pbold text-black">Budget Insights</Text>
                        <View className="w-10" />
                    </View>

                    {/* Month Navigation (for Pie Chart only) */}
                    <View className="flex-row justify-center items-center mb-6 bg-slate-200 p-3 rounded-xl ">
                        <TouchableOpacity
                            onPress={() => navigateMonth("prev")}
                            className="p-2.5 rounded-full bg-gray-200"
                        >
                            <Text className="text-black font-psemibold text-base">{"<"}</Text>
                        </TouchableOpacity>
                        <Text className="text-xl font-pbold text-black mx-4 w-32 text-center">
                            {/* FIX: Changed to MMMM yyyy for proper year display */}
                            {format(currentMonth, "MMMM yyyy")}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigateMonth("next")}
                            className="p-2.5 rounded-full bg-gray-200"
                        >
                            <Text className="text-black font-psemibold text-base">{">"}</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View className="flex-1 justify-center items-center min-h-[300px]">
                            <ActivityIndicator size="large" color="#9F54B6" />
                            <Text className="text-lg text-gray-700 mt-4">
                                Loading insights...
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* Spending by Category (Pie Chart for Selected Month) */}
                            {spendingByCategoryData && spendingByCategoryData.length > 0 ? (
                                <View className="mb-8 p-4 bg-white rounded-xl shadow-md items-center">
                                    <Text className="text-lg font-pbold text-black mb-4">
                                        Spending by Category ({format(currentMonth, "MMMM yyyy")}) {/* FIX: Changed to MMMM yyyy */}
                                    </Text>
                                    <PieChart
                                        data={spendingByCategoryData}
                                        width={screenWidth - 64}
                                        height={220}
                                        chartConfig={chartConfig}
                                        accessor="population"
                                        backgroundColor="transparent"
                                        paddingLeft="15"
                                        absolute
                                    />
                                    <View className="flex-row flex-wrap justify-center mt-4">
                                        {spendingByCategoryData.map((item, index) => (
                                            <View
                                                key={index}
                                                className="flex-row items-center mr-4 mb-2"
                                            >
                                                <View
                                                    style={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: 6,
                                                        backgroundColor: item.color,
                                                        marginRight: 5,
                                                    }}
                                                />
                                                <Text className="text-sm text-gray-800">
                                                    {item.name} (${item.population.toFixed(2)})
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <View className="mb-8 p-4 bg-white rounded-xl shadow-md items-center justify-center min-h-[150px]">
                                    <Text className="text-gray-500 text-base font-pmedium">
                                        No spending data for {format(currentMonth, "MMMM yyyy")}. {/* FIX: Changed to MMMM yyyy */}
                                    </Text>
                                </View>
                            )}

                            {/* Spending Trends by Top Categories (Line Chart) */}
                            {historicalSpendingData && historicalSpendingData.datasets.length > 0 ? (
                                <View className="mb-8 p-4 bg-white rounded-xl shadow-md items-center">
                                    <Text className="text-lg font-pbold text-black mb-4">
                                        Spending Trends by Top Categories (Last {NUM_MONTHS_FOR_TREND} Months)
                                    </Text>
                                    <LineChart
                                        data={historicalSpendingData}
                                        width={screenWidth - 64}
                                        height={250}
                                        yAxisLabel="$"
                                        chartConfig={chartConfig}
                                        bezier // Smooth curves
                                        style={{ marginVertical: 8, borderRadius: 16 }}
                                        verticalLabelRotation={30}
                                    />
                                     <View className="flex-row flex-wrap justify-center mt-4">
                                        {historicalSpendingData.datasets.map((dataset, index) => (
                                            <View key={index} className="flex-row items-center mr-4 mb-2">
                                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dataset.color(), marginRight: 5 }} />
                                                <Text className="text-sm text-gray-800">{dataset.legend}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <View className="mb-8 p-4 bg-white rounded-xl shadow-md items-center justify-center min-h-[150px]">
                                    <Text className="text-gray-500 text-base font-pmedium">
                                        No historical spending trends available.
                                    </Text>
                                </View>
                            )}

                            {/* Monthly Budget Performance (Line Chart) */}
                            {monthlyBudgetPerformance && monthlyBudgetPerformance.datasets.length > 0 ? (
                                <View className="mb-8 p-4 bg-white rounded-xl shadow-md items-center">
                                    <Text className="text-lg font-pbold text-black mb-4">
                                        Monthly Budget Performance (Last {NUM_MONTHS_FOR_TREND} Months)
                                    </Text>
                                    <LineChart
                                        data={monthlyBudgetPerformance}
                                        width={screenWidth - 64}
                                        height={250}
                                        yAxisLabel="$"
                                        chartConfig={chartConfig}
                                        bezier
                                        style={{ marginVertical: 8, borderRadius: 16 }}
                                        verticalLabelRotation={30}
                                    />
                                    <View className="flex-row flex-wrap justify-center mt-4">
                                        {monthlyBudgetPerformance.datasets.map((dataset, index) => (
                                            <View key={index} className="flex-row items-center mr-4 mb-2">
                                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dataset.color(), marginRight: 5 }} />
                                                <Text className="text-sm text-gray-800">{dataset.legend}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <View className="mb-8 p-4 bg-white rounded-xl shadow-md items-center justify-center min-h-[150px]">
                                    <Text className="text-gray-500 text-base font-pmedium">
                                        No monthly budget performance data available.
                                    </Text>
                                </View>
                            )}
                        </>
                    )}

                    <View className="h-20" />
                </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    );
};

export default BudgetInsights;
