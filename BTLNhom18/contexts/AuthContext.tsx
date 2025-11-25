// import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

// type User = {
//   id: string;
//   phone?: string;
//   name?: string;
//   rank?: "Vang" | "Bac" | "Dong";
// };

// type AuthContextType = {
//   user: User | null;
//   isAuthenticated: boolean;
//   loginWithPhone: (phone: string, password: string) => Promise<void>;
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);

//   const loginWithPhone = useCallback(async (phone: string, password: string) => {
//     // Mocked credentials: 0377180111 / 123
//     await new Promise((r) => setTimeout(r, 400));
//     if (phone === "0377180111" && password === "123") {
//       setUser({ id: "u_0377180111", phone, name: "Người dùng", rank: "Vang" });
//       return;
//     }
//     throw new Error("Số điện thoại hoặc mật khẩu không đúng");
//   }, []);

//   const logout = useCallback(() => {
//     setUser(null);
//   }, []);

//   const value = useMemo(
//     () => ({ user, isAuthenticated: !!user, loginWithPhone, logout }),
//     [user, loginWithPhone, logout]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }

// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

type User = {
  id: string;
  phone: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');

    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

// const register = async (phone: string, password: string, name: string, email?: string) => {
//   const res = await fetch(`${API_URL}/api/auth/register`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ phone, password, name, email }), // Thêm email
//   });
// };
const register = async (phone: string, password: string, name: string, email?: string) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, name, email }),
  });

  const data = await res.json();

  // Nếu backend trả lỗi
  if (!res.ok) {
    throw new Error(data.message || 'Đăng ký thất bại!');
  }

  // Lưu token + user vào AsyncStorage
  await AsyncStorage.setItem('token', data.token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));

  // Đặt user vào state -> đăng nhập ngay lập tức
  setUser(data.user);
};


  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginWithPhone,
      register,
      logout,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

