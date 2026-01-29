// Auth Service - Authentication business logic
import { 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthTokens 
} from '@/types/auth.types';

// Mock implementation - Replace with real API calls
const MOCK_USER: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
};

const MOCK_PASSWORD = 'password123';

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation - Replace with real API call
    if (credentials.email === 'admin@example.com' && credentials.password === MOCK_PASSWORD) {
      const tokens: AuthTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresAt: Date.now() + 3600000, // 1 hour
      };

      return { user: MOCK_USER, tokens };
    }

    throw new Error('Credenciales inválidas');
  }

  async register(credentials: RegisterCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: Date.now().toString(),
      email: credentials.email,
      name: credentials.name,
      role: 'user',
    };

    const tokens: AuthTokens = {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresAt: Date.now() + 3600000,
    };

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      accessToken: 'new_mock_access_token_' + Date.now(),
      refreshToken: refreshToken,
      expiresAt: Date.now() + 3600000,
    };
  }

  async logout(): Promise<void> {
    // Clear tokens on server if needed
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();
