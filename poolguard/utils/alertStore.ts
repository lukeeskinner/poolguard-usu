export type AlertSeverity = "emergency" | "high" | "medium" | "system";

export interface AppAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  time: string;
  description: string;
}

type Listener = () => void;

let alerts: AppAlert[] = [];
const listeners = new Set<Listener>();

export function getAlerts(): AppAlert[] {
  return alerts;
}

export function addAlert(alert: Omit<AppAlert, "id" | "time">) {
  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const newAlert: AppAlert = {
    id: `${Date.now()}`,
    time,
    ...alert,
  };
  alerts = [newAlert, ...alerts];
  listeners.forEach((l) => l());
}

export function clearAlerts() {
  alerts = [];
  listeners.forEach((l) => l());
}

export function subscribeAlerts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
