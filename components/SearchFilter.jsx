import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import FormField from "./FormField";
import CustomButton from "./CustomButton";
import icons from "../constants/icons"; // Ensure icons are correctly imported

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
}) => {
  const [isStartDateSelection, setIsStartDateSelection] = useState(true);
  const [subcategories, setSubcategories] = useState([]);

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
        alert("End date cannot be before start date.");
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
  };

  const handleClearFilters = () => {
    clearSearch();
    setIsSearchFilterExpanded(false);
  };

  return (
    <View className="pt-1">
      {/* Merchant Search */}
      <TextInput
        className="flex-1 text-black-100 font-bold text-base  rounded-md border border-[##4E17B3] w-full h-12 mb-3 px-4"
        value={searchQuery}
        placeholder="Merchant Name"
        // placeholderTextColor="#a1a1a"
        onChangeText={(text) => setSearchQuery(text)}
        keyboardType="default"
      />

      {/* Category Dropdown */}
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
      <View className="flex-row justify-between mb-4">
        <View className="w-[48%]">
          <TouchableOpacity
            onPress={() => openCalendar(true)}
            className="flex-row items-center p-3 rounded-md border border-[#4E17B3]"
          >
            <Image
              source={icons.calendar}
              className="w-5 h-5 mr-2"
              resizeMode="contain"
              tintColor="#4E17B3"
            />
            <Text className="text-base text-gray-800 font-pregular">
              {searchStartDate ? format(searchStartDate, "yyyy-MM-dd") : "From"}
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
              className="w-5 h-5 mr-2"
              resizeMode="contain"
              tintColor="#4E17B3"
            />
            <Text className="text-base text-gray-800 font-pregular text-center">
              {searchEndDate ? format(searchEndDate, "yyyy-MM-dd") : "To"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Clear Buttons */}
      <View className="flex-row justify-between">
        {/* <CustomButton
          title="Apply Filters"
          handlePress={handleApplyFilters}
          containerStyles="w-[48%] bg-secondary-200"
          textStyles="text-white font-pbold"
        /> */}
        {/* <CustomButton
          title="Clear Filters"
          handlePress={handleClearFilters}
          containerStyles="w-[48%] bg-gray-300"
          textStyles="text-gray-700 font-pbold"
        /> */}

        <TouchableOpacity
          onPress={handleClearFilters}
          className="mt-1 w-full bg-[#D03957] rounded-md p-3 items-center justify-center" // Adjust className for your desired style
        >
          <Text className="text-white font-pmedium text-base">
            Clear Filter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add a "Close Filter" button for explicit collapsing */}
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
            />
            <CustomButton
              title="Close Calendar"
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
    fontFamily: "Poppins-Regular",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Poppins-Regular",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  // Existing styles for the internal Calendar Modal
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
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
