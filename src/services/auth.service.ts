// Auth Service - Authentication business logic
// Integración con OpenTaxi API
import { 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthTokens 
} from '@/types/auth.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5108';
const TENANT_ID = import.meta.env.VITE_TOKEN_TENANT;

// Mock implementation - Solo para desarrollo
const MOCK_USER: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
};

const MOCK_PASSWORD = 'password123';

// Función para extraer mensaje de error legible del backend
function extractErrorMessage(errorText: string): string {
  // Si el error contiene "Email already registered"
  if (errorText.includes('Email already registered')) {
    return 'Este correo electrónico ya está registrado. Por favor, usa otro correo o inicia sesión.';
  }
  
  // Si contiene stack trace de .NET, extraer solo el mensaje principal
  if (errorText.includes('System.') || errorText.includes('at ')) {
    // Buscar el mensaje después de la excepción
    const match = errorText.match(/(?:System\.\w+Exception):\s*([^\r\n]+)/);
    if (match) {
      return match[1].trim();
    }
    
    // Buscar mensajes comunes
    if (errorText.includes('Invalid credentials') || errorText.includes('Invalid login')) {
      return 'Credenciales inválidas. Verifica tu correo y contraseña.';
    }
    
    return 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  }
  
  // Si es JSON, intentar parsear
  try {
    const errorJson = JSON.parse(errorText);
    return errorJson.message || errorJson.title || errorJson.error || 'Error en la solicitud';
  } catch {
    // Si no es JSON, retornar el texto limpio (limitado a 200 caracteres)
    return errorText.length > 200 
      ? errorText.substring(0, 200) + '...' 
      : errorText || 'Error en la solicitud';
  }
}

class AuthService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = `${API_URL}`;
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Llamada real al API
    const response = await fetch(`${this.apiUrl}/users/login`, {
      method: 'POST',
      headers: {        
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(extractErrorMessage(errorText));
    }

    const data = await response.json();
    
    // Transformar respuesta del API al formato esperado
    const tokens: AuthTokens = {
      accessToken: data.token || data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt || Date.now() + 3600000,
      tokenType: data.tokenType || 'Bearer',
    };

    const user: User = {
      id: data.id || data.userId,
      email: credentials.email,
      name: data.name || data.email,
      role: data.role || 'user',
      tenantId: data.tenantId,
    };

    return { user, tokens };
  }

  async register(credentials: RegisterCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Llamada real al API
    const response = await fetch(`${this.apiUrl}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        tenantId: TENANT_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(extractErrorMessage(errorText));
    }

    const data = await response.json();

    // Transformar respuesta del API al formato esperado
    const tokens: AuthTokens = {
      accessToken: data.token || data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt || Date.now() + 3600000,
      tokenType: data.tokenType || 'Bearer',
    };

    const user: User = {
      id: data.id || data.userId,
      email: credentials.email,
      name: credentials.name || credentials.email,
      role: 'user',
      tenantId: credentials.tenantId,
    };

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {

    // Implementar refresh token con el API real si está disponible
    throw new Error('Refresh token no implementado en el API');
  }

  async logout(): Promise<void> {    
  }

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Mock implementations
  private async mockLogin(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.email === 'admin@example.com' && credentials.password === MOCK_PASSWORD) {
      const tokens: AuthTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresAt: Date.now() + 3600000,
      };

      return { user: MOCK_USER, tokens };
    }

    throw new Error('Credenciales inválidas');
  }

  private async mockRegister(credentials: RegisterCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: Date.now().toString(),
      email: credentials.email,
      name: credentials.name || credentials.email,
      role: 'user',
      tenantId: credentials.tenantId,
    };

    const tokens: AuthTokens = {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresAt: Date.now() + 3600000,
    };

    return { user, tokens };
  }
}

export const authService = new AuthService();
