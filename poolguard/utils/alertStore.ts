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
const emergencyListeners = new Set<Listener>();

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
  

  // If it's an emergency, fire emergency listeners too
  if (alert.severity === "emergency") {
    emergencyListeners.forEach((l) => l());
  }
  else
  {
    listeners.forEach((l) => l());
  }
}

export function clearAlerts() {
  alerts = [];
  listeners.forEach((l) => l());
}

export function subscribeAlerts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function subscribeEmergency(listener: Listener): () => void {
  emergencyListeners.add(listener);
  return () => emergencyListeners.delete(listener);
}
