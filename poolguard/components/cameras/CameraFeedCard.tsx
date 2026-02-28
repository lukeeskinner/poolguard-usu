import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface CameraFeedCardProps {
  name: string;
  signal: "Excellent" | "Good" | "Poor";
  resolution: string;
  isLive: boolean;
  placeholderColor: string;
  streamUrl?: string;
}

const FRAME_DELAY_MS = 150; // ~6 fps — smooth without tearing

export default function CameraFeedCard({
  name,
  signal,
  resolution,
  isLive,
  placeholderColor,
  streamUrl,
}: CameraFeedCardProps) {
  // shownUri: the last fully-loaded frame — always visible, never flashes
  const [shownUri, setShownUri] = useState<string | null>(null);
  // loadingUri: the next frame loading silently in the background
  const [loadingUri, setLoadingUri] = useState<string | null>(null);

  const activeRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueNext = useCallback(() => {
    if (!activeRef.current || !streamUrl) return;
    timerRef.current = setTimeout(() => {
      if (activeRef.current && streamUrl) {
        setLoadingUri(`${streamUrl}?t=${Date.now()}`);
      }
    }, FRAME_DELAY_MS);
  }, [streamUrl]);

  useEffect(() => {
    if (!streamUrl) return;
    activeRef.current = true;
    // kick off the first frame
    setLoadingUri(`${streamUrl}?t=${Date.now()}`);
    return () => {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [streamUrl]);

  // Called when the hidden loading image finishes — promote it to shown
  const onFrameReady = useCallback(() => {
    setShownUri(loadingUri);
    queueNext();
  }, [loadingUri, queueNext]);

  // On error just retry after a short delay
  const onFrameError = useCallback(() => {
    queueNext();
  }, [queueNext]);

  const signalColor =
    signal === "Excellent"
      ? Colors.signalExcellent
      : signal === "Good"
        ? Colors.signalGood
        : Colors.alertBadge;

  return (
    <View style={styles.card}>
      {/* Feed Preview */}
      <View style={[styles.feedPreview, { backgroundColor: placeholderColor }]}>

        {/* Layer 1: last good frame — always visible, never re-fetches */}
        {shownUri && (
          <Image
            source={{ uri: shownUri }}
            style={StyleSheet.absoluteFillObject}
            contentFit="contain"
            cachePolicy="memory"
          />
        )}

        {/* Layer 2: next frame loading silently behind the scenes */}
        {loadingUri && (
          <Image
            source={{ uri: loadingUri }}
            style={[StyleSheet.absoluteFillObject, { opacity: 0 }]}
            contentFit="contain"
            cachePolicy="memory"
            onLoad={onFrameReady}
            onError={onFrameError}
          />
        )}

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
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
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
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
});