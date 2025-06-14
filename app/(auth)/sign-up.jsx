import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../../constants/images"; // Assuming images.logoo7 exists
import FormFiled from "../../components/FormField"; // Your custom FormField component
import CustomButton from "../../components/CustomButton"; // Your custom CustomButton component
import { Link, router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { createUser } from "../../lib/appwrite"; // Your Appwrite createUser function
import GradientBackground from "../../components/GradientBackground"; // Your GradientBackground component
import Checkbox from "expo-checkbox"; // Import Checkbox from expo-checkbox (install if you haven't: expo install expo-checkbox)

const SignUp = () => {
  const [form, setForm] = useState({
    username: "", // Added username to form state
    email: "",
    password: "",
    confirmPassword: "", // New field for password confirmation
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false); // State for terms agreement

  const { setUser, setIsLogged } = useGlobalContext();

  const submit = async () => {
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    // 1- Basic Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    // 2- Password Match Validation
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    // 3- Basic Password Strength Validation (add more complex regex as needed)
    if (form.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }
    // Example: Add more rules like requiring a number, special char, etc.
    // if (!/[0-9]/.test(form.password)) { Alert.alert("Error", "Password must contain a number."); return; }

    // 4- Terms Acceptance Validation
    if (!agreeToTerms) {
      Alert.alert(
        "Error",
        "You must agree to the Terms of Service and Privacy Policy."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Call createUser with updated arguments (no 'pwd' parameter anymore)
      const result = await createUser(form.email, form.password, form.username);

      setUser(result); // Set the returned user profile document to global state
      setIsLogged(true);

      router.replace("/home"); // Navigate to home after successful signup
    } catch (error) {
      console.error("Sign Up Error:", error); // Log the actual error
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className=" flex justify-center items-center px-4 py-6 ">
            <Image
              source={images.logoo7} // Your app logo
              resizeMode="contain"
              className="w-[230px] h-[105px] "
            />

            {/* <Text className="text-base text-gray-700 font-pextrabold text-center mt-4">
              Register for O7 Account
            </Text> */}

            {/* Username Field */}
            <FormFiled
              title="User Name"
              value={form.username}
              handleChangeText={(e) => setForm({ ...form, username: e })}
              otherStyles="mt-5"
              placeholder="Your unique username"
            />

            {/* Email Field */}
            <FormFiled
              title="Email Address"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles="mt-5"
              keyboardType="email-address"
              placeholder="your@example.com"
            />

            {/* Password Field */}
            <FormFiled
              title="Password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-5"
              secureTextEntry // Hides password characters
              placeholder="Min. 8 characters"
            />

            {/* Confirm Password Field */}
            <FormFiled
              title="Confirm Password"
              value={form.confirmPassword}
              handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
              otherStyles="mt-5"
              secureTextEntry // Hides password characters
              placeholder="Re-enter your password"
            />

            {/* Terms and Privacy Checkbox */}
            <View className="flex-row items-center mt-5 w-full px-1">
              <Checkbox
                value={agreeToTerms}
                onValueChange={setAgreeToTerms}
                color={agreeToTerms ? "#008000" : "#2A9D8F"} // Purple when checked
                className="w-5 h-5 rounded"
              />
              <Text className="text-sm text-gray-700 font-pregular ml-2 flex-1">
                I agree to the app's{" "}
                <Link
                  href="/privacy-policy"
                  className="text-purple-600 font-psemibold underline"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms-of-service"
                  className="text-purple-600 font-psemibold underline"
                >
                  Terms of Service
                </Link>
                .
              </Text>
            </View>

            <CustomButton
              title="Sign Up"
              handlePress={submit}
              containerStyle=" mt-7 w-full"
              isLoading={isSubmitting}
            />

            {/* Already have an account link */}
            <View className="justify-center pt-3 flex-row gap-2">
              <Text className="text-lg text-black font-pregular">
                Have an Account already?
              </Text>
              <Link
                href="/sign-in"
                className="text-lg font-psemibold text-red-700"
              >
                Sign In
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default SignUp;
