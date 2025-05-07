import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet } from "react-native";

const GradientBackground = ({ children, style = {} }) => {
  return (
    <LinearGradient
      colors={["#EDF1F4", "#C8D1E7", "#997AB8"]}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0.5 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradientBackground;
