import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ================= TYPES ================= */
export interface User {
  username: string;
  isAdmin: boolean;
  isPremium: boolean; // เพิ่มเพื่อรองรับระบบ VIP
  token?: string;
}

interface LoginPayload {
  username: string;
  isAdmin?: boolean;
  isPremium?: boolean;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (payload: LoginPayload) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  loading: boolean;
}

const AUTH_STORAGE_KEY = 'auth_user';
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = useCallback((payload: LoginPayload) => {
    let processedUser: User = {
      username: payload.username,
      isAdmin: Boolean(payload.isAdmin),
      isPremium: Boolean(payload.isPremium),
      token: payload.token
    };

    // 🔥 Force Admin สำหรับ Joshua
    if (processedUser.username.toLowerCase() === 'joshua') {
      processedUser.isAdmin = true;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(processedUser));
    setUser(processedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updated: User = { ...user, ...updates };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  }, [user]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      }
    } catch (err) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};