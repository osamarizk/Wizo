import React from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { format } from "date-fns";

const screenWidth = Dimensions.get("window").width;

const SpendingTrendsChart = ({ monthlySummary, isLoading }) => {
  // Debug log: See what monthlySummary is received
  console.log(
    "SpendingTrendsChart: monthlySummary prop received:",
    monthlySummary
  );

  // If data is still loading, show a loading indicator
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="small" color="#9F54B6" />
        <Text className="text-gray-600 mt-2">Loading spending trends...</Text>
      </View>
    );
  }

  // Defensive check: Ensure monthlySummary is an array before filtering
  const safeMonthlySummary = monthlySummary || [];

  // Filter out months that have no spending (totalSpending > 0)
  // This makes the chart more relevant by focusing on active spending periods.
  // Sort by month ascending to ensure the trend is displayed chronologically.
  const relevantMonthlyData = safeMonthlySummary
    .filter((item) => {
      const isRelevant = item.totalSpending > 0;
      // Debug log: Check each item's totalSpending before filter
      console.log(
        `Item for ${item.month}: totalSpending = ${item.totalSpending}, Is relevant: ${isRelevant}`
      );
      return isRelevant;
    })
    .sort((a, b) => new Date(a.month) - new Date(b.month));

  // Debug log: See what data is left after filtering
  console.log(
    "SpendingTrendsChart: relevantMonthlyData after filter:",
    relevantMonthlyData
  );

  // Prepare data for the Line Chart
  const chartData = {
    labels: relevantMonthlyData.map((item) =>
      format(new Date(item.month), "MMM")
    ), // e.g., "Jan", "Feb"
    datasets: [
      {
        data: relevantMonthlyData.map((item) => item.totalSpending),
        color: (opacity = 1) => `rgba(159, 84, 182, ${opacity})`, // Line color (e.g., purple)
        strokeWidth: 2, // Line thickness
      },
    ],
  };

  // Define the chart configuration
  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#9F54B6", // Start of gradient background
    backgroundGradientTo: "#2A9D8F", // End of gradient background
    decimalPlaces: 2, // Optional, defaults to 2dp
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Label/axis color
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6", // Radius of dots
      strokeWidth: "3",
      stroke: "#ffa726", // Dot border color
    },
    propsForBackgroundLines: {
      strokeDasharray: "", // Solid background lines
      stroke: "#ffffff40", // Lighter white for grid lines
    },
    fillShadowGradient: "#9F54B6", // Gradient for fill under the line
    fillShadowGradientOpacity: 0.5, // Opacity of fill gradient
  };

  if (relevantMonthlyData.length === 0) {
    return (
      <View className="p-4 mb-4 rounded-md bg-gray-50 border-t border-[#9F54B6]">
        <Text className="text-lg font-pbold text-black mb-4 text-center">
          Spending Trends
        </Text>
        <Text className="text-gray-500 italic text-center">
          No spending data available to show trends for the current year.
        </Text>
      </View>
    );
  }

  // Calculate dynamic width for the chart
  // We'll set a base width per data point (month) to ensure enough space for labels and dots
  const chartWidthPerMonth = 60; // Adjust this value to control spacing between months
  const dynamicChartWidth = Math.max(
    screenWidth - 30, // Minimum width, same as current
    relevantMonthlyData.length * chartWidthPerMonth // Dynamic width based on data points
  );

  return (
    <View className=" mb-1 bg-transparent mr-2 border-t border-[#9F54B6]">
      <Text className="text-lg font-pbold text-black mb-2 mt-2">
        Spending Trends (Current Year)
      </Text>
      <Text className="text-sm font-pregular text-gray-700 mb-2">
        See your overall spending patterns over time, showing total expenditure
        per month for the current year.
      </Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <LineChart
          data={chartData}
          width={dynamicChartWidth} // Apply the dynamic width
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chartStyle}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  chartStyle: {
    marginVertical: 10,
    borderRadius: 4,
  },
});

export default SpendingTrendsChart;
