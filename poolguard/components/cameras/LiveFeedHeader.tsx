import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface LiveFeedHeaderProps {
  activeCount: number;
}

export default function LiveFeedHeader({ activeCount }: LiveFeedHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Feeds</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{activeCount} Active</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
});
