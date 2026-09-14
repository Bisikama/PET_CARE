import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAccessToken, clearAuth, setAccessToken as apiSetToken } from '../../../infrastructure/api/client';
import { authApi } from '../api/authApi';
import { UserProfile } from '../types/auth.types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, userProfile: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const restoreSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const token = await getAccessToken();
      if (token) {
        // Fetch user profile
        const response = await authApi.getMe();
        setState({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      // If fetching me fails (e.g., token expired and refresh failed), clear session
      await clearAuth();
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (token: string, userProfile: UserProfile) => {
    await apiSetToken(token);
    setState({
      user: userProfile,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore errors on logout
    } finally {
      await clearAuth();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
