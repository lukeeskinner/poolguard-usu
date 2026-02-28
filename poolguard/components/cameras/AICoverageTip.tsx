import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface AICoverageTipProps {
  tip: string;
}

export default function AICoverageTip({ tip }: AICoverageTipProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons
          name="information-circle-outline"
          size={22}
          color={Colors.tipIcon}
        />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>AI Coverage Tip</Text>
        <Text style={styles.body}>{tip}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.tipBackground,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  iconWrapper: {
    marginTop: 1,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    fontWeight: "400",
  },
});
