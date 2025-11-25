// app/register.tsx – PHIÊN BẢN HOÀN HẢO NHẤT TỪ TRƯỚC ĐẾN NAY!!!
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth(); // ĐÃ ĐẢM BẢO CÓ register

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
    }
    if (phone.replace(/\D/g, '').length !== 10) {
      return Alert.alert('Lỗi', 'Số điện thoại phải có 10 chữ số');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return Alert.alert('Lỗi', 'Email không hợp lệ');
    }

    setLoading(true);
    try {
      await register(phone.trim(), password, name, email); // Gửi thêm email
      Alert.alert('Thành công', 'Đăng ký thành công!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/account') }
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>Điền thông tin để bắt đầu mua sắm</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={{ marginTop: 32, gap: 18 }}>

            <View style={styles.field}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                placeholder="Nguyễn Văn A"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="example@gmail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                placeholder="0377180111"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#666" />
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                />
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eye}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#666" />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={onRegister}
              disabled={loading}
              style={[styles.registerBtn, loading && { opacity: 0.7 }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>Đăng ký</Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.back()} style={styles.loginLink}>
              <Text style={styles.loginText}>
                Đã có tài khoản? <Text style={{ color: '#008080', fontWeight: '700' }}>Đăng nhập ngay</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', color: '#000' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 8 },

  field: { width: '100%' },
  label: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordWrapper: { position: 'relative' },
  eye: { position: 'absolute', right: 14, top: 16 },

  registerBtn: {
    backgroundColor: '#008080',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  registerBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  loginLink: { alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: 15, color: '#666' },
});