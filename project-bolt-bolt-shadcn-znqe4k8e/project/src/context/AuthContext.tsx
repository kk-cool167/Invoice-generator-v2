import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  token: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('auth_token') !== null;
    } catch {
      return false;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  });

  const login = (authToken: string) => {
    try {
      localStorage.setItem('auth_token', authToken);
      setToken(authToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('auth_token');
      setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to remove auth token:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}