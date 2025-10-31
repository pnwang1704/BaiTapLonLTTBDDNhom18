import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="person-outline" size={64} color="#8E8E93" />
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>Manage your profile and settings.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#000", marginTop: 12 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
});
