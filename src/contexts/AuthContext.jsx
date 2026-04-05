import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('rl_token');
    const stored = localStorage.getItem('rl_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('rl_token');
        localStorage.removeItem('rl_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: u, token } = await authService.login(email, password);
    localStorage.setItem('rl_token', token);
    localStorage.setItem('rl_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { user: u, token } = await authService.signup(name, email, password);
    localStorage.setItem('rl_token', token);
    localStorage.setItem('rl_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('rl_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
