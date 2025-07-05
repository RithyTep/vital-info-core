import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  isTokenValid: () => boolean;
  isLoading: boolean;
}

const AUTH_TOKEN_KEY = 'hms-auth-token';
const ADMIN_PROFILE_KEY = 'hms-admin-profile';
const DEFAULT_PASSWORD = '5569';
const TOKEN_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function getAdminPassword(): string {
  const admin = localStorage.getItem(ADMIN_PROFILE_KEY);
  if (admin) {
    try {
      const { password } = JSON.parse(admin);
      return password || DEFAULT_PASSWORD;
    } catch {
      return DEFAULT_PASSWORD;
    }
  }
  return DEFAULT_PASSWORD;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthToken();
  }, []);

  const checkAuthToken = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      const tokenData = JSON.parse(token);
      const now = new Date().getTime();
      if (now - tokenData.timestamp < TOKEN_DURATION) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const login = (password: string): boolean => {
    const adminPassword = getAdminPassword();
    if (password === adminPassword) {
      const tokenData = {
        timestamp: new Date().getTime(),
        authenticated: true
      };
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(tokenData));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
  };

  const isTokenValid = (): boolean => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      const tokenData = JSON.parse(token);
      const now = new Date().getTime();
      return now - tokenData.timestamp < TOKEN_DURATION;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isTokenValid, isLoading }}>
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
