import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import ScreenHeader from "@/components/cameras/ScreenHeader";
import LiveFeedHeader from "@/components/cameras/LiveFeedHeader";
import CameraFeedCard from "@/components/cameras/CameraFeedCard";
import AddCameraButton from "@/components/cameras/AddCameraButton";
import AICoverageTip from "@/components/cameras/AICoverageTip";

// Update this to your server's local IP address (e.g. "http://192.168.1.42:5001")
const SERVER_URL = "https://navigate-funky-roads-salad.trycloudflare.com";

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
  const [selectedCameraId, setSelectedCameraId] = useState(CAMERAS[0].id);
  const selectedCamera =
    CAMERAS.find((camera) => camera.id === selectedCameraId) ?? CAMERAS[0];

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

          <View style={styles.videoTabs}>
            {CAMERAS.map((camera) => {
              const isActive = camera.id === selectedCamera.id;
              return (
                <TouchableOpacity
                  key={camera.id}
                  style={[styles.videoTab, isActive && styles.videoTabActive]}
                  onPress={() => setSelectedCameraId(camera.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.videoTabText,
                      isActive && styles.videoTabTextActive,
                    ]}
                  >
                    {camera.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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
  videoTabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: Colors.tipBackground,
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  videoTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 10,
  },
  videoTabActive: {
    backgroundColor: Colors.primary,
  },
  videoTabText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  videoTabTextActive: {
    color: Colors.white,
  },
  centerCard: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 12,
  },
});
