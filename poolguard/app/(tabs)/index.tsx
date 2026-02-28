import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { sendLocalNotification } from "@/utils/notifications";

export default function DashboardScreen() {
  const handleTestNotification = async () => {
    await sendLocalNotification(
      "⚠️ PoolGuard Alert",
      "Motion detected near the deep end. Tap to review the live feed.",
      { screen: "home" }
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>PoolGuard AI</Text>

        <TouchableOpacity style={styles.button} onPress={handleTestNotification} activeOpacity={0.85}>
          <Ionicons name="notifications-outline" size={20} color={Colors.white} />
          <Text style={styles.buttonText}>Send Test Notification</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});

