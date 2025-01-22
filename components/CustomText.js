import React from "react";
import { Text, StyleSheet } from "react-native";

export const CustomText = ({ style, children, ...props }) => {
  const fontSize = StyleSheet.flatten(style)?.fontSize || 14; // Default font size if not specified
  const fontFamily = StyleSheet.flatten(style)?.fontFamily || "extraLight"; // Default font size if not specified
  const lineHeightMultiplier = 1.2;
  const calculatedStyle = {
    ...StyleSheet.flatten(style),
    lineHeight: Math.round(fontSize * lineHeightMultiplier),
    paddingBottom: Math.round(fontSize * 0.1), // Add a small bottom padding
    fontFamily: fontFamily,
  };
  return (
    <Text {...props} style={[styles.text, calculatedStyle]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    // Add some bottom padding to prevent clipping
    // Adjust line height to give more vertical space
    // lineHeight: "auto",
    // alignSelf: "stretch",
    // You might need to adjust these values based on your specific font and design
  },
});
