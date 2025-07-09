import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal, // Keep Modal for the internal Calendar Modal
  Pressable, // Keep Pressable for the internal Calendar Modal
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  I18nManager, // <-- ADDED THIS
  Alert, // <-- ADDED THIS for consistent alerts
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import CustomButton from "./CustomButton";
import icons from "../constants/icons";
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../utils/fontUtils";
import i18n from "../utils/i18n";

const screenWidth = Dimensions.get("window").width;

const SearchFilter = ({
  searchQuery,
  setSearchQuery,
  selectedSearchCategory,
  setSelectedSearchCategory,
  selectedSearchSubcategory,
  setSelectedSearchSubcategory,
  searchStartDate,
  setSearchStartDate,
  searchEndDate,
  setSearchEndDate,
  showCalendarModal,
  setShowCalendarModal,
  markedDates,
  setMarkedDates,
  categories,
  performSearch,
  clearSearch,
  setIsSearchFilterExpanded,
  setShowSearchFilterModal, // Kept as in your provided code
}) => {
  const { t } = useTranslation(); // Hook for translation
  const [isStartDateSelection, setIsStartDateSelection] = useState(true);
  const [subcategories, setSubcategories] = useState([]);

  // Helper to convert to Arabic numerals (needed for date formatting if RTL)
  const convertToArabicNumerals = (num) => {
    const numString = String(num);
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
    return numString.replace(
      /\d/g,
      (digit) => arabicNumeralsMap[digit] || digit
    );
  };

  // Helper function to format date and convert numerals if needed
  const formatLocalizedDate = useCallback(
    (dateValue, formatStringKey = "common.dateFormatShort") => {
      if (
        !dateValue ||
        (typeof dateValue === "string" && dateValue === "N/A")
      ) {
        return t("common.not_available_short");
      }

      const dateObject = new Date(dateValue);
      if (isNaN(dateObject.getTime())) {
        return t("common.not_available_short");
      }

      const formattedDate = format(dateObject, t(formatStringKey));

      if (I18nManager.isRTL) {
        return convertToArabicNumerals(formattedDate);
      }
      return formattedDate;
    },
    [t]
  );

  // Effect to update subcategories when selected category changes
  useEffect(() => {
    if (selectedSearchCategory) {
      const parentCategory = categories.find(
        (cat) => cat.$id === selectedSearchCategory
      );
      if (parentCategory && parentCategory.subcategories) {
        setSubcategories(
          parentCategory.subcategories.map((sub) => ({
            label: sub.name,
            value: sub.$id,
          }))
        );
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
    // Reset subcategory if category changes
    setSelectedSearchSubcategory(null);
  }, [selectedSearchCategory, categories]);

  const onDayPress = (day) => {
    const selectedDate = new Date(day.dateString);
    const dateString = format(selectedDate, "yyyy-MM-dd");

    if (isStartDateSelection) {
      setSearchStartDate(selectedDate);
      setMarkedDates({
        [dateString]: { selected: true, marked: true, selectedColor: "blue" },
      });
      // If end date is before start date, clear it
      if (searchEndDate && selectedDate > searchEndDate) {
        setSearchEndDate(null);
      }
    } else {
      // Ensure end date is not before start date
      if (searchStartDate && selectedDate < searchStartDate) {
        Alert.alert(t("common.error"), t("home.endDateBeforeStartDateError")); // Translated alert
        return;
      }
      setSearchEndDate(selectedDate);
      setMarkedDates((prev) => ({
        ...prev,
        [dateString]: { selected: true, marked: true, selectedColor: "blue" },
      }));
    }
    setShowCalendarModal(false);
  };

  const openCalendar = (isStart) => {
    setIsStartDateSelection(isStart);
    setShowCalendarModal(true);
  };

  const handleCategoryChange = (item) => {
    setSelectedSearchCategory(item.value);
  };

  const handleSubcategoryChange = (item) => {
    setSelectedSearchSubcategory(item.value);
  };

  // Modified handlers: they call the search/clear logic, but DO NOT automatically collapse the filter.
  // The user will explicitly collapse it with the 'Close Filter' button.
  const handleApplyFilters = () => {
    performSearch();
    // This prop is passed from Home.jsx to close the modal
    if (setShowSearchFilterModal) {
      setShowSearchFilterModal(false);
    }
  };

  const handleClearFilters = () => {
    clearSearch();
    setIsSearchFilterExpanded(false); // This prop is still passed, so keep it here
    // This prop is passed from Home.jsx to close the modal
    if (setShowSearchFilterModal) {
      setShowSearchFilterModal(false);
    }
  };

  return (
    <View className="mt-2  shadow-lg shadow-green-800">
      {/* Merchant Search */}
      <TextInput
        className={`flex-1 text-black-100 font-bold text-base rounded-md border border-[##4E17B3] w-full h-12 mb-3 px-4`}
        style={{
          fontFamily: getFontClassName("bold"),
          textAlign: i18n.language.startsWith("ar") ? "right" : "left",
        }} // Font style applied
        value={searchQuery}
        placeholder={t("home.merchantName")} // Translated placeholder
        placeholderTextColor="#a1a1a" // Kept as in your code
        onChangeText={(text) => setSearchQuery(text)}
        keyboardType="default"
      />

      {/* Category Dropdown */}
      {/* Kept commented as in your provided code */}
      {/* <View className="mb-4">
        <Text className="text-gray-700 font-pmedium text-base mb-2">
          Category
        </Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={categories.map((cat) => ({ label: cat.name, value: cat.$id }))}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!selectedSearchCategory ? "Select category" : "..."}
          searchPlaceholder="Search..."
          value={selectedSearchCategory}
          onChange={handleCategoryChange}
          renderLeftIcon={() => (
            <Image source={icons.categories} className="w-5 h-5 mr-2" />
          )}
        />
      </View> */}

      {/* Subcategory Dropdown (conditionally rendered) */}
      {/* Kept commented as in your provided code */}
      {/* {selectedSearchCategory && subcategories.length > 0 && (
        <View className="mb-4">
          <Text className="text-gray-700 font-pmedium text-base mb-2">
            Subcategory
          </Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={subcategories}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={
              !selectedSearchSubcategory ? "Select subcategory" : "..."
            }
            searchPlaceholder="Search..."
            value={selectedSearchSubcategory}
            onChange={handleSubcategoryChange}
            renderLeftIcon={() => (
              <Image source={icons.subcategory} className="w-5 h-5 mr-2" />
            )}
          />
        </View>
      )} */}

      {/* Date Range Selection */}
      <View
        className={`flex-row justify-between mb-4 ${
          I18nManager.isRTL ? "flex-row-reverse" : "flex-row" // RTL layout
        }`}
      >
        <View className="w-[48%]">
          <TouchableOpacity
            onPress={() => openCalendar(true)}
            className="flex-row items-center p-3 rounded-md border border-[#4E17B3]"
          >
            <Image
              source={icons.calendar}
              className={`w-5 h-5 ${
                i18n.language.startsWith("ar") ? "ml-2" : "mr-2"
              }`} // RTL spacing
              resizeMode="contain"
              tintColor="#4E17B3"
            />
            <Text
              className={`text-base text-gray-800 font-pregular flex-1 ${
                I18nManager.isRTL ? "text-right" : "text-left" // RTL alignment
              }`}
              style={{ fontFamily: getFontClassName("regular") }} // Font style applied
            >
              {searchStartDate
                ? formatLocalizedDate(searchStartDate, "common.dateFormatShort")
                : t("home.fromDate")}{" "}
              {/* Translated */}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="w-[48%]">
          <TouchableOpacity
            onPress={() => openCalendar(false)}
            className="flex-row items-center p-3 rounded-md border border-[#4E17B3]"
          >
            <Image
              source={icons.calendar}
              className={`w-5 h-5 ${
                i18n.language.startsWith("ar") ? "ml-2" : "mr-2"
              }`} // RTL spacing
              resizeMode="contain"
              tintColor="#4E17B3"
            />
            <Text
              className={`text-base text-gray-800 font-pregular flex-1 ${
                I18nManager.isRTL ? "text-right" : "text-left" // RTL alignment
              }`}
              style={{ fontFamily: getFontClassName("regular") }} // Font style applied
            >
              {searchEndDate
                ? formatLocalizedDate(searchEndDate, "common.dateFormatShort")
                : t("home.toDate")}{" "}
              {/* Translated */}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Clear Buttons */}
      <View className="flex-row justify-between">
        {/* Kept commented as in your provided code */}
        {/* <CustomButton
          title="Apply Filters"
          handlePress={handleApplyFilters}
          containerStyles="w-[48%] bg-secondary-200"
          textStyles="text-white font-pbold"
        /> */}
        {/* Kept commented as in your provided code */}
        {/* <CustomButton
          title="Clear Filters"
          handlePress={handleClearFilters}
          containerStyles="w-[48%] bg-gray-300"
          textStyles="text-gray-700 font-pbold"
        /> */}

        {/* <TouchableOpacity
          onPress={handleClearFilters}
          className="mt-1 w-full bg-[#D03957] rounded-md p-3 items-center justify-center"
        >
          <Text
            className="text-white font-pmedium text-base"
            style={{ fontFamily: getFontClassName("medium") }} // Font style applied
          >
            {t("home.clearFiltersButton")} 
          </Text>
        </TouchableOpacity> */}
      </View>

      {/* Add a "Close Filter" button for explicit collapsing */}
      {/* Kept commented as in your provided code */}
      {/* <CustomButton
        title="Close Filter"
        handlePress={() => setIsSearchFilterExpanded(false)}
        containerStyles="mt-4 bg-red-500 w-full"
        textStyles="text-white font-pbold"
      /> */}

      {/* Calendar Modal (for date selection - remains within SearchFilter) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCalendarModal}
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <Pressable
          style={styles.centeredView}
          onPress={() => setShowCalendarModal(false)}
        >
          <View style={styles.modalView}>
            <Calendar
              onDayPress={onDayPress}
              markedDates={markedDates}
              markingType={"simple"}
              enableSwipeMonths={true}
              current={
                (isStartDateSelection ? searchStartDate : searchEndDate) ||
                new Date()
              }
              theme={{
                todayTextColor: "#2A9D8F", // Consistent color
                arrowColor: "#2A9D8F", // Consistent color
                selectedDayBackgroundColor: "#2A9D8F", // Consistent color
                selectedDayTextColor: "#ffffff",
              }}
            />
            <CustomButton
              title={t("home.closeCalendar")} // Translated
              handlePress={() => setShowCalendarModal(false)}
              containerStyles="mt-4 bg-red-500"
              textStyles="text-white font-pbold"
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  // Existing dropdown styles
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#A1A1AA",
    fontFamily: "Poppins-Regular", // Font style applied
    textAlign: I18nManager.isRTL ? "right" : "left", // RTL alignment
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Poppins-Regular", // Font style applied
    textAlign: I18nManager.isRTL ? "right" : "left", // RTL alignment
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    fontFamily: "Poppins-Regular", // Font style applied
    textAlign: I18nManager.isRTL ? "right" : "left", // RTL alignment
  },
  // Existing styles for the internal Calendar Modal
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 30,
    backgroundColor: "white",
    borderRadius: 30,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: screenWidth * 0.9,
  },
});
export default SearchFilter;
