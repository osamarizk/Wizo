import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GradientBackground from "../components/GradientBackground"; // Adjust path as needed
import FormField from "../components/FormField"; // Adjust path as needed
import CustomButton from "../components/CustomButton"; // Adjust path as needed
import { useGlobalContext } from "../context/GlobalProvider"; // Adjust path as needed
import {
  createBudget,
  getUserBudgets, // This is for checking existing budgets during initial load, not for on-the-fly checks
  updateBudget,
  getAllCategories, // Renamed from getCategories to match your GlobalProvider source
  getSubcategoriesByCategory,
  createNotification,
  countUnreadNotifications,
} from "../lib/appwrite"; // Adjust path as needed
import { Dropdown } from "react-native-element-dropdown"; // Ensure this library is installed
import { Calendar } from "react-native-calendars"; // Ensure this library is installed
import { format } from "date-fns";

// BudgetSetupModal component now accepts props for visibility, closing, initial data, and success callback
const BudgetSetupModal = ({
  isVisible,
  onClose,
  initialBudgetData,
  onSaveSuccess,
}) => {
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
      if (!user) return; // Wait for user to be available

      setLoading(true);
      try {
        // Fetch categories
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);

        if (initialBudgetData) {
          // Update mode: pre-fill form with initial budget data
          setBudgetAmount(String(initialBudgetData.budgetAmount));
          setSelectedCategory(initialBudgetData.categoryId);
          setSelectedSubcategory(initialBudgetData.subcategoryId || null);
          setStartDate(
            initialBudgetData.startDate
              ? new Date(initialBudgetData.startDate)
              : undefined
          );
          setEndDate(
            initialBudgetData.endDate
              ? new Date(initialBudgetData.endDate)
              : undefined
          );
          setIsExistingBudget(true);

          if (initialBudgetData.categoryId) {
            const fetchedSubcategories = await getSubcategoriesByCategory(
              initialBudgetData.categoryId
            );
            setSubcategories(fetchedSubcategories);
          }
        } else {
          // Create mode: reset form
          setBudgetAmount("");
          setSelectedCategory(null);
          setSelectedSubcategory(null);
          setStartDate(undefined);
          setEndDate(undefined);
          setIsExistingBudget(false);
          setSubcategories([]); // Clear subcategories for new budget
        }
      } catch (error) {
        console.error("Error fetching data for budget setup modal:", error);
        Alert.alert(
          "Error",
          "Failed to load data for budget setup. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      // Only fetch data when modal is visible
      fetchData();
    }
  }, [isVisible, user, initialBudgetData]); // Re-fetch when modal visibility or initial data changes

  // Fetch subcategories when the selected category changes
  useEffect(() => {
    const fetchRelatedSubcategories = async () => {
      if (selectedCategory) {
        setLoading(true);
        try {
          const fetchedSubcategories = await getSubcategoriesByCategory(
            selectedCategory
          );
          setSubcategories(fetchedSubcategories);
          // If the previously selected subcategory is not in the new list, clear it
          if (
            selectedSubcategory &&
            !fetchedSubcategories.some((sub) => sub.$id === selectedSubcategory)
          ) {
            setSelectedSubcategory(null);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          Alert.alert("Error", "Failed to load subcategories.");
        } finally {
          setLoading(false);
        }
      } else {
        setSubcategories([]);
        setSelectedSubcategory(null);
      }
    };
    fetchRelatedSubcategories();
  }, [selectedCategory]); // Depend only on selectedCategory

  const handleSaveBudget = async () => {
    if (!budgetAmount.trim() || !selectedCategory || !startDate || !endDate) {
      Alert.alert(
        "Error",
        "Please fill in all required fields (Amount, Category, Start Date, End Date)."
      );
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(
        "Error",
        "Please enter a valid positive number for your budget."
      );
      return;
    }

    if (startDate > endDate) {
      Alert.alert("Error", "Start date cannot be after end date.");
      return;
    }

    setLoading(true);
    try {
      let budgetId;
      if (isExistingBudget && initialBudgetData?.$id) {
        // Update existing budget
        budgetId = initialBudgetData.$id;
        await updateBudget(
          budgetId,
          amount,
          startDate.toISOString(),
          endDate.toISOString(),
          selectedCategory,
          selectedSubcategory
        );
        Alert.alert("Success", "Budget updated successfully.");
      } else {
        // Create new budget
        const newBudget = await createBudget(
          user.$id,
          selectedCategory,
          amount,
          startDate.toISOString(),
          endDate.toISOString(),
          selectedSubcategory
        );
        budgetId = newBudget.$id;
        Alert.alert("Success", "Budget created successfully.");
      }
      setHasBudget(true); // Update global state

      // Create notification
      await createNotification({
        user_id: user.$id,
        title: isExistingBudget ? "Budget Updated" : "Budget Created",
        message: isExistingBudget
          ? "Your budget has been updated successfully."
          : "Your budget has been created successfully.",
        budget_id: budgetId,
      });

      // Update the unread notification count
      const updatedUnreadCount = await countUnreadNotifications(user.$id);
      updateUnreadCount(updatedUnreadCount);

      onSaveSuccess(); // Trigger refresh in parent
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving budget:", error);
      Alert.alert("Error", "Failed to save budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (day, dateType) => {
    const selectedDate = new Date(day.timestamp);
    if (dateType === "start") {
      setStartDate(selectedDate);
    } else {
      setEndDate(selectedDate);
    }
  };

  if (!isVisible) {
    return null; // Don't render if not visible
  }

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
          className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md max-h-[90%]"
          onStartShouldSetResponder={() => true}
        >
          <Text className="text-3xl font-plight text-[#9F54B6] mb-6 text-center">
            {isExistingBudget ? "Update Your Budget" : "Set Up Your Budget"}
          </Text>

          {loading && (
            <View className="absolute inset-0 bg-white/70 justify-center items-center z-20 rounded-lg">
              <ActivityIndicator size="large" color="#9F54B6" />
              <Text className="mt-2 text-gray-700">Loading...</Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            <FormField
              placeholder="Enter your budget amount"
              value={budgetAmount}
              handleChangeText={setBudgetAmount}
              keyboardType="numeric"
              className="mb-4"
              title="Budget Amount"
            />

            <View className="mb-4">
              <Text className="text-base text-gray-800 font-psemibold mb-1">
                Category
              </Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                data={categories.map((cat) => ({
                  label: cat.name,
                  value: cat.$id,
                }))}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Category"
                searchPlaceholder="Search..."
                value={selectedCategory}
                onChange={(item) => {
                  setSelectedCategory(item.value);
                  setSelectedSubcategory(null); // Reset subcategory when category changes
                }}
              />
            </View>

            <View className="mb-4">
              <Text className="text-base text-gray-800 font-psemibold mb-1">
                Subcategory
              </Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                data={subcategories.map((sub) => ({
                  label: sub.name,
                  value: sub.$id,
                }))}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={
                  subcategories.length === 0
                    ? "No Subcategories"
                    : "Select Subcategory"
                }
                searchPlaceholder="Search..."
                value={selectedSubcategory}
                onChange={(item) => setSelectedSubcategory(item.value)}
                disabled={subcategories.length === 0}
              />
            </View>

            <View className="mb-4">
              <Text className="text-base text-gray-800 font-psemibold mb-1">
                Start Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                className="w-full border-2 border-blue-400 rounded-xl p-4"
              >
                <Text className="text-xl text-gray-800">
                  {startDate ? format(startDate, "PPP") : "Select Start Date"}
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
                    style={styles.calendarOverlay}
                    onPress={() => setShowStartDatePicker(false)} // Close when tapping outside
                  >
                    <View
                      style={styles.calendarContainer}
                      onStartShouldSetResponder={() => true}
                    >
                      <Calendar
                        style={styles.calendar}
                        onDayPress={(day) => {
                          handleDateSelect(day, "start");
                          setShowStartDatePicker(false);
                        }}
                        // minDate={new Date()} // Uncomment if you want to restrict past dates
                        markedDates={
                          startDate
                            ? {
                                [format(startDate, "yyyy-MM-dd")]: {
                                  selected: true,
                                  marked: true,
                                  selectedColor: "#9F54B6",
                                },
                              }
                            : {}
                        }
                      />
                      <TouchableOpacity
                        onPress={() => setShowStartDatePicker(false)}
                        className="mt-4 px-4 py-2 bg-gray-200 rounded-md"
                      >
                        <Text className="text-gray-700">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                </Modal>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-base text-gray-800 font-psemibold mb-1">
                End Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                className="w-full border-2 border-blue-400 rounded-xl p-4"
              >
                <Text className="text-xl text-gray-800">
                  {endDate ? format(endDate, "PPP") : "Select End Date"}
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
                    style={styles.calendarOverlay}
                    onPress={() => setShowEndDatePicker(false)} // Close when tapping outside
                  >
                    <View
                      style={styles.calendarContainer}
                      onStartShouldSetResponder={() => true}
                    >
                      <Calendar
                        style={styles.calendar}
                        onDayPress={(day) => {
                          handleDateSelect(day, "end");
                          setShowEndDatePicker(false);
                        }}
                        minDate={startDate || new Date()} // End date cannot be before start date
                        markedDates={
                          endDate
                            ? {
                                [format(endDate, "yyyy-MM-dd")]: {
                                  selected: true,
                                  marked: true,
                                  selectedColor: "#9F54B6",
                                },
                              }
                            : {}
                        }
                      />
                      <TouchableOpacity
                        onPress={() => setShowEndDatePicker(false)}
                        className="mt-4 px-4 py-2 bg-gray-200 rounded-md"
                      >
                        <Text className="text-gray-700">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                </Modal>
              )}
            </View>

            <CustomButton
              handlePress={handleSaveBudget}
              title={loading ? "Saving..." : "Save Budget"}
              disabled={loading}
              className="mt-4 bg-blue-500 py-3 rounded-xl"
              textStyles="font-psemibold text-lg text-white text-center"
            />
            <TouchableOpacity
              onPress={onClose}
              className="mt-4 text-center px-4 py-2 rounded-xl border border-gray-300 bg-gray-100"
              disabled={loading}
            >
              <Text className="text-center text-base font-pmedium text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#9F54B6",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#7b7b8b",
  },
  selectedTextStyle: {
    fontSize: 18,
    color: "#000",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  calendar: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    elevation: 2,
    width: "90%", // Adjust width for responsiveness
    maxWidth: 400, // Max width for larger screens
  },
  calendarOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default BudgetSetupModal;
