import { View, Text, Keyboard, TouchableWithoutFeedback } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const AuthLayout = () => {
  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"} // Moves content up when keyboard appears
          style={{ flex: 1 }}
        >
          <Stack>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
            <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
            <Stack.Screen name="reset-pwd" options={{ headerShown: false }} />

            <StatusBar backgroundColor="#161622" style="light" />
          </Stack>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  );
};

export default AuthLayout;
