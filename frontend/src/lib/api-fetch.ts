import { envConfig } from './env-config';

const API_URL = envConfig.getApiUrl();

// Simple fetch-based API client
export const fetchAPI = {
  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async get(endpoint: string, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }
};

// Auth API using fetch
export const authFetchAPI = {
  login: (data: { email: string; password: string }) =>
    fetchAPI.post('/auth/login', data),
  
  register: (data: { email: string; password: string; name?: string }) =>
    fetchAPI.post('/auth/register', data),
  
  getProfile: (token: string) =>
    fetchAPI.get('/auth/profile', token),
};