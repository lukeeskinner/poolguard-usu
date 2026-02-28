import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface ScreenHeaderProps {
  title: string;
  subtitle: string;
  showMiraLogo?: boolean;
}

export default function ScreenHeader({
  title,
  subtitle,
  showMiraLogo,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.backButton} />

      <View style={styles.titleBlock}>
        {showMiraLogo ? (
          <View style={styles.logoRow}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.miraText}>Mira</Text>
          </View>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color={Colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.tipBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  titleBlock: {
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "400",
    marginTop: 1,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.tipBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  miraText: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
});
