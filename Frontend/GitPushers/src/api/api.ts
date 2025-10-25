import axios, { AxiosError } from 'axios';
import type { 
  AxiosInstance, 
  InternalAxiosRequestConfig,
  AxiosResponse 
} from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`[API Error] ${status}`, data);
      
      switch (status) {
        case 401:
          console.warn('Token nieautoryzowany - wylogowanie');
          localStorage.removeItem('authToken');

          break;
          
        case 403:
          console.error('Brak dostępu do zasobu');
          break;
          
        case 404:
          console.error('Zasób nie znaleziony');
          break;
          
        case 500:
          console.error('Błąd serwera');
          break;
          
        default:
          console.error('Nieoczekiwany błąd API');
      }
    } else if (error.request) {
      console.error('[API Error] Brak odpowiedzi z serwera', error.request);
    } else {
      console.error('[API Error] Błąd konfiguracji', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; detail?: string }>;
    
    if (axiosError.response?.data) {
      return axiosError.response.data.message || 
             axiosError.response.data.detail || 
             'Wystąpił błąd podczas komunikacji z serwerem';
    }
    
    if (axiosError.request) {
      return 'Nie można połączyć się z serwerem. Sprawdź połączenie internetowe.';
    }
    
    return axiosError.message || 'Wystąpił nieoczekiwany błąd';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Wystąpił nieznany błąd';
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};

export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('authToken');
};

export default apiClient;

