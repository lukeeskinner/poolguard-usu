import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Contacts from "expo-contacts";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export default function EmergencyContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: "1",
      name: "John Doe",
      phone: "+1 (555) 123-4567",
      relationship: "Spouse",
      isPrimary: true,
    },
    {
      id: "2",
      name: "Jane Smith",
      phone: "+1 (555) 987-6543",
      relationship: "Neighbor",
      isPrimary: false,
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelationship, setNewRelationship] = useState("");

  const handlePickFromContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant access to your contacts to use this feature.",
        );
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      if (data.length > 0) {
        // For now, we'll show the manual form with the option to pick
        // In a full implementation, you'd show a contact picker UI
        setIsAdding(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to access contacts");
    }
  };

  const handleImportContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant access to your contacts to use this feature.",
        );
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      if (data.length > 0) {
        // Get a random contact as example (in production, you'd show a picker)
        // For now, pre-fill the form with contact data if available
        Alert.alert(
          "Import Contact",
          "Contact picker will open. For now, please enter details manually.",
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to import contact");
    }
  };

  const handleAddContact = () => {
    setIsAdding(true);
  };

  const handleSaveContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert("Error", "Please enter a name and phone number");
      return;
    }

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      relationship: newRelationship.trim() || "Contact",
      isPrimary: contacts.length === 0,
    };

    setContacts([...contacts, newContact]);

    setNewName("");
    setNewPhone("");
    setNewRelationship("");
    setIsAdding(false);
  };

  const handleCancelAdd = () => {
    setNewName("");
    setNewPhone("");
    setNewRelationship("");
    setIsAdding(false);
  };

  const handleDeleteContact = (id: string) => {
    const contactToDelete = contacts.find((c) => c.id === id);
    const wasPrimary = contactToDelete?.isPrimary;

    Alert.alert(
      "Delete Contact",
      "Are you sure you want to remove this emergency contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedContacts = contacts.filter((c) => c.id !== id);

            // If we deleted the primary contact, make the first remaining contact primary
            if (wasPrimary && updatedContacts.length > 0) {
              updatedContacts[0].isPrimary = true;
            }

            setContacts(updatedContacts);
          },
        },
      ],
    );
  };

  const handleSetPrimary = (id: string) => {
    setContacts(
      contacts.map((c) => ({
        ...c,
        isPrimary: c.id === id,
      })),
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.infoText}>
            These contacts will be notified immediately when a critical alert is
            detected. Primary contact will be called first.
          </Text>
        </View>

        {/* Emergency Services Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMERGENCY SERVICES</Text>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyLeft}>
              <View style={styles.emergencyIconContainer}>
                <Ionicons name="call" size={24} color="#DC2626" />
              </View>
              <View style={styles.emergencyText}>
                <Text style={styles.emergencyTitle}>Auto-Call 911</Text>
                <Text style={styles.emergencySubtitle}>
                  Automatically call emergency services for drowning alerts
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contacts List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>YOUR CONTACTS</Text>
            <Text style={styles.contactCount}>
              {contacts.length} {contacts.length === 1 ? "Contact" : "Contacts"}
            </Text>
          </View>

          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactLeft}>
                <View
                  style={[
                    styles.contactAvatar,
                    contact.isPrimary && styles.contactAvatarPrimary,
                  ]}
                >
                  <Text style={styles.contactInitial}>
                    {contact.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <View style={styles.contactNameRow}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  <Text style={styles.contactRelationship}>
                    {contact.relationship}
                  </Text>
                </View>
              </View>
              <View style={styles.contactActions}>
                {!contact.isPrimary && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetPrimary(contact.id)}
                  >
                    <Ionicons name="star-outline" size={20} color="#6B7280" />
                  </TouchableOpacity>
                )}
                {contact.isPrimary && (
                  <View style={styles.actionButton}>
                    <Ionicons name="star" size={20} color="#F59E0B" />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteContact(contact.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add Contact Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
            <Ionicons name="add-circle" size={24} color="#3B82F6" />
            <Text style={styles.addButtonText}>Add Emergency Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATION METHOD</Text>
          <View style={styles.notificationCard}>
            <TouchableOpacity style={styles.notificationOption}>
              <View style={styles.notificationLeft}>
                <Ionicons name="call-outline" size={20} color="#3B82F6" />
                <Text style={styles.notificationText}>Phone Call</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationOption}>
              <View style={styles.notificationLeft}>
                <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
                <Text style={styles.notificationText}>SMS Text</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationOption}>
              <View style={styles.notificationLeft}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#3B82F6"
                />
                <Text style={styles.notificationText}>Push Notification</Text>
              </View>
              <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Response Time Info */}
        <View style={styles.responseCard}>
          <Ionicons name="time-outline" size={20} color="#6B7280" />
          <Text style={styles.responseText}>
            Contacts are notified within{" "}
            <Text style={styles.responseBold}>2 seconds</Text> of alert
            detection
          </Text>
        </View>
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal
        visible={isAdding}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelAdd}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCancelAdd}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Emergency Contact</Text>
              <TouchableOpacity onPress={handleCancelAdd}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Import from Contacts Button */}
              <TouchableOpacity
                style={styles.importButton}
                onPress={handleImportContact}
              >
                <Ionicons name="person-add-outline" size={20} color="#3B82F6" />
                <Text style={styles.importButtonText}>
                  Import from Contacts
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                  value={newName}
                  onChangeText={setNewName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor="#9CA3AF"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Relationship</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Spouse, Neighbor, Friend"
                  placeholderTextColor="#9CA3AF"
                  value={newRelationship}
                  onChangeText={setNewRelationship}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.formInfo}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#6B7280"
                />
                <Text style={styles.formInfoText}>
                  {contacts.length === 0
                    ? "This will be your primary contact."
                    : "You can set this as primary contact after adding."}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelAdd}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveContact}
              >
                <Text style={styles.saveButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  infoIconContainer: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  contactCount: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  emergencyCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  emergencyLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  emergencyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
  },
  contactCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactLeft: {
    flexDirection: "row",
    flex: 1,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactAvatarPrimary: {
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  contactInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginRight: 8,
  },
  primaryBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#92400E",
    letterSpacing: 0.5,
  },
  contactPhone: {
    fontSize: 15,
    color: "#3B82F6",
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 14,
    color: "#6B7280",
  },
  contactActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 8,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  notificationOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  notificationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  responseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  responseText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    flex: 1,
  },
  responseBold: {
    fontWeight: "700",
    color: "#374151",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalForm: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3B82F6",
    marginBottom: 20,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    paddingHorizontal: 12,
    letterSpacing: 0.5,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  formInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  formInfoText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: Colors.white,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
});
