import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Tabs } from "expo-router"; // Import useNavigation
import TabIcons from "../../components/TabIcons";
import icons from "../../constants/icons";
import UploadModal from "../../components/UploadModal";
import { useGlobalContext } from "../../context/GlobalProvider";

const TabsLayout = () => {
  const { showUploadModal, setShowUploadModal } = useGlobalContext();
  const [activeTab, setActiveTab] = useState("home");

  // Function to refresh the Home screen when modal is closed
  const handleModalClose = () => {
    setShowUploadModal(false);
    setActiveTab("home"); // Switch back to home tab
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
            height: 84,
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
                  setActiveTab("upload");
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

        {/* Budget Tab */}
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
          onClose={() => setShowUploadModal(false)} // Close the modal
        />
      )}
    </>
  );
};

export default TabsLayout;
