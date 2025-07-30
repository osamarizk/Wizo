import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
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
  sendOTPToEmail,
  getUserIdbyEmail,
  getAppwriteErrorMessageKey,
} from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import EmailResetModal from "../../components/EmailResetModel";
import GradientBackground from "../../components/GradientBackground";

// NEW: Import translation and font utilities
import { useTranslation } from "react-i18next";
import { getFontClassName } from "../../utils/fontUtils";

const SignIn = () => {
  const { t } = useTranslation(); // NEW: Initialize useTranslation

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUser, setIsLogged, checkSessionAndFetchUser } = useGlobalContext();

  const [modalVisible, setModalVisible] = useState(false);

  const submit = async () => {
    // 1- Basic Input Validation
    if (!form.email || !form.password) {
      Alert.alert(t("common.errorTitle"), t("auth.fillAllFieldsError"));
      return;
    }

    // 2- Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert(t("common.errorTitle"), t("auth.invalidEmailError"));
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(form.email, form.password);
      await checkSessionAndFetchUser();
      router.replace("/home");
    } catch (error) {
      console.error("Sign In Error:", error);
      const errorKey = getAppwriteErrorMessageKey(error); // Get the translation key
      let errorMessage = t(errorKey); // Get the translated message

      // If it's a generic Appwrite error, include the original message
      if (errorKey === "appwriteErrors.genericAppwriteError") {
        errorMessage = t(errorKey, { message: error.message });
      }

      Alert.alert(
        t("common.errorTitle"), // Use generic error title
        errorMessage // Display the translated, user-friendly message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendPasswordResetEmail = async (email) => {
    // 1. Validate email format in the modal callback too
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t("common.invalidEmailTitle"), t("auth.invalidEmailError"));
      return;
    }

    setModalVisible(false);
    setIsSubmitting(true);

    try {
      const REDIRECT_URL = "https://resynq.net/reset-password.html"; // <<< IMPORTANT: MATCH YOUR EXPO DEEP LINK/WEB REDIRECT URL
      console.log("REDIRECT_URL", REDIRECT_URL);
      await requestPasswordReset(email, REDIRECT_URL);

      // SUCCESS MESSAGE (This is for when the email *was* successfully sent)
      Alert.alert(
        t("auth.passwordResetSuccessTitle"),
        t("auth.passwordResetSuccessMessage")
      );
    } catch (error) {
      console.error("Forgot Password Error:", error);
      console.log("Exact error.message:", error.message); // <-- ADD THIS
      console.log("Full error object:", JSON.stringify(error, null, 2)); // <-- ADD THIS to see full structure

      const errorKey = getAppwriteErrorMessageKey(error);
      console.log("Determined errorKey:", errorKey); // <-- ADD THIS

      let userFacingMessage = t("common.errorTitle"); // Default title for errors

      if (errorKey === "appwriteErrors.userNotFound") {
        userFacingMessage = t("auth.passwordResetGenericConfirmation");
      } else if (errorKey === "appwriteErrors.networkRequestFailed") {
        userFacingMessage = t("appwriteErrors.networkRequestFailed");
      } else {
        let errorMessage = t(errorKey);
        if (errorKey === "appwriteErrors.genericAppwriteError") {
          errorMessage = t(errorKey, { message: error.message });
        }
        userFacingMessage = errorMessage;
      }

      Alert.alert(t("common.errorTitle"), userFacingMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReset = async (email) => {
    console.log("Passed Email", email);
    try {
      const userId = await getUserIdbyEmail(email);
      console.log("get user id....handleSendReset", userId);

      const res = await sendOTPToEmail(userId, email);

      router.push({
        pathname: "/verify-otp",
        params: { email, userId: res.userId, expire: res.expire },
      });

      Alert.alert(t("common.successTitle"), t("auth.otpSentSuccessMessage"));
    } catch (error) {
      Alert.alert(
        t("common.errorTitle"),
        error.message || t("common.unexpectedError")
      );
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 15,
            paddingBottom: 10,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex justify-center items-center px-4 py-6 ">
            <Image
              source={images.logoo7}
              resizeMode="contain"
              className="w-[230px] h-[105px] mt-5"
            />
            <Text
              className={`text-xl text-gray-700 text-center mt-3 ${getFontClassName(
                "extrabold"
              )}`}
              style={{
                fontFamily: getFontClassName("extrabold"),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              {t("auth.accessAccount")}
            </Text>
            <FormFiled
              title={t("auth.emailAddress")}
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles="mt-5"
              keyboardType="email-address"
              placeholder={t("auth.enterEmailPlaceholder")}
              placeholderTextColor="#999"
            />
            <FormFiled
              title={t("auth.password")}
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-4"
              secureTextEntry
              placeholder={t("auth.enterPasswordPlaceholder")}
              placeholderTextColor="#999"
            />
          </View>
          <View className=" flex-2 justify-cecnter px-4">
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              disabled={isSubmitting}
            >
              <Text
                className={`text-secondary text-base mt-2 underline ${getFontClassName(
                  "bold"
                )}`}
                style={{
                  fontFamily: getFontClassName("bold"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              >
                {t("auth.forgotPassword")}
              </Text>
            </TouchableOpacity>

            <CustomButton
              title={t("auth.signInButton")}
              handlePress={submit}
              containerStyle="mt-5 w-full"
              isLoading={isSubmitting}
            />
            <EmailResetModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onSend={handleSendPasswordResetEmail}
            />

            <View
              className={`justify-center pt-5 flex-row gap-2 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Text
                className={`text-lg text-gray-700 ${getFontClassName(
                  "semibold"
                )}`}
                style={{
                  fontFamily: getFontClassName("semibold"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              >
                {t("auth.noAccountQuestion")}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/sign-up")} // Use router.push for programmatic navigation
              >
                <Text
                  className={`text-lg text-secondary ${getFontClassName(
                    "bold"
                  )}`}
                  style={{
                    fontFamily: getFontClassName("bold"),
                    textAlign: I18nManager.isRTL ? "right" : "left",
                  }}
                >
                  {t("auth.signUpLink")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default SignIn;
