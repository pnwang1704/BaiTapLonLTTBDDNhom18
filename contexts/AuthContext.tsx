import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type User = {
  id: string;
  phone?: string;
  name?: string;
  rank?: "Vang" | "Bac" | "Dong";
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const loginWithPhone = useCallback(async (phone: string, password: string) => {
    // Mocked credentials: 0377180111 / 123
    await new Promise((r) => setTimeout(r, 400));
    if (phone === "0377180111" && password === "123") {
      setUser({ id: "u_0377180111", phone, name: "Người dùng", rank: "Vang" });
      return;
    }
    throw new Error("Số điện thoại hoặc mật khẩu không đúng");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loginWithPhone, logout }),
    [user, loginWithPhone, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


