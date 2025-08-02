import { envConfig } from './env-config';

// Simple API client optimized for Next.js 15
const API_URL = envConfig.getApiUrl();

// Next.js 15 recommended fetch configuration
const fetchConfig: RequestInit = {
  // Next.js 15 caching behavior
  cache: 'no-store', // Don't cache auth requests
  // CORS configuration
  mode: 'cors',
  credentials: 'omit', // Don't send cookies for security
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const simpleAPI = {
  async login(email: string, password: string) {
    try {
      console.log('🔐 Attempting login with Next.js 15 fetch...');
      console.log('API URL:', `${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Response status:', response.status);
      console.log('✅ Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('❌ Login error data:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🎉 Login successful:', { user: data.user?.email, role: data.user?.role });
      return data;
    } catch (error) {
      console.error('💥 Simple API login error:', error);
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }
      
      throw error;
    }
  },

  async register(email: string, password: string, name?: string) {
    try {
      console.log('📝 Attempting register with Next.js 15 fetch...');
      console.log('API URL:', `${API_URL}/auth/register`);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });

      console.log('📡 Response status:', response.status);
      console.log('✅ Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('❌ Register error data:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🎉 Register successful:', { user: data.user?.email, role: data.user?.role });
      return data;
    } catch (error) {
      console.error('💥 Simple API register error:', error);
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }
      
      throw error;
    }
  }
};