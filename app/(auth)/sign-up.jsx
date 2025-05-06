import { View, Text, ScrollView, Image, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../../constants/images";
import FormFiled from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { createUser } from "../../lib/appwrite";

const SignUp = () => {

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUser, setIsLogged } = useGlobalContext();

  const submit = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert("Error", "Please fill all fields");
      return; // Stop execution if fields are empty
    }
    // 1- check if the email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createUser(
        form.email,
        form.password,
        form.username,
        form.password 
      );

      setUser(result);
      setIsLogged(true);
      // set result to the global state
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView className="bg-onboarding h-full">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className=" flex justify-center items-center px-4 py-6 min-h[80vh] ">
          <Image
            source={images.logoo7}
            resizeMode="contain"
            className="w-[230px] h-[105px] mt-1"
          />

          <Text className="text-3xl text-gray-700 font-pextrabold text-center mt-4">
            Register for O7 Account
          </Text>

          <FormFiled
            title="User Name"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-5"
          />

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
            otherStyles="mt-5"
            keyboardType="password"
          />

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyle=" mt-7 w-full"
            isLoading={isSubmitting}
          />
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-700 font-pregular">
              Have an Account already?
            </Text>
            <Link
              href="/sign-in"
              className="text-lg font-psemibold text-secondary"
            >
              Sign In
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
