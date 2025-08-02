import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthResponse } from '@/types';
import { authAPI } from '@/lib/api';
import { nextjs15AuthAPI } from '@/lib/nextjs15-api';
import { authStorage, authUtils } from '@/lib/auth-storage';
import { rateLimiter, csrfToken } from '@/lib/security';
import toast from 'react-hot-toast';

import { envConfig } from '@/lib/env-config';

const API_URL = envConfig.getApiUrl();

interface AuthState {
  user: User | null;
  loading: boolean;
  isLoggingOut: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Initial state that matches both server and client to prevent hydration issues
const getInitialState = (): AuthState => {
  // Always return consistent initial state to prevent hydration mismatch
  return {
    user: null,
    loading: false, // Will be set to true when checkAuth is dispatched
    isLoggingOut: false,
    isAuthenticated: false,
    isAdmin: false,
  };
};

const initialState: AuthState = getInitialState();

// Async thunks
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    console.log('🔍 checkAuth called');
    
    // Only run on client side
    if (typeof window === 'undefined') {
      console.log('🔍 checkAuth - Server side, returning null');
      return null;
    }
    
    try {
      const token = authStorage.getAccessToken();
      const savedUser = authStorage.getUser();
      const isValidSession = authStorage.isAuthenticated();

      console.log('🔍 checkAuth - Auth data:', { 
        hasToken: !!token, 
        hasUser: !!savedUser,
        isValidSession,
        userEmail: savedUser?.email 
      });

      if (token && savedUser && isValidSession) {
        console.log('✅ checkAuth - User authenticated:', savedUser.email);
        return savedUser;
      }
      
      // Clear invalid auth data
      if (!isValidSession) {
        console.log('🧹 checkAuth - Invalid session, clearing auth data');
        authStorage.clearAll();
      }
      
      console.log('❌ checkAuth - No valid auth data found');
      return null;
    } catch (error) {
      console.error('❌ checkAuth error:', error);
      // Clear potentially corrupted auth data
      authStorage.clearAll();
      return rejectWithValue('Auth check failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    console.log('🎯 Redux loginUser called:', {
      email,
      passwordLength: password?.length,
      timestamp: new Date().toISOString(),
    });

    // Role-based rate limiting check
    const rateLimitKey = `login_${email}`;
    
    // Try to get user role from previous login attempts or assume USER
    // Admin users will bypass this check anyway
    const userRole = 'USER'; // Default to USER for rate limiting
    const maxAttempts = userRole === 'ADMIN' ? 999 : 3;
    const windowMs = userRole === 'ADMIN' ? 0 : 10 * 60 * 1000; // 10 minutes for users
    
    if (!rateLimiter.isAllowed(rateLimitKey, maxAttempts, windowMs, userRole)) {
      const remaining = rateLimiter.getRemainingAttempts(rateLimitKey, maxAttempts, userRole);
      const timeUntilReset = Math.ceil(rateLimiter.getTimeUntilReset(rateLimitKey, windowMs, userRole) / 1000 / 60);
      const message = `มีการพยายามเข้าสู่ระบบมากเกินไป (${remaining} ครั้งที่เหลือ) กรุณาลองใหม่ในอีก ${timeUntilReset} นาที`;
      toast.error(message);
      return rejectWithValue(message);
    }

    try {
      // Enhanced network connectivity check
      if (typeof window !== 'undefined') {
        if (!navigator.onLine) {
          const message = 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อของคุณ';
          return rejectWithValue(message);
        }
        
        // Additional mobile network check
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (connection) {
          console.log('📶 Network info:', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
          });
          
          if (connection.effectiveType === 'slow-2g' || connection.rtt > 2000) {
            console.warn('⚠️ Slow network detected, adjusting timeouts');
          }
        }
      }
      
      // Enhanced device detection
      const currentHost = window.location.hostname;
      const userAgent = navigator.userAgent.toLowerCase();
      const isIPAddress = currentHost.match(/^\d+\.\d+\.\d+\.\d+$/);
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.screen.width <= 768;
      const isMobile = isIPAddress || isMobileUA || isSmallScreen;
      
      console.log('🔍 Device detection:', {
        host: currentHost,
        isIPAddress: !!isIPAddress,
        isMobileUA,
        screenWidth: window.screen.width,
        isSmallScreen,
        isMobile,
      });

      // Circuit breaker for mobile - if network is too slow, fail fast
      const connection = (navigator as any).connection;
      const isSlow = connection && (connection.effectiveType === 'slow-2g' || connection.rtt > 3000);
      if (isSlow) {
        console.warn('🐌 Very slow network detected, using simplified login');
      }
      
      // Try multiple login approaches for better compatibility
      const loginAttempts = [
        {
          name: 'Mobile-Optimized Direct Backend',
          attempt: async () => {
            const backendUrls = [];
            
            if (isMobile) {
              if (isIPAddress) {
                backendUrls.push(`http://${currentHost}:4000/api`);
                console.log(`📱 Mobile: ONLY using same IP (${currentHost}) with Simple strategy`);
              } else {
                // For mobile, only try current host IP
                backendUrls.push(`http://${currentHost}:4000/api`);
                console.log(`📱 Mobile: Using current host IP only`);
              }
            } else {
              backendUrls.push('http://localhost:4000/api');
              backendUrls.push('http://127.0.0.1:4000/api');
              backendUrls.push(API_URL);
            }
            
            const uniqueUrls = Array.from(new Set(backendUrls));
            const urlsToTry = isSlow ? uniqueUrls.slice(0, 2) : uniqueUrls;
            console.log(`🎯 Mobile-optimized login URLs:`, { all: uniqueUrls, trying: urlsToTry });
            
            for (const baseUrl of urlsToTry) {
              try {
                console.log(`🔄 Mobile login attempt: ${baseUrl}`);
                
                const loginPayload = { email, password };
                
                const allStrategies = [
                  {
                    name: 'Simple',
                    options: {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                      },
                      body: JSON.stringify(loginPayload),
                    }
                  },
                  {
                    name: 'CORS',
                    options: {
                      method: 'POST',
                      mode: 'cors' as RequestMode,
                      credentials: 'include' as RequestCredentials,
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                      },
                      body: JSON.stringify(loginPayload),
                    }
                  }
                ];
                
                let fetchStrategies;
                if (isMobile) {
                  fetchStrategies = [allStrategies[0], allStrategies[1]];
                  console.log(`📱 Mobile: Using Simple + CORS strategies`);
                } else if (isSlow) {
                  fetchStrategies = allStrategies.slice(0, 1);
                } else {
                  fetchStrategies = allStrategies;
                }
                
                for (const strategy of fetchStrategies) {
                  try {
                    console.log(`🔄 Trying ${strategy.name} strategy for ${baseUrl}`);
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => {
                      console.log(`⏰ Timeout reached for ${strategy.name} ${baseUrl}`);
                      controller.abort();
                    }, 3000);
                    
                    const response = await fetch(`${baseUrl}/auth/login`, {
                      ...strategy.options,
                      signal: controller.signal,
                    } as RequestInit);
                    
                    clearTimeout(timeoutId);
                    
                    console.log(`📡 ${strategy.name} response from ${baseUrl}: ${response.status} ${response.statusText} (type: ${response.type})`);
                    
                    if (response.ok && response.status >= 200 && response.status < 300) {
                      try {
                        const data = await response.json();
                        console.log(`✅ ${strategy.name} login successful via ${baseUrl}`, { 
                          hasAccessToken: !!data.access_token,
                          hasUser: !!data.user,
                          userRole: data.user?.role,
                        });
                        return data;
                      } catch (jsonError) {
                        console.error(`❌ ${strategy.name} JSON parse error for ${baseUrl}:`, jsonError);
                        continue;
                      }
                    } else {
                      const errorText = await response.text().catch(() => 'Unable to read error');
                      console.log(`❌ ${strategy.name} failed ${baseUrl}: ${response.status} - ${errorText}`);
                      continue;
                    }
                  } catch (strategyError: any) {
                    console.log(`❌ ${strategy.name} strategy error for ${baseUrl}:`, strategyError.message);
                    continue;
                  }
                }
                
              } catch (urlError: any) {
                console.log(`❌ All strategies failed for ${baseUrl}:`, {
                  name: urlError.name,
                  message: urlError.message,
                });
                continue;
              }
            }
            
            throw new Error(`All mobile-optimized URLs failed. Tried: ${uniqueUrls.join(', ')}`);
          }
        },
        {
          name: 'Primary API',
          attempt: async () => await nextjs15AuthAPI.login(email, password)
        },
        {
          name: 'Legacy API', 
          attempt: async () => await authAPI.login({ email, password })
        }
      ];

      let authData: AuthResponse | undefined;
      let lastError: Error | null = null;
      let attemptCount = 0;
      
      // Determine max attempts based on device type
      let maxAttempts;
      if (isMobile) {
        maxAttempts = 2;
        console.log('📱 Mobile: Using 2 login attempts (Mobile-Optimized + Primary API)');
      } else if (isSlow) {
        maxAttempts = 1;
      } else {
        maxAttempts = loginAttempts.length;
      }
      
      for (const loginAttempt of loginAttempts.slice(0, maxAttempts)) {
        attemptCount++;
        try {
          console.log(`🔄 Trying ${loginAttempt.name}... (${attemptCount}/${maxAttempts})`);
          
          const attemptPromise = loginAttempt.attempt();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error(`Login attempt timeout after 5 seconds`));
            }, 5000);
          });
          
          authData = await Promise.race([attemptPromise, timeoutPromise]) as AuthResponse;
          console.log(`✅ Login successful with ${loginAttempt.name}`, {
            hasAccessToken: !!authData?.access_token,
            hasUser: !!authData?.user
          });
          break;
        } catch (error: any) {
          console.log(`❌ ${loginAttempt.name} failed (${attemptCount}/${maxAttempts}):`, {
            message: error.message,
            status: error.status,
            name: error.name
          });
          lastError = error;
          
          if (isSlow && error.message.toLowerCase().includes('timeout')) {
            console.log('🚫 Failing fast due to slow network and timeout');
            break;
          }
          continue;
        }
      }
      
      // If all attempts failed, try fallback (skip only for slow networks)
      if (!authData && !isSlow) {
        console.log('🔄 All login attempts failed, trying fallback...');
        try {
          const { fallbackAuth } = await import('@/lib/api-fallback');
          
          const fallbackPromise = fallbackAuth.login(email, password);
          const fallbackTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Fallback timeout')), 3000);
          });
          
          authData = await Promise.race([fallbackPromise, fallbackTimeout]) as AuthResponse;
          console.log('✅ Login successful with fallback');
        } catch (fallbackError: any) {
          console.error('❌ Fallback login also failed:', fallbackError);
          throw lastError || fallbackError;
        }
      }

      if (!authData) {
        console.error('🚨 No authData received - all login methods failed');
        
        if (isMobile) {
          throw new Error(`Mobile login failed - cannot connect to server at ${currentHost}:4000`);
        } else {
          throw lastError || new Error('Login failed - no authentication data received');
        }
      }

      // Validate authData structure
      if (!authData.access_token || !authData.user) {
        console.error('🚨 Invalid authData structure:', {
          hasAccessToken: !!authData.access_token,
          hasRefreshToken: !!authData.refresh_token,
          hasUser: !!authData.user,
        });
        throw new Error('Login failed - invalid authentication response');
      }

      console.log('✅ Valid authData received:', {
        hasAccessToken: !!authData.access_token,
        hasRefreshToken: !!authData.refresh_token,
        hasUser: !!authData.user,
        userEmail: authData.user?.email,
        userRole: authData.user?.role
      });

      // Save tokens and user data in session storage
      authStorage.setTokens({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        user: authData.user
      });
      
      // Clear rate limiting on successful login
      rateLimiter.clearLimit(rateLimitKey);
      
      // Show success message
      toast.success('เข้าสู่ระบบสำเร็จ!');
      
      return {
        user: authData.user,
        redirectPath: authData.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
      };
    } catch (error: any) {
      console.error('🚨 Final login error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      
      let message = 'เข้าสู่ระบบไม่สำเร็จ';
      
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('All backend URLs failed') || error.message.includes('All mobile-optimized URLs failed') || error.code === 'ECONNREFUSED') {
        const currentHost = window.location.hostname;
        const isIPAddress = currentHost.match(/^\d+\.\d+\.\d+\.\d+$/);
        const isMobile = isIPAddress || /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()) || window.screen.width <= 768;
        
        if (isMobile) {
          message = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้\n• ตรวจสอบว่าอยู่ใน WiFi network เดียวกัน\n• ลองรีเฟรชหน้าเว็บ\n• เซิร์ฟเวอร์อาจไม่ทำงาน';
        } else {
          message = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้\n• ตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่ที่ port 4000\n• ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        }
      } else if (error.status === 401 || error.message.includes('401') || error.message.includes('ไม่พบบัญชีผู้ใช้งาน') || error.message.includes('รหัสผ่านไม่ถูกต้อง')) {
        message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      } else if (error.status === 429 || error.message.includes('429')) {
        message = 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ภายหลัง';
      } else if (error.status === 400 || error.message.includes('400')) {
        message = 'ข้อมูลที่ส่งไม่ถูกต้อง';
      } else if (error.message && !error.message.includes('Rate limit')) {
        message = error.message;
      }
      
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }: { email: string; password: string; name?: string }, { rejectWithValue }) => {
    // Rate limiting check for registration
    const rateLimitKey = `register_${email}`;
    const userRole = 'USER'; // Registration is always for regular users
    const maxAttempts = 3;
    const windowMs = 15 * 60 * 1000; // 15 minutes for registration
    
    if (!rateLimiter.isAllowed(rateLimitKey, maxAttempts, windowMs, userRole)) {
      const remaining = rateLimiter.getRemainingAttempts(rateLimitKey, maxAttempts, userRole);
      const timeUntilReset = Math.ceil(rateLimiter.getTimeUntilReset(rateLimitKey, windowMs, userRole) / 1000 / 60);
      const message = `มีการพยายามสมัครสมาชิกมากเกินไป (${remaining} ครั้งที่เหลือ) กรุณาลองใหม่ในอีก ${timeUntilReset} นาที`;
      toast.error(message);
      return rejectWithValue(message);
    }

    try {
      console.log('🔐 Attempting registration...');
      
      let authData: AuthResponse;
      
      const registerAttempts = [
        {
          name: 'Primary API',
          attempt: async () => await nextjs15AuthAPI.register(email, password, name)
        },
        {
          name: 'Legacy API',
          attempt: async () => await authAPI.register({ email, password, name })
        },
        {
          name: 'Direct Backend (Smart)',
          attempt: async () => {
            const currentHost = window.location.hostname;
            console.log(`🔍 Registration - Current host: ${currentHost}`);
            
            const backendUrls = [];
            
            if (currentHost.match(/^\d+\.\d+\.\d+\.\d+$/)) {
              backendUrls.push(`http://${currentHost}:4000/api`);
              console.log(`📱 Mobile registration (IP: ${currentHost}), trying same IP for backend`);
            }
            
            backendUrls.push('http://localhost:4000/api');
            backendUrls.push('http://127.0.0.1:4000/api');
            backendUrls.push(API_URL);
            
            const uniqueUrls = Array.from(new Set(backendUrls));
            console.log(`🎯 Registration will try these URLs:`, uniqueUrls);
            
            for (const baseUrl of uniqueUrls) {
              try {
                console.log(`🔄 Trying registration ${baseUrl}...`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                const response = await fetch(`${baseUrl}/auth/register`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                  },
                  mode: 'cors',
                  credentials: 'omit',
                  body: JSON.stringify({ email, password, name }),
                  signal: controller.signal,
                });
                
                clearTimeout(timeoutId);
                console.log(`📡 Registration response from ${baseUrl}: ${response.status}`);
                
                if (response.ok) {
                  const data = await response.json();
                  console.log(`✅ Registration successful via ${baseUrl}`);
                  return data;
                } else {
                  console.log(`❌ Registration ${baseUrl} returned ${response.status}`);
                }
              } catch (urlError: any) {
                console.log(`❌ Registration failed ${baseUrl}:`, urlError.message);
                continue;
              }
            }
            
            throw new Error(`All backend URLs failed for registration. Tried: ${uniqueUrls.join(', ')}`);
          }
        }
      ];

      let lastError: Error | null = null;
      
      for (const registerAttempt of registerAttempts) {
        try {
          console.log(`🔄 Trying ${registerAttempt.name}...`);
          authData = await registerAttempt.attempt();
          console.log(`✅ Registration successful with ${registerAttempt.name}`);
          break;
        } catch (error: any) {
          console.log(`❌ ${registerAttempt.name} failed:`, error.message);
          lastError = error;
          continue;
        }
      }
      
      // If all attempts failed, try fallback
      if (!authData!) {
        console.log('🔄 All registration attempts failed, trying fallback...');
        try {
          const { fallbackAuth } = await import('@/lib/api-fallback');
          authData = await fallbackAuth.register(email, password, name);
          console.log('✅ Registration successful with fallback');
        } catch (fallbackError: any) {
          console.error('❌ Fallback registration also failed:', fallbackError);
          throw lastError || fallbackError;
        }
      }

      // Registration successful - data is saved to database
      // But don't auto-login user, they need to login manually
      
      // Clear rate limiting on successful registration
      rateLimiter.clearLimit(rateLimitKey);
      
      toast.success('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      
      return {
        user: authData.user,
        redirectPath: '/auth/login',
        registered: true // Flag to indicate successful registration
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let message = 'สมัครสมาชิกไม่สำเร็จ';
      
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.code === 'ECONNREFUSED') {
        message = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่หรือไม่';
      } else if (error.message.includes('409') || error.message.includes('already exists') || error.message.includes('User with this email already exists')) {
        message = 'อีเมลนี้มีผู้ใช้งานแล้ว';
      } else if (error.message.includes('429')) {
        message = 'มีการพยายามสมัครสมาชิกมากเกินไป กรุณาลองใหม่ภายหลัง';
      } else if (error.message.includes('400')) {
        message = 'ข้อมูลการสมัครสมาชิกไม่ถูกต้อง';
      } else if (error.message && !error.message.includes('Rate limit')) {
        message = error.message;
      }
      
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    if (state.auth.isLoggingOut) {
      console.log('🚫 Logout already in progress, skipping...');
      return { redirectPath: '/auth/login', forceRedirect: true };
    }
    
    console.log('🚪 Redux logout function called');
    
    try {
      // Clear all auth data immediately
      console.log('🗑️ Clearing auth storage...');
      authStorage.clearAll();
      
      // Clear all browser storage thoroughly
      if (typeof window !== 'undefined') {
        console.log('🗑️ Clearing browser storage...');
        
        // Clear session storage completely
        sessionStorage.clear();
        
        // Clear specific localStorage keys
        const keysToRemove = [
          'user', 'access_token', 'refresh_token', 'csrf_token',
          'authUser', 'authToken', 'token', 'userToken', 'auth_timestamp'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
      }
      
      // Try API logout (non-blocking)
      try {
        console.log('🔄 Attempting logout API call...');
        await authAPI.logout();
        console.log('✅ Logout API successful');
      } catch (error) {
        console.warn('❌ Logout API failed (continuing with local logout):', error);
      }
      
      console.log('✅ Local logout completed successfully');
      toast.success('ออกจากระบบสำเร็จ');
      
      return { 
        redirectPath: '/auth/login',
        forceRedirect: true,
        success: true
      };
    } catch (error) {
      console.error('❌ Local logout failed:', error);
      
      // Force clear everything anyway
      authStorage.clearAll();
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.clear();
      }
      
      toast.success('ออกจากระบบสำเร็จ');
      
      return { 
        redirectPath: '/auth/login',
        forceRedirect: true,
        success: true
      };
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      authStorage.clearAll();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('csrf_token');
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isAdmin = action.payload.role === 'ADMIN';
    },
  },
  extraReducers: (builder) => {
    builder
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.isAdmin = action.payload.role === 'ADMIN';
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isAdmin = action.payload.user.role === 'ADMIN';
      })
      .addCase(loginUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // Don't set user as authenticated after registration
        // User needs to login separately
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        
        console.log('✅ Register successful, redirecting to login:', action.payload.user.email);
      })
      .addCase(registerUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoggingOut = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoggingOut = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoggingOut = false;
        // Still clear auth on logout rejection
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
      });
  },
});

export const { clearAuth, setUser } = authSlice.actions;
export default authSlice.reducer;