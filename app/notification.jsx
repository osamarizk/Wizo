import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
  Image,
  Pressable,
  RefreshControl,
  I18nManager,
} from "react-native";
import {
  fetchNotifications,
  markNotificationAsRead,
  countUnreadNotifications,
  fetchReceipt,
  fetchBudget,
  getAllCategories,
} from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";
import GradientBackground from "../components/GradientBackground";
import { useNavigation, useFocusEffect } from "expo-router";
import icons from "../constants/icons";

import { ar as arLocale } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { format } from "date-fns";

// Enable LayoutAnimation for smooth transitions on Android
// if (Platform.OS === "android") {
//   UIManager.setLayoutAnimationEnabledExperimental &&
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// NEW: Utility function to convert numbers to Arabic numerals (copied from Home/BudgetSetupModal)
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

// NEW: Utility to map category names to i18n keys (copied from Home/BudgetSetupModal)
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

// NEW: Utility to map subcategory names to i18n keys (copied from Home/BudgetSetupModal)
const mapSubcategoryNameToI18nKey = (subcategoryNameFromDB) => {
  if (!subcategoryNameFromDB) return "";
  switch (subcategoryNameFromDB) {
    // Food & Dining
    case "Restaurants":
      return "restaurants";
    case "Groceries":
      return "groceries";
    case "Cafes":
      return "cafes";
    case "Fast Food":
      return "fastFood";
    case "Bars":
      return "bars";
    case "Delivery":
      return "delivery";
    // Transportation
    case "Fuel":
      return "fuel";
    case "Public Transport":
      return "publicTransport";
    case "Taxi/Rideshare":
      return "taxiRideshare";
    case "Parking":
      return "parking";
    case "Vehicle Maintenance":
      return "vehicleMaintenance";
    case "Tolls":
      return "tolls";
    // Shopping
    case "Clothing":
      return "clothing";
    case "Electronics":
      return "electronics";
    case "Household Items":
      return "householdItems";
    case "Personal Care":
      return "personalCare";
    case "Online Shopping":
      return "onlineShopping";
    case "Books":
      return "books";
    case "Furniture":
      return "furniture";
    // Health & Wellness
    case "Pharmacy":
      return "pharmacy";
    case "Doctor Visits":
      return "doctorVisits";
    case "Fitness":
      return "fitness";
    case "Insurance":
      return "insurance";
    case "Dental Care":
      return "dentalCare";
    case "Vision Care":
      return "visionCare";
    // Bills & Utilities
    case "Electricity":
      return "electricity";
    case "Water":
      return "water";
    case "Internet":
      return "internet";
    case "Mobile":
      return "mobile";
    case "Rent/Mortgage":
      return "rentMortgage";
    case "Subscription Services":
      return "subscriptionServices";
    case "Cable TV":
      return "cableTv";
    // Entertainment & Leisure
    case "Movies":
      return "movies";
    case "Concerts":
      return "concerts";
    case "Events":
      return "events";
    case "Hobbies":
      return "hobbies";
    case "Travel":
      return "travel";
    case "Streaming Services":
      return "streamingServices";
    case "Sports":
      return "sports";
    // Business Expenses
    case "Office Supplies":
      return "officeSupplies";
    case "Business Travel":
      return "businessTravel";
    case "Client Meals":
      return "clientMeals";
    case "Subscriptions":
      return "subscriptions";
    case "Software":
      return "software";
    case "Advertising":
      return "advertising";
    case "Training":
      return "training";
    // Education
    case "Tuition Fees":
      return "tuitionFees";
    case "Education Books":
      return "educationBooks";
    case "Courses":
      return "courses";
    case "School Supplies":
      return "schoolSupplies";
    case "Student Loans":
      return "studentLoans";
    // Financial Services
    case "Bank Fees":
      return "bankFees";
    case "Loan Payments":
      return "loanPayments";
    case "Investments":
      return "investments";
    case "Insurance Premiums":
      return "insurancePremiums";
    case "Credit Card Fees":
      return "creditCardFees";
    // Gifts & Donations
    case "Charitable Donations":
      return "charitableDonations";
    case "Gifts":
      return "gifts";
    case "Fundraising Events":
      return "fundraisingEvents";
    // Home Improvement
    case "Plumbing":
      return "plumbing";
    case "Electrician":
      return "electrician";
    case "Gardening":
      return "gardening";
    // Add any other subcategories you have in your database here
    case "Miscellaneous":
      return "miscellaneous";
    default:
      return subcategoryNameFromDB
        .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) =>
          chr ? chr.toUpperCase() : ""
        )
        .replace(/^./, (match) => match.toLowerCase());
  }
};
const NotificationPage = () => {
  const { t } = useTranslation();

  const { user, updateUnreadCount } = useGlobalContext();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [receiptDetails, setReceiptDetails] = useState({});
  const [budgetDetails, setBudgetDetails] = useState({});
  const [allCategories, setAllCategories] = useState([]);
  const [loadingDetailsId, setLoadingDetailsId] = useState(null);
  const navigation = useNavigation();

  dayjs.extend(relativeTime);
  const [timeUpdate, setTimeUpdate] = useState(Date.now()); // For relative time updates

  const currentDateFormatLocale = i18n.language.startsWith("ar")
    ? arLocale
    : undefined;
  const fetchUserNotifications = useCallback(async () => {
    if (!user?.$id) {
      setNotifications([]);
      return;
    }
    setRefreshing(true);
    try {
      const fetched = await fetchNotifications(user.$id);
      const fetchedCategories = await getAllCategories(); // NEW: Fetch all categories
      setAllCategories(fetchedCategories); // NEW: Set categories to state

      // Client-side filtering for expired notifications
      const nonExpiredNotifications = fetched.filter(
        (n) => !n.expiresAt || new Date(n.expiresAt) > new Date()
      );

      setNotifications(nonExpiredNotifications);
      console.log("NotificationPage: Notifications fetched successfully.");
    } catch (err) {
      console.error("NotificationPage: Error fetching notifications:", err);
    } finally {
      setRefreshing(false);
    }
  }, [user?.$id]);

  useFocusEffect(
    useCallback(() => {
      console.log("NotificationPage: useFocusEffect triggered.");
      fetchUserNotifications();

      const updateCount = async () => {
        if (user?.$id) {
          const newCount = await countUnreadNotifications(user.$id);
          updateUnreadCount(newCount);
        }
      };
      updateCount();

      const interval = setInterval(() => {
        setTimeUpdate(Date.now());
      }, 60000);

      return () => {
        clearInterval(interval);
        setExpandedId(null);
        setReceiptDetails({});
        setBudgetDetails({});
        setAllCategories([]);
      };
    }, [user?.$id, fetchUserNotifications, updateUnreadCount])
  );

  const handleRefresh = useCallback(async () => {
    await fetchUserNotifications();
  }, [fetchUserNotifications]);

  const handleNotificationPress = useCallback(
    async (notificationId, associatedReceiptId, associatedBudgetId) => {
      const wasExpanded = expandedId === notificationId;

      if (!wasExpanded) {
        // We are expanding this notification
        // Determine if we need to fetch new details (i.e., it's the "first time")
        const needsReceiptFetch =
          associatedReceiptId && !receiptDetails[associatedReceiptId];
        const needsBudgetFetch =
          associatedBudgetId && !budgetDetails[associatedBudgetId];
        const needsDelay = needsReceiptFetch || needsBudgetFetch; // Only delay if we actually need to fetch something

        setLoadingDetailsId(notificationId); // Set loading state for this specific item immediately

        const expandAndFetch = async () => {
          LayoutAnimation.easeInEaseOut(); // Trigger animation
          setExpandedId(notificationId); // Expand the item

          try {
            // Fetch receipt details if needed
            if (needsReceiptFetch) {
              // Use the pre-calculated flag
              try {
                const receipt = await fetchReceipt(associatedReceiptId);
                if (receipt) {
                  setReceiptDetails((prev) => ({
                    ...prev,
                    [associatedReceiptId]: receipt,
                  }));
                } else {
                  console.warn(
                    "Receipt not found for ID:",
                    associatedReceiptId
                  );
                }
              } catch (err) {
                console.error("Error fetching receipt details:", err);
              }
            }

            // Fetch budget details if needed
            if (needsBudgetFetch) {
              // Use the pre-calculated flag
              const notificationItem = notifications.find(
                (n) => n.$id === notificationId
              );
              // Ensure we don't try to fetch a budget that was deleted
              if (
                notificationItem?.title !==
                t("notifications.budgetDeletedNotificationTitle")
              ) {
                try {
                  const budget = await fetchBudget(associatedBudgetId);
                  if (budget) {
                    setBudgetDetails((prev) => ({
                      ...prev,
                      [associatedBudgetId]: budget,
                    }));
                  } else {
                    console.warn(
                      "Budget not found for ID:",
                      associatedBudgetId
                    );
                  }
                } catch (err) {
                  console.error("Error fetching budget details:", err);
                }
              }
            }
          } finally {
            setLoadingDetailsId(null); // Clear loading state after all fetches (success or failure)
          }
        };

        if (needsDelay) {
          setTimeout(expandAndFetch, 500); // Use the 400ms delay if fetching
        } else {
          expandAndFetch(); // No delay if data is already cached
        }
      } else {
        // We are collapsing this notification
        LayoutAnimation.easeInEaseOut(); // Trigger animation for collapsing
        setExpandedId(null); // Collapse the item
        setLoadingDetailsId(null); // Ensure loading state is cleared if it somehow was set for a collapsing item
      }

      // Mark notification as read (this can happen independently of detail fetching/expansion)
      const notificationToMark = notifications.find(
        (n) => n.$id === notificationId
      );
      if (notificationToMark && !notificationToMark.read) {
        try {
          await markNotificationAsRead(notificationId);
          setNotifications((prev) =>
            prev.map((n) =>
              n.$id === notificationId ? { ...n, read: true } : n
            )
          );
          if (user?.$id) {
            const newCount = await countUnreadNotifications(user.$id);
            updateUnreadCount(newCount);
          }
        } catch (err) {
          console.error("Error marking notification as read:", err);
        }
      }
    },
    [
      expandedId,
      notifications,
      receiptDetails,
      budgetDetails,
      user?.$id,
      updateUnreadCount,
      t,
      setLoadingDetailsId,
    ]
  );

  // NEW: Helper to get translated category name for budget details
  const getTranslatedCategoryName = useCallback(
    (categoryId) => {
      const category = allCategories.find((cat) => cat.$id === categoryId);
      return category
        ? t(`categories.${mapCategoryNameToI18nKey(category.name)}`)
        : t("common.unknownCategory");
    },
    [allCategories, t]
  );

  // NEW: Helper to get translated payment method for receipt details
  const getTranslatedPaymentMethod = useCallback(
    (method) => {
      // Assuming payment methods are stored as simple strings like "Cash", "Card"
      // and you have corresponding i18n keys like "receipts.paymentMethod_cash"
      switch (method) {
        case "Cash":
          return t("receipts.paymentMethod_cash");
        case "Card":
          return t("receipts.paymentMethod_card");
        case "Bank Transfer":
          return t("receipts.paymentMethod_bankTransfer");
        case "Mobile Payment":
          return t("receipts.paymentMethod_mobilePayment");
        case "Other":
          return t("receipts.paymentMethod_other");
        default:
          return method || t("common.notApplicable");
      }
    },
    [t]
  );

  const renderNotificationItem = useCallback(
    ({ item }) => {
      const isExpanded = item.$id === expandedId;
      const receipt = item.receipt_id ? receiptDetails[item.receipt_id] : null;
      const budget = item.budget_id ? budgetDetails[item.budget_id] : null;
      const isLoadingDetails = loadingDetailsId === item.$id; // NEW: Check if this item's details are loading
      const canViewAssociatedDetails =
        (item.receipt_id || item.budget_id) &&
        item.title !== t("notifications.budgetDeletedNotificationTitle");

      const isFinancialAdvice = item.type === "financial_advice"; // NEW: Flag for financial advice type

      return (
        <View className="bg-white mx-4 mb-2 rounded-lg overflow-hidden border-t border-[#9F54B6]">
          <TouchableOpacity
            onPress={() =>
              handleNotificationPress(item.$id, item.receipt_id, item.budget_id)
            }
            activeOpacity={0.7}
            className={`p-4 flex-row items-start justify-between ${
              I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <View
              className={`flex-1 ${
                I18nManager.isRTL ? "pr-0 pl-3" : "pr-3 pl-0"
              }`}
            >
              <View
                className={`flex-row items-center mb-1 ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {!item.read && (
                  <View
                    className={`w-2 h-2 bg-red-500 rounded-full ${
                      I18nManager.isRTL ? "ml-2" : "mr-2"
                    }`}
                  />
                )}
                <Text
                  className={`text-base flex-1 ${
                    item.read ? "text-gray-500" : "text-black"
                  } ${getFontClassName("bold")}`}
                  style={{
                    fontFamily: getFontClassName("bold"),
                    textAlign: I18nManager.isRTL ? "right" : "left",
                  }}
                  numberOfLines={isExpanded ? 0 : 1}
                >
                  {t(
                    `notifications.${item.title.replace(
                      /\s/g,
                      ""
                    )}NotificationTitle`,
                    { defaultValue: item.title }
                  )}
                </Text>
                <Text
                  className={`text-xs text-green-700 ${
                    I18nManager.isRTL ? "mr-2" : "ml-2"
                  }`}
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  {dayjs(item.$createdAt).fromNow()}
                </Text>
              </View>
              <Text
                className={`text-sm mt-1 ${
                  item.read ? "text-gray-400" : "text-gray-700"
                } ${getFontClassName("regular")}`}
                style={{
                  fontFamily: getFontClassName("regular"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
                numberOfLines={isExpanded ? 0 : 2}
              >
                {item.message}
              </Text>

              {canViewAssociatedDetails && !isExpanded && (
                <Text
                  className={`text-xs text-blue-500 mt-2 ${getFontClassName(
                    "medium"
                  )}`}
                  style={{
                    fontFamily: getFontClassName("medium"),
                    textAlign: I18nManager.isRTL ? "right" : "left",
                  }}
                >
                  {t("notifications.tapToViewDetails")}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View className="bg-white p-4 border-t border-[#4E17B3]">
              <Text
                className={`text-xs text-gray-500 mb-2 ${getFontClassName(
                  "semibold"
                )}`}
                style={{
                  fontFamily: getFontClassName("semibold"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              >
                {t("notifications.received")}{" "}
                {i18n.language.startsWith("ar")
                  ? convertToArabicNumerals(
                      format(
                        new Date(item.$createdAt),
                        t("common.dateFormatLong"),
                        { locale: currentDateFormatLocale }
                      )
                    )
                  : format(
                      new Date(item.$createdAt),
                      t("common.dateFormatLong"),
                      { locale: currentDateFormatLocale }
                    )}
              </Text>

              {/* NEW: Conditional rendering for receipt details based on loading state */}
              {item.receipt_id && (
                <View className="mb-2">
                  <Text
                    className={`text-sm text-black mb-1 ${getFontClassName(
                      "semibold"
                    )}`}
                    style={{
                      fontFamily: getFontClassName("semibold"),
                      textAlign: I18nManager.isRTL ? "right" : "left",
                    }}
                  >
                    {t("notifications.receiptDetails")}
                  </Text>
                  {isLoadingDetails || !receipt ? ( // Show loading if details are loading OR receipt is null
                    <View
                      className={`flex-row items-center ${
                        I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <ActivityIndicator size="small" color="#999" />
                      <Text
                        className={`text-xs text-gray-500 italic ${
                          I18nManager.isRTL ? "mr-2" : "ml-2"
                        } ${getFontClassName("regular")}`}
                        style={{
                          fontFamily: getFontClassName("regular"),
                          textAlign: I18nManager.isRTL ? "right" : "left",
                        }}
                      >
                        {t("notifications.loadingReceipt")}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text
                        className={`text-sm text-gray-800 ${getFontClassName(
                          "regular"
                        )}`}
                        style={{
                          fontFamily: getFontClassName("regular"),
                          textAlign: I18nManager.isRTL ? "right" : "left",
                        }}
                      >
                        🧾 {t("notifications.merchant")}{" "}
                        {receipt.merchant || t("common.notApplicable")}
                      </Text>
                      <Text
                        className={`text-sm text-gray-800 ${getFontClassName(
                          "regular"
                        )}`}
                        style={{
                          fontFamily: getFontClassName("regular"),
                          textAlign: I18nManager.isRTL ? "right" : "left",
                        }}
                      >
                        💵 {t("notifications.total")}{" "}
                        {i18n.language.startsWith("ar")
                          ? `${convertToArabicNumerals(
                              parseFloat(receipt.total || 0).toFixed(2)
                            )} ${t("common.currency_symbol_short")}`
                          : `${t("common.currency_symbol_short")}${parseFloat(
                              receipt.total || 0
                            ).toFixed(2)}`}
                      </Text>
                      <Text
                        className={`text-sm text-gray-800 ${getFontClassName(
                          "regular"
                        )}`}
                        style={{
                          fontFamily: getFontClassName("regular"),
                          textAlign: I18nManager.isRTL ? "right" : "left",
                        }}
                      >
                        📅 {t("notifications.date")}{" "}
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(
                              format(
                                new Date(receipt.datetime),
                                t("common.dateFormatShort"),
                                { locale: currentDateFormatLocale }
                              )
                            )
                          : format(
                              new Date(receipt.datetime),
                              t("common.dateFormatShort"),
                              { locale: currentDateFormatLocale }
                            )}
                      </Text>
                      {receipt.payment_method && (
                        <Text
                          className={`text-sm text-gray-800 ${getFontClassName(
                            "regular"
                          )}`}
                          style={{
                            fontFamily: getFontClassName("regular"),
                            textAlign: I18nManager.isRTL ? "right" : "left",
                          }}
                        >
                          💳 {t("notifications.payment")}{" "}
                          {getTranslatedPaymentMethod(receipt.payment_method)}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* NEW: Conditional rendering for budget details based on loading state */}
              {item.budget_id && (
                <View className="mb-2">
                  <Text
                    className={`text-sm text-black mb-1 ${getFontClassName(
                      "semibold"
                    )}`}
                    style={{
                      fontFamily: getFontClassName("semibold"),
                      textAlign: I18nManager.isRTL ? "right" : "left",
                    }}
                  >
                    {t("notifications.budgetDetails")}
                  </Text>
                  {isLoadingDetails || !budget ? ( // Show loading if details are loading OR budget is null
                    <View
                      className={`flex-row items-center ${
                        I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <ActivityIndicator size="small" color="#999" />
                      <Text
                        className={`text-xs text-gray-500 italic ${
                          I18nManager.isRTL ? "mr-2" : "ml-2"
                        } ${getFontClassName("regular")}`}
                        style={{
                          fontFamily: getFontClassName("regular"),
                          textAlign: I18nManager.isRTL ? "right" : "left",
                        }}
                      >
                        {item.title ===
                        t("notifications.budgetDeletedNotificationTitle")
                          ? t("notifications.budgetNoLongerExists")
                          : t("notifications.loadingBudget")}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text
                        className={`text-sm text-gray-800 ${getFontClassName(
                          "regular"
                        )}`}
                        style={{
                          fontFamily: getFontClassName("regular"),
                          textAlign: I18nManager.isRTL ? "right" : "left",
                        }}
                      >
                        📊 {t("notifications.budgetName")}{" "}
                        {getTranslatedCategoryName(budget.categoryId) ||
                          t("common.notApplicable")}
                      </Text>
                      <Text
                        className={`text-sm text-gray-800 ${getFontClassName(
                          "regular"
                        )}`}
                        style={{
                          fontFamily: getFontClassName("regular"),
                          textAlign: I18nManager.isRTL ? "right" : "left",
                        }}
                      >
                        🎯 {t("notifications.budgetAmount")}{" "}
                        {i18n.language.startsWith("ar")
                          ? `${convertToArabicNumerals(
                              parseFloat(budget.budgetAmount || 0).toFixed(2)
                            )} ${t("common.currency_symbol_short")}`
                          : `${t("common.currency_symbol_short")}${parseFloat(
                              budget.budgetAmount || 0
                            ).toFixed(2)}`}
                      </Text>
                      <Text
                        className={`text-sm text-gray-800 ${getFontClassName(
                          "regular"
                        )}`}
                        style={{
                          fontFamily: getFontClassName("regular"),
                          textAlign: I18nManager.isRTL ? "right" : "left",
                        }}
                      >
                        ➡️ {t("notifications.budgetStarts")}{" "}
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(
                              format(
                                new Date(budget.startDate),
                                t("common.dateFormatShort"),
                                { locale: currentDateFormatLocale }
                              )
                            )
                          : format(
                              new Date(budget.startDate),
                              t("common.dateFormatShort"),
                              { locale: currentDateFormatLocale }
                            )}
                      </Text>
                      <Text
                        className={`text-sm text-gray-800 ${getFontClassName(
                          "regular"
                        )}`}
                        style={{
                          fontFamily: getFontClassName("regular"),
                          textAlign: I18nManager.isRTL ? "right" : "left",
                        }}
                      >
                        🔚 {t("notifications.budgetEnds")}{" "}
                        {i18n.language.startsWith("ar")
                          ? convertToArabicNumerals(
                              format(
                                new Date(budget.endDate),
                                t("common.dateFormatShort"),
                                { locale: currentDateFormatLocale }
                              )
                            )
                          : format(
                              new Date(budget.endDate),
                              t("common.dateFormatShort"),
                              { locale: currentDateFormatLocale }
                            )}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Display Expiry Date if available and not expired */}
              {item.expiresAt && new Date(item.expiresAt) > new Date() && (
                <Text
                  className={`text-xs text-red-500 mt-2 ${getFontClassName(
                    "medium"
                  )}`}
                  style={{
                    fontFamily: getFontClassName("medium"),
                    textAlign: I18nManager.isRTL ? "right" : "left",
                  }}
                >
                  ⚠️ {t("notifications.expires")}{" "}
                  {i18n.language.startsWith("ar")
                    ? convertToArabicNumerals(
                        format(
                          new Date(item.expiresAt),
                          t("common.dateFormatLong"),
                          { locale: currentDateFormatLocale }
                        )
                      )
                    : format(
                        new Date(item.expiresAt),
                        t("common.dateFormatLong"),
                        { locale: currentDateFormatLocale }
                      )}
                </Text>
              )}
              {item.type &&
              item.type !== "system" &&
              (item.type === "wallet" ||
                item.type === "budget_alert" ||
                item.type === "points" ||
                item.type === "badge") &&
              !item.receipt_id &&
              !item.budget_id ? (
                <Text
                  className={`text-xs text-gray-600 mt-2 ${getFontClassName(
                    "regular"
                  )}`}
                  style={{
                    fontFamily: getFontClassName("regular"),
                    textAlign: I18nManager.isRTL ? "right" : "left",
                  }}
                >
                  {t("notifications.type")} {item.type}
                </Text>
              ) : null}
            </View>
          )}
        </View>
      );
    },
    [
      expandedId,
      receiptDetails,
      budgetDetails,
      handleNotificationPress,
      timeUpdate,
      t,
      i18n.language,
      currentDateFormatLocale,
      getTranslatedCategoryName,
      getTranslatedPaymentMethod,
      loadingDetailsId, // NEW: Add loadingDetailsId to dependencies
    ]
  );
  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        {/* Notification Header */}
        <View
          className={`flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm ${
            I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <Text
            className={`text-2xl text-black ${getFontClassName("bold")}`} // NEW: Apply font class
            style={{ fontFamily: getFontClassName("bold") }}
          >
            {t("common.notifications")}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Image
              source={icons.close}
              resizeMode="contain"
              className="w-6 h-6"
              tintColor="#333"
            />
          </TouchableOpacity>
        </View>

        {/* NEW: Expiry Information Text */}
        <View
          className={`px-4 py-2 bg-gray-50 border-b border-gray-100 ${
            I18nManager.isRTL ? "items-end" : "items-start"
          }`}
        >
          <Text
            className={`text-sm text-gray-600 ${getFontClassName("regular")}`} // NEW: Apply font class
            style={{
              fontFamily: getFontClassName("regular"),
              textAlign: I18nManager.isRTL ? "right" : "left",
            }} // NEW: RTL text align
          >
            {t("notifications.importantInfo")}
          </Text>
        </View>

        {notifications.length === 0 && !refreshing ? (
          <View className="flex-1 justify-center items-center bg-gray-50">
            <Text
              className={`text-gray-500 text-lg ${getFontClassName("medium")}`} // NEW: Apply font class
              style={{ fontFamily: getFontClassName("medium") }}
            >
              {t("notifications.noNotificationsFound")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.$id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#9F54B6"
              />
            }
            contentContainerStyle={{ paddingVertical: 10 }}
            ListEmptyComponent={
              !refreshing && (
                <View className="flex-1 justify-center items-center h-40">
                  <Text
                    className={`text-gray-500 italic text-base ${getFontClassName(
                      "regular"
                    )}`} // NEW: Apply font class
                    style={{ fontFamily: getFontClassName("regular") }}
                  >
                    {t("notifications.noNotificationsYet")}
                  </Text>
                </View>
              )
            }
          />
        )}
        {refreshing && notifications.length > 0 && (
          <View className="absolute bottom-0 w-full items-center p-4 bg-transparent">
            <ActivityIndicator size="small" color="#9F54B6" />
          </View>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
};

export default NotificationPage;
