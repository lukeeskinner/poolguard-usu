import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import ScreenHeader from "@/components/cameras/ScreenHeader";
import LiveFeedHeader from "@/components/cameras/LiveFeedHeader";
import CameraFeedCard from "@/components/cameras/CameraFeedCard";
import AddCameraButton from "@/components/cameras/AddCameraButton";
import AICoverageTip from "@/components/cameras/AICoverageTip";

// Update this to your server's local IP address (e.g. "http://192.168.1.42:5001")
const SERVER_URL = "https://job-pal-approaches-compound.trycloudflare.com";

const CAMERAS = [
  {
    id: "1",
    name: "Deep End",
    signal: "Excellent" as const,
    resolution: "1080p",
    isLive: true,
    placeholderColor: "#4FA8C9",
    streamUrl: `${SERVER_URL}/snapshot`,
  },
  {
    id: "2",
    name: "Shallow End",
    signal: "Good" as const,
    resolution: "1080p",
    isLive: true,
    placeholderColor: "#62C1D8",
  },
];

export default function CamerasScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <ScreenHeader title="PoolGuard AI" subtitle="Camera Management" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LiveFeedHeader
            activeCount={CAMERAS.filter((c) => c.isLive).length}
          />
          {CAMERAS.map((camera) => (
            <CameraFeedCard
              key={camera.id}
              name={camera.name}
              signal={camera.signal}
              resolution={camera.resolution}
              isLive={camera.isLive}
              placeholderColor={camera.placeholderColor}
              streamUrl={camera.streamUrl}
            />
          ))}
          <AddCameraButton />
          <AICoverageTip tip="Add a third camera facing the patio entrance for 100% safety perimeter detection." />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
});
