import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
  Image,
  Pressable,
  RefreshControl, // <--- ADDED THIS IMPORT for RefreshControl
} from "react-native";
import {
  fetchNotifications,
  markNotificationAsRead,
  countUnreadNotifications,
  fetchReceipt,
  fetchBudget, // <--- Correctly import YOUR fetchBudget function
} from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";
import GradientBackground from "../components/GradientBackground";
import { useNavigation, useFocusEffect } from "expo-router";
import icons from "../constants/icons";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { format } from "date-fns"; // <--- ADDED THIS IMPORT for date formatting

// Enable LayoutAnimation for smooth transitions on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NotificationPage = () => {
  const { user, updateUnreadCount } = useGlobalContext();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [receiptDetails, setReceiptDetails] = useState({});
  const [budgetDetails, setBudgetDetails] = useState({});
  const navigation = useNavigation();

  dayjs.extend(relativeTime);
  const [timeUpdate, setTimeUpdate] = useState(Date.now()); // For relative time updates

  const fetchUserNotifications = useCallback(async () => {
    if (!user?.$id) {
      console.log("NotificationPage: No user ID, skipping notification fetch.");
      setNotifications([]);
      return;
    }
    setRefreshing(true);
    try {
      console.log(
        "NotificationPage: Fetching notifications for user:",
        user.$id
      );
      // fetchNotifications now returns just the documents array from lib/appwrite.js
      const fetched = await fetchNotifications(user.$id);

      // Client-side filtering for expired notifications
      const nonExpiredNotifications = fetched.filter(
        (n) => !n.expiresAt || new Date(n.expiresAt) > new Date()
      );

      setNotifications(nonExpiredNotifications);
      console.log("NotificationPage: Notifications fetched successfully.");
    } catch (err) {
      console.error("NotificationPage: Error fetching notifications:", err);
    } finally {
      setRefreshing(false);
    }
  }, [user?.$id]);

  useFocusEffect(
    useCallback(() => {
      console.log("NotificationPage: useFocusEffect triggered.");
      fetchUserNotifications();

      const updateCount = async () => {
        if (user?.$id) {
          const newCount = await countUnreadNotifications(user.$id);
          updateUnreadCount(newCount);
        }
      };
      updateCount();

      const interval = setInterval(() => {
        setTimeUpdate(Date.now());
      }, 60000);

      return () => {
        console.log("NotificationPage: useFocusEffect cleanup.");
        clearInterval(interval);
        setExpandedId(null);
        setReceiptDetails({}); // Clear cached details on blur
        setBudgetDetails({}); // Clear cached details on blur
      };
    }, [user?.$id, fetchUserNotifications, updateUnreadCount])
  );

  const handleRefresh = useCallback(async () => {
    await fetchUserNotifications();
  }, [fetchUserNotifications]);

  const handleNotificationPress = useCallback(
    async (notificationId, associatedReceiptId, associatedBudgetId) => {
      LayoutAnimation.easeInEaseOut();
      const wasExpanded = expandedId === notificationId;
      setExpandedId(wasExpanded ? null : notificationId);

      if (!wasExpanded) {
        if (associatedReceiptId && !receiptDetails[associatedReceiptId]) {
          try {
            const receipt = await fetchReceipt(associatedReceiptId);
            if (receipt) {
              setReceiptDetails((prev) => ({
                ...prev,
                [associatedReceiptId]: receipt,
              }));
            } else {
              console.warn("Receipt not found for ID:", associatedReceiptId);
            }
          } catch (err) {
            console.error("Error fetching receipt details:", err);
          }
        }

        if (associatedBudgetId && !budgetDetails[associatedBudgetId]) {
          try {
            const budget = await fetchBudget(associatedBudgetId);
            if (budget) {
              setBudgetDetails((prev) => ({
                ...prev,
                [associatedBudgetId]: budget,
              }));
            } else {
              console.warn("Budget not found for ID:", associatedBudgetId);
            }
          } catch (err) {
            console.error("Error fetching budget details:", err);
          }
        }
      }

      const notificationToMark = notifications.find(
        (n) => n.$id === notificationId
      );
      if (notificationToMark && !notificationToMark.read) {
        try {
          await markNotificationAsRead(notificationId);
          setNotifications((prev) =>
            prev.map((n) =>
              n.$id === notificationId ? { ...n, read: true } : n
            )
          );
          if (user?.$id) {
            const newCount = await countUnreadNotifications(user.$id);
            updateUnreadCount(newCount);
          }
        } catch (err) {
          console.error("Error marking notification as read:", err);
        }
      }
    },
    [
      expandedId,
      notifications,
      receiptDetails,
      budgetDetails,
      user?.$id,
      updateUnreadCount,
    ]
  );

  const renderNotificationItem = useCallback(
    ({ item }) => {
      const isExpanded = item.$id === expandedId;
      const receipt = item.receipt_id ? receiptDetails[item.receipt_id] : null;
      const budget = item.budget_id ? budgetDetails[item.budget_id] : null;

      const hasAssociatedDetails = item.receipt_id || item.budget_id;

      return (
        <View className="bg-onboarding mx-4 mb-2 rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <TouchableOpacity
            onPress={() =>
              handleNotificationPress(item.$id, item.receipt_id, item.budget_id)
            }
            activeOpacity={0.7}
            className="p-4 flex-row items-start justify-between"
          >
            <View className="flex-1 pr-3">
              <View className="flex-row items-center mb-1">
                {!item.read && (
                  <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                )}
                <Text
                  className={`font-pbold text-base flex-1 ${
                    item.read ? "text-gray-500" : "text-black"
                  }`}
                  numberOfLines={isExpanded ? 0 : 1}
                >
                  {item.title}
                </Text>
                <Text className="text-xs text-gray-400 ml-2">
                  {dayjs(item.$createdAt).fromNow()}
                </Text>
              </View>
              <Text
                className={`text-sm mt-1 ${
                  item.read ? "text-gray-400" : "text-gray-700"
                }`}
                numberOfLines={isExpanded ? 0 : 2}
              >
                {item.message}
              </Text>

              {hasAssociatedDetails && !isExpanded && (
                <Text className="text-xs text-blue-500 mt-2 font-pmedium">
                  Tap to view details ↗️
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View className="bg-gray-100 p-4 pt-0 border-t border-gray-200">
              <Text className="text-xs text-gray-500 mb-2">
                Received:{" "}
                {format(new Date(item.$createdAt), "MMM dd,yyyy HH:mm")}
              </Text>

              {item.receipt_id && (
                <View className="mb-2">
                  <Text className="font-psemibold text-sm text-black mb-1">
                    Receipt Details:
                  </Text>
                  {receipt ? (
                    <View>
                      <Text className="text-sm text-gray-800">
                        🧾 Merchant: {receipt.merchant || "N/A"}
                      </Text>
                      <Text className="text-sm text-gray-800">
                        💵 Total: {parseFloat(receipt.total || 0).toFixed(2)}
                      </Text>
                      <Text className="text-sm text-gray-800">
                        📅 Date:{" "}
                        {format(new Date(receipt.datetime), "MMM dd,yyyy")}
                      </Text>
                      {receipt.payment_method && (
                        <Text className="text-sm text-gray-800">
                          💳 Payment: {receipt.payment_method}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#999" />
                      <Text className="text-xs text-gray-500 italic ml-2">
                        Loading receipt...
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {item.budget_id && (
                <View className="mb-2">
                  <Text className="font-psemibold text-sm text-black mb-1">
                    Budget Details:
                  </Text>
                  {budget ? (
                    <View>
                      <Text className="text-sm text-gray-800">
                        📊 Name: {budget.name || "N/A"}
                      </Text>
                      <Text className="text-sm text-gray-800">
                        🎯 Amount: $
                        {parseFloat(budget.budgetAmount || 0).toFixed(2)}
                      </Text>
                      <Text className="text-sm text-gray-800">
                        🏷️ Category ID: {budget.categoryId || "N/A"}
                      </Text>{" "}
                      {/* Assuming 'name' might not be in budget */}
                      <Text className="text-sm text-gray-800">
                        ➡️ Starts:{" "}
                        {format(new Date(budget.startDate), "MMM dd,yyyy")}
                      </Text>
                      <Text className="text-sm text-gray-800">
                        🔚 Ends:{" "}
                        {format(new Date(budget.endDate), "MMM dd,yyyy")}
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#999" />
                      <Text className="text-xs text-gray-500 italic ml-2">
                        Loading budget...
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* If there's a 'type' field, you could show different info based on it */}
              {item.type &&
              item.type !== "system" &&
              (item.type === "wallet" || item.type === "budget_alert") &&
              !item.receipt_id &&
              !item.budget_id ? (
                <Text className="text-xs text-gray-600 mt-2">
                  Type: {item.type}
                </Text>
              ) : null}
            </View>
          )}
        </View>
      );
    },
    [
      expandedId,
      receiptDetails,
      budgetDetails,
      handleNotificationPress,
      timeUpdate,
    ]
  );

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        {/* Notification Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <Text className="text-2xl font-pbold text-black">Notifications</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Image
              source={icons.close}
              resizeMode="contain"
              className="w-6 h-6 "
              tintColor="#333"
            />
          </TouchableOpacity>
        </View>

        {notifications.length === 0 && !refreshing ? (
          <View className="flex-1 justify-center items-center bg-gray-50">
            <Text className="text-gray-500 text-lg font-pmedium">
              No notifications found.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.$id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#9F54B6"
              />
            }
            contentContainerStyle={{ paddingVertical: 10 }}
            ListEmptyComponent={
              !refreshing && (
                <View className="flex-1 justify-center items-center h-40">
                  <Text className="text-gray-500 italic text-base">
                    No notifications yet.
                  </Text>
                </View>
              )
            }
          />
        )}
        {refreshing && notifications.length > 0 && (
          <View className="absolute bottom-0 w-full items-center p-4 bg-transparent">
            <ActivityIndicator size="small" color="#9F54B6" />
          </View>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
};

export default NotificationPage;
