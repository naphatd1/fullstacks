// Next.js 15 optimized API client using native fetch
import { authStorage } from './auth-storage';
import { envConfig } from './env-config';

const API_URL = envConfig.getApiUrl();

// Next.js 15 fetch configuration
const createFetchConfig = (options: RequestInit = {}): RequestInit => ({
  // Next.js 15 caching strategy
  cache: 'no-store', // Don't cache API requests
  // Network configuration
  mode: 'cors',
  credentials: 'omit', // Don't send cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  },
  ...options,
});

// Enhanced error handling for Next.js 15
const handleFetchError = async (response: Response, url: string) => {
  let errorData;
  try {
    errorData = await response.json();
  } catch {
    errorData = { 
      message: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status 
    };
  }

  console.error('🚨 API Error:', {
    url,
    status: response.status,
    statusText: response.statusText,
    data: errorData,
  });

  const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  (error as any).status = response.status;
  (error as any).data = errorData;
  throw error;
};

// Main API client class
export class NextJS15ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      console.log(`🌐 ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, createFetchConfig(options));
      
      console.log(`📡 Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        await handleFetchError(response, url);
      }

      return response;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🔌 Network error:', error.message);
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }
      
      throw error;
    }
  }

  async get(endpoint: string, options: RequestInit = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: 'GET',
    });
    
    return response.json();
  }

  async post(endpoint: string, data?: any, options: RequestInit = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return response.json();
  }

  async patch(endpoint: string, data?: any, options: RequestInit = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return response.json();
  }

  async delete(endpoint: string, options: RequestInit = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
    
    return response.json();
  }
}

// Create API instance
export const nextjs15Api = new NextJS15ApiClient(API_URL);

// Auth API using Next.js 15 patterns
export const nextjs15AuthAPI = {
  async login(email: string, password: string) {
    console.log('🔐 Next.js 15 Login attempt');
    return nextjs15Api.post('/auth/login', { email, password });
  },

  async register(email: string, password: string, name?: string) {
    console.log('📝 Next.js 15 Register attempt');
    return nextjs15Api.post('/auth/register', { email, password, name });
  },

  async logout() {
    console.log('👋 Next.js 15 Logout');
    return nextjs15Api.post('/auth/logout');
  },

  async getProfile() {
    const token = authStorage.getAccessToken();
    return nextjs15Api.get('/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async refreshToken(refreshToken: string) {
    return nextjs15Api.post('/auth/refresh', { refresh_token: refreshToken });
  },
};