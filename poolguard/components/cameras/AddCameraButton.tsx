import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  View,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const BRANDS = [
  "Axis",
  "Hikvision",
  "Dahua",
  "Reolink",
  "Amcrest",
  "Nest",
  "Arlo",
  "Other",
];

export default function AddCameraButton() {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [location, setLocation] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const onClose = () => {
    setModalVisible(false);
    setName("");
    setIp("");
    setLocation("");
    setSelectedBrand("");
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={22} color={Colors.white} />
        <Text style={styles.text}>Add New Camera</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          {/* Tappable backdrop */}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheetWrapper}
          >
            <View style={styles.sheet}>
              {/* Handle bar */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <Ionicons name="videocam" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle}>Add New Camera</Text>
                  <Text style={styles.headerSubtitle}>
                    Enter your camera details below
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.form}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Camera Name */}
                <Text style={styles.label}>Camera Name</Text>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="camera-outline"
                    size={18}
                    color={Colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Pool South-West"
                    placeholderTextColor={Colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    selectionColor={Colors.primary}
                  />
                </View>

                {/* IP Address */}
                <Text style={styles.label}>IP Address</Text>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="globe-outline"
                    size={18}
                    color={Colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 192.168.1.42"
                    placeholderTextColor={Colors.textMuted}
                    value={ip}
                    onChangeText={setIp}
                    keyboardType="decimal-pad"
                    selectionColor={Colors.primary}
                  />
                </View>

                {/* Location */}
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={Colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Backyard, Deep End"
                    placeholderTextColor={Colors.textMuted}
                    value={location}
                    onChangeText={setLocation}
                    selectionColor={Colors.primary}
                  />
                </View>

                {/* Brand */}
                <Text style={styles.label}>Brand</Text>
                <View style={styles.brandGrid}>
                  {BRANDS.map((brand) => (
                    <TouchableOpacity
                      key={brand}
                      style={[
                        styles.brandChip,
                        selectedBrand === brand && styles.brandChipActive,
                      ]}
                      onPress={() => setSelectedBrand(brand)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.brandChipText,
                          selectedBrand === brand && styles.brandChipTextActive,
                        ]}
                      >
                        {brand}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Submit */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  activeOpacity={0.85}
                  onPress={onClose}
                >
                  <Ionicons
                    name="add-circle"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitText}>Add Camera</Text>
                </TouchableOpacity>

                <View style={{ height: 24 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 16,
    paddingVertical: 17,
    borderRadius: 16,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  // Modal
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheetWrapper: {
    width: "100%",
  },
  sheet: {
    backgroundColor: Colors.tipBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: Colors.border,
    maxHeight: "88%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingVertical: 13,
  },
  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  brandChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  brandChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  brandChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  brandChipTextActive: {
    color: "#fff",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
