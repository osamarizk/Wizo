import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  // StyleSheet, // Removed: no longer needed as styles are inline with Tailwind
  Modal,
  Pressable,
  ActivityIndicator,
  I18nManager,
  TextInput,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GradientBackground from "../components/GradientBackground"; // Adjust path as needed
import FormField from "../components/FormField"; // Adjust path as needed
import CustomButton from "../components/CustomButton"; // Adjust path as needed
import { useGlobalContext } from "../context/GlobalProvider"; // Adjust path as needed
import icons from "../constants/icons";
import {
  createBudget,
  getUserBudgets, // Used for checking existing budgets for overlap validation
  updateBudget,
  getAllCategories,
  getSubcategoriesByCategory,
  createNotification,
  countUnreadNotifications,
  getFutureDate,
} from "../lib/appwrite"; // Adjust path as needed
import { Dropdown } from "react-native-element-dropdown"; // Ensure this library is installed
import { Calendar } from "react-native-calendars"; // Ensure this library is installed
import { format } from "date-fns";
import { ar as arLocale } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils"; // Path from BudgetSetupModal to utils/fontUtils
import i18n from "../utils/i18n";

const screenWidth = Dimensions.get("window").width;
// Utility function to convert numbers to Arabic numerals (copy from Budget.jsx if not global)
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

// Utility to map category names to i18n keys (copy from Budget.jsx)
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

  // IMPORTANT: Ensure these case statements EXACTLY match the subcategory names
  // as they are stored in your Appwrite database.
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
      return "miscellaneous"; // Example if it's a general subcategory
    // Fallback for cases not explicitly mapped (converts 'Some Subcategory' to 'someSubcategory')
    default:
      return subcategoryNameFromDB
        .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) =>
          chr ? chr.toUpperCase() : ""
        )
        .replace(/^./, (match) => match.toLowerCase());
  }
};

const BudgetSetupModal = ({
  isVisible,
  onClose,
  initialBudgetData,
  onSaveSuccess,
}) => {
  const { t } = useTranslation();

  const { user, setHasBudget, updateUnreadCount } = useGlobalContext();
  const [budgetAmount, setBudgetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExistingBudget, setIsExistingBudget] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);

        if (initialBudgetData) {
          // MODIFIED LINES BELOW:
          setBudgetAmount(String(initialBudgetData.budgetAmount)); // FIX 1: Use 'budgetAmount'
          setSelectedCategory(initialBudgetData.categoryId); // FIX 2: Use 'categoryId'
          setSelectedSubcategory(initialBudgetData.subcategoryId || null); // FIX 3: Use 'subcategoryId'
          setStartDate(
            initialBudgetData.start_date
              ? new Date(initialBudgetData.start_date)
              : undefined
          );
          setEndDate(
            initialBudgetData.end_date
              ? new Date(initialBudgetData.end_date)
              : undefined
          );
          setIsExistingBudget(true);

          if (initialBudgetData.categoryId) {
            // FIX 4: Use 'categoryId' here too
            const fetchedSubcategories = await getSubcategoriesByCategory(
              initialBudgetData.categoryId // FIX 5: Use 'categoryId' here too
            );
            setSubcategories(fetchedSubcategories);
          }
        } else {
          setBudgetAmount("");
          setSelectedCategory(null);
          setSelectedSubcategory(null);
          setStartDate(undefined);
          setEndDate(undefined);
          setIsExistingBudget(false);
          setSubcategories([]);
        }
      } catch (error) {
        console.error("Error fetching data for budget setup modal:", error);
        // Translated Alert.alert
        Alert.alert(
          t("common.errorTitle"),
          t("common.failedToLoadData", {
            error: error.message || t("common.unknownError"),
          })
        );
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchData();
    }
  }, [isVisible, user, initialBudgetData, t]); // Added 't' to dependencies

  useEffect(() => {
    const fetchRelatedSubcategories = async () => {
      if (selectedCategory) {
        setLoading(true);
        try {
          const fetchedSubcategories = await getSubcategoriesByCategory(
            selectedCategory
          );
          setSubcategories(fetchedSubcategories);
          if (
            selectedSubcategory &&
            !fetchedSubcategories.some((sub) => sub.$id === selectedSubcategory)
          ) {
            setSelectedSubcategory(null);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          // Translated Alert.alert
          Alert.alert(
            t("common.errorTitle"),
            t("common.failedToLoadSubcategories")
          );
        } finally {
          setLoading(false);
        }
      } else {
        setSubcategories([]);
        setSelectedSubcategory(null);
      }
    };
    fetchRelatedSubcategories();
  }, [selectedCategory, selectedSubcategory, t]); // Added 't' to dependencies

  const handleSaveBudget = useCallback(async () => {
    // Helper to get category name (from your Budget.jsx, adapted here for modal scope)
    const getCategoryNameForNotification = (categoryId) => {
      const category = categories.find((cat) => cat.$id === categoryId);
      return category
        ? t(`categories.${mapCategoryNameToI18nKey(category.name)}`)
        : t("common.unknownCategory");
    };

    const getSubcategoryNameForNotification = (subcategoryId) => {
      if (!subcategoryId) return "";
      const subcategory = subcategories.find(
        (sub) => sub.$id === subcategoryId
      );
      return subcategory ? subcategory.name : ""; // Subcategories might not have i18n keys if they are user-defined
    };

    if (!budgetAmount.trim() || !selectedCategory || !startDate || !endDate) {
      Alert.alert(
        t("budget.fillAllFieldsErrorTitle"), // Translated
        t("budget.fillAllFieldsErrorMessage") // Translated
      );
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(
        t("budget.invalidAmountErrorTitle"), // Translated
        t("budget.invalidAmountErrorMessage") // Translated
      );
      return;
    }

    if (startDate > endDate) {
      Alert.alert(
        t("budget.dateOrderErrorTitle"),
        t("budget.dateOrderErrorMessage")
      ); // Translated
      return;
    }

    setLoading(true);
    try {
      let budgetId;
      const categoryName = getCategoryNameForNotification(selectedCategory); // Get translated name for notifications
      const subcategoryName =
        getSubcategoryNameForNotification(selectedSubcategory); // Get name for notifications
      const currencySymbol = t("common.currency_symbol_short");

      if (isExistingBudget && initialBudgetData?.$id) {
        // --- UPDATE EXISTING BUDGET FLOW ---
        budgetId = initialBudgetData.$id;
        await updateBudget(
          budgetId,
          amount,
          startDate.toISOString(),
          endDate.toISOString(),
          selectedCategory,
          selectedSubcategory
        );
        Alert.alert(t("common.success"), t("budget.budgetUpdateSuccess")); // Translated

        // Create notification for update
        await createNotification({
          user_id: user.$id,
          title: t("budget.budgetUpdatedNotificationTitle"), // Translated
          message: t("budget.budgetUpdatedNotificationMessage", {
            // Translated with variables
            categoryName: categoryName,
            amount: i18n.language.startsWith("ar")
              ? convertToArabicNumerals(amount.toFixed(2))
              : amount.toFixed(2),
            currencySymbol: currencySymbol,
            subcategoryName: subcategoryName ? ` (${subcategoryName})` : "", // Add subcategory if exists
          }),
          budget_id: budgetId,
          type: "budget", // Consistent type
          expiresAt: getFutureDate(7), // Expiry for success
        });
      } else {
        // --- CREATE NEW BUDGET FLOW ---
        // *** Validation for existing/overlapping budgets ***
        const existingBudgets = await getUserBudgets(user.$id); // Assuming this fetches ALL user budgets
        const newBudgetStartDate = startDate.getTime(); // Get timestamp for easier comparison
        const newBudgetEndDate = endDate.getTime();

        const isOverlap = existingBudgets.some((existingBudget) => {
          const existingBudgetStartDate = new Date(
            existingBudget.start_date // Use start_date from Appwrite
          ).getTime();
          const existingBudgetEndDate = new Date(
            existingBudget.end_date // Use end_date from Appwrite
          ).getTime();

          const categoryMatch = existingBudget.category_id === selectedCategory; // Use category_id

          const subcategoryMatch = selectedSubcategory
            ? existingBudget.subcategory_id === selectedSubcategory // Use subcategory_id
            : existingBudget.subcategory_id === null ||
              existingBudget.subcategory_id === undefined; // If new budget has no sub, it conflicts with existing without sub

          const datesOverlap =
            newBudgetStartDate <= existingBudgetEndDate &&
            newBudgetEndDate >= existingBudgetStartDate;

          return categoryMatch && subcategoryMatch && datesOverlap;
        });

        if (isOverlap) {
          Alert.alert(
            t("budget.budgetConflictErrorTitle"), // Translated
            t("budget.budgetConflictErrorMessage") // Translated
          );
          setLoading(false);
          return; // Stop function execution
        }

        const newBudget = await createBudget(
          user.$id,
          selectedCategory,
          amount,
          startDate.toISOString(),
          endDate.toISOString(),
          selectedSubcategory
        );
        budgetId = newBudget.$id;
        Alert.alert(
          t("common.success"),
          t("budget.budgetCreatedNotificationTitle")
        ); // Translated

        // Create notification for creation
        await createNotification({
          user_id: user.$id,
          title: t("budget.budgetCreatedNotificationTitle"), // Translated
          message: t("budget.budgetCreatedNotificationMessage", {
            // Translated with variables
            categoryName: categoryName,
            amount: i18n.language.startsWith("ar")
              ? convertToArabicNumerals(amount.toFixed(2))
              : amount.toFixed(2),
            currencySymbol: currencySymbol,
            subcategoryName: subcategoryName ? ` (${subcategoryName})` : "", // Add subcategory if exists
          }),
          budget_id: budgetId,
          type: "budget", // Consistent type
          expiresAt: getFutureDate(7), // Expiry for success
        });
      }
      setHasBudget(true); // Assuming this updates global context for budget presence

      const updatedUnreadCount = await countUnreadNotifications(user.$id);
      updateUnreadCount(updatedUnreadCount);

      onSaveSuccess(); // Callback to parent to refresh budget list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving budget:", error);
      Alert.alert(
        t("common.failed"),
        t("common.failedToSaveBudget", {
          error: error.message || t("common.unknownError"),
        }) // Translated
      );
      // Create notification for failure
      try {
        await createNotification({
          user_id: user.$id,
          title: t("budget.budgetActionFailedNotificationTitle"), // Assuming this key exists
          message: t("budget.budgetActionFailedNotificationMessage", {
            error: error.message || t("common.unknownError"),
          }),
          type: "error", // Error type
          expiresAt: getFutureDate(14), // Longer expiry for errors
        });
        const updatedUnreadCount = await countUnreadNotifications(user.$id);
        updateUnreadCount(updatedUnreadCount);
      } catch (notificationError) {
        console.warn(
          "Failed to create budget save/update failure notification:",
          notificationError
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    budgetAmount,
    selectedCategory,
    selectedSubcategory,
    startDate,
    endDate,
    isExistingBudget,
    initialBudgetData,
    user?.$id,
    onSaveSuccess,
    onClose,
    setHasBudget,
    updateUnreadCount,
    categories, // Added categories for getCategoryNameForNotification
    subcategories, // Added subcategories for getSubcategoryNameForNotification
    t, // Added 't' for translations
    i18n.language, // Added to ensure re-run if language changes for numeral conversion
    getFutureDate, // Added if it's a memoized function or part of current scope
  ]);

  const handleDateSelect = (day, dateType) => {
    const selectedDate = new Date(day.timestamp);
    if (dateType === "start") {
      setStartDate(selectedDate);
    } else {
      setEndDate(selectedDate);
    }
  };

  if (!isVisible) {
    return null;
  }

  const today = new Date();
  const formattedToday = format(today, "yyyy-MM-dd");

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/50"
        onPress={onClose}
      >
        <View
          className="bg-primary   p-6 w-11/12 max-w-md max-h-[90%]"
          onStartShouldSetResponder={() => true}
        >
          <TouchableOpacity onPress={onClose} className="p-2">
            <Image
              source={icons.close}
              resizeMode="contain"
              className="w-6 h-6 "
              tintColor="#333"
            />
          </TouchableOpacity>
          <Text
            className={`text-3xl text-[#1a2471] mb-6 text-center `}
            style={{ fontFamily: getFontClassName("semibold") }}
          >
            {isExistingBudget
              ? t("budget.updateYourBudgetTitle")
              : t("budget.setUpYourBudgetTitle")}{" "}
          </Text>

          {loading && (
            <View className="absolute inset-0 bg-white/70 justify-center items-center z-20 rounded-lg">
              <ActivityIndicator size="large" color="#9F54B6" />
              <Text
                className="mt-2 text-gray-700"
                style={{ fontFamily: getFontClassName("regular") }}
              >
                {t("budget.loadingData")}
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* Budget Amount Input */}
            <View className="mb-3">
              <Text
                className={`text-lg text-[#1a2471]  mb-1 text-center ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {t("budget.budgetAmountTitle")}
              </Text>
              <TextInput
                className={`w-full h-12.5 bg-white  p-3  border-2 border-[#9F54B6] text-lg text-black ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`}
                style={{
                  fontFamily: getFontClassName("regular"),
                  // ADD THIS LINE for placeholder alignment
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
                placeholder={t("budget.enterBudgetAmountPlaceholder", {
                  currencySymbol: t("common.currency_symbol_short"),
                })}
                placeholderTextColor="#7b7b8b"
                value={
                  i18n.language.startsWith("ar") && budgetAmount
                    ? convertToArabicNumerals(budgetAmount)
                    : budgetAmount
                }
                onChangeText={(text) => {
                  const normalizedText = text
                    .replace(/٠/g, "0")
                    .replace(/١/g, "1")
                    .replace(/٢/g, "2")
                    .replace(/٣/g, "3")
                    .replace(/٤/g, "4")
                    .replace(/٥/g, "5")
                    .replace(/٦/g, "6")
                    .replace(/٧/g, "7")
                    .replace(/٨/g, "8")
                    .replace(/٩/g, "9");

                  const filteredText = normalizedText.replace(/[^0-9.]/g, "");

                  let finalAmount = filteredText;
                  const parts = filteredText.split(".");
                  if (parts.length > 2) {
                    finalAmount = `${parts[0]}.${parts.slice(1).join("")}`;
                  }

                  setBudgetAmount(finalAmount);
                }}
                keyboardType="numeric"
              />
            </View>

            {/* Category Dropdown */}
            <View className="mb-4">
              <Text
                className={`text-lg text-[#1a2471]  mb-1 ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {t("budget.categoryTitle")}
              </Text>
              <Dropdown
                className="h-12.5 bg-white p-3 border-2 border-[#9F54B6]"
                placeholderStyle={{
                  fontSize: 16,
                  color: "#7b7b8b",
                  textAlign: I18nManager.isRTL ? "right" : "left",
                  fontFamily: getFontClassName("regular"),
                }}
                selectedTextStyle={{
                  fontSize: 16,
                  color: "#000",
                  textAlign: I18nManager.isRTL ? "right" : "left",
                  fontFamily: getFontClassName("regular"),
                }}
                inputSearchStyle={{
                  height: 40,
                  fontSize: 16,
                  textAlign: I18nManager.isRTL ? "right" : "left",
                  fontFamily: getFontClassName("regular"),
                }}
                itemTextStyle={{
                  textAlign: I18nManager.isRTL ? "right" : "left",
                  fontFamily: getFontClassName("regular"),
                }}
                data={categories.map((cat) => ({
                  label: t(`categories.${mapCategoryNameToI18nKey(cat.name)}`),
                  value: cat.$id,
                }))}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={t("budget.selectCategoryPlaceholder")}
                searchPlaceholder={t("common.search")}
                value={selectedCategory}
                onChange={(item) => {
                  setSelectedCategory(item.value);
                  setSelectedSubcategory(null);
                }}
                containerStyle={{
                  borderRadius: 4, // Match border radius of input
                  borderColor: "#9F54B6",
                  borderWidth: 1,
                  overflow: "hidden", // Ensure content doesn't spill
                  alignSelf: "center",
                }}
              />
            </View>

            {/* Subcategory Dropdown */}
            <View className="mb-4">
              <Text
                className={`text-lg text-[#1a2471]  mb-1 ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {t("budget.subcategoryTitle")}
              </Text>
              <Dropdown
                className="h-12.5 bg-white  p-3  border-2 border-[#9F54B6]"
                placeholderStyle={{
                  fontSize: 16,
                  color: "#7b7b8b",
                  textAlign: I18nManager.isRTL ? "right" : "left",
                  fontFamily: getFontClassName("regular"),
                }}
                selectedTextStyle={{
                  fontSize: 16,
                  color: "#000",
                  textAlign: I18nManager.isRTL ? "right" : "left",
                  fontFamily: getFontClassName("regular"),
                }}
                inputSearchStyle={{
                  height: 40,
                  fontSize: 16,
                  textAlign: I18nManager.isRTL ? "right" : "left",
                  fontFamily: getFontClassName("regular"),
                }}
                itemTextStyle={{
                  textAlign: I18nManager.isRTL ? "right" : "left",
                  fontFamily: getFontClassName("regular"),
                }}
                data={subcategories.map((sub) => ({
                  label: t(
                    `subcategories.${mapSubcategoryNameToI18nKey(sub.name)}`
                  ),
                  value: sub.$id,
                }))}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={
                  subcategories.length === 0
                    ? t("budget.noSubcategoriesAvailable")
                    : t("budget.selectSubcategoryPlaceholder")
                }
                searchPlaceholder={t("common.search")}
                value={selectedSubcategory}
                onChange={(item) => setSelectedSubcategory(item.value)}
                disable={subcategories.length === 0}
                containerStyle={{
                  borderRadius: 4, // Match border radius of input
                  borderColor: "#9F54B6",
                  borderWidth: 1,
                  overflow: "hidden", // Ensure content doesn't spill
                  alignSelf: "center",
                }}
              />
            </View>
            {/* Start Date Picker */}
            <View className="mb-4">
              <Text
                className={`text-lg text-[#1a2471]  mb-1 ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {t("budget.startDateTitle")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                className="w-full border-2 border-[#9F54B6]  p-4"
              >
                <Text
                  className={`text-base text-gray-800 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  {startDate
                    ? format(startDate, "PPP", {
                        locale: i18n.language.startsWith("ar")
                          ? arLocale
                          : undefined,
                      })
                    : t("budget.selectStartDatePlaceholder")}{" "}
                </Text>
              </TouchableOpacity>

              {showStartDatePicker && (
                <Modal
                  visible={showStartDatePicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowStartDatePicker(false)}
                >
                  <Pressable
                    className="flex-1 justify-center items-center bg-black/50"
                    onPress={() => setShowStartDatePicker(false)}
                  >
                    <View
                      className="bg-primary rounded-lg p-5 items-center   max-w-[400px]"
                      onStartShouldSetResponder={() => true}
                    >
                      {/* Close Icon (X) */}
                      <TouchableOpacity
                        onPress={() => setShowStartDatePicker(false)}
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

                      <Calendar
                        className="rounded-lg border border-gray-300  w-full mt-6" // Added mt-6 for icon space
                        onDayPress={(day) => {
                          handleDateSelect(day, "start");
                          setShowStartDatePicker(false);
                        }}
                        minDate={formattedToday}
                        current={
                          startDate
                            ? format(startDate, "yyyy-MM-dd")
                            : formattedToday
                        }
                        markedDates={
                          startDate
                            ? {
                                [format(startDate, "yyyy-MM-dd")]: {
                                  selected: true,
                                  marked: true,
                                  selectedColor: "#2A9D8F", // Teal
                                },
                              }
                            : {
                                [formattedToday]: {
                                  // Mark today by default if no date is selected
                                  selected: true,
                                  selectedColor: "#2A9D8F", // Teal
                                  textColor: "#ffffff",
                                },
                              }
                        }
                        theme={{
                          backgroundColor: "#ffffff",
                          calendarBackground: "#ffffff",
                          textSectionTitleColor: "#607D8B", // Darker gray for day headers
                          textSectionTitleDisabledColor: "#B0BEC5",
                          selectedDayBackgroundColor: "#2A9D8F", // Teal for selected
                          selectedDayTextColor: "#ffffff",
                          todayTextColor: "#F4A261", // Orange for today
                          dayTextColor: "#264653", // Dark Blue for normal days
                          textDisabledColor: "#CFD8DC", // Lighter gray for disabled dates
                          dotColor: "#F4A261", // Orange dot
                          selectedDotColor: "#ffffff",
                          arrowColor: "#264653", // Dark Blue arrows
                          disabledArrowColor: "#B0BEC5",
                          monthTextColor: "#264653", // Dark Blue month name
                          indicatorColor: "#2A9D8F",
                          textDayFontFamily: getFontClassName("regular"),
                          textMonthFontFamily: getFontClassName("semibold"),
                          textDayHeaderFontFamily: getFontClassName("regular"),
                          textDayFontSize: 16,
                          textMonthFontSize: 18,
                          textDayHeaderFontSize: 14,
                        }}
                        hideExtraDays={true}
                        enableSwipeMonths={true}
                        renderHeader={(date) => {
                          const headerText = format(
                            date.getTime(),
                            "MMMM yyyy",
                            {
                              // Include year
                              locale: i18n.language.startsWith("ar")
                                ? arLocale
                                : undefined,
                            }
                          );
                          return (
                            <Text
                              style={{
                                fontSize: 18,
                                fontFamily: getFontClassName("semibold"),
                                textAlign: "center",
                                color: "#264653",
                              }}
                            >
                              {headerText}
                            </Text>
                          );
                        }}
                      />
                    </View>
                  </Pressable>
                </Modal>
              )}
            </View>

            {/* End Date Picker */}
            <View className="mb-4">
              <Text
                className={`text-lg text-[#1a2471]  mb-1 ${
                  I18nManager.isRTL ? "text-right" : "text-left"
                }`}
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {t("budget.endDateTitle")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                className="w-full border-2 border-[#9F54B6]  p-4"
              >
                <Text
                  className={`text-base text-gray-800 ${
                    I18nManager.isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ fontFamily: getFontClassName("regular") }}
                >
                  {endDate
                    ? format(endDate, "PPP", {
                        locale: i18n.language.startsWith("ar")
                          ? arLocale
                          : undefined,
                      })
                    : t("budget.selectEndDatePlaceholder")}{" "}
                </Text>
              </TouchableOpacity>

              {showEndDatePicker && (
                <Modal
                  visible={showEndDatePicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowEndDatePicker(false)}
                >
                  <Pressable
                    className="flex-1 justify-center items-center bg-black/50"
                    onPress={() => setShowEndDatePicker(false)}
                  >
                    <View
                      className="bg-primary rounded-lg p-5 items-center   max-w-[400px]" // Removed unnecessary w-11/12, keep max-w
                      onStartShouldSetResponder={() => true}
                    >
                      {/* Close Icon (X) */}
                      <TouchableOpacity
                        onPress={() => setShowEndDatePicker(false)}
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

                      <Calendar
                        className="rounded-lg border border-gray-300  w-full mt-6" // Added mt-6 for icon space
                        onDayPress={(day) => {
                          handleDateSelect(day, "end");
                          setShowEndDatePicker(false);
                        }}
                        minDate={
                          startDate
                            ? format(startDate, "yyyy-MM-dd")
                            : formattedToday
                        } // minDate is startDate or today
                        current={
                          endDate
                            ? format(endDate, "yyyy-MM-dd")
                            : formattedToday
                        } // Display selected month or current month
                        markedDates={
                          endDate
                            ? {
                                [format(endDate, "yyyy-MM-dd")]: {
                                  selected: true,
                                  marked: true,
                                  selectedColor: "#2A9D8F", // Teal
                                },
                              }
                            : {
                                // Mark today by default if no date is selected
                                [formattedToday]: {
                                  selected: true,
                                  selectedColor: "#2A9D8F", // Teal
                                  textColor: "#ffffff",
                                },
                              }
                        }
                        theme={{
                          backgroundColor: "#ffffff",
                          calendarBackground: "#ffffff",
                          textSectionTitleColor: "#607D8B",
                          textSectionTitleDisabledColor: "#B0BEC5",
                          selectedDayBackgroundColor: "#2A9D8F",
                          selectedDayTextColor: "#ffffff",
                          todayTextColor: "#F4A261",
                          dayTextColor: "#264653",
                          textDisabledColor: "#CFD8DC",
                          dotColor: "#F4A261",
                          selectedDotColor: "#ffffff",
                          arrowColor: "#264653",
                          disabledArrowColor: "#B0BEC5",
                          monthTextColor: "#264653",
                          indicatorColor: "#2A9D8F",
                          textDayFontFamily: getFontClassName("regular"),
                          textMonthFontFamily: getFontClassName("semibold"),
                          textDayHeaderFontFamily: getFontClassName("regular"),
                          textDayFontSize: 16,
                          textMonthFontSize: 18,
                          textDayHeaderFontSize: 14,
                        }}
                        hideExtraDays={true}
                        enableSwipeMonths={true}
                        renderHeader={(date) => {
                          const headerText = format(
                            date.getTime(),
                            "MMMM yyyy",
                            {
                              locale: i18n.language.startsWith("ar")
                                ? arLocale
                                : undefined,
                            }
                          );
                          return (
                            <Text
                              style={{
                                fontSize: 18,
                                fontFamily: getFontClassName("semibold"),
                                textAlign: "center",
                                color: "#264653",
                              }}
                            >
                              {headerText}
                            </Text>
                          );
                        }}
                      />
                    </View>
                  </Pressable>
                </Modal>
              )}
            </View>

            {/* Save/Update Button */}
            <TouchableOpacity
              onPress={handleSaveBudget}
              className={`mt-4 py-3 items-center justify-center ${
                loading ? "bg-gray-400" : "bg-[#264653]"
              }`}
              disabled={loading}
            >
              <Text
                className="text-lg text-white text-center"
                style={{ fontFamily: getFontClassName("semibold") }}
              >
                {loading
                  ? t("budget.savingButton")
                  : isExistingBudget
                  ? t("budget.updateBudgetButton")
                  : t("budget.saveBudgetButton")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
          <View className="h-2"></View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default BudgetSetupModal;
