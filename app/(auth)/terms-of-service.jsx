import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import GradientBackground from "../../components/GradientBackground"; // Adjust path as needed

const TermsOfService = () => {
  const navigation = useNavigation();

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8 mt-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text className="text-blue-600 text-lg font-pmedium">Back</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-pbold text-black text-center flex-1 pr-12">
              Terms of Service
            </Text>
            <View className="w-10" /> {/* Placeholder for alignment */}
          </View>

          {/* Terms Content */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-base font-pregular text-gray-800 leading-relaxed">
              <Text className="font-pbold">Last Updated: June 12, 2025</Text>
              {"\n\n"}
              Welcome to O7! These Terms of Service ("Terms") govern your use of
              the O7 mobile application (the "App") provided by O7 ("we," "us,"
              or "our"). By accessing or using the App, you agree to be bound by
              these Terms. If you do not agree to these Terms, do not use the
              App.
              {"\n\n"}
              <Text className="font-pbold">1. Account Registration</Text>
              {"\n"}
              You must be at least 18 years old to create an account and use the
              App. When you register for an account, you agree to provide
              accurate, current, and complete information as prompted by our
              registration form. You are responsible for maintaining the
              confidentiality of your account password and for all activities
              that occur under your account.
              {"\n\n"}
              <Text className="font-pbold">2. Use of the App</Text>
              {"\n"}
              The App is designed to help you track your expenses by uploading
              and managing your receipts. You agree to use the App only for
              lawful purposes and in accordance with these Terms. You are
              prohibited from:
              {"\n"}- Using the App for any illegal or unauthorized purpose.
              {"\n"}- Uploading malicious software or data.
              {"\n"}- Attempting to interfere with the proper working of the
              App.
              {"\n\n"}
              <Text className="font-pbold">3. Intellectual Property</Text>
              {"\n"}
              All content, features, and functionality of the App (including but
              not limited to all information, software, text, displays, images,
              video, and audio, and the design, selection, and arrangement
              thereof) are owned by O7, its licensors, or other providers of
              such material and are protected by copyright, trademark, patent,
              trade secret, and other intellectual property or proprietary
              rights laws.
              {"\n\n"}
              <Text className="font-pbold">4. User Data and Privacy</Text>
              {"\n"}
              By using the App and uploading receipts, you agree to the
              collection and use of your data as outlined in our Privacy Policy.
              This includes the anonymized and aggregated sharing of data
              derived from your receipts with third parties for market research
              and business analytics purposes, which is done with your explicit
              consent obtained during the receipt upload process.
              {"\n\n"}
              <Text className="font-pbold">
                5. Premium Features and Subscriptions
              </Text>
              {"\n"}
              The App may offer premium features available through a
              subscription. All subscriptions are subject to these Terms and the
              terms of the respective app store (Apple App Store or Google Play
              Store). Payments are processed through the app store's in-app
              purchase mechanisms.
              {"\n\n"}
              <Text className="font-pbold">6. Disclaimers</Text>
              {"\n"}
              The App is provided on an "as is" and "as available" basis,
              without any warranties of any kind, either express or implied. We
              do not warrant that the App will be uninterrupted, error-free, or
              free of viruses or other harmful components.
              {"\n\n"}
              <Text className="font-pbold">7. Limitation of Liability</Text>
              {"\n"}
              In no event will O7, its affiliates, or their licensors, service
              providers, employees, agents, officers, or directors be liable for
              damages of any kind, under any legal theory, arising out of or in
              connection with your use, or inability to use, the App.
              {"\n\n"}
              <Text className="font-pbold">8. Governing Law</Text>
              {"\n"}
              These Terms shall be governed by and construed in accordance with
              the laws of [Your Jurisdiction], without regard to its conflict of
              law provisions.
              {"\n\n"}
              <Text className="font-pbold">9. Changes to Terms</Text>
              {"\n"}
              We reserve the right to revise and update these Terms from time to
              time in our sole discretion. All changes are effective immediately
              when we post them. Your continued use of the App following the
              posting of revised Terms means that you accept and agree to the
              changes.
              {"\n\n"}
              <Text className="font-pbold">10. Contact Information</Text>
              {"\n"}
              If you have any questions about these Terms, please contact us at:
              support@o7empower.com
            </Text>
          </View>

          {/* Spacer for bottom padding */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default TermsOfService;
