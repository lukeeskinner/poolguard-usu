import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function AddCameraButton() {
  return (
    <TouchableOpacity style={styles.button} activeOpacity={0.85}>
      <Ionicons name="add-circle-outline" size={22} color={Colors.white} />
      <Text style={styles.text}>Add New Camera</Text>
    </TouchableOpacity>
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
});
