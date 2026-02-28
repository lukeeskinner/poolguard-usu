import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useEffect, useState } from "react";
import { subscribeAlerts, subscribeEmergency } from "@/utils/alertStore";

interface TabIconProps {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  label: string;
  badge?: number;
}

function TabIcon({ name, color, label, badge }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <View>
        <Ionicons name={name} size={24} color={color} />
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const unsubAlerts = subscribeAlerts(() => setAlertCount(prev => prev+1));
    const unsubEmeAlerts = subscribeEmergency(() => setAlertCount(prev => prev+1));
    return () => {
      unsubAlerts();
      unsubEmeAlerts();
    };
  }, []);
    
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon name="home-outline" color={color} label="HOME" />
          ),
          tabBarActiveTintColor: Colors.activeTab,
          tabBarInactiveTintColor: Colors.inactiveTab,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon
              name="notifications-outline"
              color={color}
              label="ALERTS"
              badge={alertCount}
            />
          ),
          tabBarActiveTintColor: Colors.activeTab,
          tabBarInactiveTintColor: Colors.inactiveTab,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon name="settings-outline" color={color} label="SETTINGS" />
          ),
          tabBarActiveTintColor: Colors.activeTab,
          tabBarInactiveTintColor: Colors.inactiveTab,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cameras"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarItem: {
    paddingVertical: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 80,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: Colors.alertBadge,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
});
