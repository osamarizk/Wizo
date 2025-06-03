import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/CustomButton";
import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import images from "../constants/images";
import { useGlobalContext } from "../context/GlobalProvider";
import { Dimensions } from "react-native";
import GradientBackground from "../components/GradientBackground";
const Index = () => {
  const { width, height } = Dimensions.get("window");
  const { loading, isLogged } = useGlobalContext();
  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        <ScrollView>
          <View className=" justify-center items-center px-4 py-3  ">
            <Image
              source={images.logoo7}
              resizeMode="contain"
              className="w-[230px] h-[105px] "
            />

            <Image
              source={images.mobrc}
              resizeMode="contain"
              style={{ width: width * 0.9, height: height * 0.35 }}
              className="mb-1"
            />

            <View className="flex-1">
              <Text className="text-xl text-gray-700 font-plight text-center ">
                Receipts are tedious to manage are often lost and hard to track
                {"\n"}
              </Text>
              {/* <Text className="text-sm text-secondary font-pregular text-center -mt-7 ">--------------------------------------------------{"\n "}</Text> */}
              <Text className="text-gray-700  text-sm    mb-3   ">
                🔥 Capture and upload your receipt with ease.{"\n"}
                {"\n"}🔥 Let AI handle the storing and processing for you.{"\n"}
                {"\n"}🔥 Say goodbay to hassle of manual record-keeping{"\n"}
                {"\n"}🔥 No Personal informations is shared ever.
              </Text>
            </View>

            {/* <Image
              source={images.gr}
              style={{ width: width * 0.9, height: height * 0.35 }}
              className=" bottom-80 left-2"
              resizeMode="contain"
              opacity={0.92}
            /> */}
            {/* <Text className="text-secondary text-2xl font-pbold text-center mt-1">O7 Empower the best solution</Text> */}

            {/* <CustomButton
              title="Continue with mail"
              handlePress={() => {
                router.push("/sign-in");
              }}
              containerStyle="w-full mt-4"
            /> */}

            <TouchableOpacity
              onPress={() => {
                router.push("/sign-in");
              }}
              className="mt-2 w-full bg-secondary rounded-md p-3 items-center justify-center" // Adjust className for your desired style
            >
              <Text className="text-white font-pmedium text-base">
                Continue with mail
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* <StatusBar backgroundColor="#161622" style="dark" /> */}
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Index;
