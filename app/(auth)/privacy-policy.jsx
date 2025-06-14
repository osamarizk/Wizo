import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import GradientBackground from "../../components/GradientBackground"; // Adjust path as needed

const PrivacyPolicy = () => {
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
              Privacy Policy
            </Text>
            <View className="w-10" />
          </View>

          {/* Policy Content */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
            <Text className="text-base font-pregular text-gray-800 leading-relaxed">
              <Text className="font-pbold">Effective Date: June 12, 2025</Text>
              {"\n\n"}
              Welcome to O7! This Privacy Policy describes how O7 collects,
              uses, and discloses information about you when you use our mobile
              application (the "App").
              {"\n\n"}
              <Text className="font-pbold">1. Information We Collect</Text>
              {"\n"}
              We collect information you provide directly to us when you use the
              App, such as when you create an account, upload receipts, or
              contact customer support. This includes:
              {"\n"}- Account Information: Your username, email address, and
              hashed password.
              {"\n"}- Receipt Data: Details from your uploaded receipts,
              including merchant name, date, total amount, items purchased,
              category, and payment method.
              {"\n"}- Communication Data: Information you provide when you
              communicate with us, such as feedback or support inquiries.
              {"\n\n"}
              <Text className="font-pbold">2. How We Use Your Information</Text>
              {"\n"}
              We use the information we collect to:
              {"\n"}- Provide, maintain, and improve the App's features and
              functionality.
              {"\n"}- Process and manage your receipt uploads and spending data.
              {"\n"}- Provide you with personalized insights and analytics on
              your spending.
              {"\n"}- Communicate with you about your account, updates, and
              promotional offers.
              {"\n"}- Anonymize and aggregate data for research and analytics to
              improve our services.
              {"\n\n"}
              <Text className="font-pbold">3. Sharing Your Information</Text>
              {"\n"}
              We may share your information as follows:
              {"\n"}- <Text className="font-psemibold">With Your Consent:</Text>{" "}
              As explicitly stated during the receipt upload process, by
              uploading a receipt, you consent to us sharing certain anonymized
              and aggregated data derived from your receipts with third parties
              for market research and business analytics purposes. This data
              will not identify you personally.
              {"\n"}- <Text className="font-psemibold">Service Providers:</Text>{" "}
              We may share information with third-party vendors, consultants,
              and other service providers who perform services on our behalf and
              require access to your information to carry out those services.
              {"\n"}-{" "}
              <Text className="font-psemibold">Legal Requirements:</Text> We may
              disclose your information if required to do so by law or in the
              good faith belief that such action is necessary to comply with a
              legal obligation.
              {"\n\n"}
              <Text className="font-pbold">4. Data Security</Text>
              {"\n"}
              We implement reasonable security measures to protect your
              information from unauthorized access, alteration, disclosure, or
              destruction. However, no internet or email transmission is ever
              fully secure or error-free.
              {"\n\n"}
              <Text className="font-pbold">5. Your Choices</Text>
              {"\n"}
              You can review and update your account information in your profile
              settings. You can also manage your data sharing preferences in the
              "Privacy Controls" section of the App Settings.
              {"\n\n"}
              <Text className="font-pbold">6. Changes to this Policy</Text>
              {"\n"}
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy in the
              App. You are advised to review this Privacy Policy periodically
              for any changes.
              {"\n\n"}
              <Text className="font-pbold">7. Contact Us</Text>
              {"\n"}
              If you have any questions about this Privacy Policy, please
              contact us at: support@o7empower.com
            </Text>
          </View>

          {/* Spacer for bottom padding */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default PrivacyPolicy;
