import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GradientBackground from "../components/GradientBackground"; // Assuming this is in the correct relative path
import FormField from "../components/FormField"; // Assuming this is in the correct relative path
import CustomButton from "../components/CustomButton"; // Assuming this is in the correct relative path
import { useGlobalContext } from "../context/GlobalProvider"; // Adjust the path if needed
import { createBudget, getUserBudgets, updateBudget } from "../lib/appwrite"; // Adjust the path if needed

const SetupBudgetScreen = ({ navigation }) => {
  // Destructure navigation
  const { user, setHasBudget } = useGlobalContext(); // Destructure setHasBudget
  const [budgetAmount, setBudgetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExistingBudget, setIsExistingBudget] = useState(false); // Track if budget exists

  useEffect(() => {
    const fetchBudget = async () => {
      if (user) {
        setLoading(true);
        try {
          const budget = await getUserBudgets(user.$id);
          console.log("Budget is",budget ,isExistingBudget)
          if (budget) {
            setBudgetAmount(String(budget.budgetAmount)); // Convert to string for TextInput
            setIsExistingBudget(true);
          }
        } catch (error) {
          console.error("Error fetching budget:", error);
          // Handle error:  Show message to user, or redirect
          if (error.message === "Budget does not exist") {
            setIsExistingBudget(false); // Set to false, explicitly
            setBudgetAmount("");
          }
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBudget();
  }, [user]);

  const handleSaveBudget = async () => {
    if (!budgetAmount.trim()) {
      Alert.alert("Error", "Please enter a budget amount.");
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

    setLoading(true);
    try {
      if (isExistingBudget) {
        // Update existing budget
        await updateBudget(user.$id, amount);
        Alert.alert("Success", "Budget updated successfully.");
      } else {
        // Create new budget
        await createBudget(user.$id, amount);
        Alert.alert("Success", "Budget created successfully.");
      }

      setHasBudget(true); // Update global state
      navigation.goBack(); // Go back
    } catch (error) {
      console.error("Error saving budget:", error);
      Alert.alert("Error", "Failed to save budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground className="flex-1 items-center justify-center p-4">
      <SafeAreaView className="w-full max-w-md">
        <Text className="text-2xl font-bold text-white mb-6 text-center">
          {isExistingBudget ? "Update Your Budget" : "Set Up Your Budget"}
        </Text>

        <FormField
          placeholder="Enter your budget amount"
          value={budgetAmount}
          onChangeText={setBudgetAmount}
          keyboardType="numeric"
          className="mb-4"
        />

        <CustomButton
          onPress={handleSaveBudget}
          title={loading ? "Saving..." : "Save Budget"}
          disabled={loading}
          className="mt-4"
        />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 text-center"
          disabled={loading}
        >
          <Text className="text-white underline">Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default SetupBudgetScreen;
