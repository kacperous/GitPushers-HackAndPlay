import apiClient, { handleApiError, setToken, removeToken, isAuthenticated as checkAuth, getToken } from '../api/api';
import type { AxiosResponse } from 'axios';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  account_type?: 'doctor' | 'pharmacy';
}

export interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  account_type: 'doctor' | 'pharmacy';
  // Add other user fields as needed
}

export interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  account_type?: 'doctor' | 'pharmacy';
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: UserData;
}

interface RegisterResponse {
  user: UserData;
  tokens: {
    access: string;
    refresh: string;
  };
  message: string;
}

class AuthService {
  async login(loginData: LoginData): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await apiClient.post(
        '/auth/login',
        loginData
      );

      const { access, refresh } = response.data;

      if (access) {
        setToken(access);
        localStorage.setItem('refreshToken', refresh);
      }

      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async register(registerData: RegisterData): Promise<RegisterResponse> {
    try {
      const dataToSend = {
        ...registerData,
        account_type: registerData.account_type || 'pharmacy'
      };

      const response: AxiosResponse<RegisterResponse> = await apiClient.post(
        '/auth/register',
        dataToSend
      );

      const { tokens } = response.data;

      if (tokens.access) {
        setToken(tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
      }

      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async getCurrentUser(): Promise<UserData> {
    try {
      const response: AxiosResponse<UserData> = await apiClient.get('/auth/user/me');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async updateUser(
    userData: UpdateUserData,
    method: 'PUT' | 'PATCH' = 'PATCH'
  ): Promise<UserData> {
    try {
      const response: AxiosResponse<UserData> = await apiClient.request({
        method: method,
        url: '/auth/user/update',
        data: userData,
      });

      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
  logout(): void {
    removeToken();
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return checkAuth();
  }

  getToken(): string | null {
    return getToken();
  }
}

export const authService = new AuthService();
