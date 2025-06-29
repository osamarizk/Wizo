import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  I18nManager,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { format } from "date-fns";
import { ar as arLocale } from "date-fns/locale";

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils"; // Assumed to return direct font family name
import i18n from "../utils/i18n";

const convertToArabicNumerals = (num) => {
  const numString = String(num || 0);
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

const screenWidth = Dimensions.get("window").width;

const SpendingTrendsChart = ({ monthlySummary, isLoading }) => {
  const { t } = useTranslation();

  console.log(
    "SpendingTrendsChart: monthlySummary prop received:",
    monthlySummary
  );

  const currentDateFormatLocale = i18n.language.startsWith("ar")
    ? arLocale
    : undefined;

  const formatMonthName = useCallback(
    (dateString) => {
      return format(new Date(dateString), "MMM", {
        locale: currentDateFormatLocale,
      });
    },
    [currentDateFormatLocale]
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="small" color="#9F54B6" />
        <Text
          className="text-gray-600 mt-2"
          style={{ fontFamily: getFontClassName("regular") }}
        >
          {t("home.loadingSpendingTrends")}
        </Text>
      </View>
    );
  }

  const safeMonthlySummary = monthlySummary || [];

  const relevantMonthlyData = safeMonthlySummary
    .filter((item) => {
      const isRelevant = (item.totalSpending || 0) > 0;
      console.log(
        `Item for ${item.month}: totalSpending = ${item.totalSpending}, Is relevant: ${isRelevant}`
      );
      return isRelevant;
    })
    .sort((a, b) => new Date(a.month) - new Date(b.month));

  console.log(
    "SpendingTrendsChart: relevantMonthlyData after filter:",
    relevantMonthlyData
  );

  const chartData = {
    labels: relevantMonthlyData.map((item) => formatMonthName(item.month)),
    datasets: [
      {
        data: relevantMonthlyData.map((item) => item.totalSpending || 0),
        color: (opacity = 1) => `rgba(159, 84, 182, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#9F54B6",
    backgroundGradientTo: "#2A9D8F",
    decimalPlaces: 0, // Set to 0 if you primarily want whole numbers on Y-axis
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Labels (dots) and grid lines color
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // X and Y axis label color

    // --- CRITICAL FIX FOR FONT AND NUMERALS IN CHART LABELS ---
    // React-native-chart-kit uses 'fontFamily' directly for label styles
    // Ensure getFontClassName returns the actual font family name (e.g., 'Cairo-Regular')
    propsForLabels: {
      fontFamily: getFontClassName("extrabold"), // Apply Cairo/Poppins Regular here
      fontSize: 12, // Adjust font size as needed
    },

    // Format Y-axis labels with currency symbol and Arabic numerals
    formatYLabel: (yValue) => {
      const formattedValue = (yValue || 0).toFixed(0); // Ensure yValue is number, default to 0. toFixed(0) for whole numbers.
      return i18n.language.startsWith("ar")
        ? `${convertToArabicNumerals(formattedValue)} ${t(
            "common.currency_symbol_short"
          )}`
        : `${formattedValue} ${t("common.currency_symbol_short")}`;
    },
    // Format X-axis labels (month names) -- handled by formatMonthName in labels array
    formatXLabel: (xValue) => {
      return xValue; // xValue is already formatted by `formatMonthName` (e.g., "Jan", "يناير")
    },

    style: {
      borderRadius: 18,

      // Adjust padding for RTL. react-native-chart-kit handles some mirroring,
      // but explicit padding can ensure labels don't get cut off.
      // Increased right padding for RTL to make space for Arabic numbers on Y-axis.
      paddingRight: I18nManager.isRTL ? 50 : 16, // More space on right for Arabic labels if they get squished
      paddingLeft: I18nManager.isRTL ? 16 : 50, // More space on left for LTR labels (Y-axis)
      paddingBottom: 0, // No extra padding at the bottom from the chart-kit itself
    },
    propsForDots: {
      r: "6",
      strokeWidth: "3",
      stroke: "#ffa726",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#ffffff40",
    },
    fillShadowGradient: "#9F54B6",
    fillShadowGradientOpacity: 0.5,

    yAxisLabel: "", // Removed currency symbol from yAxisLabel as it's handled in formatYLabel
    xAxisLabel: "", // X-axis labels are handled by `labels` directly
  };

  if (relevantMonthlyData.length === 0) {
    return (
      <View className="p-4 mb-4 rounded-md bg-gray-50 border-t border-[#9F54B6] ">
        <Text
          className="text-lg text-black mb-4 text-center"
          style={{ fontFamily: getFontClassName("regular") }}
        >
          {t("home.spendingTrendsTitle")}
        </Text>
        <Text
          className="text-gray-500 italic text-center"
          style={{ fontFamily: getFontClassName("regular") }}
        >
          {t("home.noSpendingTrendsData")}
        </Text>
      </View>
    );
  }

  const chartWidthPerMonth = 60;
  const dynamicChartWidth = Math.max(
    screenWidth - 30,
    relevantMonthlyData.length * chartWidthPerMonth
  );

  return (
    <View className="mb-1 bg-transparent mr-2 border-t border-[#9F54B6]">
      <Text
        className={`text-lg text-black mb-2 mt-2 ${
          I18nManager.isRTL ? "text-right" : "text-left"
        }`}
        style={{ fontFamily: getFontClassName("bold") }}
      >
        {t("home.spendingTrendsCurrentYear")}
      </Text>
      <Text
        className={`text-sm text-gray-700 mb-2 ${
          I18nManager.isRTL ? "text-right" : "text-left"
        }`}
        style={{ fontFamily: getFontClassName("semibold") }}
      >
        {t("home.spendingTrendsDescription")}
      </Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <LineChart
          data={chartData}
          width={dynamicChartWidth}
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
    // Note: alignSelf might interact with ScrollView.
    // Ensure the chart's content isn't overflowing or misaligned.
    // If issues persist, consider removing alignSelf here and managing alignment via parent View.
    // alignSelf: I18nManager.isRTL ? "items-end" : "items-start", // Changed to flex-start for LTR, which chart-kit often aligns with

    marginVertical: 10,
    borderRadius: 4,
    fontFamily: getFontClassName("semibold"),
    fontSize: 12,
  },
});

export default SpendingTrendsChart;
