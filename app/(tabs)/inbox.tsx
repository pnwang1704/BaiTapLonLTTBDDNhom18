import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function InboxScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="chatbox-outline" size={64} color="#007AFF" />
      <Text style={styles.title}>Inbox</Text>
      <Text style={styles.subtitle}>Check your messages and updates.</Text>
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
