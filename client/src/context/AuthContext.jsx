import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('stockmate_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state by verifying existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('stockmate_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setToken(storedToken);
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          localStorage.removeItem('stockmate_token');
          localStorage.removeItem('stockmate_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: loggedInUser, token: authToken } = res.data;

    // Persist to local storage
    localStorage.setItem('stockmate_token', authToken);
    localStorage.setItem('stockmate_user', JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    setToken(authToken);

    return loggedInUser;
  };

  // Register handler
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { user: registeredUser, token: authToken } = res.data;

    // Persist to local storage
    localStorage.setItem('stockmate_token', authToken);
    localStorage.setItem('stockmate_user', JSON.stringify(registeredUser));

    setUser(registeredUser);
    setToken(authToken);

    return registeredUser;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('stockmate_token');
    localStorage.removeItem('stockmate_user');
    setUser(null);
    setToken(null);
  };

  // Helper to determine destination route after login based on role
  const getRoleDashboard = (userRole) => {
    switch (userRole) {
      case 'business':
        return '/business/dashboard';
      case 'supplier':
        return '/supplier/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        getRoleDashboard
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume AuthContext cleanly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
