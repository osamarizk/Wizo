// components/FinancialDataCards.jsx

import React from "react";
import { View, Text, I18nManager } from "react-native";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n";

// The user provided this function, so I'll include it.
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

// A card component to display a single financial metric
const DataCard = ({ title, value, isRTL }) => (
  <View
    className={`bg-gray-800 rounded-xl p-4 shadow-sm flex-1`}
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}
  >
    <Text
      className="text-gray-300 text-sm mb-1"
      style={{ fontFamily: getFontClassName("regular") }}
    >
      {title}
    </Text>
    <Text
      className={`text-white text-xl ${isRTL ? "text-right" : "text-left"}`}
      style={{ fontFamily: getFontClassName("semibold") }}
    >
      {value}
    </Text>
  </View>
);

const FinancialDataCards = ({ financialData, preferredCurrencySymbol }) => {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  // Utility to format currency with Arabic numerals if needed
  const formatCurrency = (amount) => {
    const formatted = parseFloat(amount).toFixed(2);
    if (i18n.language.startsWith("ar")) {
      return `${convertToArabicNumerals(formatted)} ${preferredCurrencySymbol}`;
    } else {
      return `${preferredCurrencySymbol}${formatted}`;
    }
  };

  return (
    <View className="mb-6">
      {/* Title for the section */}
      <Text
        className={`text-white text-xl mb-4 ${
          isRTL ? "text-right" : "text-left"
        }`}
        style={{ fontFamily: getFontClassName("bold") }}
      >
        {t("manageData.dataSummaryTitle")}
      </Text>

      {/* Row 1: Overall Spending and Wallet Balance */}
      <View className="flex-row justify-between mb-4">
        {/* Overall Spending Card */}
        <View className="flex-1 mr-2">
          <DataCard
            title={t("manageData.overallSpendingRecorded")}
            value={formatCurrency(financialData.overallSpending)}
            isRTL={isRTL}
          />
        </View>

        {/* Wallet Balance Card */}
        <View className="flex-1 ml-2">
          <DataCard
            title={t("financialInsights.walletBalance")}
            value={formatCurrency(financialData.walletBalance)}
            isRTL={isRTL}
          />
        </View>
      </View>

      {/* Row 2: Total Receipts and Top Spending Categories */}
      <View className="flex-row justify-between">
        {/* Total Receipts Uploaded Card */}
        <View className="flex-1 mr-2">
          <DataCard
            title={t("manageData.totalReceiptsUploaded")}
            value={
              i18n.language.startsWith("ar")
                ? convertToArabicNumerals(financialData.totalReceipts)
                : financialData.totalReceipts
            }
            isRTL={isRTL}
          />
        </View>

        {/* Top Spending Categories Card */}
        <View
          className={`bg-gray-800 rounded-xl p-4 shadow-sm flex-1 ml-2`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text
            className="text-gray-300 text-sm mb-2"
            style={{ fontFamily: getFontClassName("regular") }}
          >
            {t("financialInsights.topSpendingCategories")}
          </Text>
          {financialData.topSpendingCategories.length > 0 &&
            financialData.topSpendingCategories.map((c, index) => (
              <View
                key={index}
                className="flex-row justify-between"
                style={{ direction: isRTL ? "rtl" : "ltr" }}
              >
                <Text
                  className="text-white text-base"
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  {t(
                    `categories.${c.name.toLowerCase().replace(/\s/g, "_")}`
                  ) || c.name}
                </Text>
                <Text
                  className="text-white text-base"
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {formatCurrency(c.amount)}
                </Text>
              </View>
            ))}
        </View>
      </View>
    </View>
  );
};

export default FinancialDataCards;
