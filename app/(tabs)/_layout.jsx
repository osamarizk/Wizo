import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import React, { useState } from "react";
import { Tabs } from "expo-router";
import TabIcons from "../../components/TabIcons";
import icons from "../../constants/icons";

import UploadModal from "../../components/UploadModal";
const TabsLayout = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
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
            borderCurve: 50,
            // Keep the tab bar at the bottom
            // Ensure it's at the bottom of the screen
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
                  setActiveTab("upload"); // 👈 Mark upload as active when pressed
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

        {/* BookMark Tab */}
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

        {/* Home Tab */}
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

      {/* Upload Modal */}
      <UploadModal
        visible={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setActiveTab("home");
        }}
      />
    </>
  );
};

export default TabsLayout;
