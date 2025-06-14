import { View, Text, ScrollView, Image, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../../constants/images";

import CustomButton from "../../components/CustomButton";
import { OtpInput } from "react-native-otp-entry";
import { Link, router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { verifyOTP } from "../../lib/appwrite";

const VerifyOtp = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setisSubmitting] = useState(false);

  const { email, userId, expire } = useLocalSearchParams();
  const [otp, setOtp] = useState(""); // Store the OTP entered by the user

  const handleVerifyOtp = async () => {
    try {
      // Verify OTP using Appwrite API
      console.log("passed from EmailResetModel", userId, otp);
      const session = await verifyOTP(userId, otp);
      console.log("Returned Session", session);
      const newUserId = session.userId;
      const oldpwd = session.pwd;

      if (session) {
        // Proceed to reset password screen
        Alert.alert("Success", "OTP verified. Please reset your password.");
        console.log("passed from Verify", session.userId, otp);
        // OTP verified successfully, navigate to reset password screen
        router.push({
          pathname: "/reset-pwd",
          params: { userId: newUserId, secret: otp, email, oldpwd },
        });
        // Redirect to reset password screen (assuming you have the password reset screen set up)
        // You can redirect to another page for password reset or show the password reset input fields here.
      } else {
        Alert.alert("Error", "Invalid OTP or expired OTP.");
      }
    } catch (error) {
      console.log("Error verifying OTP:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-onboarding h-full">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className=" flex justify-center items-center px-4 py-6 min-h[85vh] ">
          <Image
            source={images.logoo7}
            resizeMode="contain"
            className="w-[230px] h-[105px] mt-5"
          />

          <Text className="text-3xl text-gray-700 font-pextrabold text-center mt-5 mb-10">
            Reset Your Password
          </Text>

          <View className="mt-2 justify-center items-center w-full flex-nowrap  ">
            <Text className="text-sm text-gray-700 font-psemibold mb-3">
              Enter the 6-digit code sent to {""}
              <Text className="  font-pbold text-secondary">{email}</Text>
            </Text>

            <OtpInput
              numberOfDigits={6}
              onTextChange={(text) => setOtp(text)} // Update the OTP value
              focusColor="#D24726"
              color="#fff"
              autoFocus={false}
              hideStick={true}
              // placeholder="******"
              // blurOnFilled={true}
              disabled={false}
              type="numeric"
              secureTextEntry={false}
              focusStickBlinkingDuration={500}
              theme={{
                pinCodeContainerStyle: {
                  backgroundColor: "#fff",
                  borderColor: "#fff",
                  borderWidth: 1,
                  width: 50,
                  height: 65,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                },
              }}
            />
          </View>
          <CustomButton
            title="Verify & Continue"
            // handlePress={submit}
            handlePress={handleVerifyOtp} // Handle OTP verification
            containerStyle=" mt-5 w-full"
            isLoading={isSubmitting}
          />

          <View className="w-full items-end mt-4">
            <Link href="/sign-in">
              <Text className="text-lg font-psemibold text-secondary mt-2  ">
                Cancel
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerifyOtp;
