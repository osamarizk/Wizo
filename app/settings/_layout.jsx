import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const SettLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="app-settings" options={{ headerShown: false }} />
        <Stack.Screen name="manage-data" options={{ headerShown: false }} />
        <Stack.Screen
          name="privacy-controls"
          options={{ headerShown: false }}
        />
        {/* privacy-policy.jsx */}
        <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />

        {/* terms-of-service */}
        <Stack.Screen
          name="terms-of-service"
          options={{ headerShown: false }}
        />

        {/*
              IMPORTANT: When using expo-router's file-system routing,
              you DO NOT explicitly list Stack.Screen for files
              like app-settings.jsx, manage-data.jsx, privacy-controls.jsx
              that are directly within this 'settings' directory.
              Expo Router automatically discovers them.

              The 'headerShown: false' in screenOptions will apply to all
              screens within this /settings/ route group.
            */}
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default SettLayout;
