// Authentication types - Strongly typed for JWT auth
// Compatible with OpenTaxi API

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: 'admin' | 'user';
  tenantId?: string;
}

// LoginRequest según el Swagger del API
export interface LoginCredentials {
  email: string;
  password: string;
}

// RegisterUserRequest según el Swagger del API
export interface RegisterCredentials {
  email: string;
  password: string;
  tenantId?: string;
  name?: string;
}

// Respuesta de login del API OpenTaxi (JWT token)
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (credentials: RegisterCredentials) => Promise<void>;
}

// Respuesta estándar del API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Tipos para Companies (CRUD)
export interface Company {
  id: string;
  name: string;
  taxId: string;
}

export interface CreateCompanyRequest {
  name: string;
  taxId: string;
}

export interface UpdateCompanyRequest {
  name: string;
  taxId: string;
}
