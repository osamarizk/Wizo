// app/(auth)/_layout.jsx

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
// import { StatusBar } from "expo-status-bar"; // No longer needed here if used in individual screens

const AuthLayout = () => {
  return (
    <>
      {/* The commented out KeyboardAvoidingView and TouchableWithoutFeedback are fine
          to remain commented out here, as they are handled within individual screens
          like sign-in.jsx and sign-up.jsx. */}
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        > */}
          <Stack>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
            <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
            <Stack.Screen name="reset-pwd" options={{ headerShown: false }} />
              <Stack.Screen name="test" options={{ headerShown: false }} />

            {/* REMOVED: StatusBar component from directly inside Stack */}
            {/* <StatusBar backgroundColor="#161622" style="light" /> */}
          </Stack>
        {/* </KeyboardAvoidingView>
      </TouchableWithoutFeedback> */}
    </>
  );
};

export default AuthLayout;
