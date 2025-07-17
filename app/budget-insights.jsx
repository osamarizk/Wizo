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
    I18nManager,
} from "react-native";
import { useGlobalContext } from "../context/GlobalProvider";
import GradientBackground from "../components/GradientBackground";
import { useNavigation, useFocusEffect } from "expo-router";
import {
    getUserBudgets,
    getReceiptsForPeriod,
    getCategories2Bud,
} from "../lib/appwrite";

import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    addMonths,
    eachMonthOfInterval,
} from "date-fns";
import { ar as arLocale } from "date-fns/locale";

import { useTranslation } from "react-i18next";
import i18n from "../utils/i18n";
import { getFontClassName } from "../utils/fontUtils";

const screenWidth = Dimensions.get("window").width;
const NUM_MONTHS_FOR_TREND = 6;

// Utility function to convert numbers to Arabic numerals
const convertToArabicNumerals = (num) => {
    const numString = String(num || 0);
    if (typeof numString !== "string") return String(numString);
    const arabicNumeralsMap = {
        0: "٠", 1: "١", 2: "٢", 3: "٣", 4: "٤",
        5: "٥", 6: "٦", 7: "٧", 8: "٨", 9: "٩",
    };
    return numString.replace(/\d/g, (digit) => arabicNumeralsMap[digit] || digit);
};

// Utility function to map database category names to i18n keys
const mapCategoryNameToI18nKey = (categoryNameFromDB) => {
    if (!categoryNameFromDB) return "unknownCategory";

    switch (categoryNameFromDB) {
        case "Food & Dining": return "foodDining";
        case "Transportation": return "transportation";
        case "Shopping": return "shopping";
        case "Health & Wellness": return "healthWellness";
        case "Bills & Utilities": return "billsUtilities";
        case "Entertainment & Leisure": return "entertainmentLeisure";
        case "Business Expenses": return "businessExpenses";
        case "Education": return "education";
        case "Financial Services": return "financialServices";
        case "Gifts & Donations": return "giftsDonations";
        case "Home Improvement": return "homeImprovement";
        case "Miscellaneous": return "miscellaneous";
        case "Household Items": return "householdItems";
        case "Clothing": return "clothing";
        default:
            const camelCaseKey = categoryNameFromDB
                .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) =>
                    chr ? chr.toUpperCase() : ""
                )
                .replace(/^./, (match) => match.toLowerCase());
            return camelCaseKey || "unknownCategory";
    }
};

const BudgetInsights = () => {
    const { user, preferredCurrencySymbol } = useGlobalContext();
    const navigation = useNavigation();
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [spendingByCategoryTableData, setSpendingByCategoryTableData] = useState([]);
    const [monthlyPerformanceTableData, setMonthlyPerformanceTableData] = useState([]);
    const [topCategoriesOverallSpending, setTopCategoriesOverallSpending] = useState([]);
    const [categoriesMap, setCategoriesMap] = useState({});

    // Helper to format numbers based on language
    const formatNumber = useCallback((number) => {
        const formatted = number.toFixed(2);
        return i18n.language.startsWith("ar") ? convertToArabicNumerals(formatted) : formatted;
    }, [i18n.language]);

    const fetchData = useCallback(async () => {
        if (!user?.$id) {
            setIsLoading(false);
            return;
        }

        if (!refreshing) setIsLoading(true);

        try {
            const fetchedCategories = await getCategories2Bud();
            const map = {};
            fetchedCategories.forEach((cat) => {
                map[cat.$id] = cat.name;
            });
            setCategoriesMap(map);
            const getCategoryNameLocal = (categoryId) => {
                const nameFromDB = map[categoryId];
                const i18nKey = mapCategoryNameToI18nKey(nameFromDB);
                return t(`categories.${i18nKey}`) || t("common.unknownCategory");
            };

            const today = new Date();
            const endDateForTrends = endOfMonth(today);
            const startDateForTrends = startOfMonth(subMonths(today, NUM_MONTHS_FOR_TREND - 1));
            const monthsInTrend = eachMonthOfInterval({ start: startDateForTrends, end: endDateForTrends });

            let allHistoricalReceipts = [];
            let allHistoricalBudgets = [];

            for (const month of monthsInTrend) {
                const monthStart = startOfMonth(month);
                const monthEnd = endOfMonth(month);

                const monthlyReceipts = await getReceiptsForPeriod(
                    user.$id,
                    monthStart.toISOString(),
                    monthEnd.toISOString()
                );
                allHistoricalReceipts = [...allHistoricalReceipts, ...monthlyReceipts];

                const monthlyBudgets = await getUserBudgets(user.$id);
                const relevantMonthlyBudgets = monthlyBudgets.filter(budget => {
                    const budgetStartDate = new Date(budget.startDate);
                    const budgetEndDate = new Date(budget.endDate);
                    return (budgetStartDate <= monthEnd && budgetEndDate >= monthStart);
                });
                allHistoricalBudgets = [...allHistoricalBudgets, ...relevantMonthlyBudgets];
            }

            // --- Insight 1: Spending by Category for Selected Month (Table) ---
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
                        if (categoryId && !isNaN(amount)) {
                            if (!currentMonthSpendingData[categoryId]) {
                                currentMonthSpendingData[categoryId] = {
                                    spent: 0,
                                    budgeted: 0,
                                    categoryName: getCategoryNameLocal(categoryId),
                                };
                            }
                            currentMonthSpendingData[categoryId].spent += amount;
                        }
                    });
                }
            });

            const categoryTableData = Object.values(currentMonthSpendingData).map(item => ({
                categoryName: item.categoryName,
                spent: item.spent,
                budgeted: item.budgeted,
                remaining: item.budgeted - item.spent,
            })).sort((a, b) => b.spent - a.spent);

            setSpendingByCategoryTableData(categoryTableData);


            // --- Insight 2: Top Categories Overall Spending (Table) ---
            const categoryTotalsOverall = {};

            allHistoricalReceipts.forEach(receipt => {
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
                            categoryTotalsOverall[categoryId] = (categoryTotalsOverall[categoryId] || 0) + amount;
                        }
                    });
                }
            });

            const topCategoriesData = Object.entries(categoryTotalsOverall)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([categoryId, totalSpent]) => ({
                    categoryName: getCategoryNameLocal(categoryId),
                    totalSpent: totalSpent,
                }));
            
            setTopCategoriesOverallSpending(topCategoriesData);


            // --- Insight 3: Monthly Budget Performance (Table) ---
            const monthlyPerformanceAggregation = {};
            monthsInTrend.forEach(month => {
                const monthKey = format(startOfMonth(month), 'yyyy-MM');
                monthlyPerformanceAggregation[monthKey] = {
                    totalBudgeted: 0,
                    totalSpent: 0,
                    monthLabel: format(month, t("budgetInsights.monthYearFormat"), { locale: i18n.language.startsWith("ar") ? arLocale : undefined })
                };
            });

            allHistoricalBudgets.forEach(budget => {
                const budgetStartDate = new Date(budget.startDate);
                const budgetEndDate = new Date(budget.endDate);

                const budgetAmountPerDay = parseFloat(budget.budgetAmount) / ((budgetEndDate.getTime() - budgetStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1);

                eachMonthOfInterval({ start: budgetStartDate, end: budgetEndDate }).forEach(month => {
                    const monthKey = format(startOfMonth(month), 'yyyy-MM');
                    if (monthlyPerformanceAggregation[monthKey]) {
                        const intersectionStart = new Date(Math.max(month.getTime(), budgetStartDate.getTime()));
                        const intersectionEnd = new Date(Math.min(endOfMonth(month).getTime(), budgetEndDate.getTime()));
                        const daysInIntersection = (intersectionEnd.getTime() - intersectionStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
                        if (daysInIntersection > 0) {
                            monthlyPerformanceAggregation[monthKey].totalBudgeted += budgetAmountPerDay * daysInIntersection;
                        }
                    }
                });
            });

            allHistoricalReceipts.forEach(receipt => {
                const receiptDate = new Date(receipt.datetime);
                const monthKey = format(startOfMonth(receiptDate), 'yyyy-MM');

                if (monthlyPerformanceAggregation[monthKey]) {
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
                                monthlyPerformanceAggregation[monthKey].totalSpent += amount;
                            }
                        });
                    }
                }
            });

            const monthlyPerformanceTable = Object.values(monthlyPerformanceAggregation).map(data => ({
                month: data.monthLabel,
                budgeted: data.totalBudgeted,
                spent: data.totalSpent,
                surplusDeficit: data.totalBudgeted - data.totalSpent,
            }));

            setMonthlyPerformanceTableData(monthlyPerformanceTable);

        } catch (error) {
            console.error("Error fetching budget insights data:", error);
            Alert.alert(t("common.errorTitle"), t("budgetInsights.loadError"));
            setSpendingByCategoryTableData([]);
            setMonthlyPerformanceTableData([]);
            setTopCategoriesOverallSpending([]);
            setCategoriesMap({});
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user?.$id, currentMonth, refreshing, t, formatNumber]);


    useFocusEffect(
        useCallback(() => {
            fetchData();
            return () => {
                setIsLoading(true);
                setSpendingByCategoryTableData([]);
                setMonthlyPerformanceTableData([]);
                setTopCategoriesOverallSpending([]);
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

    // --- Reusable Table Component ---
    const Table = ({ title, headers, data, renderRow, emptyMessage }) => (
        <View className="mb-8 p-4 bg-white rounded-xl shadow-md">
            <Text
                className={`text-lg text-black mb-4 ${I18nManager.isRTL ? 'text-right' : 'text-left'}`}
                style={{ fontFamily: getFontClassName("bold") }}
            >
                {title}
            </Text>
            {data && data.length > 0 ? (
                <View className="border border-gray-300 rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <View className={`flex-row bg-gray-100 border-b border-gray-300 ${I18nManager.isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        {headers.map((header, index) => (
                            <Text
                                key={index}
                                // Adjusted alignment for headers: first column left, others right (or reversed for RTL)
                                className={`flex-1 p-2 text-md text-gray-700 ${
                                    I18nManager.isRTL
                                        ? (index === 0 ? 'text-right pr-4' : 'text-left pl-4') // RTL: First column right, others left
                                        : (index === 0 ? 'text-left pl-4' : 'text-right pr-4') // LTR: First column left, others right
                                }`}
                                style={{ fontFamily: getFontClassName("bold") }}
                            >
                                {header}
                            </Text>
                        ))}
                    </View>
                    {/* Table Rows */}
                    {data.map((item, rowIndex) => (
                        <View
                            key={rowIndex}
                            className={`flex-row ${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-200 last:border-b-0 ${I18nManager.isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {renderRow(item, rowIndex)}
                        </View>
                    ))}
                </View>
            ) : (
                <View className="items-center justify-center min-h-[100px]">
                    <Text
                        className="text-gray-500 text-base"
                        style={{ fontFamily: getFontClassName("medium") }}
                    >
                        {emptyMessage}
                    </Text>
                </View>
            )}
        </View>
    );

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
                    <View className={`flex-row items-center justify-between mb-6 ${I18nManager.isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                            <Text className="text-blue-600 text-lg" style={{ fontFamily: getFontClassName("medium") }}>{t("common.back")}</Text>
                        </TouchableOpacity>
                        <Text className="text-2xl text-black" style={{ fontFamily: getFontClassName("bold") }}>{t("budgetInsights.title")}</Text>
                        <View className="w-10" />
                    </View>

                    {/* Month Navigation (for Spending by Category table) */}
                    <View className={`flex-row justify-center items-center mb-6 bg-slate-200 p-3 rounded-xl ${I18nManager.isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <TouchableOpacity
                            onPress={() => navigateMonth("prev")}
                            className="p-2.5 rounded-full bg-gray-200"
                        >
                            <Text className="text-black text-base" style={{ fontFamily: getFontClassName("bold") }}>{"<"}</Text>
                        </TouchableOpacity>
                        <Text className="text-xl text-black mx-4 w-32 text-center" style={{ fontFamily: getFontClassName("bold") }}>
                            {format(currentMonth, t("budgetInsights.monthYearFormat"), { locale: i18n.language.startsWith("ar") ? arLocale : undefined })}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigateMonth("next")}
                            className="p-2.5 rounded-full bg-gray-200"
                        >
                            <Text className="text-black text-base" style={{ fontFamily: getFontClassName("bold") }}>{">"}</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View className="flex-1 justify-center items-center min-h-[300px]">
                            <ActivityIndicator size="large" color="#9F54B6" />
                            <Text className="text-lg text-gray-700 mt-4" style={{ fontFamily: getFontClassName("regular") }}>
                                {t("budgetInsights.loadingInsights")}
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* Spending by Category Table */}
                            <Table
                                title={t("budgetInsights.spendingByCategoryTitle", { month: format(currentMonth, t("budgetInsights.monthYearFormat"), { locale: i18n.language.startsWith("ar") ? arLocale : undefined }) })}
                                headers={[
                                    t("common.category"),
                                    `${t("common.spent")} (${preferredCurrencySymbol})`,
                                    `${t("common.budgeted")} (${preferredCurrencySymbol})`,
                                    `${t("common.remaining")} (${preferredCurrencySymbol})`
                                ]}
                                data={spendingByCategoryTableData}
                                renderRow={(item) => (
                                    <>
                                        <Text className={`flex-1 p-2 text-md text-gray-800 ${I18nManager.isRTL ? 'text-right' : 'text-left'}`} style={{ fontFamily: getFontClassName("medium") }}>{item.categoryName}</Text>
                                        <Text className={`flex-1 p-2 text-md text-gray-800 ${I18nManager.isRTL ? 'text-right' : 'text-left '}`} style={{ fontFamily: getFontClassName("bold") }}>{formatNumber(item.spent)}</Text>
                                        <Text className={`flex-1 p-2 text-md text-gray-800 ${I18nManager.isRTL ? 'text-right' : 'text-left'}`} style={{ fontFamily: getFontClassName("bold") }}>{formatNumber(item.budgeted)}</Text>
                                        <Text className={`flex-1 p-2 text-md ${item.remaining < 0 ? 'text-red-600' : 'text-green-600'} ${I18nManager.isRTL ? 'text-left pl-4' : 'text-right pr-4'}`} style={{ fontFamily: getFontClassName("bold") }}>
                                            {formatNumber(item.remaining)}
                                        </Text>
                                    </>
                                )}
                                emptyMessage={t("budgetInsights.noSpendingData", { month: format(currentMonth, t("budgetInsights.monthYearFormat"), { locale: i18n.language.startsWith("ar") ? arLocale : undefined }) })}
                            />

                            {/* Top Categories Overall Spending Table */}
                            <Table
                                title={t("budgetInsights.topCategoriesOverallTitle", { numMonths: NUM_MONTHS_FOR_TREND })}
                                headers={[
                                    t("common.category"),
                                    `${t("common.totalSpent")} (${preferredCurrencySymbol})`
                                ]}
                                data={topCategoriesOverallSpending}
                                renderRow={(item) => (
                                    <>
                                        <Text className={`flex-1 p-2 text-md text-gray-800 ${I18nManager.isRTL ? 'text-right pr-4' : 'text-left pl-4'}`} style={{ fontFamily: getFontClassName("medium") }}>{item.categoryName}</Text>
                                        <Text className={`flex-1 p-2 text-md text-gray-800 ${I18nManager.isRTL ? 'text-left pl-4' : 'text-right pr-4'}`} style={{ fontFamily: getFontClassName("bold") }}>{formatNumber(item.totalSpent)}</Text>
                                    </>
                                )}
                                emptyMessage={t("budgetInsights.noTopCategoriesData", { numMonths: NUM_MONTHS_FOR_TREND })}
                            />

                            {/* Monthly Budget Performance Table */}
                            <Table
                                title={t("budgetInsights.monthlyBudgetPerformanceTitle", { numMonths: NUM_MONTHS_FOR_TREND })}
                                headers={[
                                    t("common.month"),
                                    `${t("common.budgeted")} (${preferredCurrencySymbol})`,
                                    `${t("common.spent")} (${preferredCurrencySymbol})`,
                                    `${t("common.surplusDeficit")} (${preferredCurrencySymbol})`
                                ]}
                                data={monthlyPerformanceTableData}
                                renderRow={(item) => (
                                    <>
                                        <Text className={`flex-1 p-2 text-md text-gray-800 ${I18nManager.isRTL ? 'text-right ' : 'text-left'}`} style={{ fontFamily: getFontClassName("medium") }}>{item.month}</Text>
                                        <Text className={`flex-1 p-2 text-md text-gray-800 ${I18nManager.isRTL ? 'text-right' : 'text-left'}`} style={{ fontFamily: getFontClassName("bold") }}>{formatNumber(item.budgeted)}</Text>
                                        <Text className={`flex-1 p-2 text-md text-gray-800 ${I18nManager.isRTL ? 'text-right' : 'text-left'}`} style={{ fontFamily: getFontClassName("bold") }}>{formatNumber(item.spent)}</Text>
                                        <Text className={`flex-1 p-2 text-md ${item.surplusDeficit < 0 ? 'text-red-600' : 'text-green-600'} ${I18nManager.isRTL ? 'text-left pl-4' : 'text-right pr-4'}`} style={{ fontFamily: getFontClassName("bold") }}>
                                            {formatNumber(item.surplusDeficit)}
                                        </Text>
                                    </>
                                )}
                                emptyMessage={t("budgetInsights.noMonthlyPerformanceData", { numMonths: NUM_MONTHS_FOR_TREND })}
                            />
                        </>
                    )}

                    <View className="h-20" />
                </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    );
};

export default BudgetInsights;
