// app/sign-up/index.jsx

import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../../constants/images";
import FormFiled from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  createUser,
  getAppwriteErrorMessageKey,
  checkSession,
} from "../../lib/appwrite";
import GradientBackground from "../../components/GradientBackground";
import Checkbox from "expo-checkbox";

import { useTranslation } from "react-i18next";
import { getFontClassName } from "../../utils/fontUtils";
import CurrencySelector from "../../components/CurrencySelector";

const SignUp = () => {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    preferredCurrency: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState(null);
  const [countryCode, setCountryCode] = useState(null);

  const { setUser, setIsLogged } = useGlobalContext();

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const userSession = await checkSession(); // Your Appwrite session check
        if (userSession && userSession.countryName) {
          setCountryCode(userSession.countryName); // Set initial country code
        }
      } catch (error) {
        console.error("Failed to fetch country from session:", error);
      }
    };
    fetchCountry();
  }, []);

  const submit = async () => {
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.preferredCurrency
    ) {
      Alert.alert(t("common.errorTitle"), t("auth.fillAllFieldsError"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert(t("common.errorTitle"), t("auth.invalidEmailError"));
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert(t("common.errorTitle"), t("auth.passwordsMismatchError"));
      return;
    }

    if (form.password.length < 8) {
      Alert.alert(t("common.errorTitle"), t("auth.passwordLengthError"));
      return;
    }

    if (!agreeToTerms) {
      Alert.alert(t("common.errorTitle"), t("auth.agreeTermsError"));
      return;
    }

    console.log("prefered currency===>>>", form.preferredCurrency);

    setIsSubmitting(true);
    try {
      const result = await createUser(
        form.email,
        form.password,
        form.username,
        form.preferredCurrency
      );

      setUser(result);
      setIsLogged(true);

      // if (form.preferredCurrency) {
      //   // Ensure it's not null before saving
      //   await account.updatePrefs({
      //     preferredCurrency: form.preferredCurrency, // <-- FIXED: Use form.preferredCurrency
      //   });
      // } else {
      //   // Optional: Handle case where preferredCurrency might still be null
      //   // (e.g., if you don't make it a mandatory field and user skips selection)
      //   console.warn(
      //     "No preferred currency selected, user preferences might not be updated."
      //   );
      //   // You could set a default here if needed:
      //   // const defaultCurrency = countryCodeToCurrencyMap[countryCode?.toUpperCase()]?.code || countryCodeToCurrencyMap.DEFAULT.code;
      //   // await account.updatePrefs({ preferredCurrency: defaultCurrency });
      // }

      router.replace("/home");
    } catch (error) {
      console.error("Sign Up Error:", error);
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
      setIsSubmitting(false);
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
        >
          <View className="flex-1 items-center px-4 ">
            <Image
              source={images.logoo7}
              resizeMode="contain"
              className="w-[230px] h-[90px] "
            />

            {/* <Text
                className={`text-xl text-gray-700 text-center mt-4 ${getFontClassName("extrabold")}`}
                style={{ fontFamily: getFontClassName("extrabold"), textAlign: I18nManager.isRTL ? 'right' : 'left' }}
              >
                {t("auth.registerAccount")}
              </Text> */}

            {/* Form Fields */}
            <FormFiled
              title={t("auth.username")}
              value={form.username}
              handleChangeText={(e) => setForm({ ...form, username: e })}
              otherStyles="mt-2"
              placeholder={t("auth.enterUsernamePlaceholder")}
            />

            <FormFiled
              title={t("auth.emailAddress")}
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles="mt-2"
              keyboardType="email-address"
              placeholder={t("auth.enterEmailPlaceholder")}
            />

            <FormFiled
              title={t("auth.password")}
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-2"
              secureTextEntry
              placeholder={t("auth.enterPasswordPlaceholderShort")}
            />

            <FormFiled
              title={t("auth.confirmPassword")}
              value={form.confirmPassword}
              handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
              otherStyles="mt-2"
              secureTextEntry
              placeholder={t("auth.reenterPasswordPlaceholder")}
            />

            <CurrencySelector
              initialCountryCode={countryCode} // Pass the country code from session
              initialCurrencyCode={form.preferredCurrency} // <-- FIXED: Read from form state
              onCurrencyChange={(value) =>
                setForm({ ...form, preferredCurrency: value })
              } // <-- FIXED: Update form state
              containerStyles="mt-2" // Example styling
            />

            {/* Terms and Privacy Checkbox */}
            <View
              className={`flex-row items-center mt-2 w-full px-1 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Checkbox
                value={agreeToTerms}
                onValueChange={setAgreeToTerms}
                color={agreeToTerms ? "#008000" : "#264653"}
                className={`w-5 h-5 rounded ml-2 mr-2 ${
                  I18nManager.isRTL ? "ml-2" : "mr-2"
                }`}
              />
              <Text
                className={`text-base text-gray-700 flex-1 ${getFontClassName(
                  "semibold"
                )}`}
                style={{
                  fontFamily: getFontClassName("semibold"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              >
                {t("auth.agreeToTermsPrefix")}
                <Link
                  href="/privacy-policy"
                  className={`text-purple-600 underline ${getFontClassName(
                    "semibold"
                  )}`}
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {t("common.privacyPolicy")}
                </Link>{" "}
                {t("common.and")}{" "}
                <Link
                  href="/terms-of-service"
                  className={`text-purple-600 underline ${getFontClassName(
                    "semibold"
                  )}`}
                  style={{ fontFamily: getFontClassName("semibold") }}
                >
                  {t("common.termsOfService")}
                </Link>
                {t("auth.agreeToTermsSuffix")}
              </Text>
            </View>

            <CustomButton
              title={t("auth.signUpButton")}
              handlePress={submit}
              containerStyle="mt-4 w-full"
              isLoading={isSubmitting}
            />

            {/* Already have an account link */}
            <View
              className={`justify-center pt-2 flex-row gap-2 ${
                I18nManager.isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Text
                className={`text-lg text-black ${getFontClassName("regular")}`}
                style={{
                  fontFamily: getFontClassName("regular"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              >
                {t("auth.haveAccountQuestion")}
              </Text>
              <Link
                href="/sign-in"
                className={`text-lg text-red-700 ${getFontClassName("bold")}`}
                style={{
                  fontFamily: getFontClassName("bold"),
                  textAlign: I18nManager.isRTL ? "right" : "left",
                }}
              >
                {t("auth.signInLink")}
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default SignUp;
