import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithPhone, isAuthenticated } = useAuth();

  // Nếu đã đăng nhập, tự động sang tab Account
  useEffect(() => {
    if (isAuthenticated) router.replace("/(tabs)/account");
  }, [isAuthenticated, router]);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLoginPhone = async () => {
    try {
      setLoading(true);
      await loginWithPhone(phone.trim(), password);
      router.replace("/(tabs)/account");
    } catch (e: any) {
      Alert.alert("Đăng nhập thất bại", e?.message ?? "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = () => Alert.alert("Google", "Tính năng sẽ sớm có mặt");
  const onFacebook = () => Alert.alert("Facebook", "Tính năng sẽ sớm có mặt");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Ionicons name="cart-outline" size={64} color="#008080" />
        <Text style={styles.title}>Chào mừng trở lại</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục mua sắm</Text>

        <View style={styles.socialRow}>
          <Pressable style={[styles.socialBtn, { backgroundColor: "#fff", borderColor: "#E5E5EA", borderWidth: 1 }]} onPress={onGoogle}>
            <Ionicons name="logo-google" size={18} color="#DB4437" />
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable style={[styles.socialBtn, { backgroundColor: "#1877F2" }]} onPress={onFacebook}>
            <Ionicons name="logo-facebook" size={18} color="#fff" />
            <Text style={[styles.socialText, { color: "#fff" }]}>Facebook</Text>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.hr} />
          <Text style={styles.or}>Hoặc</Text>
          <View style={styles.hr} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            placeholder="VD: 0377180111"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            placeholder="•••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <Text style={styles.hint}>Test: 0377180111 / 123</Text>
        </View>

        <Pressable disabled={loading} onPress={onLoginPhone} style={[styles.primaryBtn, loading && { opacity: 0.7 }]}>
          <Text style={styles.primaryText}>{loading ? "Đang đăng nhập..." : "Đăng nhập bằng SĐT"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, alignItems: "center", padding: 24, gap: 12, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", color: "#000", marginTop: 8 },
  subtitle: { fontSize: 14, color: "#666" },
  socialRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  socialBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  socialText: { fontSize: 14, fontWeight: "600", color: "#111" },
  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", gap: 8, marginTop: 12 },
  hr: { flex: 1, height: 1, backgroundColor: "#E5E5EA" },
  or: { color: "#8E8E93", fontWeight: "600" },
  field: { width: "100%", marginTop: 8 },
  label: { color: "#111", marginBottom: 6, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#E5E5EA", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  hint: { color: "#8E8E93", fontSize: 12, marginTop: 6 },
  primaryBtn: { backgroundColor: "#008080", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, marginTop: 16, width: "100%" },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700", textAlign: "center" },
});

