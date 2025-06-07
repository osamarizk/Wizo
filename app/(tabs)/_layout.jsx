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

        {/* Budget Tab (Commented out) */}
        {/* <Tabs.Screen
          name="budget"
          options={{
            title: "Budget",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcons
                icon={icons.pie}
                color={color}
                name="Budget"
                focused={activeTab === "budget"}
              />
            ),
          }}
          listeners={{
            tabPress: () => {
              setActiveTab("budget");
            },
          }}
        /> */}

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

        {/* Account Tab */}
        <Tabs.Screen
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
        />
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
