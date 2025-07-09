import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Platform,
  I18nManager,
} from "react-native";
import React, { useState } from "react";
import { Tabs, router } from "expo-router"; // Import router
import TabIcons from "../../components/TabIcons";
import icons from "../../constants/icons";
import UploadModal from "../../components/UploadModal"; // Assuming this path
import { useGlobalContext } from "../../context/GlobalProvider";
import eventEmitter from "../../utils/eventEmitter"; // <--- IMPORT EVENT EMITTER
import { Image } from "react-native";

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../../utils/fontUtils";
import i18n from "../../utils/i18n";
import { StatusBar } from "expo-status-bar";
const TabsLayout = () => {
  const { showUploadModal, setShowUploadModal } = useGlobalContext();
  const [activeTab, setActiveTab] = useState("home"); // Keep track of active tab
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  // Function to handle successful upload and redirect
  const handleUploadSuccess = () => {
    // console.log(
    //   "TabsLayout: Upload success from modal. Starting dismissal and navigation."
    // );

    // Step 1: Close the modal immediately
    setShowUploadModal(false);

    // Step 2: Add a small delay before emitting the event and navigating
    // This gives React Native a moment to fully unmount the modal and update the UI
    setTimeout(() => {
      eventEmitter.emit("refreshHome"); // Emit the global refresh event
      router.replace("/home"); // Redirect to the Home tab
      setActiveTab("home"); // Update active tab state to reflect the redirection
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
            source={icons.budget}
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
              style={{
                right: I18nManager.isRTL ? undefined : -6, // If RTL, right: auto, left: -6
                left: I18nManager.isRTL ? -6 : undefined, // If LTR, left: auto, right: -6
              }}
            >
              {/* The badge content, a simple exclamation mark */}
              <Text
                className={`text-white text-xs ${getFontClassName(
                  "bold"
                )} text-center`}
                style={{ fontFamily: getFontClassName("bold") }}
              >
                {t("common.exclamationMark")}
              </Text>
            </View>
          )}
        </View>

        {/* The text label for the tab */}
        <Text
          className={`${
            focused ? "font-psemibold" : "font-pregular"
          } text-center ${getFontClassName(focused ? "semibold" : "regular")}`} // Apply dynamic font classes
          style={{
            color: color,
            fontSize: Platform.select({
              ios: 14,
              android: 11,
            }),
            fontFamily: getFontClassName(focused ? "semibold" : "regular"),
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {t("tabs.budget")} {/* Translated Budget tab name */}
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
            title: t("tabs.home"),
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcons
                icon={icons.home}
                color={color}
                name={t("tabs.home")}
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
            title: t("tabs.spending"),
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcons
                icon={icons.activity}
                color={color}
                name={t("tabs.spending")}
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
                name={t("tabs.upload")}
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
            title: t("tabs.wallet"), // Translated title
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcons
                icon={icons.wallet}
                color={color}
                name={t("tabs.wallet")} // Translated name for TabIcons component
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

        {/* Budget Tab */}
        <Tabs.Screen
          name="budget"
          options={{
            title: t("tabs.budget"), // Translated title
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
      <StatusBar backgroundColor="#161622" style="light" />
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
