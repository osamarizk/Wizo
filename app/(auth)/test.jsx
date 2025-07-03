import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Link } from "expo-router";

const test = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Link
        href="/sign-in"
        className="text-lg text-secondary"
        
      >
        test
      </Link>
    </View>
  );
};

export default test;

const styles = StyleSheet.create({});
