import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../context/GlobalProvider";
import {
  getUserBudgets,
  getCategories,
  getSubcategoriesByCategory,
  getAllCategories,
  getSubcategoriesById,
} from "../lib/appwrite";

import { router, useLocalSearchParams } from "expo-router";
import CustomButton from "../components/CustomButton";
import GradientBackground from "../components/GradientBackground";

const BudgetDetails = () => {
  const { user } = useGlobalContext();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const fetchBudgetData = async () => {
      if (user) {
        setLoading(true);
        setError(null);
        try {
          const budgets = await getUserBudgets(user.$id);
          if (budgets && budgets.length > 0) {
            // Assuming only one budget per user
            const budgetData = budgets[0];
            setBudget(budgetData);

            // console.log("budgetData", budgetData);
            const fetchedCategories = await getAllCategories();
            // console.log("Categories:", fetchedCategories);
            setCategories(fetchedCategories);

            if (budgetData.subcategoryId) {
              const fetchedSubcategories = await getSubcategoriesById(
                budgetData.subcategoryId
              );

              // console.log("budgetData.subcategoryId",budgetData.subcategoryId)
              //  console.log("budgetData.subcategoryId",budgetData.subcategoryId)
              setSubcategories(fetchedSubcategories);
            }
          } else {
            setError("No budget found. Please create a budget.");
          }
        } catch (err) {
          setError(err.message || "Failed to fetch budget details.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBudgetData();
  }, [user]);

  const handleUpdateBudget = () => {
    router.push({
      pathname: "/budget-set",
      params: {
        budgetId: budget?.$id,
        budgetAmount: budget?.budgetAmount,
        selectedCategory: budget?.categoryid,
        selectedSubcategory: budget?.subcategoryid,
        startDate: budget?.startDate,
        endDate: budget?.endDate,
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading budget details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-lg text-center">{error}</Text>
        {error === "No budget found. Please create a budget." && (
          <TouchableOpacity
            onPress={() => router.push("/budgetSetup")}
            className="mt-4"
          >
            <Text className="text-blue-500 underline">
              Set up your budget now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!budget) {
    return null;
  }

  return (
    <GradientBackground>
      <SafeAreaView className="w-full max-w-md mx-auto">
        <Text className="text-2xl font-pbold text-gray-800 mb-6 text-center">
          Your Budget Details
        </Text>

        <ScrollView className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <View>
            <Text className="text-lg font-semibold text-gray-700">
              Budget Amount:
            </Text>
            <Text className="text-xl text-gray-900">
              ${budget.budgetAmount.toFixed(2)}
            </Text>
          </View>

          <View>
            <Text className="text-lg font-psemibold text-gray-700">
              Category:
            </Text>
            <Text className="text-xl text-gray-700">
              {categories.find((cat) => cat.$id === budget.categoryId)?.name ||
                "N/A"}
            </Text>
          </View>

          <View>
            <Text className="text-lg font-psemibold text-gray-700">
              Subcategory:
            </Text>
            <Text className="text-xl text-gray-700">
              {subcategories.find((sub) => sub.$id === budget.subcategoryId)
                ?.name || "N/A"}
            </Text>
          </View>

          <View>
            <Text className="text-lg font-semibold text-gray-700">
              Start Date:
            </Text>
            <Text className="text-xl text-gray-900">
              {new Date(budget.startDate).toLocaleDateString()}
            </Text>
          </View>

          <View>
            <Text className="text-lg font-semibold text-gray-700">
              End Date:
            </Text>
            <Text className="text-xl text-gray-900">
              {new Date(budget.endDate).toLocaleDateString()}
            </Text>
          </View>

          <CustomButton
            handlePress={handleUpdateBudget}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            title={"Update Budget"}
            disabled={loading}
            // className="mt-4"
          />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default BudgetDetails;
