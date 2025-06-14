import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform, // Import Platform for KeyboardAvoidingView behavior
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../../constants/images"; // Ensure this path is correct
import FormFiled from "../../components/FormField"; // Ensure this path is correct
import CustomButton from "../../components/CustomButton"; // Ensure this path is correct
import { Link, router } from "expo-router";
import {
  getCurrentUser,
  requestPasswordReset, // Use this for forgot password
  signIn,
  sendOTPToEmail,
  getUserIdbyEmail,
} from "../../lib/appwrite"; // Ensure this path is correct
import { useGlobalContext } from "../../context/GlobalProvider"; // Ensure this path is correct
import EmailResetModal from "../../components/EmailResetModel"; // Your existing EmailResetModal component
import GradientBackground from "../../components/GradientBackground"; // Ensure this path is correct

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Corrected state variable name

  const { setUser, setIsLogged, checkSessionAndFetchUser } = useGlobalContext(); // Get checkSessionAndFetchUser

  const [modalVisible, setModalVisible] = useState(false);

  const submit = async () => {
    // 1- Basic Input Validation
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // 2- Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the API to login the user
      await signIn(form.email, form.password); // signIn creates a session

      // Re-fetch user data using the global context function to update global state
      await checkSessionAndFetchUser(); // This will get the user profile and set it

      // Navigate to home after successful login
      router.replace("/home");
    } catch (error) {
      console.error("Sign In Error:", error);
      Alert.alert(
        "Login Failed",
        error.message || "An unexpected error occurred during login."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendPasswordResetEmail = async (email) => {
    // 1. Validate email format in the modal callback too
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setModalVisible(false); // Close the modal immediately
    setIsSubmitting(true); // Show a loading indicator for the reset process

    try {
      // Use requestPasswordReset for password recovery (sends a link)
      // The redirect URL is crucial and must be configured in Appwrite

      const REDIRECT_URL = "https://wizo-app-auth.web.app/reset-password.html"; // <<< IMPORTANT: MATCH YOUR EXPO DEEP LINK/WEB REDIRECT URL
      console.log("REDIRECT_URL", REDIRECT_URL);
      // For Expo Router deep linking, this would be `YOUR_APP_SCHEME://reset-password` (e.g. `wizo://reset-password`)
      // or your web URL if you configure web redirects for Appwrite
      await requestPasswordReset(email, REDIRECT_URL);

      Alert.alert(
        "Password Reset",
        "A password reset link has been sent to your email address. Please check your inbox (and spam folder)."
      );
    } catch (error) {
      console.error("Forgot Password Error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send password reset email."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReset = async (email) => {
    // 1. Trigger backend email with OTP
    console.log("Passed Email", email);
    try {
      const userId = await getUserIdbyEmail(email);
      console.log("get user id....handleSendReset", userId);

      const res = await sendOTPToEmail(userId, email);

      // Directly pass userId and expire to the next screen
      router.push({
        pathname: "/verify-otp",
        params: { email, userId: res.userId, expire: res.expire },
      });

      Alert.alert("Success", "OTP sent to your email.");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className=" flex justify-center items-center px-4 py-6 min-h[85vh] ">
              <Image
                source={images.logoo7}
                resizeMode="contain"
                className="w-[230px] h-[105px] mt-5"
              />

              <Text className="text-xl text-gray-700 font-pextrabold text-center mt-3">
                Access Your Account
              </Text>

              <FormFiled
                title="Email Address"
                value={form.email}
                handleChangeText={(e) => setForm({ ...form, email: e })}
                otherStyles="mt-5"
                keyboardType="email-address"
                placeholder="your@example.com"
              />

              <FormFiled
                title="Password"
                value={form.password}
                handleChangeText={(e) => setForm({ ...form, password: e })}
                otherStyles="mt-4"
                secureTextEntry // Ensure password is hidden
                placeholder="Enter your password"
              />

              <View className="w-full items-end">
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  disabled={isSubmitting}
                >
                  <Text className="text-secondary text-base font-psemibold mt-2">
                    Forgot password?
                  </Text>
                </TouchableOpacity>
                {/* EmailResetModal is correctly placed here */}
                <EmailResetModal
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  onSend={handleSendPasswordResetEmail} // Use the new handler
                />
              </View>

              {/* Removed direct link to /verify-otp as it's not for password reset */}
              {/* <Link href="/verify-otp">
                                <Text>Verify OTP</Text>
                            </Link> */}

              <CustomButton
                title="Sign In"
                handlePress={submit}
                containerStyle=" mt-5 w-full"
                isLoading={isSubmitting}
              />

              <View className="justify-center pt-5 flex-row gap-2">
                <Text className="text-base text-gray-700 font-semibold">
                  Don't have an Account?
                </Text>
                <Link
                  href="/sign-up"
                  className="text-base font-psemibold text-secondary"
                >
                  Sign Up
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default SignIn;
