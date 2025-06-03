// components/UserBudgets.jsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Collapsible from "react-native-collapsible";
import icons from "../constants/icons"; // Adjust path as needed

// Props:
// userBudget: Array of budget objects
// isExpanded: Boolean state for collapsible
// toggleExpanded: Function to toggle isExpanded
// ViewBudget: Function to navigate/view specific budget details
// getCategoryName: Helper function to get category name by ID (now operates on the 'categories' prop)
// SetupBudget: Function to navigate to add new budget screen
// categories: Array of all categories (passed from home.jsx)
const UserBudgets = ({
  userBudget,
  isExpanded,
  toggleExpanded,
  ViewBudget,
  getCategoryName,
  SetupBudget,
  categories,
}) => {
  return (
    <View className="flex p-4 mb-4 rounded-xl border-2 border-[#9F54B6]">
      <Text className="text-lg font-psemibold text-black mb-2">My Budgets</Text>
      <View className="w-full max-w-md justify-center items-center">
        <TouchableOpacity
          onPress={toggleExpanded}
          className="w-full flex flex-row items-center justify-between"
        >
          <Text className="text-center text-base font-pregular text-black mb-4 underline">
            👇 Expand to Check My Budgets ... 👇
          </Text>
          {/* Icons for expand/collapse (uncomment if using) */}
          {/* {isExpanded ? (
            <Image
              source={icons.up}
              className="w-6 h-6"
            />
          ) : (
            <Image
              source={icons.down}
              className="w-6 h-6"
            />
          )} */}
        </TouchableOpacity>
        <Collapsible collapsed={!isExpanded}>
          {isExpanded && (
            <View>
              {userBudget.map((budget) => (
                <TouchableOpacity
                  key={budget.$id}
                  onPress={() => ViewBudget(budget.$id)}
                  className="p-4 mb-4 border-2 rounded-md border-[#fff]"
                >
                  <Text className="text-[#15493a] text-center font-psemibold text-base">
                    Budget for {getCategoryName(budget.categoryId)}: EGP{" "}
                    {budget.budgetAmount.toFixed(2)}
                  </Text>
                  <Text className="text-blue-800 text-center text-sm">
                    View Details
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Collapsible>

        <TouchableOpacity
          onPress={SetupBudget}
          className="p-4 items-center justify-center"
        >
          <Image
            source={icons.pie}
            className="w-12 h-12"
            resizeMode="contain"
            tintColor="#15493a"
          />
          <Text className="text-[#15493a] font-psemibold text-base text-center">
            Add New Budget
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserBudgets;
