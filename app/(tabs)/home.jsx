import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import GradientBackground from "../../components/GradientBackground";
import { useGlobalContext } from "../../context/GlobalProvider";
import icons from "../../constants/icons";
import {
  countUnreadNotifications,
  countUserReceipts,
  getReceiptStats,
} from "../../lib/appwrite";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import UploadModal from "../../components/UploadModal";

const Home = () => {
  const hours = new Date().getHours();
  const { user, showUploadModal, setShowUploadModal } = useGlobalContext();

  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [receiptCount, setReceiptCount] = useState(0);
  const [receiptStats, setReceiptStats] = useState({
    totalCount: 0,
    thisMonthCount: 0,
    monthlySpending: 0,
    latestDate: "N/A",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const greeting =
    hours < 12
      ? "Good Morning"
      : hours < 18
      ? "Good Afternoon"
      : "Good Evening";

  const latestReceipts = [
    { id: 1, name: "Bill.png", date: "January 15, 2023", size: "560 KB" },
    { id: 2, name: "Bill.png", date: "January 15, 2023", size: "560 KB" },
    { id: 3, name: "Bill.png", date: "January 15, 2023", size: "560 KB" },
    { id: 4, name: "Bill.png", date: "January 15, 2023", size: "560 KB" },
    { id: 5, name: "Bill.png", date: "January 15, 2023", size: "560 KB" },
  ];

  const renderReceiptItem = ({ item }) => (
    <View className="bg-onboarding flex-row items-center justify-between p-3 mb-3 rounded-xl border-2 border-secondary">
      <View className="flex-row items-center">
        <Image source={icons.gallery} className="w-8 h-8 mr-3" />
        <View>
          <Text className="text-sm font-medium">{item.name}</Text>
          <Text className="text-xs text-gray-500">
            {item.date} | {item.size}
          </Text>
        </View>
      </View>
      <TouchableOpacity>
        <Image source={icons.dots} className="w-8 h-8 mr-3" />
      </TouchableOpacity>
    </View>
  );

  const onRefresh = async () => {
    setRefreshing(true);

    if (user?.$id) {
      try {
        const [count, stats] = await Promise.all([
          countUnreadNotifications(user.$id),
          getReceiptStats(user.$id),
        ]);
        setUnreadCount(count);
        setReceiptStats(stats);
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    }

    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (user?.$id) {
          try {
            const [count, stats] = await Promise.all([
              countUnreadNotifications(user.$id),
              getReceiptStats(user.$id),
            ]);
            setUnreadCount(count);
            setReceiptStats(stats);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }
      };

      fetchData();
    }, [user])
  );

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 40,
            paddingBottom: 80,
          }}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-base text-gray-500 font-pregular">
                    {greeting}
                  </Text>
                  <Text className="text-xl font-pbold text-center">
                    {user?.username
                      ? `${user.username
                          .charAt(0)
                          .toUpperCase()}${user.username.slice(1)}`
                      : user?.email
                      ? `${user.email
                          .charAt(0)
                          .toUpperCase()}${user.email.slice(1)}`
                      : "User"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/notification")}
                  className="relative p-2 rounded-full mt-1"
                >
                  <Image source={icons.notification} className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Receipt Summary */}
              <View className="bg-onboarding p-4 rounded-xl mb-8 border-2 border-secondary">
                <Text className="text-center text-black mb-2 text-base font-pregular">
                  Total Receipts
                </Text>
                <Text className="text-center text-3xl font-pbold text-gray-800">
                  Receipts : {receiptStats.totalCount}
                </Text>
                <Text className="text-center text-base font-pregular text-black">
                  <Text className="text-center text-base font-pregular  text-[#4E17B3] mt-1 underline">
                    {"("}{receiptStats.thisMonthCount}{") "}
                  </Text>
                  R this month | Monthly Spending EGP:{" "}
                  <Text className="text-center text-base font-pregular  text-[#4E17B3] mt-1 underline">
                    {receiptStats.monthlySpending.toFixed(2)}
                  </Text>
                </Text>
                <Text className="text-center text-base font-pregular text-black mt-1">
                  Last Receipt:
                  <Text className="text-center text-base font-pregular text-[#4E17B3] mt-1 underline">
                    {" "}
                    {receiptStats.latestDate}
                  </Text>
                </Text>
              </View>
              {/* Spending Categories */}
              <View className="bg-onboarding p-4 rounded-2xl border-2 border-secondary mb-8">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-psemibold text-gray-700">
                    Total Spending
                  </Text>
                  <Text className="text-base font-pbold text-purple-600">
                    EGP 738
                  </Text>
                </View>
                <View className="flex-row justify-around">
                  {["Food", "Fuel", "Shopping", "Medical"].map((cat) => (
                    <View key={cat} className="items-center">
                      <View className="w-12 h-1 bg-orange-400 rounded-full mb-1" />
                      <Text className="text-base text-gray-600 font-pregular">
                        {cat}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Global Border Around Latest Receipts */}
              <View className="border-2 border-secondary rounded-2xl p-4 mb-4">
                <Text className="text-xl font-pbold text-black mb-4">
                  Latest Receipts
                </Text>
                {latestReceipts.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between p-3 mb-2 bg-onboarding rounded-xl"
                  >
                    <View className="flex-row items-center">
                      <Image source={icons.gallery} className="w-8 h-8 mr-3" />
                      <View>
                        <Text className="text-sm font-medium">{item.name}</Text>
                        <Text className="text-xs text-gray-500">
                          {item.date} | {item.size}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity>
                      <Image source={icons.dots} className="w-8 h-8 mr-3" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          }
        />

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal
            visible={showUploadModal}
            onClose={() => setShowUploadModal(false)} // Close the modal when it is closed
            onRefresh={onRefresh} // Refresh content when modal is closed
          />
        )}
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Home;
