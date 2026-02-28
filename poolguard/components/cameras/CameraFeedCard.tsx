import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { subscribeEmergency } from "@/utils/alertStore";
import EmergencyAlertModal from "@/components/EmergencyAlertModal";

interface CameraFeedCardProps {
  name: string;
  signal: "Excellent" | "Good" | "Poor";
  resolution: string;
  isLive: boolean;
  placeholderColor: string;
  streamUrl?: string;
}

const FRAME_DELAY_MS = 100; // ~10 fps — 1.5× faster playback
const STATUS_POLL_MS = 1000;
type RiskStatus = "low" | "medium" | "danger" | "unknown";

export default function CameraFeedCard({
  name,
  signal,
  resolution,
  isLive,
  placeholderColor,
  streamUrl,
}: CameraFeedCardProps) {
  const insets = useSafeAreaInsets();
  // shownUri: the last fully-loaded frame — always visible, never flashes
  const [shownUri, setShownUri] = useState<string | null>(null);
  // loadingUri: the next frame loading silently in the background
  const [loadingUri, setLoadingUri] = useState<string | null>(null);
  const [riskStatus, setRiskStatus] = useState<RiskStatus>("unknown");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsAlertVisible, setFsAlertVisible] = useState(false);
  const isFullscreenRef = useRef(false);

  // Keep ref in sync; clear alert overlay when leaving fullscreen
  useEffect(() => {
    isFullscreenRef.current = isFullscreen;
    if (!isFullscreen) setFsAlertVisible(false);
  }, [isFullscreen]);

  // Only show the alert when the user is already in fullscreen
  useEffect(() => {
    return subscribeEmergency(() => {
      setTimeout(() => {
        // Re-check ref at the moment the timer fires — user may have exited fullscreen
        if (isFullscreenRef.current) {
          setFsAlertVisible(true);
        }
      }, 1000);
    });
  }, []);

  const activeRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    if (!streamUrl) {
      setRiskStatus("unknown");
      return;
    }

    const analysisUrl = streamUrl.replace("/snapshot", "/analysis");
    let cancelled = false;

    const pullStatus = async () => {
      try {
        const response = await fetch(`${analysisUrl}?t=${Date.now()}`);
        if (!response.ok) return;
        const data = (await response.json()) as { warningLevel?: number };
        if (cancelled || typeof data.warningLevel !== "number") return;

        if (data.warningLevel === 0) setRiskStatus("low");
        else if (data.warningLevel === 1) setRiskStatus("medium");
        else if (data.warningLevel === 2) {
          setRiskStatus("danger");
        }
      } catch {
        // Keep last status if polling fails briefly.
      }
    };

    pullStatus();
    statusTimerRef.current = setInterval(pullStatus, STATUS_POLL_MS);

    return () => {
      cancelled = true;
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
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

  const renderPreview = (fullscreen: boolean) => {
    const overlayTopInset = fullscreen ? insets.top + 8 : 0;

    return (
      <View
        style={[
          styles.feedPreview,
          fullscreen && styles.feedPreviewFullscreen,
          { backgroundColor: fullscreen ? "#000000" : placeholderColor },
        ]}
      >
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

        <View style={[styles.leftOverlay, { marginTop: overlayTopInset }]}>
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          {riskStatus !== "unknown" && (
            <View
              style={[
                styles.statusBadge,
                riskStatus === "low" && styles.statusBadgeLow,
                riskStatus === "medium" && styles.statusBadgeMedium,
                riskStatus === "danger" && styles.statusBadgeDanger,
              ]}
            >
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {riskStatus === "low" && "LOW RISK"}
                {riskStatus === "medium" && "MEDIUM RISK"}
                {riskStatus === "danger" && "DANGER"}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.signalIcon, { marginTop: overlayTopInset }]}>
          <Ionicons name="cellular" size={18} color="rgba(255,255,255,0.85)" />
        </View>

        {fullscreen && (
          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 8 }]}
            onPress={() => setIsFullscreen(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => setIsFullscreen(true)}
        >
          {renderPreview(false)}
        </TouchableOpacity>

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
            <Ionicons
              name="settings-outline"
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isFullscreen && (
        <Modal
          visible={isFullscreen}
          animationType="fade"
          transparent
          onRequestClose={() => setIsFullscreen(false)}
        >
          <View style={styles.fullscreenBackdrop}>{renderPreview(true)}</View>
          <EmergencyAlertModal
            visible={fsAlertVisible}
            onDismiss={() => setFsAlertVisible(false)}
          />
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
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
  feedPreviewFullscreen: {
    flex: 1,
    height: undefined,
    paddingTop: 12,
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
  leftOverlay: {
    alignItems: "flex-start",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    marginTop: 8,
  },
  statusBadgeLow: {
    backgroundColor: "rgba(22, 163, 74, 0.9)",
  },
  statusBadgeMedium: {
    backgroundColor: "rgba(234, 179, 8, 0.9)",
  },
  statusBadgeDanger: {
    backgroundColor: "rgba(220, 38, 38, 0.9)",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  statusText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  signalIcon: {
    alignSelf: "flex-end",
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
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
  fullscreenBackdrop: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
