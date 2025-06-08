import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { Tabs, router } from "expo-router"; // Import router
import TabIcons from "../../components/TabIcons";
import icons from "../../constants/icons";
import UploadModal from "../../components/UploadModal"; // Assuming this path
import { useGlobalContext } from "../../context/GlobalProvider";
import eventEmitter from "../../utils/eventEmitter"; // <--- IMPORT EVENT EMITTER
import { Image } from "react-native";

const TabsLayout = () => {
  const { showUploadModal, setShowUploadModal } = useGlobalContext();
  const [activeTab, setActiveTab] = useState("home"); // Keep track of active tab
  const [refreshing, setRefreshing] = useState(false);

  console.log("TabsLayout Rendered...", showUploadModal, activeTab);
  // Function to handle successful upload and redirect
  const handleUploadSuccess = () => {
    // console.log(
    //   "TabsLayout: Upload success from modal. Starting dismissal and navigation."
    // );

    // Step 1: Close the modal immediately
    setShowUploadModal(false);
    console.log("TabsLayout: setShowUploadModal(false) called.");

    // Step 2: Add a small delay before emitting the event and navigating
    // This gives React Native a moment to fully unmount the modal and update the UI
    setTimeout(() => {
      console.log("TabsLayout: Emitting refreshHome event after delay.");
      eventEmitter.emit("refreshHome"); // Emit the global refresh event

      console.log("TabsLayout: Navigating to /home after delay.");
      router.replace("/home"); // Redirect to the Home tab
      setActiveTab("home"); // Update active tab state to reflect the redirection
      console.log("TabsLayout: Navigation and activeTab update complete.");
    }, 100); // A sma
  };

  function BudgetTabBarIcon({ focused, color }) {
    // Use 'hasBudget' from your global context to determine if a budget is initialized
    const { hasBudget } = useGlobalContext();

    return (
      // Main container for the tab icon, mimicking the non-upload styling of your TabIcons
      <View className="items-center justify-center gap-1 w-16">
        <View className="relative items-center justify-center">
          {/* Your Budget icon */}
          <Image
            source={icons.pie}
            resizeMode="contain"
            // Apply tint color similar to other non-upload icons
            tintColor={focused ? color : "#888"}
            // Fixed size for the icon itself, matching TabIcons' non-upload size
            className="w-6 h-6"
          />
          {/* Conditionally render the badge when no budget is initialized */}
          {!hasBudget && (
            <View
              // Tailwind classes for the badge's appearance and positioning
              className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-5 h-5 items-center justify-center z-10"
            >
              {/* The badge content, a simple exclamation mark */}
              <Text className="text-white text-xs font-pbold">!</Text>
            </View>
          )}
        </View>

        {/* The text label for the tab */}
        <Text
          // Apply font styling based on 'focused' state
          className={`${
            focused ? "font-psemibold" : "font-pregular"
          } text-center`}
          style={{
            // Apply dynamic color based on 'focused' state
            color: color,
            // Apply platform-specific font size, mirroring your TabIcons logic
            fontSize: Platform.select({
              ios: 14,
              android: 11,
            }),
          }}
          numberOfLines={1} // Ensure text stays on one line
          ellipsizeMode="tail" // Add ellipsis if text overflows
        >
          Budget {/* Directly set the name for the Budget tab */}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#D24726",
          tabBarInactiveTintColor: "#B0B0B3",
          tabBarStyle: {
            backgroundColor: "#FAFAFA",
            borderTopWidth: 2,
            borderTopColor: "#F4F0F0",
            height: Platform.select({
              // <--- Use Platform.select here
              ios: 84, // Height for iOS
              android: 100, // Height for Android
            }),
            borderRadius: 10,
            borderCurve: 90,
          },
        }}
      >
        {/* Home Tab */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcons
                icon={icons.home}
                color={color}
                name="Home"
                focused={activeTab === "home"}
              />
            ),
          }}
          listeners={{
            tabPress: () => {
              setActiveTab("home");
            },
          }}
        />

        {/* Spending Tab */}
        <Tabs.Screen
          name="spending"
          options={{
            title: "Spending",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcons
                icon={icons.activity}
                color={color}
                name="Spending"
                focused={activeTab === "spending"}
              />
            ),
          }}
          listeners={{
            tabPress: () => {
              setActiveTab("spending");
            },
          }}
        />

        {/* Upload Tab */}
        <Tabs.Screen
          name="upload"
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                onPress={() => {
                  setShowUploadModal(true);
                  setActiveTab("upload"); // Set active tab to upload when button pressed
                }}
              />
            ),
            tabBarIcon: ({ color }) => (
              <TabIcons
                icon={icons.camera}
                color={color}
                name="Upload"
                focused={activeTab === "upload"}
              />
            ),
            headerShown: false,
          }}
        />

        {/* Wallet Tab */}
        <Tabs.Screen
          name="wallet"
          options={{
            title: "Wallet",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcons
                icon={icons.wallet}
                color={color}
                name="Wallet"
                focused={activeTab === "wallet"}
              />
            ),
          }}
          listeners={{
            tabPress: () => {
              setActiveTab("wallet");
            },
          }}
        />

        {/* Budget Tab (Commented out) */}
        <Tabs.Screen
          name="budget"
          options={{
            title: "Budget",
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <BudgetTabBarIcon focused={focused} color={color} />
            ),
          }}
          listeners={{
            tabPress: () => {
              setActiveTab("budget");
            },
          }}
        />

        {/* Account Tab */}
        {/* <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcons
                icon={icons.profile}
                color={color}
                name="Account"
                focused={activeTab === "account"}
              />
            ),
          }}
          listeners={{
            tabPress: () => {
              setActiveTab("account");
            },
          }}
        /> */}
      </Tabs>

      {/* Upload Modal will be shown when showUploadModal is true */}

      {showUploadModal && (
        <UploadModal
          visible={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess} // Pass the success handler
        />
      )}
    </>
  );
};

export default TabsLayout;
