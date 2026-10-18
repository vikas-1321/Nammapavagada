import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser } from '../types';
import { authApi } from '../api/authApi';
import { apiClient } from '../api/client';
import { storage } from '../utils/storage';

const TOKEN_KEY = 'npweb_admin_mobile_token';
const USER_KEY = 'npweb_admin_mobile_user';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Intercept 401s from ApiClient
    apiClient.onUnauthorized(() => {
      logout();
    });

    const initAuth = async () => {
      try {
        const savedApiUrl = await storage.getItem('npweb_custom_api_url');
        if (savedApiUrl) {
          apiClient.setBaseUrl(savedApiUrl);
        }

        const savedToken = await storage.getItem(TOKEN_KEY);
        const savedUserStr = await storage.getItem(USER_KEY);

        if (savedToken) {
          apiClient.setToken(savedToken);
          setToken(savedToken);

          if (savedUserStr) {
            setUser(JSON.parse(savedUserStr));
          }

          // Fetch fresh user profile from backend
          try {
            const freshUser = await authApi.getMe();
            setUser(freshUser);
            await storage.setItem(USER_KEY, JSON.stringify(freshUser));
          } catch {
            // If network fails on startup, keep cached user profile
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    await storage.setItem(TOKEN_KEY, res.token);
    await storage.setItem(USER_KEY, JSON.stringify(res.user));
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      apiClient.setToken(null);
      await storage.removeItem(TOKEN_KEY);
      await storage.removeItem(USER_KEY);
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const freshUser = await authApi.getMe();
      setUser(freshUser);
      await storage.setItem(USER_KEY, JSON.stringify(freshUser));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
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
