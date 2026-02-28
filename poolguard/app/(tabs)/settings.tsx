import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface SettingItemProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  showChevron?: boolean;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  isDestructive?: boolean;
}

function SettingItem({
  icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  showChevron = false,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
  isDestructive = false,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      activeOpacity={showToggle ? 1 : 0.7}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconBgColor || "#EFF6FF" },
            isDestructive && styles.iconContainerDestructive,
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={iconColor || (isDestructive ? "#DC2626" : Colors.primary)}
          />
        </View>
        <View style={styles.settingText}>
          <Text
            style={[
              styles.settingTitle,
              isDestructive && styles.settingTitleDestructive,
            ]}
          >
            {title}
          </Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={Colors.border}
        />
      )}
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [autoCall911, setAutoCall911] = useState(false);
  const [notifyEmergencyContacts, setNotifyEmergencyContacts] = useState(true);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        <SettingSection title="NOTIFICATIONS">
          <SettingItem
            icon="notifications-outline"
            iconColor="#3B82F6"
            iconBgColor="#EFF6FF"
            title="Push Notifications"
            showToggle
            toggleValue={pushNotifications}
            onToggleChange={setPushNotifications}
          />
          <SettingItem
            icon="alert-circle-outline"
            iconColor="#DC2626"
            iconBgColor="#FEE2E2"
            title="Critical Alerts"
            showToggle
            toggleValue={criticalAlerts}
            onToggleChange={setCriticalAlerts}
          />
        </SettingSection>

        <SettingSection title="EMERGENCY ESCALATION">
          <SettingItem
            icon="medical-outline"
            iconColor="#DC2626"
            iconBgColor="#FEE2E2"
            title="Auto-Call Emergency Services (911)"
            showToggle
            toggleValue={autoCall911}
            onToggleChange={setAutoCall911}
          />
          <SettingItem
            icon="people-outline"
            iconColor="#EA580C"
            iconBgColor="#FFF7ED"
            title="Notify Emergency Contacts"
            showToggle
            toggleValue={notifyEmergencyContacts}
            onToggleChange={setNotifyEmergencyContacts}
          />
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/(tabs)/emergency")}
          >
            <Text style={styles.linkButtonText}>Manage Emergency Contacts</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </SettingSection>

        <SettingSection title="CAMERA SETTINGS">
          <SettingItem
            icon="videocam-outline"
            iconColor="#3B82F6"
            iconBgColor="#EFF6FF"
            title="Camera Management"
            subtitle="Add or remove cameras"
            showChevron
          />
          <SettingItem
            icon="settings-outline"
            iconColor="#6B7280"
            iconBgColor="#F3F4F6"
            title="Recording Settings"
            subtitle="Configure recording options"
            showChevron
          />
          <SettingItem
            icon="cloud-outline"
            iconColor="#3B82F6"
            iconBgColor="#EFF6FF"
            title="Cloud Storage"
            subtitle="15 GB of 50 GB used"
            showChevron
          />
        </SettingSection>

        <SettingSection title="AI CONFIGURATION">
          <SettingItem
            icon="analytics-outline"
            iconColor="#8B5CF6"
            iconBgColor="#F5F3FF"
            title="Detection Sensitivity"
            subtitle="Adjust AI sensitivity levels"
            showChevron
          />
          <SettingItem
            icon="eye-outline"
            iconColor="#10B981"
            iconBgColor="#ECFDF5"
            title="Coverage Zones"
            subtitle="Define monitoring zones"
            showChevron
          />
          <SettingItem
            icon="time-outline"
            iconColor="#F59E0B"
            iconBgColor="#FEF3C7"
            title="Monitoring Schedule"
            subtitle="Set active monitoring hours"
            showChevron
          />
        </SettingSection>

        <SettingSection title="ACCOUNT">
          <SettingItem
            icon="person-outline"
            iconColor="#6B7280"
            iconBgColor="#F3F4F6"
            title="Profile"
            subtitle="Manage your account details"
            showChevron
          />
          <SettingItem
            icon="shield-checkmark-outline"
            iconColor="#10B981"
            iconBgColor="#ECFDF5"
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            showChevron
          />
          <SettingItem
            icon="card-outline"
            iconColor="#3B82F6"
            iconBgColor="#EFF6FF"
            title="Subscription"
            subtitle="Premium Plan • Active"
            showChevron
          />
        </SettingSection>

        <SettingSection title="SUPPORT">
          <SettingItem
            icon="help-circle-outline"
            iconColor="#6B7280"
            iconBgColor="#F3F4F6"
            title="Help Center"
            subtitle="FAQs and guides"
            showChevron
          />
          <SettingItem
            icon="chatbubble-outline"
            iconColor="#3B82F6"
            iconBgColor="#EFF6FF"
            title="Contact Support"
            subtitle="Get help from our team"
            showChevron
          />
          <SettingItem
            icon="document-text-outline"
            iconColor="#6B7280"
            iconBgColor="#F3F4F6"
            title="Terms & Privacy"
            subtitle="Legal information"
            showChevron
          />
        </SettingSection>

        <SettingSection title="ADVANCED">
          <SettingItem
            icon="log-out-outline"
            iconColor="#DC2626"
            iconBgColor="#FEE2E2"
            title="Sign Out"
            isDestructive
          />
        </SettingSection>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Mira</Text>
          <Text style={styles.versionText}>Version 1.0.0 (Build 100)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.tipBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainerDestructive: {
    backgroundColor: "#3D1010",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  settingTitleDestructive: {
    color: "#EF4444",
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.cardBackground,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
