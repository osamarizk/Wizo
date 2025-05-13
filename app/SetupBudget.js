import React, { useState, useEffect } from "react";
import { ScrollView, View, Text } from "react-native";
import { useGlobalContext } from "../context/GlobalProvider";
import {
  createBudget,
  getBudget,
  updateBudget,
  getAllBudgets,
} from "../lib/appwrite";
import { useNavigation } from "@react-navigation/native";
import FormField from "../components/FormField"; // Import your FormField component
import CustomButton from "../components/CustomButton"; // Import your CustomButton component

const SetupBudget = () => {
  const { user } = useGlobalContext();
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({}); // { [categoryId]: amount }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch categories from Appwrite
        const fetchedCategories = await databases.listDocuments(
          config.databaseId,
          config.categoryCollectionId
        );
        setCategories(fetchedCategories.documents);

        if (user) {
          // Fetch existing budgets for the user
          const existingBudgets = await getAllBudgets(user.$id);
          const budgetMap = {};
          existingBudgets.forEach((budget) => {
            budgetMap[budget.categoryId] = budget.amount;
          });
          setBudgets(budgetMap);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch initial data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  const handleAmountChange = (categoryId, amount) => {
    setBudgets((prevBudgets) => ({
      ...prevBudgets,
      [categoryId]: amount,
    }));
  };

  const handleSaveBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        throw new Error("User not logged in.");
      }

      // Iterate through the budgets and create/update them
      for (const categoryId of Object.keys(budgets)) {
        const amount = budgets[categoryId];
        const existingBudget = await getBudget(user.$id, categoryId);

        if (existingBudget) {
          // Update existing budget
          await updateBudget(existingBudget.$id, amount);
        } else {
          // Create new budget
          await createBudget(user.$id, categoryId, amount);
        }
      }
      navigation.goBack(); // Navigate back after saving
      console.log("Budgets saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save budgets.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading Budget Setup...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">Error: {error}</Text>
        {/* You might want a retry button here */}
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Set Up Your Budget</Text>
      <Text className="text-md mb-4">Enter your budget for each category.</Text>

      {categories.map((category) => (
        <View key={category.$id} className="mb-6">
          <Text className="text-lg font-semibold mb-2">{category.name}</Text>
          <FormField
            type="number"
            value={budgets[category.$id] || ""}
            handleChangeText={(text) =>
              handleAmountChange(category.$id, parseFloat(text))
            }
            placeholder="Amount"
            otherStyles="w-full"
          />
        </View>
      ))}

      <CustomButton
        title="Save Budgets"
        handlePress={handleSaveBudgets}
        isLoading={loading}
        containerStyle="w-full"
      />
    </ScrollView>
  );
};

export default SetupBudget;
