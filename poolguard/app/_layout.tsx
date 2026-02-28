import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotifications,
  registerNotificationCategories,
} from "@/utils/notifications";
import EmergencyAlertModal from "@/components/EmergencyAlertModal";
import { io, Socket } from "socket.io-client";
import { subscribeEmergency } from "@/utils/alertStore";

const SERVER_URL = "https://navigate-funky-roads-salad.trycloudflare.com";

export default function RootLayout() {
  const router = useRouter();
  const [alertVisible, setAlertVisible] = useState(false);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const ALERT_COOLDOWN_MS = 60_000; // 1 minute between drowning alerts

  useEffect(() => {
    registerForPushNotifications();
    registerNotificationCategories();

    const unsubEmergency = subscribeEmergency(() => setAlertVisible(true));

    // Handle notification action buttons tapped from system tray
    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // No-op: in-app modal is handled by subscribeEmergency in alertStore
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const actionId = response.actionIdentifier;
        if (actionId === "VIEW_LIVE") {
          router.push("/(tabs)/home");
        }
      });

    // Connect to the backend socket and listen for risk level changes
    const socket = io(SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("risk_change", (data: { previous: string; current: string }) => {
      if (data.current === "high") {
        const now = Date.now();
        if (now - lastAlertTimeRef.current >= ALERT_COOLDOWN_MS) {
          lastAlertTimeRef.current = now;
          setAlertVisible(true);
        }
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      socket.disconnect();
      unsubEmergency();
    };
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <EmergencyAlertModal
        visible={alertVisible}
        onDismiss={() => setAlertVisible(false)}
      />
    </>
  );
}
