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
import images from "../../constants/images";
import FormFiled from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import {
  getCurrentUser,
  requestPasswordReset,
  signIn,
} from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import EmailResetModal from "../../components/EmailResetModel";
import { sendOTPToEmail } from "../../lib/appwrite";
import GradientBackground from "../../components/GradientBackground"

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setisSubmitting] = useState(false);

  const { setUser, setIsLogged } = useGlobalContext();

  const [modalVisible, setModalVisible] = useState(false);

  const submit = async () => {
    // 1- check if the form is valid
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    // 1- check if the email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    // 3-Call the API to login the user
    try {
      await signIn(form.email, form.password);
      //  set user data to global context
      const resu = await getCurrentUser();
      console.log("current user", resu);
      setUser(resu);
      setIsLogged(true);
      // set result to the global state
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setisSubmitting(false);
    }
  };

  const handleSendReset = async (email) => {
    // 1. Trigger backend email with OTP
    console.log("Passed Email", email);
    try {
      const res = await sendOTPToEmail(email);

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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className=" flex justify-center items-center px-4 py-6 min-h[85vh] ">
            <Image
              source={images.logoo7}
              resizeMode="contain"
              className="w-[230px] h-[105px] mt-5"
            />

            <Text className="text-3xl text-gray-700 font-pextrabold text-center mt-5">
              Access Your O7 Account
            </Text>

            <FormFiled
              title="Email Address"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles="mt-5"
              keyboardType="email-address"
            />

            <FormFiled
              title="Password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-7 "
              keyboardType="password"
            />

            <View className="w-full items-end">
              {/* <Link
              href="/forget-pwd"
              className="text-lg font-psemibold text-secondary mt-2 "
            >
              Forgot password?
            </Link> */}

              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text className="text-secondary text-lg font-psemibold mt-2">
                  Forgot password?
                </Text>
              </TouchableOpacity>
              <EmailResetModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSend={handleSendReset}
              />
            </View>
            <Link href="/verify-otp">
              <Text>Verify OTP</Text>
            </Link>
            <CustomButton
              title="Sign In"
              handlePress={submit}
              containerStyle=" mt-5 w-full"
              isLoading={isSubmitting}
            />
            <View className="justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-gray-700 font-semibold">
                Don't have an Account?
              </Text>
              <Link
                href="/sign-up"
                className="text-lg font-psemibold text-secondary"
              >
                Sign Up
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default SignIn;
