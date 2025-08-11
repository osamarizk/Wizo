// settings/FinancialInsights.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  I18nManager,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect, router } from "expo-router";
import GradientBackground from "../components/GradientBackground";
import icons from "../constants/icons";
import { useGlobalContext } from "../context/GlobalProvider";
import {
  getReceiptStats,
  fetchUserReceipts,
  getUserBudgets,
  getWalletTransactions,
  createNotification,
  getCategories,
  initializeUserCategories,
} from "../lib/appwrite";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n";
import { format } from "date-fns";
import { ar as arLocale } from "date-fns/locale";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Utility function to convert numbers to Arabic numerals
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

const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20"; // Or "gemini-1.5-pro"
const DEFAULT_MAX_FREE_REQUESTS = 3;

const FinancialInsights = () => {
  const ListHeader = () => (
    <>
      <Text
        className={`text-2xl text-blue-800 mb-1 ${
          I18nManager.isRTL ? "text-right" : "text-left"
        }`}
        style={{ fontFamily: getFontClassName("bold") }}
      >
        {t("financialInsights.adviceTitle")}
      </Text>
      {lastGeneratedTime && (
        <Text
          className="text-base text-gray-500 mb-4"
          style={{
            fontFamily: getFontClassName("regular"),
            textAlign: I18nManager.isRTL ? "right" : "left",
          }}
        >
          {t("financialInsights.lastUpdated")}{" "}
          {format(lastGeneratedTime, "PPP p", {
            locale: currentLanguage.startsWith("ar") ? arLocale : undefined,
          })}
        </Text>
      )}
    </>
  );

  // Create a component that will act as the footer for the FlatList
  const ListFooter = () => (
    <Text
      className="text-base text-gray-700 mt-4 italic"
      style={{
        fontFamily: getFontClassName("light"),
        textAlign: I18nManager.isRTL ? "right" : "left",
      }}
    >
      {t("financialInsights.adviceDisclaimer")}
    </Text>
  );

  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, currentLanguage, preferredCurrencySymbol } = useGlobalContext();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [adviceText, setAdviceText] = useState([]);
  const [lastGeneratedTime, setLastGeneratedTime] = useState(null);
  const [dailyFreeRequests, setDailyFreeRequests] = useState(0);

  const [financialData, setFinancialData] = useState({
    totalReceipts: 0,
    overallSpending: 0,
    topSpendingCategories: [],
    budgetPerformance: [],
    walletBalance: 0,
    recentLargeExpenses: [],
    topFrequentMerchants: [],
    topFrequentItems: [],
  });

  const fetchDataForInsights = useCallback(async () => {
    if (!user?.$id) {
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    try {
      const receiptStats = await getReceiptStats(user.$id);
      const totalReceipts = receiptStats?.totalCount || 0;

      const allReceipts = await fetchUserReceipts(user.$id);
      console.log("Fetched all receipts for insights:", allReceipts);

      let overallSpending = 0;
      const categorySpendingById = {};
      const categoryIdToNameMap = {};
      const recentExpenses = [];
      const merchantVisits = {};
      const itemOccurrences = {};

      let allCategories = await getCategories(user.$id);

      if (allCategories.length === 0) {
        console.log(
          `User ${user.$id} has no categories. Initializing default categories...`
        );
        await initializeUserCategories(user.$id);
        allCategories = await getCategories(user.$id);
      }

      // --- Build the primary map from the user's categories.
      allCategories.forEach((cat) => {
        if (cat.$id) {
          categoryIdToNameMap[cat.$id] = cat.name;
        }
      });
      console.log(
        "Initial CategoryId to Name Map from user's categories:",
        categoryIdToNameMap
      );

      // Iterate through all receipts to aggregate spending and fill in any missing category names.
      allReceipts.forEach((receipt) => {
        let items = receipt.items;
        let parsedItems = [];
        if (typeof items === "string") {
          try {
            parsedItems = JSON.parse(items);
            if (!Array.isArray(parsedItems)) {
              parsedItems = [];
            }
          } catch (e) {
            console.error("Error parsing receipt items for insights:", e);
            parsedItems = [];
          }
        } else if (Array.isArray(items)) {
          parsedItems = items;
        }

        const totalReceiptAmount = parseFloat(receipt.total || 0);
        if (!isNaN(totalReceiptAmount) && totalReceiptAmount > 0) {
          overallSpending += totalReceiptAmount;
        }

        const merchantName = receipt.merchant;
        if (merchantName) {
          merchantVisits[merchantName] =
            (merchantVisits[merchantName] || 0) + 1;
        }

        if (parsedItems.length > 0) {
          parsedItems.forEach((item) => {
            const categoryName = item.category;
            const categoryId = item.category_id;
            const itemPrice = parseFloat(item.price || 0);
            const itemName = item.name;

            if (categoryId && !isNaN(itemPrice) && itemPrice > 0) {
              categorySpendingById[categoryId] =
                (categorySpendingById[categoryId] || 0) + itemPrice;
              // Add a mapping for this category ID if it's not already in the map
              if (!categoryIdToNameMap[categoryId]) {
                categoryIdToNameMap[categoryId] = categoryName;
              }
            } else {
              console.warn(
                `Item missing category ID or price in receipt ${receipt.$id}:`,
                item
              );
            }

            if (itemName) {
              itemOccurrences[itemName] = (itemOccurrences[itemName] || 0) + 1;
            }
          });
        } else {
          console.warn(
            `Receipt ID: ${receipt.$id} has no valid items to aggregate categories from.`
          );
        }

        const receiptDate = new Date(receipt.datetime);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (receiptDate >= thirtyDaysAgo && totalReceiptAmount > 500) {
          const mainReceiptCategory =
            parsedItems[0]?.category || "Uncategorized";
          recentExpenses.push({
            merchant: receipt.merchant,
            amount: totalReceiptAmount,
            date: format(receiptDate, "PPP", {
              locale: currentLanguage.startsWith("ar") ? arLocale : undefined,
            }),
            category: mainReceiptCategory,
          });
        }
      });

      console.log("--- DEBUGGING CATEGORY & BUDGET DATA ---");
      console.log("Final built CategoryId to Name Map:", categoryIdToNameMap);

      console.log(
        "Aggregated categorySpendingById object:",
        categorySpendingById
      );

      const safeCategorySpendingById =
        categorySpendingById && typeof categorySpendingById === "object"
          ? categorySpendingById
          : {};
      const sortedCategories = Object.entries(safeCategorySpendingById)
        .map(([id, amount]) => ({
          name: categoryIdToNameMap[id] || "Unknown Category",
          amount: amount,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      console.log(
        "Final sortedCategories array (should have names):",
        sortedCategories
      );

      const safeMerchantVisits =
        merchantVisits && typeof merchantVisits === "object"
          ? merchantVisits
          : {};
      const topFrequentMerchants = Object.entries(safeMerchantVisits)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));
      console.log("Top Frequent Merchants:", topFrequentMerchants);

      const safeItemOccurrences =
        itemOccurrences && typeof itemOccurrences === "object"
          ? itemOccurrences
          : {};
      const topFrequentItems = Object.entries(safeItemOccurrences)
        .filter(([, count]) => count > 1)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));
      console.log("Top Frequent Items:", topFrequentItems);

      const userBudgetsRaw = await getUserBudgets(user.$id);
      console.log("Raw userBudgets from Appwrite:", userBudgetsRaw);

      // Add a temporary mapping for any budget categories that don't exist
      userBudgetsRaw.forEach((budget) => {
        if (!categoryIdToNameMap[budget.categoryId]) {
          console.warn(
            `Budget found for non-existent category ID: ${budget.categoryId}. Mapping to 'Unknown Category'.`
          );
          categoryIdToNameMap[budget.categoryId] = "Unknown Category";
        }
      });
      console.log(
        "Updated CategoryId to Name Map after checking budgets:",
        categoryIdToNameMap
      );

      console.log("--- END DEBUGGING ---");

      const budgetPerformance = userBudgetsRaw
        .map((budget) => {
          console.log("Processing budget in Advise:", budget);
          const budgetedAmount = parseFloat(budget.budgetAmount || 0);
          const categoryId = budget.categoryId;

          const categoryName =
            categoryIdToNameMap[categoryId] || "Unknown Category";

          console.log("Processing budget [categoryName]:", categoryName);

          const categoryTotalSpent = categorySpendingById[categoryId] || 0;

          const status =
            categoryTotalSpent > budgetedAmount
              ? "over"
              : categoryTotalSpent < budgetedAmount
              ? "under"
              : "on track";
          return {
            category: categoryName,
            categoryId: categoryId,
            budgeted: budgetedAmount,
            spent: parseFloat(categoryTotalSpent || 0),
            status: status,
          };
        })
        .filter((budget) => budget.spent > 0); // NEW: Filter out budgets with zero spending

      console.log(
        "Processed budgetPerformance array (should have names and correct spent):",
        budgetPerformance
      );

      const userWallets = await getWalletTransactions(user.$id);
      const totalWalletBalance = userWallets.reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount || 0),
        0
      );

      setFinancialData({
        totalReceipts: totalReceipts,
        overallSpending: overallSpending || 0,
        topSpendingCategories: sortedCategories,
        budgetPerformance: budgetPerformance,
        walletBalance: totalWalletBalance || 0,
        recentLargeExpenses: recentExpenses.map((exp) => ({
          merchant: exp.merchant,
          amount: parseFloat(exp.amount || 0),
          date: exp.date,
          category: exp.category,
        })),
        topFrequentMerchants: topFrequentMerchants,
        topFrequentItems: topFrequentItems,
      });
    } catch (error) {
      console.error("Failed to fetch financial data for insights:", error);
      Alert.alert(t("common.error"), t("financialInsights.adviceErrorMessage"));
      setFinancialData({
        totalReceipts: 0,
        overallSpending: 0,
        topSpendingCategories: [],
        budgetPerformance: [],
        walletBalance: 0,
        recentLargeExpenses: [],
        topFrequentMerchants: [],
        topFrequentItems: [],
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [user?.$id, t, currentLanguage]);

  useFocusEffect(
    useCallback(() => {
      const loadDailyRequestState = async () => {
        const today = new Date().toDateString();
        const storedLastAdviceDate = await AsyncStorage.getItem(
          "lastAdviceDate"
        );
        let storedDailyFreeRequests = await AsyncStorage.getItem(
          "dailyFreeRequests"
        );

        if (storedLastAdviceDate !== today) {
          await AsyncStorage.setItem("lastAdviceDate", today);
          await AsyncStorage.setItem("dailyFreeRequests", "0");
          setDailyFreeRequests(0);
        } else {
          setDailyFreeRequests(parseInt(storedDailyFreeRequests || "0", 10));
        }
      };

      loadDailyRequestState();
      fetchDataForInsights();
      setAdviceText(""); // Clear advice text on focus/re-entry
      setLastGeneratedTime(null); // Clear last generated time

      return () => {};
    }, [fetchDataForInsights])
  );

  const generateAdvice = useCallback(async () => {
    // Before any state changes, check if we should skip
    if (isGeneratingAdvice || isLoadingData || !user?.$id) {
      console.log(
        "Generate Advice skipped (loading, generating, or no user):",
        { isGeneratingAdvice, isLoadingData, userId: user?.$id }
      );
      if (!user?.$id && !isGeneratingAdvice && !isLoadingData) {
        // Only alert if skipped due to no user and not already in a loading state
        Alert.alert(t("common.error"), t("common.notLoggedIn"));
      }
      return;
    }

    const isPremiumUser = user?.isPremium;
    const maxFreeRequestsToday =
      user?.maxFreeDailyInsights || DEFAULT_MAX_FREE_REQUESTS;

    console.log("Before limit check:", {
      dailyFreeRequests,
      maxFreeRequestsToday,
      isPremiumUser,
      condition: !isPremiumUser && dailyFreeRequests >= maxFreeRequestsToday,
    });

    // Check daily free request limit from state (managed by AsyncStorage)
    if (!isPremiumUser && dailyFreeRequests >= maxFreeRequestsToday) {
      Alert.alert(
        t("financialInsights.rateLimitedTitle"),
        t("financialInsights.rateLimitedMessage")
      );
      // It's crucial to set setIsGeneratingAdvice(false) here, as no API call will be made
      setIsGeneratingAdvice(false);
      return;
    }

    // Set loading state true AFTER all preliminary checks passed
    setIsGeneratingAdvice(true);
    setAdviceText(""); // Clear previous advice immediately

    try {
      const promptParts = [];
      promptParts.push(
        `Analyze the following financial summary for a user. Respond in ${
          currentLanguage === "ar" ? "Arabic" : "English"
        }.`
      );
      promptParts.push(
        `Your advice should cover different aspects of the financial data provided. Aim for diversity in topics across requests.`
      );
      promptParts.push(
        `Format your advice as a JSON array of objects. Each object must have a "header" (a concise, descriptive title for the advice) and a "body" (the detailed advice text). Do not output any text before or after the JSON. Ensure the entire response is a single JSON array.`
      );

      promptParts.push(`User's current financial summary:`);
      promptParts.push(
        `Total receipts uploaded: ${financialData.totalReceipts}`
      );
      promptParts.push(
        `Overall spending: ${financialData.overallSpending.toFixed(2)} ${t(
          "common.currency_symbol_short"
        )}`
      );
      promptParts.push(
        `Current wallet balance: ${financialData.walletBalance.toFixed(2)} ${t(
          "common.currency_symbol_short"
        )}`
      );

      if (financialData.topSpendingCategories.length > 0) {
        promptParts.push(
          `Top spending categories (name: amount): ${financialData.topSpendingCategories
            .map(
              (c) =>
                `${t(
                  `categories.${mapCategoryNameToI18nKey(c.name)}`
                )}: ${c.amount.toFixed(2)}`
            )
            .join(", ")}`
        );
      }

      if (financialData.budgetPerformance.length > 0) {
        promptParts.push(
          `The user currently has budgets set up for the following categories:`
        );
        financialData.budgetPerformance.forEach((bp) => {
          promptParts.push(
            `- ${t(
              `categories.${mapCategoryNameToI18nKey(bp.category)}`
            )}: Budgeted ${bp.budgeted.toFixed(2)} vs. Spent ${bp.spent.toFixed(
              2
            )} (Status: ${bp.status})`
          );
        });
        promptParts.push(
          `Please provide advice on budget adherence, optimization, and how to improve spending habits within or against these existing budgets.`
        );
      } else {
        promptParts.push(
          `The user does not currently have any budgets set up. Consider providing advice on the importance of budgeting and how to get started.`
        );
      }

      if (financialData.recentLargeExpenses.length > 0) {
        promptParts.push(
          `Recent notable expenses (over 500 ${t(
            "common.currency_symbol_short"
          )}):`
        );
        financialData.recentLargeExpenses.forEach((exp) => {
          promptParts.push(
            `- ${exp.merchant} - ${exp.amount.toFixed(2)} ${t(
              "common.currency_symbol_short"
            )} on ${exp.date} (Category: ${t(
              `categories.${mapCategoryNameToI18nKey(exp.category)}`
            )})`
          );
        });
      }

      if (
        financialData.topFrequentMerchants &&
        financialData.topFrequentMerchants.length > 0
      ) {
        promptParts.push(
          `${t(
            "financialInsights.frequentMerchantVisits"
          )} ${financialData.topFrequentMerchants
            .map((m) => `${m.name} (${m.count} visits)`)
            .join(", ")}`
        );
      }

      if (
        financialData.topFrequentItems &&
        financialData.topFrequentItems.length > 0
      ) {
        promptParts.push(
          `${t(
            "financialInsights.frequentItemPurchases"
          )} ${financialData.topFrequentItems
            .map((item) => `${item.name} (${item.count} times)`)
            .join(", ")}`
        );
      }

      if (isPremiumUser) {
        promptParts.push(
          `Provide comprehensive, personalized financial advice based on this data. Focus on identifying areas for savings, optimizing budget adherence, and improving overall financial health. Give actionable tips.`
        );
        promptParts.push(
          `Keep it concise, but informative. Prioritize offering unique advice topics each time the user requests advice, rotating between general spending, budget performance (if budgets exist), frequent purchases, merchant visit patterns, and other relevant insights from the data. Max 300 words.`
        );
      } else {
        promptParts.push(
          `Provide one general financial tip based on the user's data. Focus on a single area of improvement or a positive trend. Keep it very concise (max 100 words).`
        );
        promptParts.push(
          `Ensure this tip offers a new and distinct insight with each request, covering different aspects of their spending patterns or habits.`
        );
      }

      promptParts.push(
        `Request ID: ${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 10)}`
      );

      const prompt = promptParts.join("\n");
      console.log("Prompt to Gemini:", prompt);

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                header: { type: "STRING" },
                body: { type: "STRING" },
              },
              propertyOrdering: ["header", "body"],
            },
          },
        },
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Gemini API Raw Result:", result);

      if (
        result.promptFeedback?.blockReason ||
        result.candidates?.[0]?.finishReason === "SAFETY" ||
        result.candidates?.[0]?.safetyRatings?.some((rating) => rating.blocked)
      ) {
        console.error(
          "Gemini API response blocked due to safety reasons:",
          result
        );
        Alert.alert(
          t("financialInsights.adviceErrorTitle"),
          t("financialInsights.contentBlockedMessage") ||
            "The financial advice could not be generated due to content policy. Please try again or rephrase if you used unusual terms."
        );
        setAdviceText("");
      } else if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const text = result.candidates[0].content.parts[0].text;
        try {
          const parsedAdvice = JSON.parse(text);
          if (Array.isArray(parsedAdvice)) {
            setAdviceText(parsedAdvice);

            await createNotification({
              user_id: user.$id,
              title: t("financialInsights.adviceTitle"),
              message:
                parsedAdvice[0]?.header ||
                t("financialInsights.newInsightAvailable"), // Use the header of the first item
              type: "insight",
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
          } else {
            // Handle case where it's not a valid array, maybe set an error state
            console.error("Parsed advice is not an array:", parsedAdvice);
            setAdviceText([]);
            Alert.alert(
              t("common.error"),
              t("financialInsights.adviceErrorMessage")
            );
          }
        } catch (e) {
          console.error("Error parsing advice JSON:", e);
          setAdviceText([]); // Reset advice on error
          Alert.alert(
            t("common.error"),
            t("financialInsights.adviceErrorMessage")
          );
        }
        setLastGeneratedTime(new Date());

        if (!isPremiumUser) {
          const newCount = dailyFreeRequests + 1;
          setDailyFreeRequests(newCount);
          console.log("Updated dailyFreeRequests to:", newCount);
          await AsyncStorage.setItem("dailyFreeRequests", String(newCount));
          await AsyncStorage.setItem(
            "lastAdviceDate",
            new Date().toDateString()
          );
        }
      } else {
        console.error(
          "Gemini API returned unexpected structure or no content:",
          result
        );
        Alert.alert(
          t("financialInsights.adviceErrorTitle"),
          t("financialInsights.adviceErrorMessage")
        );
        setAdviceText("");
      }
    } catch (error) {
      console.error("Error generating financial advice:", error);
      Alert.alert(
        t("financialInsights.adviceErrorTitle"),
        t("financialInsights.adviceErrorMessage", {
          error: error.message || t("common.unknownError"),
        })
      );
      setAdviceText("");
    } finally {
      // This block will always execute after try/catch/else if
      setIsGeneratingAdvice(false);
      console.log(
        "Finished generating advice. isGeneratingAdvice set to false."
      );
    }
  }, [user, financialData, dailyFreeRequests, t, currentLanguage]);

  const mapCategoryNameToI18nKey = (categoryNameFromDB) => {
    if (!categoryNameFromDB) return "";
    switch (categoryNameFromDB) {
      case "Food & Dining":
        return "foodDining";
      case "Transportation":
        return "transportation";
      case "Shopping":
        return "shopping";
      case "Health & Wellness":
        return "healthWellness";
      case "Bills & Utilities":
        return "billsUtilities";
      case "Entertainment & Leisure":
        return "entertainmentLeisure";
      case "Business Expenses":
        return "businessExpenses";
      case "Education":
        return "education";
      case "Financial Services":
        return "financialServices";
      case "Gifts & Donations":
        return "giftsDonations";
      case "Home Improvement":
        return "homeImprovement";
      case "Miscellaneous":
        return "miscellaneous";
      case "Household Items":
        return "householdItems";
      case "Clothing":
        return "clothing";
      default:
        return categoryNameFromDB
          .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) =>
            chr ? chr.toUpperCase() : ""
          )
          .replace(/^./, (match) => match.toLowerCase());
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        {/* Diagnostic logs visible in console for debugging isGeneratingAdvice and dailyFreeRequests */}
        {console.log(
          "Render: isGeneratingAdvice:",
          isGeneratingAdvice,
          "dailyFreeRequests:",
          dailyFreeRequests
        )}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="mr-3 ml-3 mt-8"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            className={`flex-row items-center justify-between mb-8 mt-4 ${
              I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text
                className="text-blue-600 text-lg"
                style={{ fontFamily: getFontClassName("medium") }}
              >
                {t("common.back")}{" "}
              </Text>
            </TouchableOpacity>
            <Text
              className="text-3xl text-black text-center flex-1 "
              style={{ fontFamily: getFontClassName("bold") }}
            >
              {t("financialInsights.pageTitle")}
            </Text>
            <View className="w-10" />
          </View>

          {/* Conditional rendering for no data */}
          {financialData.totalReceipts === 0 && !isLoadingData ? (
            <View className="bg-white rounded-xl p-6 mb-6 border border-gray-200 items-center justify-center">
              <Image
                source={icons.check}
                className="w-12 h-12 mb-4 tint-gray-500"
                resizeMode="contain"
              />
              <Text
                className="text-xl text-gray-800 mb-2 text-center"
                style={{ fontFamily: getFontClassName("bold") }}
              >
                {t("financialInsights.noDataTitle")}
              </Text>
              <Text
                className="text-base text-gray-600 text-center"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("financialInsights.noDataMessage")}
              </Text>
            </View>
          ) : (
            <>
              {/* Get Advice Button - Moved to top for best practice */}
              <TouchableOpacity
                // The key prop is here, it should force re-evaluation if these dependencies change
                key={`advice-button-${dailyFreeRequests}-${isGeneratingAdvice}-${user?.isPremium}`}
                onPress={generateAdvice}
                className={`flex-row items-center justify-center p-4 rounded-xl shadow-lg mb-3 ${
                  // Added rounded-xl
                  isGeneratingAdvice ||
                  (user &&
                    !user.isPremium &&
                    dailyFreeRequests >=
                      (user?.maxFreeDailyInsights || DEFAULT_MAX_FREE_REQUESTS))
                    ? "bg-gray-400 opacity-70"
                    : "bg-[#2A9D8F] hover:bg-[#21867A] active:bg-[#1A6F5A"
                }`}
                disabled={
                  isGeneratingAdvice ||
                  (user &&
                    !user.isPremium &&
                    dailyFreeRequests >=
                      (user?.maxFreeDailyInsights || DEFAULT_MAX_FREE_REQUESTS))
                }
              >
                {isGeneratingAdvice ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                    className={`${I18nManager.isRTL ? "ml-2" : "mr-2"}`}
                  />
                ) : (
                  <Image
                    source={icons.sparkles}
                    className={`w-6 h-6 tint-white ml-2 ${
                      I18nManager.isRTL ? "ml-2" : "mr-2"
                    }`}
                    resizeMode="contain"
                  />
                )}
                <Text
                  className="text-white text-xl"
                  style={{ fontFamily: getFontClassName("extrabold") }}
                >
                  {isGeneratingAdvice
                    ? t("financialInsights.generatingAdvice")
                    : t("financialInsights.getAdviceButton")}
                </Text>
              </TouchableOpacity>

              {/* Display Advice Limit Status */}
              {!user?.isPremium && ( // Only show this if not premium
                <View className=" mb-2   items-center ">
                  <Text
                    className="text-slate-700 text-base text-center "
                    style={{ fontFamily: getFontClassName("regular") }}
                  >
                    {dailyFreeRequests <
                    (user?.maxFreeDailyInsights || DEFAULT_MAX_FREE_REQUESTS)
                      ? t("financialInsights.freeAdviceRemaining", {
                          count: dailyFreeRequests,
                          max:
                            user?.maxFreeDailyInsights ||
                            DEFAULT_MAX_FREE_REQUESTS,
                        })
                      : t("financialInsights.freeAdviceExhausted")}
                  </Text>
                  {dailyFreeRequests >=
                    (user?.maxFreeDailyInsights ||
                      DEFAULT_MAX_FREE_REQUESTS) && (
                    <TouchableOpacity
                      onPress={() => router.push("/upgrade-premium")}
                      className="mt-2"
                    >
                      <Text
                        className="text-[#D03957] text-base underline"
                        style={{ fontFamily: getFontClassName("medium") }}
                      >
                        {t("financialInsights.upgradeToPremiumShort")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* AI Advice Display - Only show if adviceText is present */}
              {adviceText ? (
                <View className="bg-transparent border border-gray-200 rounded-xl">
                  {/* Header Section */}
                  <View className="p-6">
                    <Text
                      className={`text-2xl text-blue-800 mb-1 ${
                        I18nManager.isRTL ? "text-right" : "text-left"
                      }`}
                      style={{ fontFamily: getFontClassName("bold") }}
                    >
                      {t("financialInsights.adviceTitle")}
                    </Text>
                    {lastGeneratedTime && (
                      <Text
                        className="text-base text-gray-500 mb-4"
                        style={{
                          fontFamily: getFontClassName("regular"),
                          textAlign: I18nManager.isRTL ? "right" : "left",
                        }}
                      >
                        {t("financialInsights.lastUpdated")}{" "}
                        {format(lastGeneratedTime, "PPP p", {
                          locale: currentLanguage.startsWith("ar")
                            ? arLocale
                            : undefined,
                        })}
                      </Text>
                    )}
                  </View>

                  {/* Advice Items rendered by mapping over the array */}
                  {adviceText.map((item, index) => (
                    <View
                      key={`advice-${index}`}
                      className="bg-white p-4 mx-3 rounded-xl mb-4 shadow-md"
                    >
                      <Text
                        className={`text-lg text-black mb-1 ${
                          I18nManager.isRTL ? "text-right" : "text-left"
                        }`}
                        style={{ fontFamily: getFontClassName("bold") }}
                      >
                        {item.header}
                      </Text>
                      <Text
                        className={`text-base text-gray-700 ${
                          I18nManager.isRTL ? "text-right" : "text-left"
                        }`}
                        style={{ fontFamily: getFontClassName("regular") }}
                      >
                        {item.body}
                      </Text>
                    </View>
                  ))}

                  {/* Footer Section */}
                  <View className="p-6">
                    <Text
                      className="text-base text-gray-700 italic"
                      style={{
                        fontFamily: getFontClassName("light"),
                        textAlign: I18nManager.isRTL ? "right" : "left",
                      }}
                    >
                      {t("financialInsights.adviceDisclaimer")}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Data Summary Section - Placed after advice */}
              <View className="bg-white rounded-xl p-8 mb-6 shadow-md ">
                <Text
                  className={`text-xl text-[#D03957] mb-4 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("bold") }}
                >
                  {t("manageData.dataSummaryTitle")}
                </Text>
                <View
                  className={`flex-row items-center justify-between py-2 border-t border-[#4E17B3] ${
                    I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Text
                    className="text-lg text-gray-700"
                    style={{ fontFamily: getFontClassName("bold") }}
                  >
                    {t("manageData.totalReceiptsUploaded")}:
                  </Text>
                  <Text
                    className="text-lg text-[#D03957]"
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    {i18n.language.startsWith("ar")
                      ? convertToArabicNumerals(financialData.totalReceipts)
                      : financialData.totalReceipts}
                  </Text>
                </View>
                <View
                  className={`flex-row items-center justify-between py-2 border-t border-[#4E17B3] ${
                    I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Text
                    className="text-lg text-gray-700"
                    style={{ fontFamily: getFontClassName("bold") }}
                  >
                    {t("manageData.overallSpendingRecorded")}:
                  </Text>
                  <Text
                    className="text-lg text-[#D03957]"
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    {i18n.language.startsWith("ar")
                      ? `${convertToArabicNumerals(
                          financialData.overallSpending.toFixed(2)
                        )} ${preferredCurrencySymbol}`
                      : `${preferredCurrencySymbol}${financialData.overallSpending.toFixed(
                          2
                        )}`}
                  </Text>
                </View>
                {financialData.topSpendingCategories.length > 0 && (
                  <View className="py-2 border-t border-[#4E17B3]">
                    <Text
                      className={`text-lg text-gray-700 mb-2 ${
                        I18nManager.isRTL ? "text-right" : "text-left"
                      }`}
                      style={{ fontFamily: getFontClassName("bold") }}
                    >
                      {t("financialInsights.topSpendingCategories")}: {" "}
                      {financialData.topSpendingCategories.map((c, index) => (
                        <Text
                          key={index}
                          className="text-base text-[#D03957]"
                          style={{
                            fontFamily: getFontClassName("semibold"),
                            textAlign: I18nManager.isRTL ? "right" : "left",
                            marginBottom:
                              index <
                              financialData.topSpendingCategories.length - 1
                                ? 4
                                : 0,
                          }}
                        >
                          {`${t(
                            `categories.${mapCategoryNameToI18nKey(c.name)}`
                          )}: `}
                          {i18n.language.startsWith("ar")
                            ? `${convertToArabicNumerals(
                                c.amount.toFixed(2)
                              )} ${preferredCurrencySymbol}`
                            : `${preferredCurrencySymbol}${c.amount.toFixed(
                                2
                              )}`}
                        </Text>
                      ))}
                    </Text>
                  </View>
                )}
                <View
                  className={`flex-row items-center justify-between py-2 border-t ${
                    I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Text
                    className="text-lg text-gray-700"
                    style={{ fontFamily: getFontClassName("bold") }}
                  >
                    {t("financialInsights.walletBalance")}:
                  </Text>
                  <Text
                    className="text-lg text-[#D03957]"
                    style={{ fontFamily: getFontClassName("semibold") }}
                  >
                    {i18n.language.startsWith("ar")
                      ? `${convertToArabicNumerals(
                          financialData.walletBalance.toFixed(2)
                        )} ${preferredCurrencySymbol}`
                      : `${preferredCurrencySymbol}${financialData.walletBalance.toFixed(
                          2
                        )}`}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Upgrade to Premium Call to Action (if not premium)
          {user && !user.isPremium && (
            <TouchableOpacity
              onPress={() => router.push("/upgrade-premium")}
              className={`flex-row items-center justify-center p-4 rounded-xl mt-4 bg-[#4E17B3]`}
            >
              <Image
                source={icons.star}
                className={`w-6 h-6 tint-white ${
                  I18nManager.isRTL ? "ml-2" : "mr-2"
                }`}
                resizeMode="contain"
              />
              <Text
                className="text-white text-lg"
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {t("financialInsights.upgradeToPremium")}
              </Text>
            </TouchableOpacity>
          )} */}

          {/* Spacer for bottom padding */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

// Create a component that will act as the header for the FlatList

export default FinancialInsights;
