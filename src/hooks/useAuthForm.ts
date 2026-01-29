// useAuthForm - Form state management hook
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials, RegisterCredentials } from '@/types/auth.types';

interface UseAuthFormReturn {
  isLoading: boolean;
  error: string | null;
  handleLogin: (credentials: LoginCredentials) => Promise<void>;
  handleRegister: (credentials: RegisterCredentials) => Promise<void>;
  clearError: () => void;
}

export const useAuthForm = (): UseAuthFormReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  }, [login, navigate]);

  const handleRegister = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await register(credentials);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  }, [register, navigate]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    handleLogin,
    handleRegister,
    clearError,
  };
};
