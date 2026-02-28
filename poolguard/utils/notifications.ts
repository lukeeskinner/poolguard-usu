import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { addAlert } from "./alertStore";

// Controls how notifications are shown when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerNotificationCategories() {
  try {
    await Notifications.setNotificationCategoryAsync("pool_alert", [
      {
        identifier: "CALL_911",
        buttonTitle: "Call 911",
        options: { isDestructive: true, opensAppToForeground: false },
      },
      {
        identifier: "VIEW_LIVE",
        buttonTitle: "View Live",
        options: { opensAppToForeground: true },
      },
      {
        identifier: "OK",
        buttonTitle: "OK",
        options: { isDestructive: false, opensAppToForeground: false },
      },
    ]);
  } catch (e) {
    console.log("Could not register notification categories:", e);
  }
}

export async function registerForPushNotifications(): Promise<
  string | undefined
> {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device.");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563EB",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission not granted for push notifications.");
    return;
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const token = (
      await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      )
    ).data;
    console.log("Expo Push Token:", token);
    return token;
  } catch (e) {
    console.log("Push token unavailable (run `npx eas init` to fix):", e);
    return;
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  addAlert({
    severity: "medium",
    title,
    description: body,
  });
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: true,
      categoryIdentifier: "pool_alert",
    },
    trigger: null,
  });
}

export function sendEmergencyNotification() {
  // Fires the in-app EmergencyAlertModal via the alert store (subscribeEmergency in _layout.tsx).
  // No system notification scheduled — the modal IS the alert when the app is open.
  addAlert({
    severity: "emergency",
    title: "🚨 Emergency: Possible Drowning Detected",
    description:
      "Emergency protocol initiated. Siren activated and emergency contacts notified.",
  });
}
