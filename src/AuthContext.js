import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('MangaZone_Auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 👑 Joshua Admin Bypass
        if (parsed.username?.toLowerCase() === 'joshua') parsed.isAdmin = true;
        setUser(parsed);
      } catch (e) { localStorage.removeItem('MangaZone_Auth'); }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    const data = { ...userData, isAdmin: userData.username?.toLowerCase() === 'joshua' };
    localStorage.setItem('MangaZone_Auth', JSON.stringify(data));
    setUser(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('MangaZone_Auth');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const value = useMemo(() => ({ user, login, logout, loading }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);