import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  quickLoginAs: (role: 'Admin' | 'Operator') => Promise<void>;
  updateProfile: (data: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('aquapulse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            // Invalid token
            localStorage.removeItem('aquapulse_token');
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.error('Failed to load current user:', err);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('aquapulse_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'Network error during login' };
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.token) {
        localStorage.setItem('aquapulse_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'Network error during registration' };
    }
  };

  const logout = () => {
    localStorage.removeItem('aquapulse_token');
    setToken(null);
    setUser(null);
  };

  const quickLoginAs = async (role: 'Admin' | 'Operator') => {
    const email = role === 'Admin' ? 'admin@aquapulse.io' : 'operator@aquapulse.io';
    const password = role === 'Admin' ? 'Admin@123' : 'Operator@123';
    await login(email, password);
  };

  const updateProfile = async (data: any) => {
    try {
      const res = await api.updateProfile(data);
      if (res.success && res.user) {
        setUser((prev) => (prev ? { ...prev, ...res.user } : res.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        quickLoginAs,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
