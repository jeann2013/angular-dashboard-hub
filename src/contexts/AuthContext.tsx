// Auth Context - Global authentication state management
// Compatible con OpenTaxi API
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthContextType 
} from '@/types/auth.types';
import { authService } from '@/services/auth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOKENS: 'auth_tokens',
  USER: 'auth_user',
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedTokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens) as AuthTokens;
          
          // Check if token is still valid (si expiresAt existe)
          if (!parsedTokens.expiresAt || parsedTokens.expiresAt > Date.now()) {
            setTokens(parsedTokens);
            setUser(JSON.parse(storedUser));
          } else {
            // Clear expired tokens
            localStorage.removeItem(STORAGE_KEYS.TOKENS);
            localStorage.removeItem(STORAGE_KEYS.USER);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { user: authUser, tokens: authTokens } = await authService.login(credentials);
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(authTokens));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
      
      setUser(authUser);
      setTokens(authTokens);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const { user: authUser, tokens: authTokens } = await authService.register(credentials);
      
      localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(authTokens));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
      
      setUser(authUser);
      setTokens(authTokens);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKENS);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
      setTokens(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
