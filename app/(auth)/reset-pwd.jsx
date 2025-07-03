import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../../constants/images";
import CustomButton from "../../components/CustomButton";
import FormFiled from "../../components/FormField";
import { router, useLocalSearchParams } from "expo-router";
import {
  getCurrentUser,
  resetPassword,
  resetPasswordWithOTP,
  updatePasswordField,
  getAppwriteErrorMessageKey,
} from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const Resetpwd = () => {
  const [form, setForm] = useState({
    password: "",
    confirpassword: "",
  });

  const [isSubmitting, setisSubmitting] = useState(false);

  const { userId, secret, email, oldpwd } = useLocalSearchParams();
  const { setUser, setIsLogged } = useGlobalContext();

  const submit = async () => {
    // 1--xheck if the form is valid
    if (!form.password || !form.confirpassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    // 2-Check if the passoword match
    if (form.password !== form.confirpassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setisSubmitting(true);
      const currentUser = await getCurrentUser();
      // console.log("current user", resu);
      setUser(currentUser);
      setIsLogged(true);
      // console.log(resu.pwd);
      // console.log("passed from reset", userId, secret);
      const result = await resetPassword(form.password, currentUser.pwd);

      if (result && result.$id) {
        await updatePasswordField(currentUser.$id, form.password);
        Alert.alert("Success", "Password reset successfully!");
        router.push("/sign-in");
      } else {
        Alert.alert("Error", "Unexpected response from server.");
        console.log("Reset response:", result);
      }
    } catch (error) {
      const errorKey = getAppwriteErrorMessageKey(error); // Get the translation key
      let errorMessage = t(errorKey);

      // If it's a generic Appwrite error, include the original message
      if (errorKey === "appwriteErrors.genericAppwriteError") {
        errorMessage = t(errorKey, { message: error.message });
      }

      Alert.alert(
        t("common.errorTitle"), // Use generic error title
        errorMessage // Display the translated, user-friendly message
      );
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

          <Text className="text-3xl text-gray-700 font-pextrabold text-center mt-5">
            Reset Password
          </Text>

          <FormFiled
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-10"
            keyboardType="password"
          />

          <FormFiled
            title="Confirm Password"
            value={form.confirpassword}
            handleChangeText={(e) => setForm({ ...form, confirpassword: e })}
            otherStyles="mt-7 "
            keyboardType="password"
          />

          <CustomButton
            title="Reset Passord"
            handlePress={submit}
            containerStyle=" mt-5 w-full"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Resetpwd;
