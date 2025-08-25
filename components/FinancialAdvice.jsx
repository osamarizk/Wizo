// src/components/FinancialAdvice.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import { I18nManager } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";

// Define a default for the maximum number of free advice requests per day
const DEFAULT_MAX_FREE_REQUESTS = 3;

// Function to call the Gemini API
const generateAIAdvice = async (prompt) => {
  // Use exponential backoff for API calls
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = {
        contents: chatHistory,
      };

      const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY || "";
      const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Handle specific API error codes
      if (response.status === 429) {
        throw new Error("RATE_LIMITED");
      }
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        return result.candidates[0].content.parts[0].text;
      } else {
        // Handle content blocked or empty response
        if (result.candidates?.[0]?.safetyRatings?.length > 0) {
          throw new Error("CONTENT_BLOCKED");
        }
        throw new Error("Invalid API response structure.");
      }
    } catch (error) {
      if (
        error.message === "RATE_LIMITED" ||
        error.message === "CONTENT_BLOCKED"
      ) {
        throw error; // Re-throw specific errors to be handled upstream
      }
      console.error(`Attempt ${retryCount + 1} failed: ${error.message}`);
      if (retryCount < maxRetries - 1) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential delay
        await new Promise((res) => setTimeout(res, delay));
        retryCount++;
      } else {
        throw error;
      }
    }
  }
};

const FinancialAdvice = ({ financialData, isLoadingData }) => {
  const { t } = useTranslation();
  const { user } = useGlobalContext();
  const [advice, setAdvice] = useState("");
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [adviceError, setAdviceError] = useState("");
  const [dailyFreeRequests, setDailyFreeRequests] = useState(0); // Local state for daily count

  const isPremiumUser = user?.isPremium;
  const maxFreeRequestsToday =
    user?.maxFreeDailyInsights || DEFAULT_MAX_FREE_REQUESTS;

  // Function to load the daily advice count from storage
  const loadAdviceCount = async () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const savedData = await AsyncStorage.getItem("financialAdviceCount");
      if (savedData) {
        const { date, count } = JSON.parse(savedData);
        if (date === today) {
          setDailyFreeRequests(count);
        } else {
          // Reset count for a new day
          setDailyFreeRequests(0);
        }
      } else {
        // Initialize if no data is found
        setDailyFreeRequests(0);
      }
    } catch (e) {
      console.error("Failed to load advice count from storage", e);
      setDailyFreeRequests(0);
    }
  };

  useEffect(() => {
    loadAdviceCount();
  }, [user]);

  const getAdvice = useCallback(async () => {
    if (isLoadingData) {
      return;
    }

    // Check daily free request limit using context data
    if (!isPremiumUser && dailyFreeRequests >= maxFreeRequestsToday) {
      setAdviceError(t("financialInsights.rateLimitedMessage"));
      return;
    }

    setIsGeneratingAdvice(true);
    setAdviceError("");
    setAdvice("");

    try {
      const {
        overallSpending,
        topSpendingCategories,
        budgetPerformance,
        recentLargeExpenses,
        walletBalance,
        frequentMerchants,
      } = financialData;

      // Check if there is enough data to generate advice
      const hasSufficientData =
        overallSpending > 0 ||
        topSpendingCategories.length > 0 ||
        budgetPerformance.length > 0;

      if (!hasSufficientData) {
        setAdviceError(t("financialInsights.adviceNoData"));
        return;
      }

      let prompt = `Act as a helpful, friendly, and encouraging financial advisor. Analyze the following financial data for a user. Do not mention "AI" or "financial advisor". Your response should be a concise, single paragraph. Use the following data to identify a key financial pattern and provide one actionable piece of advice. Do not simply list the data.

Financial Data:
- Wallet Balance: $${walletBalance?.toFixed(2) || 0}
- Total spending (last 30 days): $${overallSpending?.toFixed(2) || 0}
- Top spending categories: ${topSpendingCategories
        .map((cat) => `${cat.name} ($${cat.amount.toFixed(2)})`)
        .join(", ")}
- Budget status: ${budgetPerformance
        .map(
          (budg) =>
            `${budg.category} budget of $${budg.budgeted.toFixed(2)} is ${
              budg.status
            } (${budg.spent.toFixed(2)} spent)`
        )
        .join("; ")}
- Frequent merchants: ${frequentMerchants
        ?.map((m) => `${m.name} (${m.count} visits)`)
        .join(", ")}
- Large expenses (last 30 days): ${recentLargeExpenses
        ?.map((exp) => `${exp.amount.toFixed(2)} at ${exp.merchant}`)
        .join(", ")}

Analyze the data and provide one clear, actionable tip based on the most prominent pattern you find. For example, if they frequently visit a merchant, suggest setting a budget for that merchant. If a category is over budget, suggest finding ways to cut back.`;

      const generatedAdvice = await generateAIAdvice(prompt);
      setAdvice(generatedAdvice);

      // Increment and save the count after a successful generation
      if (!isPremiumUser) {
        // Use a functional update to ensure we are always working with the latest state
        setDailyFreeRequests((prevCount) => {
          const newCount = prevCount + 1;
          const today = new Date().toISOString().slice(0, 10);
          AsyncStorage.setItem(
            "financialAdviceCount",
            JSON.stringify({ date: today, count: newCount })
          );
          return newCount;
        });
      }
    } catch (error) {
      console.error("Failed to generate financial advice:", error);
      if (error.message === "RATE_LIMITED") {
        setAdviceError(t("financialInsights.rateLimitedMessage"));
      } else if (error.message === "CONTENT_BLOCKED") {
        setAdviceError(t("financialInsights.contentBlockedMessage"));
      } else {
        setAdviceError(t("financialInsights.adviceErrorMessage"));
      }
    } finally {
      setIsGeneratingAdvice(false);
    }
  }, [financialData, isLoadingData, isPremiumUser, maxFreeRequestsToday, t]); // Removed dailyFreeRequests from dependency array because we use functional update now

  // Effect to trigger initial advice generation
  useEffect(() => {
    if (!isLoadingData && !isGeneratingAdvice && !advice && user) {
      getAdvice();
    }
  }, [isLoadingData, getAdvice, isGeneratingAdvice, advice, user]);

  // Render the advice content based on state
  const renderAdviceContent = () => {
    if (isGeneratingAdvice) {
      return <ActivityIndicator size="small" color="#9F54B6" />;
    }
    if (adviceError) {
      return (
        <Text
          className="text-red-500 text-center"
          style={{ fontFamily: getFontClassName("regular") }}
        >
          {adviceError}
        </Text>
      );
    }
    if (advice) {
      return (
        <Text
          className="text-white text-base"
          style={{ fontFamily: getFontClassName("regular") }}
        >
          {advice}
        </Text>
      );
    }
    return (
      <Text
        className="text-gray-400 italic text-center"
        style={{ fontFamily: getFontClassName("regular") }}
      >
        {t("financialInsights.adviceNoData")}
      </Text>
    );
  };

  const remainingAdvice = maxFreeRequestsToday - dailyFreeRequests;
  const disableButton =
    isGeneratingAdvice || (!isPremiumUser && remainingAdvice <= 0);

  return (
    <View className="bg-[#1a1a1a] p-4 rounded-xl mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className="text-white text-lg"
          style={{ fontFamily: getFontClassName("semibold") }}
        >
          {t("financialInsights.adviceTitle")}
        </Text>
        <TouchableOpacity onPress={getAdvice} disabled={disableButton}>
          <Text
            className={`text-sm ${
              disableButton ? "text-gray-500" : "text-purple-400"
            }`}
            style={{ fontFamily: getFontClassName("regular") }}
          >
            {t("financialInsights.refreshAdvice")}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mb-4">{renderAdviceContent()}</View>

      {!isPremiumUser && (
        <View className="flex-row justify-center items-center">
          {remainingAdvice > 0 ? (
            <Text
              className="text-gray-400 text-sm"
              style={{ fontFamily: getFontClassName("regular") }}
            >
              {t("financialInsights.freeAdviceRemaining", {
                count: remainingAdvice,
                max: maxFreeRequestsToday,
              })}
            </Text>
          ) : (
            <>
              <Text
                className="text-gray-400 text-sm"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("financialInsights.freeAdviceExhausted")}
              </Text>
              <TouchableOpacity onPress={() => router.push("/upgrade-premium")}>
                <Text
                  className="text-purple-400 text-sm ml-2"
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  {t("financialInsights.upgradeToPremiumShort")}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {isPremiumUser && (
        <Text
          className="text-gray-400 text-sm text-center"
          style={{ fontFamily: getFontClassName("regular") }}
        >
          {t("financialInsights.unlimitedAdvice")}
        </Text>
      )}
    </View>
  );
};

export default FinancialAdvice;
