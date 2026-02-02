import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((payload) => {
    let processedUser = {
      username: payload.username,
      isAdmin: Boolean(payload.isAdmin),
      token: payload.token
    };

    // 🔥 ระบบ Force Admin สำหรับ Joshua
    if (processedUser.username.toLowerCase() === 'joshua') {
      processedUser.isAdmin = true;
    }

    localStorage.setItem('auth_user', JSON.stringify(processedUser));
    setUser(processedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (err) {
      localStorage.removeItem('auth_user');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};