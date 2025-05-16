import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GradientBackground from "../components/GradientBackground";
import FormField from "../components/FormField";
import CustomButton from "../components/CustomButton";
import { useGlobalContext } from "../context/GlobalProvider";
import {
  createBudget,
  getUserBudgets,
  updateBudget,
  getCategories,
  getAllCategories,
  getSubcategoriesByCategory,
  createNotification,
  countUnreadNotifications,
} from "../lib/appwrite";
import { Dropdown } from "react-native-element-dropdown";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { router } from "expo-router";

const BudgetSetup = () => {
  const { user, setHasBudget, updateUnreadCount } = useGlobalContext();
  const [budgetAmount, setBudgetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExistingBudget, setIsExistingBudget] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          // Fetch categories
          const fetchedCategories = await getAllCategories();
          setCategories(fetchedCategories);
          // console.log("Categories", categories, "User-ID", user.$id);

          // Fetch existing budget
          const budgets = await getUserBudgets(user.$id);
          if (budgets && budgets.length > 0) {
            const budget = budgets[0];
            setBudgetAmount(String(budget.budgetAmount));
            setSelectedCategory(budget.categoryId);
            setSelectedSubcategory(budget.subcategoryId || null);
            console.log("budget.subcategoryId",budget.subcategoryId,selectedSubcategory)
            setStartDate(
              budget.startDate ? new Date(budget.startDate) : undefined
            );
            setEndDate(budget.endDate ? new Date(budget.endDate) : undefined);
            setIsExistingBudget(true);

            if (budget.categoryId) {
              const fetchedSubcategories = await getSubcategoriesByCategory(
                budget.categoryId
              );
              setSubcategories(fetchedSubcategories);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          Alert.alert("Error", "Failed to load data. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  // Fetch subcategories when the selected category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategory) {
        setLoading(true);
        try {
          const fetchedSubcategories = await getSubcategoriesByCategory(
            selectedCategory
          );
          setSubcategories(fetchedSubcategories);
          setSelectedSubcategory(null);
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
    fetchSubcategories();
  }, [selectedCategory]);
  const handleSaveBudget = async () => {
    console.log("handleSaveBudget called"); // Add this

    if (!budgetAmount.trim() || !selectedCategory || !startDate || !endDate) {
      Alert.alert("Error", "Please fill in all required fields.");
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
      const budgets = await getUserBudgets(user.$id);
      if (budgets && budgets.length > 0) {
        // Update existing budget
        budgetId = budgets[0].$id;
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
        budgetId = newBudget.$id; // Get the ID from the returned budget object
        Alert.alert("Success", "Budget created successfully.");
      }
      setHasBudget(true);

      // Create notification
      await createNotification({
        // Changed from createNotificationBudget to createNotification
        user_id: user.$id,
        title: isExistingBudget ? "Budget Updated" : "Budget Created", //set title
        message: isExistingBudget
          ? "Your budget has been updated successfully."
          : "Your budget has been created successfully.",
        budget_id: budgetId, // Use budgetId here
      });

      // Update the unread notification count
      const updatedUnreadCount = await countUnreadNotifications(user.$id);
      updateUnreadCount(updatedUnreadCount);

      router.push("/home");
    } catch (error) {
      console.error("Error saving budget:", error);
      Alert.alert("Error", "Failed to save budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle date selection
  const handleDateSelect = (day, dateType) => {
    const selectedDate = new Date(day.timestamp);
    if (dateType === "start") {
      setStartDate(selectedDate);
    } else {
      setEndDate(selectedDate);
    }
  };

  return (
    <GradientBackground className="flex-1 items-center justify-center p-6">
      <SafeAreaView className="w-full max-w-md">
        <ScrollView>
          <Text className="text-3xl font-plight text-[#9F54B6] mb-6 text-center">
            {isExistingBudget ? "Update Your Budget" : "Set Up Your Budget"}
          </Text>

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
              onChange={(item) => setSelectedCategory(item.value)}
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
              <Text className="text-xl">
                {startDate ? format(startDate, "PPP") : "Select Start Date"}
              </Text>
            </TouchableOpacity>

            {/* Calendar for Start Date */}
            {showStartDatePicker && (
              <Modal
                visible={showStartDatePicker}
                transparent={true} // Make the background transparent
                animationType="slide" // Choose an animation style
                onRequestClose={() => setShowStartDatePicker(false)} // Handle back button on Android
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                >
                  <Calendar
                    style={styles.calendar}
                    onDayPress={(day) => {
                      handleDateSelect(day, "start");
                      setShowStartDatePicker(false);
                    }}
                    minDate={new Date()}
                  />
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(false)}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded-md"
                  >
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
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
              <Text className="text-xl">
                {endDate ? format(endDate, "PPP") : "Select End Date"}
              </Text>
            </TouchableOpacity>

            {/* Calendar for End Date */}
            {showEndDatePicker && (
              <Modal
                visible={showEndDatePicker}
                transparent={true} // Make the background transparent
                animationType="slide"
                onRequestClose={() => setShowEndDatePicker(false)}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                >
                  <Calendar
                    style={styles.calendar}
                    onDayPress={(day) => {
                      handleDateSelect(day, "end");
                      setShowEndDatePicker(false);
                    }}
                    minDate={startDate || new Date()}
                  />
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(false)}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded-md"
                  >
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            )}
          </View>

          <CustomButton
            handlePress={handleSaveBudget}
            title={loading ? "Saving..." : "Save Budget"}
            disabled={loading}
            className="mt-4"
          />
          <TouchableOpacity
            onPress={() => router.push("/home")}
            className="mt-4 text-center"
            disabled={loading}
          >
            <Text className="text-white underline">Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
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
  },
});

export default BudgetSetup;
