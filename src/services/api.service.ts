// API Service - HTTP client with JWT interceptor
// Compatible con OpenTaxi API
import { AuthTokens, ApiResponse, ApiError } from '@/types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5108';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getTokens(): AuthTokens | null {
    const tokens = localStorage.getItem('auth_tokens');
    return tokens ? JSON.parse(tokens) : null;
  }

  private isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;
    if (!tokens.expiresAt) return false; // Si no hay expiración, asumir válido
    return Date.now() >= tokens.expiresAt;
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const tokens = this.getTokens();
      if (tokens && !this.isTokenExpired()) {
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
    }

    return headers;
  }

  private logRequest(method: string, endpoint: string, data?: unknown) {
   
  }

  private logResponse(method: string, endpoint: string, response: unknown) {
   
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {

    if (!response.ok) {
      let errorMessage = response.statusText;
      let errorCode = 'API_ERROR';

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.title || JSON.stringify(errorData);
        errorCode = errorData.code || `HTTP_${response.status}`;
      } catch {
        // Si no se puede parsear como JSON, usar el texto del status
        errorMessage = response.statusText || `HTTP Error ${response.status}`;
      }

      const error: ApiError = {
        message: errorMessage,
        code: errorCode,
        status: response.status,
      };

      if (response.status === 401) {
        // Token expired or invalid - clear storage
        localStorage.removeItem('auth_tokens');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }

      throw error;
    }

    // Para respuestas 204 (No Content) o similares
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { data: null as T, success: true };
    }

    const data = await response.json();
    return { data, success: true };
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    this.logRequest('GET', endpoint);
    const headers = await this.getHeaders(includeAuth);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });
    const result = await this.handleResponse<T>(response);
    this.logResponse('GET', endpoint, result);
    return result;
  }

  async post<T>(endpoint: string, data: unknown, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    this.logRequest('POST', endpoint, data);
    const headers = await this.getHeaders(includeAuth);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse<T>(response);
    this.logResponse('POST', endpoint, result);
    return result;
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    this.logRequest('PUT', endpoint, data);
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse<T>(response);
    this.logResponse('PUT', endpoint, result);
    return result;
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    this.logRequest('DELETE', endpoint);
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    const result = await this.handleResponse<T>(response);
    this.logResponse('DELETE', endpoint, result);
    return result;
  }
}

export const apiService = new ApiService(`${API_BASE_URL}/api`);
