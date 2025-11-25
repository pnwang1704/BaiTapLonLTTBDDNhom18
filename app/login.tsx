import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../contexts/AuthContext';

import Logo from '../assets/images/logo.png';


export default function LoginScreen() {
  const router = useRouter();
  const { loginWithPhone, isAuthenticated } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/account');
    }
  }, [isAuthenticated, router]);

  // === VALIDATION ===
  const isValidPhone = useMemo(() => /^\d{10}$/.test(phone.replace(/\s/g, '')), [phone]);
  const isValidPassword = useMemo(() => password.length >= 3, [password]);
  const isFormValid = isValidPhone && isValidPassword;

  // === ĐĂNG NHẬP ===
  const onLoginPhone = useCallback(async () => {
    if (!isFormValid) return;

    try {
      setLoading(true);
      setError('');
      await loginWithPhone(phone.trim(), password);
      router.replace('/(tabs)/account');
    } catch (e: any) {
      setError(e?.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [phone, password, isFormValid, loginWithPhone, router]);

  // === SOCIAL ===
  const onGoogle = () => Alert.alert('Google', 'Tính năng đang phát triển');
  const onFacebook = () => Alert.alert('Facebook', 'Tính năng đang phát triển');

  // === TIẾP TỤC MUA SẮM (KHÔNG ĐĂNG NHẬP) ===
  const continueShopping = () => {
    router.replace('/'); // Về Home
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
            {/* Logo */}
            <Animated.View entering={FadeInDown.delay(100)}>
              <Image source={Logo} style={styles.logo} resizeMode="contain" />
            </Animated.View>

            {/* Title */}
            <Animated.View entering={FadeInDown.delay(200)}>
              <Text style={styles.title}>Chào mừng trở lại!</Text>
              <Text style={styles.subtitle}>Đăng nhập để tiếp tục mua sắm</Text>
            </Animated.View>

            {/* Social Login */}
            <Animated.View entering={FadeInDown.delay(300)} style={styles.socialRow}>
              <Pressable style={styles.socialBtn} onPress={onGoogle}>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.socialText}>Google</Text>
              </Pressable>
              <Pressable style={[styles.socialBtn, styles.fbBtn]} onPress={onFacebook}>
                <Ionicons name="logo-facebook" size={20} color="#fff" />
                <Text style={[styles.socialText, { color: '#fff' }]}>Facebook</Text>
              </Pressable>
            </Animated.View>

            {/* Divider */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.dividerRow}>
              <View style={styles.hr} />
              <Text style={styles.or}>Hoặc đăng nhập bằng</Text>
              <View style={styles.hr} />
            </Animated.View>

            {/* Phone Field */}
            <Animated.View entering={FadeInDown.delay(500)} style={styles.field}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                placeholder="0377180111"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={[styles.input, !isValidPhone && phone.length > 0 && styles.inputError]}
                autoCapitalize="none"
                editable={!loading}
              />
              {!isValidPhone && phone.length > 0 && (
                <Text style={styles.errorText}>Số điện thoại phải có 10 chữ số</Text>
              )}
            </Animated.View>

            {/* Password Field */}
            <Animated.View entering={FadeInDown.delay(600)} style={styles.field}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.passwordInput]}
                  editable={!loading}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </Pressable>
              </View>
              <Text style={styles.hint}>Test: 0377180111 / 123</Text>
            </Animated.View>

            {/* Global Error */}
            {error ? (
              <Animated.View entering={FadeIn} style={styles.globalError}>
                <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                <Text style={styles.globalErrorText}>{error}</Text>
              </Animated.View>
            ) : null}

            {/* Login Button */}
            <Animated.View entering={FadeInDown.delay(700)}>
              <Pressable
                onPress={onLoginPhone}
                disabled={loading || !isFormValid}
                style={[
                  styles.primaryBtn,
                  (loading || !isFormValid) && styles.primaryBtnDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryText}>Đăng nhập</Text>
                )}
              </Pressable>
            </Animated.View>

            {/* NÚT TIẾP TỤC MUA SẮM - MỚI THÊM */}
            <Animated.View entering={FadeInDown.delay(800)}>
              <Pressable
                onPress={continueShopping}
                style={styles.guestBtn}
              >
                <Text style={styles.guestBtnText}>Quay trở lại trang chủ</Text>
              </Pressable>
            </Animated.View>
            {/* NÚT ĐĂNG KÝ MỚI – HOÀN HẢO!!! */}
            <Animated.View entering={FadeInDown.delay(900)}>
              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Chưa có tài khoản? </Text>
                <Pressable onPress={() => router.push('/register')}>
                  <Text style={styles.registerLink}>Đăng ký ngay</Text>
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  container: { alignItems: 'center' },

  logo: { width: 120, height: 50, marginBottom: 20 },

  title: { fontSize: 26, fontWeight: '700', color: '#000', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 6 },

  socialRow: { flexDirection: 'row', gap: 14, marginTop: 20, width: '100%' },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  fbBtn: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
  socialText: { fontSize: 15, fontWeight: '600' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 20, gap: 12 },
  hr: { flex: 1, height: 1, backgroundColor: '#E5E5EA' },
  or: { color: '#8E8E93', fontWeight: '600', fontSize: 14 },

  field: { width: '100%', marginBottom: 16 },
  label: { color: '#111', marginBottom: 8, fontWeight: '600', fontSize: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: { borderColor: '#FF3B30' },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeIcon: { position: 'absolute', right: 14, top: 16 },
  hint: { color: '#34C759', fontSize: 12, marginTop: 6, fontWeight: '500' },

  globalError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 10,
    marginVertical: 12,
    width: '100%',
    gap: 8,
  },
  globalErrorText: { color: '#FF3B30', fontSize: 14, flex: 1 },

  primaryBtn: {
    backgroundColor: '#008080',
    paddingVertical: 12,
    paddingHorizontal: 110,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnDisabled: { backgroundColor: '#ccc', opacity: 0.7 },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // === NÚT TIẾP TỤC MUA SẮM - MỚI THÊM ===
  guestBtn: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 75,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    marginTop: 12,
  },
  guestBtnText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { fontSize: 15, color: '#666' },
  registerLink: { fontSize: 15, color: '#008080', fontWeight: '700' },
});