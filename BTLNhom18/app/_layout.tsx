// app/_layout.tsx – ĐÃ FIX 100% – SẠCH NHƯ MỚI!!!
import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../components/CartProvider";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function RootLayout() {
  const router = useRouter();

  return (
    <AuthProvider>
      <CartProvider>
        {/* CHỈ KHAI BÁO CÁC TRANG NGOÀI (tabs) THÔI!!! */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product-detail" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="login" />
        </Stack>

        {/* ICON CHAT AI CỐ ĐỊNH – VẪN HOẠT ĐỘNG HOÀN HẢO */}
        <View style={{ position: "absolute", bottom: 70, right: 10, zIndex: 999 }} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/inbox")}  // ĐÚNG ĐƯỜNG DẪN!!!
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#007AFF",
              justifyContent: "center",
              alignItems: "center",
              elevation: 10,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Ionicons name="chatbubble-ellipses" size={32} color="#fff" />
            <View style={{
              position: "absolute",
              top: 6,
              right: 6,
              backgroundColor: "#FF3B30",
              borderRadius: 10,
              width: 20,
              height: 20,
              justifyContent: "center",
              alignItems: "center",
            }}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>AI</Text>
            </View>
          </TouchableOpacity>
        </View>
      </CartProvider>
    </AuthProvider>
  );
}