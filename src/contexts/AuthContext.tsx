
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  isTokenValid: () => boolean;
}

const AUTH_TOKEN_KEY = 'hms-auth-token';
const CORRECT_PASSWORD = '5569';
const TOKEN_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        return;
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    setIsAuthenticated(false);
  };

  const login = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
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
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isTokenValid }}>
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
