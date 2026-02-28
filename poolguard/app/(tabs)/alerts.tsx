import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

type AlertSeverity = "emergency" | "high" | "medium" | "system";
type FilterType = "all" | "highRisk" | "emergency";

interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  time: string;
  description: string;
  action?: string;
  actionIcon?: string;
  image?: any;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    severity: "emergency",
    title: "Emergency",
    time: "10:42 AM",
    description:
      "Drowning risk detected in deep end.\nImmediate action required.",
    action: "View Live",
    actionIcon: "call",
    image: require("@/assets/images/react-logo.png"), // Placeholder
  },
  {
    id: "2",
    severity: "medium",
    title: "Movement Alert",
    time: "09:15 AM",
    description: "Movement detected near edge.",
    action: "Review Clip",
    image: require("@/assets/images/react-logo.png"), // Placeholder
  },
  {
    id: "3",
    severity: "system",
    title: "Scheduled Check",
    time: "08:00 AM",
    description: "AI system diagnostic complete. All sensors operational.",
  },
  {
    id: "4",
    severity: "medium",
    title: "Fence Gate Opened",
    time: "07:22 AM",
    description: "Safety gate unlatched at north entrance.",
    action: "Check Gate",
    image: require("@/assets/images/react-logo.png"), // Placeholder
  },
];

export default function AlertsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const getFilteredAlerts = () => {
    if (activeFilter === "all") return mockAlerts;
    if (activeFilter === "emergency")
      return mockAlerts.filter((a) => a.severity === "emergency");
    if (activeFilter === "highRisk")
      return mockAlerts.filter(
        (a) => a.severity === "emergency" || a.severity === "high",
      );
    return mockAlerts;
  };

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

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Alert History</Text>
          <Text style={styles.headerSubtitle}>PoolGuard AI • Home Pool</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "all" && styles.filterTabActive,
          ]}
          onPress={() => setActiveFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "highRisk" && styles.filterTabActive,
          ]}
          onPress={() => setActiveFilter("highRisk")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "highRisk" && styles.filterTextActive,
            ]}
          >
            High Risk
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "emergency" && styles.filterTabActive,
          ]}
          onPress={() => setActiveFilter("emergency")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "emergency" && styles.filterTextActive,
            ]}
          >
            Emergency
          </Text>
        </TouchableOpacity>
      </View>

      {/* Alerts List */}
      <ScrollView style={styles.scrollView}>
        {getFilteredAlerts().map((alert) => (
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
                {alert.time} — {alert.description.split("\n")[0]}
              </Text>
              {alert.description.includes("\n") && (
                <Text style={styles.alertDescription}>
                  {alert.description.split("\n")[1]}
                </Text>
              )}
              {alert.action && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    alert.severity === "emergency" && styles.actionButtonRed,
                    alert.severity === "medium" && styles.actionButtonYellow,
                  ]}
                >
                  {alert.actionIcon === "call" && (
                    <Ionicons
                      name="call"
                      size={16}
                      color="#fff"
                      style={styles.actionButtonIcon}
                    />
                  )}
                  {alert.action === "Review Clip" && (
                    <Ionicons
                      name="play-circle-outline"
                      size={16}
                      color="#92400E"
                      style={styles.actionButtonIcon}
                    />
                  )}
                  {alert.action === "Check Gate" && (
                    <Ionicons
                      name="eye-outline"
                      size={16}
                      color="#92400E"
                      style={styles.actionButtonIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.actionButtonText,
                      alert.severity === "emergency" &&
                        styles.actionButtonTextWhite,
                      alert.severity === "medium" &&
                        styles.actionButtonTextDark,
                    ]}
                  >
                    {alert.action}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {alert.image && (
              <Image source={alert.image} style={styles.alertImage} />
            )}
            {!alert.image && alert.severity === "system" && (
              <View style={styles.systemIconContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={40}
                  color="#9CA3AF"
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
    color: "#6B7280",
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  filterTabActive: {
    backgroundColor: "#EFF6FF",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#2563EB",
  },
  scrollView: {
    flex: 1,
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    color: "#6B7280",
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 14,
    color: "#6B7280",
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
    backgroundColor: "#FEF3C7",
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionButtonTextWhite: {
    color: "#FFFFFF",
  },
  actionButtonTextDark: {
    color: "#92400E",
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
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
});
