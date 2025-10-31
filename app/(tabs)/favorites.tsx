import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="heart-outline" size={64} color="#FF3B30" />
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.subtitle}>Your saved items appear here ❤️</Text>
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
