// API service for authentication endpoints
const API_BASE_URL = 'http://localhost:6543'; // Adjust this to your backend URL

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
  account_type?: 'doctor' | 'pharmacy'; // Opcjonalne, domyślnie 'pharmacy'
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

class AuthService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async login(loginData: LoginData): Promise<{ token: string; user: UserData }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  }

  async register(registerData: RegisterData): Promise<{ token: string; user: UserData }> {
    // Automatycznie ustaw account_type na 'pharmacy' jeśli nie jest podane
    const dataToSend = {
      ...registerData,
      account_type: registerData.account_type || 'pharmacy'
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  }

  async getCurrentUser(): Promise<UserData> {
    const response = await fetch(`${API_BASE_URL}/auth/user/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get user data');
    }

    return response.json();
  }

  async updateUser(userData: UpdateUserData, method: 'PUT' | 'PATCH' = 'PATCH'): Promise<UserData> {
    const response = await fetch(`${API_BASE_URL}/auth/user/update`, {
      method: method,
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }

    return response.json();
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();
