import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from './utils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial load
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const saved = localStorage.getItem('MangaZone_Auth');
        if (saved) {
          const parsed = JSON.parse(saved);
          
          // Validate token/refresh user data if needed
          if (parsed.username) {
            try {
              // Try to fetch fresh user data
              const { data: freshUser } = await api.get(`/user/${parsed.username}`);
              if (freshUser) {
                const updatedUser = {
                  ...freshUser,
                  // Keep token if exists
                  token: parsed.token
                };
                setUser(updatedUser);
                localStorage.setItem('MangaZone_Auth', JSON.stringify(updatedUser));
              }
            } catch (fetchError) {
              // If fetch fails, use cached data
              console.warn('Could not fetch fresh user data, using cached:', fetchError.message);
              setUser(parsed);
            }
          } else {
            setUser(parsed);
          }
        }
      } catch (err) {
        console.error('Error loading auth from storage:', err);
        localStorage.removeItem('MangaZone_Auth');
        setError('Failed to load authentication data');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Login function
  const login = useCallback(async (userData) => {
    try {
      // Ensure joshua is always admin
      const enhancedUserData = {
        ...userData,
        isAdmin: userData.username?.toLowerCase() === 'joshua' || userData.isAdmin,
        token: userData.token || `token_${Date.now()}`
      };
      
      localStorage.setItem('MangaZone_Auth', JSON.stringify(enhancedUserData));
      setUser(enhancedUserData);
      setError(null);
      return enhancedUserData;
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed');
      throw err;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('MangaZone_Auth');
    setUser(null);
    setError(null);
    window.location.href = '/login';
  }, []);

  // Update user function
  const updateUser = useCallback((updates) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('MangaZone_Auth', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    if (!user?.username) return;
    
    try {
      const { data: freshUser } = await api.get(`/user/${user.username}`);
      if (freshUser) {
        const updatedUser = {
          ...freshUser,
          token: user.token
        };
        setUser(updatedUser);
        localStorage.setItem('MangaZone_Auth', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  }, [user]);

  // Check if user is premium (with expiration)
  const isPremium = useMemo(() => {
    if (!user?.isPremium) return false;
    
    if (user.premiumExpiresAt) {
      const expiryDate = new Date(user.premiumExpiresAt);
      const now = new Date();
      return now < expiryDate;
    }
    
    return user.isPremium;
  }, [user]);

  // Context value
  const value = useMemo(() => ({
    user,
    login,
    logout,
    updateUser,
    refreshUser,
    loading,
    error,
    isPremium,
    isAdmin: user?.isAdmin || false,
    isAuthenticated: !!user
  }), [user, login, logout, updateUser, refreshUser, loading, error, isPremium]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};