import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import * as Contacts from "expo-contacts";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface EmergencyAlertModalProps {
  visible: boolean;
  onDismiss: () => void;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
}

export default function EmergencyAlertModal({
  visible,
  onDismiss,
}: EmergencyAlertModalProps) {
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePickContact = async () => {
    setLoading(true);
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      setLoading(false);
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });

    const filtered: Contact[] = data
      .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
      .map((c) => ({
        id: c.id ?? Math.random().toString(),
        name: c.name ?? "Unknown",
        phone: c.phoneNumbers![0].number ?? "",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setContacts(filtered);
    setLoading(false);
    setShowContacts(true);
  };

  const handleCallContact = (phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    Linking.openURL(`tel:${cleaned}`);
    setShowContacts(false);
  };

  return (
    <>
    {visible && (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.appIconWrapper}>
                <Text style={styles.appIconText}>✱</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.appName}>Mira</Text>
              </View>
              <Text style={styles.timestamp}>now</Text>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.title}>
                🚨 Emergency: Possible Drowning Detected
              </Text>
              <Text style={styles.message}>
                Emergency protocol initiated. Siren activated and emergency
                contacts notified.
              </Text>
            </View>

            {/* Contact Picker */}
            {showContacts && (
              <View style={styles.contactList}>
                <View style={styles.contactListHeader}>
                  <Text style={styles.contactListTitle}>Select a contact</Text>
                  <TouchableOpacity onPress={() => setShowContacts(false)}>
                    <Ionicons name="close" size={20} color="#6B6B6B" />
                  </TouchableOpacity>
                </View>
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.primary}
                    style={{ padding: 16 }}
                  />
                ) : (
                  <FlatList
                    data={contacts}
                    keyExtractor={(item) => item.id}
                    style={styles.flatList}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.contactRow}
                        onPress={() => handleCallContact(item.phone)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.contactAvatar}>
                          <Text style={styles.contactInitial}>
                            {item.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.contactName}>{item.name}</Text>
                          <Text style={styles.contactPhone}>{item.phone}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            )}

            {/* Action Buttons */}
            {!showContacts && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.emergencyButton}
                  onPress={handlePickContact}
                  activeOpacity={0.85}
                >
                  <Ionicons name="call" size={16} color="#fff" />
                  <Text style={styles.emergencyText}>
                    Call Emergency Contact
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={onDismiss}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryText}>OK</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 12,
  },
  card: {
    width: "100%",
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 10,
  },
  appIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
  },
  appIconText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  headerText: { flex: 1 },
  appName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B6B6B",
    letterSpacing: 0.3,
  },
  timestamp: { fontSize: 12, color: "#6B6B6B" },
  body: { paddingHorizontal: 16, paddingBottom: 14 },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    lineHeight: 21,
  },
  message: { fontSize: 14, color: "#3C3C43", lineHeight: 20 },
  contactList: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.12)",
    maxHeight: 260,
  },
  contactListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  contactListTitle: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  flatList: { maxHeight: 210 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInitial: { color: "#fff", fontWeight: "700", fontSize: 15 },
  contactName: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  contactPhone: { fontSize: 12, color: "#6B6B6B", marginTop: 1 },
  actions: {
    flexDirection: "column",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.12)",
  },
  emergencyButton: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  emergencyText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  secondaryRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.12)",
  },
  secondaryDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  rightActions: {
    flex: 1,
    flexDirection: "column",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(0,0,0,0.12)",
  },
  secondaryButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E5EA",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.12)",
  },
  okButton: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.12)",
  },
  secondaryText: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
});
