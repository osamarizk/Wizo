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
import * as Notifications from "expo-notifications"; // NEW: Import Notifications

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { format } from "date-fns";

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

const mapSubcategoryNameToI18nKey = (subcategoryNameFromDB) => {
  if (!subcategoryNameFromDB) return "";
  switch (subcategoryNameFromDB) {
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
    case "Charitable Donations":
      return "charitableDonations";
    case "Gifts":
      return "gifts";
    case "Fundraising Events":
      return "fundraisingEvents";
    case "Plumbing":
      return "plumbing";
    case "Electrician":
      return "electrician";
    case "Gardening":
      return "gardening";
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

  const { user, updateUnreadCount, preferredCurrencySymbol } =
    useGlobalContext();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [receiptDetails, setReceiptDetails] = useState({});
  const [budgetDetails, setBudgetDetails] = useState({});
  const [allCategories, setAllCategories] = useState([]);
  const [loadingDetailsId, setLoadingDetailsId] = useState(null);
  const navigation = useNavigation();

  dayjs.extend(relativeTime);
  const [timeUpdate, setTimeUpdate] = useState(Date.now());

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
      const fetchedCategories = await getAllCategories();
      setAllCategories(fetchedCategories);

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
          // NEW: Reset the badge count on the app icon
          Notifications.setBadgeCountAsync(0)
            .then(() => {
              console.log("App icon badge count reset to 0.");
            })
            .catch((error) => {
              console.error("Failed to reset app icon badge count:", error);
            });
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
        const needsReceiptFetch =
          associatedReceiptId && !receiptDetails[associatedReceiptId];
        const needsBudgetFetch =
          associatedBudgetId && !budgetDetails[associatedBudgetId];
        const needsDelay = needsReceiptFetch || needsBudgetFetch;

        setLoadingDetailsId(notificationId);

        const expandAndFetch = async () => {
          LayoutAnimation.easeInEaseOut();
          setExpandedId(notificationId);

          try {
            if (needsReceiptFetch) {
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

            if (needsBudgetFetch) {
              const notificationItem = notifications.find(
                (n) => n.$id === notificationId
              );
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
            setLoadingDetailsId(null);
          }
        };

        if (needsDelay) {
          setTimeout(expandAndFetch, 500);
        } else {
          expandAndFetch();
        }
      } else {
        LayoutAnimation.easeInEaseOut();
        setExpandedId(null);
        setLoadingDetailsId(null);
      }

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
            // NEW: Reset the badge count on the app icon after marking a single notification as read
            Notifications.setBadgeCountAsync(0)
              .then(() => {
                console.log("App icon badge count reset to 0 after read.");
              })
              .catch((error) => {
                console.error("Failed to reset badge count after read:", error);
              });
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

  const getTranslatedCategoryName = useCallback(
    (categoryId) => {
      const category = allCategories.find((cat) => cat.$id === categoryId);
      return category
        ? t(`categories.${mapCategoryNameToI18nKey(category.name)}`)
        : t("common.unknownCategory");
    },
    [allCategories, t]
  );

  const getTranslatedPaymentMethod = useCallback(
    (method) => {
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
      const isLoadingDetails = loadingDetailsId === item.$id;
      const canViewAssociatedDetails =
        (item.receipt_id || item.budget_id) &&
        item.title !== t("notifications.budgetDeletedNotificationTitle");

      const isFinancialAdvice = item.type === "financial_advice";

      return (
        <View className="bg-white  mb-4 rounded-lg overflow-hidden ">
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
                  {isLoadingDetails || !receipt ? (
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
                            )} ${preferredCurrencySymbol}`
                          : `${preferredCurrencySymbol}${parseFloat(
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
                  {isLoadingDetails || !budget ? (
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
                            )} ${preferredCurrencySymbol}`
                          : `${preferredCurrencySymbol}${parseFloat(
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
      loadingDetailsId,
    ]
  );
  return (
    <GradientBackground>
      <SafeAreaView className="flex-1  p-4 mt-8">
        <View
          className={`flex-row items-center justify-between px-4 py-3  bg-transparent border-b border-gray-400 shadow-sm ${
            I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <Text
            className={`text-2xl text-black ${getFontClassName("bold")}`}
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

        <View
          className={`px-4 py-2 bg-transparent  ${
            I18nManager.isRTL ? "items-end" : "items-start"
          }`}
        >
          <Text
            className={`text-sm text-blue-600 ${getFontClassName("regular")}`}
            style={{
              fontFamily: getFontClassName("regular"),
              textAlign: I18nManager.isRTL ? "right" : "left",
            }}
          >
            {t("notifications.importantInfo")}
          </Text>
        </View>

        {notifications.length === 0 && !refreshing ? (
          <View className="flex-1 justify-center items-center bg-gray-50">
            <Text
              className={`text-gray-500 text-lg ${getFontClassName("medium")}`}
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
            contentContainerStyle={{ paddingTop: 20 }}
            ListEmptyComponent={
              !refreshing && (
                <View className="flex-1 justify-center items-center h-40">
                  <Text
                    className={`text-gray-500 italic text-base ${getFontClassName(
                      "regular"
                    )}`}
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
