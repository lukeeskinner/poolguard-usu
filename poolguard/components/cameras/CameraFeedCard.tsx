import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface CameraFeedCardProps {
  name: string;
  signal: "Excellent" | "Good" | "Poor";
  resolution: string;
  isLive: boolean;
  placeholderColor: string;
}

export default function CameraFeedCard({
  name,
  signal,
  resolution,
  isLive,
  placeholderColor,
}: CameraFeedCardProps) {
  const signalColor =
    signal === "Excellent"
      ? Colors.signalExcellent
      : signal === "Good"
        ? Colors.signalGood
        : Colors.alertBadge;

  return (
    <View style={styles.card}>
      {/* Feed Preview Placeholder */}
      <View style={[styles.feedPreview, { backgroundColor: placeholderColor }]}>
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <View style={styles.signalIcon}>
          <Ionicons name="cellular" size={18} color="rgba(255,255,255,0.85)" />
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.cameraName}>{name}</Text>
          <View style={styles.metaRow}>
            <View
              style={[styles.signalDot, { backgroundColor: signalColor }]}
            />
            <Text style={styles.metaText}>
              Signal: {signal} • {resolution}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  feedPreview: {
    height: 190,
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.live,
  },
  liveText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  signalIcon: {
    alignSelf: "flex-end",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  footerLeft: {
    flex: 1,
  },
  cameraName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  signalDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "400",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
});
