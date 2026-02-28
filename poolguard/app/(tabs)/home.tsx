import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/components/cameras/ScreenHeader";
import LiveFeedHeader from "@/components/cameras/LiveFeedHeader";
import CameraFeedCard from "@/components/cameras/CameraFeedCard";
import AddCameraButton from "@/components/cameras/AddCameraButton";
import AICoverageTip from "@/components/cameras/AICoverageTip";

// Update this to your server's local IP address (e.g. "http://192.168.1.42:5001")
const SERVER_URL = "https://vessel-foot-pot-sol.trycloudflare.com";

const CAMERAS = [
  {
    id: "1",
    name: "Camera 1",
    signal: "Excellent" as const, // THIS changes for the video
    resolution: "1080p",
    isLive: true,
    placeholderColor: "#4FA8C9",
    streamUrl: `${SERVER_URL}/snapshot`,
  },
  {
    id: "2",
    name: "Camera 2",
    signal: "Good" as const, // THIS changes for the video
    resolution: "1080p",
    isLive: true,
    placeholderColor: "#62C1D8",
  },
];

export default function CamerasScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedCamera = CAMERAS[selectedIndex];

  const goPrev = () =>
    setSelectedIndex((i) => (i - 1 + CAMERAS.length) % CAMERAS.length);
  const goNext = () => setSelectedIndex((i) => (i + 1) % CAMERAS.length);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <ScreenHeader
          title="PoolGuard AI"
          subtitle="Camera Management"
          showMiraLogo
        />
        <View style={styles.content}>
          <LiveFeedHeader
            activeCount={CAMERAS.filter((c) => c.isLive).length}
          />

          {/* Camera name above the feed */}
          <View style={styles.cameraNameRow}>
            <View style={styles.liveDot} />
            <Text style={styles.cameraName}>{selectedCamera.name}</Text>
            <Text style={styles.cameraCount}>
              {selectedIndex + 1} / {CAMERAS.length}
            </Text>
          </View>

          {/* Video feed */}
          <View style={styles.centerCard}>
            <CameraFeedCard
              key={selectedCamera.id}
              name={selectedCamera.name}
              signal={selectedCamera.signal}
              resolution={selectedCamera.resolution}
              isLive={selectedCamera.isLive}
              placeholderColor={selectedCamera.placeholderColor}
              streamUrl={selectedCamera.streamUrl}
            />
          </View>

          {/* Arrow navigation below the feed */}
          <View style={styles.navBar}>
            <TouchableOpacity
              style={[
                styles.navArrow,
                CAMERAS.length <= 1 && styles.navArrowDisabled,
              ]}
              onPress={goPrev}
              disabled={CAMERAS.length <= 1}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={
                  CAMERAS.length <= 1 ? Colors.textMuted : Colors.textPrimary
                }
              />
            </TouchableOpacity>

            {/* Dot indicators */}
            <View style={styles.dotRow}>
              {CAMERAS.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedIndex(i)}
                  style={[styles.dot, i === selectedIndex && styles.dotActive]}
                  activeOpacity={0.7}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.navArrow,
                CAMERAS.length <= 1 && styles.navArrowDisabled,
              ]}
              onPress={goNext}
              disabled={CAMERAS.length <= 1}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-forward"
                size={22}
                color={
                  CAMERAS.length <= 1 ? Colors.textMuted : Colors.textPrimary
                }
              />
            </TouchableOpacity>
          </View>

          <AddCameraButton />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  // Camera name row above the feed
  cameraNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.live,
  },
  cameraName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  cameraCount: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  centerCard: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 4,
  },
  // Arrow nav bar below the feed
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: Colors.tipBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navArrowDisabled: {
    opacity: 0.3,
  },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 22,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
