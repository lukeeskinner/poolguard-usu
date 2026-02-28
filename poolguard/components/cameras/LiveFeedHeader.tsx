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
        <View style={styles.dot} />
        <Text style={styles.badgeText}>{activeCount} ONLINE</Text>
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
    textAlign: "center",
    justifyContent:"center",

  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.tipBackground,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.live,
  },
});
