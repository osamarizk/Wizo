import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet,ScrollView } from "react-native";

const GradientBackground = ({ children, style = {} }) => {
  return (
    
    <LinearGradient
      colors={[ "#9F54B6", "#E6E8F0"]}
      start={{ x: 0.7, y: 1 }}
      end={{ x: 1, y: 0.6 }}
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
