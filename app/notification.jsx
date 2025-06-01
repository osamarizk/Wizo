import React, { useEffect, useState } from "react";
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
} from "react-native";
import {
  fetchNotifications,
  markNotificationAsRead,
  countUnreadNotifications,
  fetchReceipt,
} from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";
import GradientBackground from "../components/GradientBackground";
import { useNavigation } from "expo-router";
import icons from "../constants/icons";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
const NotificationPage = () => {
  const { user, updateUnreadCount } = useGlobalContext();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [receiptDetails, setReceiptDetails] = useState({});
  const navigation = useNavigation();

  dayjs.extend(relativeTime);
  const [timeUpdate, setTimeUpdate] = useState(Date.now());

  const fetchUserNotifications = async () => {
    if (!user?.$id) return;
    try {
      const fetched = await fetchNotifications(user.$id);
      setNotifications(fetched);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchUserNotifications();
    const interval = setInterval(() => {
      setTimeUpdate(Date.now()); // Trigger re-render every 30s
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notificationId, receiptId) => {
    const isExpanded = expandedId === notificationId;
    setExpandedId(isExpanded ? null : notificationId);

    if (!isExpanded && receiptId && !receiptDetails[receiptId]) {
      const receipt = await fetchReceipt(receiptId);
      if (receipt) {
        setReceiptDetails((prev) => ({ ...prev, [receiptId]: receipt }));
      }
    }

    try {
      await markNotificationAsRead(notificationId);
      const newCount = await countUnreadNotifications(user.$id);
      updateUnreadCount(newCount);
      setNotifications((prev) =>
        prev.map((n) => (n.$id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error updating notification:", err);
    }
  };

  const renderNotificationItem = ({ item }) => {
    const isExpanded = item.$id === expandedId;
    const receipt = item.receipt_id ? receiptDetails[item.receipt_id] : null;

    return (
      <SafeAreaView className="flex-1">
        <TouchableOpacity
          onPress={() => handleNotificationPress(item.$id, item.receipt_id)}
          className="p-4 border-b border-gray-300 bg-onboarding flex-row justify-between font-pregular text-base"
        >
          <View className="flex-1 ">
            <View className="flex-row items-center ">
              {!item.read && (
                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
              )}
              <Text
                className={`font-pbold text-base ${
                  item.read ? "text-gray-500" : "text-black"
                }`}
              >
                {item.title}
              </Text>
              <View className="flex-1 justify-end items-end">
                <Text className="text-xs text-gray-400 mt-1 ">
                  {dayjs(item.$createdAt).fromNow()}
                </Text>
              </View>
            </View>
            <Text
              className={`text-base mt-1 ${
                item.read ? "text-gray-400" : "text-black"
              }`}
            >
              {item.message}
            </Text>
            {item.receipt_id && !isExpanded && (
              <Text className="text-xs text-blue-500 mt-1">
                Tap to view receipt details ↗️
              </Text>
            )}

            {isExpanded && (
              <View className="mt-2 bg-slate-300 p-2 rounded-lg">
                <Text className="text-base text-black">
                  Created: {new Date(item.$createdAt).toLocaleString()}
                </Text>
                {receipt ? (
                  <>
                    <Text className="text-base font-pregular text-gray-800">
                      🧾 Merchant: {receipt.merchant}
                    </Text>
                    <Text className="text-base font-pregular text-gray-800">
                      💵 Total Amount: {receipt.total}
                    </Text>
                    <Text className="text-base font-pregular text-gray-800">
                      📅 Date: {receipt.datetime}
                    </Text>
                  </>
                ) : (
                  item.receipt_id && (
                    <View className="mt-1">
                      <ActivityIndicator size="small" color="#999" />
                      <Text className="text-xs text-gray-500 italic mt-1">
                        Loading receipt details...
                      </Text>
                    </View>
                  )
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1 ">
        {/* Notification Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <Text className="text-2xl font-pbold">Notifications</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={icons.close}
              resizeMode="contain"
              className="w-6 h-6 "
            />
          </TouchableOpacity>
        </View>
        {notifications.length === 0 && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">No notifications found.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.$id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </SafeAreaView>
    </GradientBackground>
  );
};

export default NotificationPage;
