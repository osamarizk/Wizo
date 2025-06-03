// components/PointsAndBadges.jsx
import React, { use } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import icons from "../constants/icons"; // Adjust path as needed

const PointsAndBadges = ({
  userTotalPoints,
  userBadges,
  showPointsBadgeModal,
  setShowPointsBadgeModal,
}) => {
  console.log("userBadges.....:", userBadges);
  return (
    <>
      {/* Points Display: Icon, "Your Points", and value on the same line */}
      <View className="flex-row items-center mb-4 mt-3">
        <Image
          source={icons.trophy}
          className="w-6 h-6 mr-1" // Icon at the start
          resizeMode="contain"
        />
        <Text className="text-xl font-pbold text-gray-900 mr-2">
          Your Points :
        </Text>
        <Text className="text-xl font-pbold text-secondary">
          {userTotalPoints !== null ? userTotalPoints : "Loading..."}
        </Text>
      </View>

      {/* Badges Display: Icon and "Your Badges" are clickable and underlined */}
      <View className="mb-4">
        <TouchableOpacity
          onPress={() => setShowPointsBadgeModal(true)}
          className="flex-row items-center mb-2" // No justify-between here, elements will flow
        >
          <Image
            source={icons.badgePlaceholder} // Using badgePlaceholder, you can use a specific 'badge' icon if you have one
            className="w-6 h-6 mr-1" // Icon at the start
            resizeMode="contain"
          />
          <Text className="text-xl font-pbold text-gray-900 underline">
            Your Badges
          </Text>
          {/* Removed the separate arrow icon as the underline indicates clickability */}
        </TouchableOpacity>

        {userBadges && userBadges.length > 0 ? (
          <>
            <FlatList
              data={userBadges.slice(0, 3)}
              keyExtractor={(item) => item.$id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View className="mr-4 items-center">
                  {/* <Image
                    source={icons.badgePlaceholder}
                    className="w-12 h-12 mb-1"
                    resizeMode="contain"
                  /> */}
                  <Text className="text-xs text-gray-700 font-pregular">
                    {item.name}
                  </Text>
                </View>
              )}
            />
          </>
        ) : (
          <Text className="text-gray-500 font-pregular text-center mt-2">
            No badges earned yet. Keep submitting receipts!
          </Text>
        )}
      </View>

      {/* Badge Modal - Retains its separate background */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPointsBadgeModal}
        onRequestClose={() => setShowPointsBadgeModal(!showPointsBadgeModal)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-5 shadow-xl w-11/12 max-h-[80vh]">
            <Text className="text-2xl font-pbold text-gray-900 mb-4 text-center">
              All Earned Badges
            </Text>
            {userBadges && userBadges.length > 0 ? (
              <FlatList
                data={userBadges}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => (
                  <View className="flex-row items-center border-b border-gray-200 py-2">
                    {/* <Image
                      source={icons.badgePlaceholder}
                      className="w-10 h-10 mr-3"
                      resizeMode="contain"
                    /> */}
                    <View>
                      <Text className="text-lg font-psemibold text-gray-800">
                        {item.name}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {item.description || "No description provided."}
                      </Text>
                    </View>
                  </View>
                )}
                className="mb-4"
              />
            ) : (
              <Text className="text-gray-500 font-pregular text-center">
                You haven't earned any badges yet.
              </Text>
            )}
            <Pressable
              className="bg-red-500 rounded-md p-3 items-center mt-4"
              onPress={() => setShowPointsBadgeModal(!showPointsBadgeModal)}
            >
              <Text className="text-white font-psemibold text-base">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PointsAndBadges;
