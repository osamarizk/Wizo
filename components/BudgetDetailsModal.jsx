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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../context/GlobalProvider"; // Adjust path as needed
import {
  fetchBudget,
  getAllCategories,
  getSubcategoriesById,
} from "../lib/appwrite"; // Adjust path as needed
import CustomButton from "../components/CustomButton"; // Adjust path as needed
import GradientBackground from "../components/GradientBackground"; // Adjust path as needed

// BudgetDetailsModal component now accepts props for visibility, closing, and the budget ID
const BudgetDetailsModal = ({ isVisible, onClose, budgetId, onUpdate }) => {
  const { user } = useGlobalContext();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!budgetId || !user) {
        setLoading(false);
        setError("No budget ID or user available.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch the specific budget details using budgetId
        const fetchedBudget = await fetchBudget(budgetId);
        if (fetchedBudget) {
          setBudget(fetchedBudget);

          const fetchedCategories = await getAllCategories();
          setCategories(fetchedCategories);

          if (fetchedBudget.subcategoryId) {
            const fetchedSubcategories = await getSubcategoriesById(
              fetchedBudget.subcategoryId
            );
            setSubcategories(fetchedSubcategories);
          }
        } else {
          setError("Budget not found.");
        }
      } catch (err) {
        console.error("Error fetching budget details in modal:", err);
        setError(err.message || "Failed to fetch budget details.");
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      // Only fetch data when modal is visible
      fetchBudgetData();
    } else {
      // Reset state when modal is hidden
      setBudget(null);
      setLoading(true);
      setError(null);
      setCategories([]);
      setSubcategories([]);
    }
  }, [isVisible, budgetId, user]); // Re-fetch if visibility, budgetId, or user changes

  // Helper to get category name
  const getCategoryName = (categoryId) => {
    return categories.find((cat) => cat.$id === categoryId)?.name || "N/A";
  };

  // Helper to get subcategory name
  const getSubcategoryName = (subcategoryId) => {
    // Find subcategory in the array (assuming getSubcategoriesById returns an array)
    if (Array.isArray(subcategories) && subcategories.length > 0) {
      return (
        subcategories.find((sub) => sub.$id === subcategoryId)?.name || "N/A"
      );
    }
    return "N/A";
  };

  const handleUpdateBudget = () => {
    // Trigger the update process, passing the current budget data
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
          className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md max-h-[80%]"
          onStartShouldSetResponder={() => true}
        >
          <Text className="text-2xl font-pbold text-gray-800 mb-6 text-center">
            Budget Details
          </Text>

          {loading ? (
            <View className="flex-1 justify-center items-center h-48">
              <ActivityIndicator size="large" color="#9F54B6" />
              <Text className="text-lg text-gray-700 mt-4">
                Loading details...
              </Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center p-4 h-48">
              <Text className="text-red-500 text-lg text-center">{error}</Text>
            </View>
          ) : budget ? (
            <ScrollView className="space-y-4">
              <View>
                <Text className="text-lg font-semibold text-gray-700">
                  Budget Amount:
                </Text>
                <Text className="text-xl text-gray-900">
                  ${parseFloat(budget.budgetAmount).toFixed(2)}
                </Text>
              </View>

              <View>
                <Text className="text-lg font-psemibold text-gray-700">
                  Category:
                </Text>
                <Text className="text-xl text-gray-700">
                  {getCategoryName(budget.categoryId)}
                </Text>
              </View>

              <View>
                <Text className="text-lg font-psemibold text-gray-700">
                  Subcategory:
                </Text>
                <Text className="text-xl text-gray-700">
                  {getSubcategoryName(budget.subcategoryId)}
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
            </ScrollView>
          ) : (
            <View className="flex-1 justify-center items-center h-48">
              <Text className="text-lg text-gray-700">
                No budget data available.
              </Text>
            </View>
          )}

          <CustomButton
            handlePress={handleUpdateBudget}
            className="mt-6 bg-blue-500 text-white py-3 rounded-xl"
            title={"Update Budget"}
            textStyles="font-psemibold text-lg text-center"
            disabled={loading || !budget}
          />
          <TouchableOpacity
            onPress={onClose}
            className="mt-4 px-4 py-2 rounded-xl border border-gray-300 bg-gray-100"
          >
            <Text className="text-center text-base font-pmedium text-gray-700">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default BudgetDetailsModal;
