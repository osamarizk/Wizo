import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Pressable,
  Alert,
  I18nManager,
  Image,
} from "react-native";

import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

import icons from "../constants/icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../context/GlobalProvider";
import {
  fetchBudget,
  getAllCategories,
  getSubcategoriesById,
} from "../lib/appwrite";
import CustomButton from "../components/CustomButton";
import GradientBackground from "../components/GradientBackground";

import { ar as arLocale } from "date-fns/locale";

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n"; // For i18n.language check

// Utility function to convert numbers to Arabic numerals (copied from Budget.jsx)
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

// Utility to map category names to i18n keys (copied from Budget.jsx)
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

// Utility to map subcategory names to i18n keys (copied from BudgetSetupModal.jsx)
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
      "personalCare";
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

const BudgetDetailsModal = ({ isVisible, onClose, budgetId, onUpdate }) => {
  const { user } = useGlobalContext();
  const { t } = useTranslation(); // NEW: Initialize useTranslation

  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!budgetId || !user) {
        setLoading(false);
        setError(t("common.noBudgetOrUser")); // NEW: Translated error message
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedBudget = await fetchBudget(budgetId);
        if (fetchedBudget) {
          setBudget(fetchedBudget);

          const fetchedCategories = await getAllCategories();
          setCategories(fetchedCategories);

          // Fetch subcategories only if a subcategoryId exists on the budget
          if (fetchedBudget.subcategoryId) {
            // getSubcategoriesById likely expects the subcategory's ID
            // If it needs the category ID to fetch all subcategories of that category,
            // you'll need to adjust your appwrite function or fetch all subcategories
            // for the budget's category. For now, assuming it fetches by subcategoryId.
            const fetchedSubcategories = await getSubcategoriesById(
              fetchedBudget.subcategoryId
            );
            setSubcategories(fetchedSubcategories);
          } else {
            setSubcategories([]); // Clear subcategories if none exist
          }
        } else {
          setError(t("budget.budgetNotFound")); // NEW: Translated error message
        }
      } catch (err) {
        console.error("Error fetching budget details in modal:", err);
        setError(
          t("common.failedToLoadData", {
            error: err.message || t("common.unknownError"),
          })
        ); // NEW: Translated error message
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchBudgetData();
    } else {
      // Reset state when modal is hidden
      setBudget(null);
      setLoading(true);
      setError(null);
      setCategories([]);
      setSubcategories([]);
    }
  }, [isVisible, budgetId, user, t]); // NEW: Added 't' to dependencies

  // Helper to get category name (now uses i18n mapping)
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.$id === categoryId);
    return category
      ? t(`categories.${mapCategoryNameToI18nKey(category.name)}`)
      : t("common.unknownCategory");
  };

  // Helper to get subcategory name (now uses i18n mapping)
  const getSubcategoryName = (subcategoryId) => {
    if (!subcategoryId) return t("common.notApplicable"); // NEW: Translated "N/A"
    // Find subcategory in the array (assuming getSubcategoriesById returns an array)
    if (Array.isArray(subcategories) && subcategories.length > 0) {
      const subcategory = subcategories.find(
        (sub) => sub.$id === subcategoryId
      );
      return subcategory
        ? t(`subcategories.${mapSubcategoryNameToI18nKey(subcategory.name)}`)
        : t("common.unknownCategory");
    }
    return t("common.notApplicable"); // NEW: Translated "N/A"
  };

  const handleUpdateBudget = () => {
    onClose(); // Close details modal first
    onUpdate(budget); // Call callback to open setup modal with budget data
  };

  if (!isVisible) {
    return null; // Don't render anything if not visible
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // Handle back button on Android
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/50"
        onPress={onClose}
      >
        <View
          className="bg-primary p-6 w-11/12 max-w-md max-h-[80%]"
          onStartShouldSetResponder={() => true} // Prevent closing modal when interacting with its content
        >
          {/* Close Button (X icon) */}
          <TouchableOpacity
            onPress={onClose}
            className={`absolute top-3 ${
              I18nManager.isRTL ? "left-3" : "right-3"
            } p-2 z-10`}
          >
            <Image
              source={icons.close} // Assuming icons.close exists
              className="w-6 h-6"
              tintColor="black"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text
            className={`text-2xl text-gray-800 mb-6 text-center ${getFontClassName(
              "bold"
            )}`}
            style={{ fontFamily: getFontClassName("bold") }}
          >
            {t("budget.budgetDetailsTitle")}
          </Text>

          {loading ? (
            <View className="flex-1 justify-center items-center h-48">
              <ActivityIndicator size="large" color="#9F54B6" />
              <Text
                className={`text-lg text-gray-700 mt-4 ${getFontClassName(
                  "bold"
                )}`}
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("budget.loadingDetails")}
              </Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center p-4 h-48">
              <Text
                className={`text-red-500 text-lg text-center ${getFontClassName(
                  "regular"
                )}`}
                style={{ fontFamily: getFontClassName("bold") }}
              >
                {error}
              </Text>
            </View>
          ) : budget ? (
            <ScrollView className="space-y-4">
              {/* Budget Amount */}
              <View
                className={`flex-row ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                } items-center mb-3`}
              >
                <Text
                  className={`text-lg text-gray-700 ${getFontClassName(
                    "bold"
                  )}`}
                  style={{ fontFamily: getFontClassName("bold") }}
                >
                  {t("budget.budgetAmountTitle")}:{" "}
                </Text>
                <Text
                  className={`text-xl text-gray-900 ${getFontClassName(
                    "bold"
                  )}`}
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  {i18n.language.startsWith("ar")
                    ? `${convertToArabicNumerals(
                        parseFloat(budget.budgetAmount || 0).toFixed(2)
                      )} ${t("common.currency_symbol_short")}`
                    : `${t("common.currency_symbol_short")}${parseFloat(
                        budget.budgetAmount || 0
                      ).toFixed(2)}`}
                </Text>
              </View>

              {/* Category */}
              <View
                className={`flex-row ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                } items-center mb-3`}
              >
                <Text
                  className={`text-lg text-gray-700 ${getFontClassName(
                    "bold"
                  )}`}
                  style={{ fontFamily: getFontClassName("bold") }}
                >
                  {t("budget.categoryTitle")}:{" "}
                </Text>
                <Text
                  className={`text-xl text-gray-700 ${getFontClassName(
                    "regular"
                  )}`}
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  {getCategoryName(budget.categoryId)}
                </Text>
              </View>

              {/* Subcategory */}
              <View
                className={`flex-row ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                } items-center mb-3`}
              >
                <Text
                  className={`text-lg text-gray-700 ${getFontClassName(
                    "bold"
                  )}`}
                  style={{ fontFamily: getFontClassName("bold") }}
                >
                  {t("budget.subcategoryTitle")}:{" "}
                </Text>
                <Text
                  className={`text-xl text-gray-700 ${getFontClassName(
                    "regular"
                  )}`}
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  {getSubcategoryName(budget.subcategoryId)}
                </Text>
              </View>

              {/* Start Date */}
              <View
                className={`flex-row ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                } items-center mb-3`}
              >
                <Text
                  className={`text-lg text-gray-700 ${getFontClassName(
                    "bold"
                  )}`}
                  style={{ fontFamily: getFontClassName("bold") }}
                >
                  {t("budget.startDateTitle")}:{" "}
                </Text>
                <Text
                  className={`text-xl text-gray-900 ${getFontClassName(
                    "bold"
                  )}`}
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  {budget.startDate
                    ? i18n.language.startsWith("ar")
                      ? format(new Date(budget.startDate), "PPP", {
                          locale: arLocale,
                        })
                      : format(new Date(budget.startDate), "PPP")
                    : t("common.notApplicable")}
                </Text>
              </View>

              {/* End Date */}
              <View
                className={`flex-row ${
                  I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
                } items-center mb-3`}
              >
                <Text
                  className={`text-lg text-gray-700 ${getFontClassName(
                    "bold"
                  )}`}
                  style={{ fontFamily: getFontClassName("bold") }}
                >
                  {t("budget.endDateTitle")}:{" "}
                </Text>
                <Text
                  className={`text-xl text-gray-900 ${getFontClassName(
                    "regular"
                  )}`}
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  {budget.endDate
                    ? i18n.language.startsWith("ar")
                      ? format(new Date(budget.endDate), "PPP", {
                          locale: arLocale,
                        })
                      : format(new Date(budget.endDate), "PPP")
                    : t("common.notApplicable")}
                </Text>
              </View>
            </ScrollView>
          ) : (
            <View className="flex-1 justify-center items-center h-48">
              <Text
                className={`text-lg text-gray-700 ${getFontClassName(
                  "regular"
                )}`}
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("budget.noBudgetDataAvailable")}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

export default BudgetDetailsModal;
