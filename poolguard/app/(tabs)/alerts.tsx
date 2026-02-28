import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import {
  getAlerts,
  subscribeAlerts,
  subscribeEmergency,
  type AlertSeverity,
  type AppAlert,
} from "@/utils/alertStore";

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AppAlert[]>(getAlerts);

  useEffect(() => {
    const unsubAlerts = subscribeAlerts(() => setAlerts([...getAlerts()]));
    const unsubEmeAlerts = subscribeEmergency(() => setAlerts([...getAlerts()]));
    return () => {
      unsubAlerts();
      unsubEmeAlerts();
    };
  }, []);

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "emergency":
        return "#DC2626";
      case "high":
        return "#DC2626";
      case "medium":
        return "#EA580C";
      case "system":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getSeverityLabel = (severity: AlertSeverity) => {
    switch (severity) {
      case "emergency":
        return "HIGH SEVERITY";
      case "high":
        return "HIGH SEVERITY";
      case "medium":
        return "MEDIUM SEVERITY";
      case "system":
        return "SYSTEM NOTIFICATION";
      default:
        return "";
    }
  };

  const filtered = alerts;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerButton} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Alert History</Text>
          <Text style={styles.headerSubtitle}>Mira • Home Pool</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      {/* Test Notification Button */}
      <TouchableOpacity
        style={styles.testButton}
        // onPress={}
        activeOpacity={0.8}
      >
        <Ionicons
          name="warning"
          size={18}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.testButtonText}>Send Test Emergency Alert</Text>
      </TouchableOpacity>

      {/* Alerts List */}
      <ScrollView style={styles.scrollView}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="shield-checkmark-outline"
              size={48}
              color="#9CA3AF"
            />
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptySubtitle}>
              Alerts will appear here when Mira detects activity.
            </Text>
          </View>
        ) : (
          filtered.map((alert: AppAlert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertContent}>
                <Text
                  style={[
                    styles.severityLabel,
                    { color: getSeverityColor(alert.severity) },
                  ]}
                >
                  {getSeverityLabel(alert.severity)}
                </Text>
                <View style={styles.alertHeader}>
                  {alert.severity === "emergency" && (
                    <View style={styles.emergencyIcon}>
                      <Ionicons name="warning" size={16} color="#DC2626" />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.alertTitle,
                      { color: getSeverityColor(alert.severity) },
                    ]}
                  >
                    {alert.title}
                  </Text>
                </View>
                <Text style={styles.alertTime}>
                  {alert.time} — {alert.description}
                </Text>
              </View>
              {alert.severity === "system" && (
                <View style={styles.systemIconContainer}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={40}
                    color="#9CA3AF"
                  />
                </View>
              )}
              {alert.severity === "emergency" && (
                <View style={styles.systemIconContainer}>
                  <Ionicons name="warning" size={40} color="#DC2626" />
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
    marginRight: 12,
  },
  severityLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  emergencyIcon: {
    marginRight: 6,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  alertTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonRed: {
    backgroundColor: "#DC2626",
  },
  actionButtonYellow: {
    backgroundColor: "#7A3B00",
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  actionButtonTextWhite: {
    color: "#FFFFFF",
  },
  actionButtonTextDark: {
    color: "#FCD34D",
  },
  alertImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  systemIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.tipBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
