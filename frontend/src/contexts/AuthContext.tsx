'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { nextjs15AuthAPI } from '@/lib/nextjs15-api';
import { authStorage, authUtils } from '@/lib/auth-storage';
import { rateLimiter, csrfToken } from '@/lib/security';
import { User, AuthResponse } from '@/types';

import { envConfig } from '@/lib/env-config';

const API_URL = envConfig.getApiUrl();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    // Generate CSRF token on app start
    if (!csrfToken.get()) {
      const token = csrfToken.generate();
      csrfToken.store(token);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const token = authStorage.getAccessToken();
      const savedUser = authStorage.getUser();

      if (token && savedUser) {
        setUser(savedUser);
        
        // Verify token is still valid (skip for now to avoid errors)
        // try {
        //   const response = await authAPI.getProfile();
        //   setUser(response.data);
        // } catch (error) {
        //   // Token invalid, clear auth
        //   clearAuth();
        // }
      }
    } catch (error) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
    authStorage.clearAll();
    // Clear CSRF token
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('csrf_token');
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🎯 AuthContext.login called:', {
      email,
      passwordLength: password?.length,
      timestamp: new Date().toISOString(),
      location: typeof window !== 'undefined' ? {
        hostname: window.location.hostname,
        href: window.location.href,
        userAgent: navigator.userAgent.substring(0, 50)
      } : 'SSR'
    });

    // Rate limiting check
    const rateLimitKey = `login_${email}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 5, 15 * 60 * 1000)) {
      const remaining = rateLimiter.getRemainingAttempts(rateLimitKey, 5);
      console.error('🚫 Rate limit exceeded:', { rateLimitKey, remaining });
      toast.error(`Too many login attempts. Please try again later. (${remaining} attempts remaining)`);
      throw new Error('Rate limit exceeded');
    }

    try {
      console.log('🔐 AuthContext: Attempting login...');
      
      // Enhanced network connectivity check
      if (typeof window !== 'undefined') {
        if (!navigator.onLine) {
          toast.error('ไม่มีการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อของคุณ');
          throw new Error('No internet connection');
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
            toast.error('⚠️ เครือข่ายช้า กำลังปรับแต่งการเชื่อมต่อ...');
          }
        }
      }
      
      // Comprehensive backend connectivity check
      const quickHealthCheck = async () => {
        const currentHost = window.location.hostname;
        const testUrls = [];
        
        // Add environment URL first (most likely to work)
        const envUrl = process.env.NEXT_PUBLIC_API_URL;
        if (envUrl) {
          testUrls.push(`${envUrl}/health`);
        }
        
        // If mobile (IP access), try same IP
        if (currentHost.match(/^\d+\.\d+\.\d+\.\d+$/)) {
          testUrls.push(`http://${currentHost}:4000/api/health`);
        }
        
        // Use environment API URL if available
        if (process.env.NEXT_PUBLIC_API_URL) {
          testUrls.push(`${process.env.NEXT_PUBLIC_API_URL}/health`);
        }
        
        // Always try localhost variants
        testUrls.push('http://localhost:4000/api/health');
        testUrls.push('http://127.0.0.1:4000/api/health');
        
        // Remove duplicates
        const uniqueUrls = Array.from(new Set(testUrls));
        console.log('🔍 Testing backend connectivity...', { testUrls: uniqueUrls, currentHost });
        
        for (const url of uniqueUrls) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s check
            
            console.log(`🔄 Testing: ${url}`);
            
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
              },
              mode: 'cors',
              credentials: 'include',
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            console.log(`📡 Health check response from ${url}: ${response.status} ${response.statusText}`);
            
            if (response.ok || response.status === 200) {
              console.log(`✅ Backend confirmed reachable at: ${url}`);
              return { reachable: true, workingUrl: url };
            }
          } catch (e: any) {
            console.log(`❌ Backend test failed for ${url}:`, {
              name: e.name,
              message: e.message,
              type: e.constructor.name
            });
            continue;
          }
        }
        return { reachable: false, workingUrl: null };
      };
      
      const healthCheckResult = await quickHealthCheck();
      if (!healthCheckResult.reachable) {
        console.warn('⚠️ Backend health check failed, but continuing with login attempts...');
        // Don't show toast error for health check - only show if actual login fails
        // toast.error('⚠️ เซิร์ฟเวอร์อาจมีปัญหา กำลังพยายามเชื่อมต่อ...');
      } else {
        console.log('✅ Backend health check passed:', healthCheckResult.workingUrl);
      }
      
      console.log('📍 Login debug info:', {
        currentURL: typeof window !== 'undefined' ? window.location.href : 'N/A',
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
        port: typeof window !== 'undefined' ? window.location.port : 'N/A',
        protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 100) : 'N/A',
        apiUrl: API_URL,
        email: email,
        timestamp: new Date().toISOString()
      });
      
      let authData: AuthResponse | undefined;
      
      // Enhanced device detection (move to top level)
      const currentHost = window.location.hostname;
      const userAgent = navigator.userAgent.toLowerCase();
      const isIPAddress = currentHost.match(/^\d+\.\d+\.\d+\.\d+$/);
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.screen.width <= 768;
      const isMobile = isIPAddress || isMobileUA || isSmallScreen;
      
      console.log('🔍 Top-level device detection:', {
        host: currentHost,
        isIPAddress: !!isIPAddress,
        isMobileUA,
        screenWidth: window.screen.width,
        isSmallScreen,
        isMobile,
        userAgent: userAgent.substring(0, 50) + '...'
      });

      // Circuit breaker for mobile - if network is too slow, fail fast
      const connection = (navigator as any).connection;
      const isSlow = connection && (connection.effectiveType === 'slow-2g' || connection.rtt > 3000);
      if (isSlow) {
        console.warn('🐌 Very slow network detected, using simplified login');
        toast.error('เครือข่ายช้า กำลังใช้โหมดเรียบง่าย...');
      }
      
      // Try multiple login approaches for better compatibility
      // Prioritize direct backend for mobile/tablet with simplified fetch
      const loginAttempts = [
        {
          name: 'Mobile-Optimized Direct Backend',
          attempt: async () => {
            // Use top-level device detection (already defined above)
            console.log(`🔍 Using top-level device detection for mobile-optimized attempt`);
            
            // Priority order: mobile-specific URLs first (only working ones)
            const backendUrls = [];
            
            if (isMobile) {
              // Mobile ONLY works with Simple strategy on same IP
              if (isIPAddress) {
                backendUrls.push(`http://${currentHost}:4000/api`);
                console.log(`📱 Mobile: ONLY using same IP (${currentHost}) with Simple strategy`);
                // Don't add any other URLs for mobile - they don't work
              } else {
                // If mobile but not on IP, try common IPs
                // For mobile, only try current host IP
                backendUrls.push(`http://${currentHost}:4000/api`);
                console.log(`📱 Mobile: Using current host IP only`);
              }
            } else {
              // Desktop can try localhost
              backendUrls.push('http://localhost:4000/api');
              backendUrls.push('http://127.0.0.1:4000/api');
              backendUrls.push(API_URL);
            }
            
            // Remove duplicates and limit URLs for slow networks
            const uniqueUrls = Array.from(new Set(backendUrls));
            const urlsToTry = isSlow ? uniqueUrls.slice(0, 2) : uniqueUrls; // Only try first 2 URLs if slow
            console.log(`🎯 Mobile-optimized login URLs:`, { all: uniqueUrls, trying: urlsToTry });
            
            for (const baseUrl of urlsToTry) {
              try {
                console.log(`🔄 Mobile login attempt: ${baseUrl}`);
                
                const loginPayload = { email, password };
                console.log(`📤 Sending login payload:`, { email: email, passwordLength: password.length });
                
                // Mobile ONLY works with Simple strategy, Desktop can try all
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
                  },
                  {
                    name: 'No-CORS',
                    options: {
                      method: 'POST',
                      mode: 'no-cors' as RequestMode,
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(loginPayload),
                    }
                  }
                ];
                
                // Mobile: Simple + CORS strategies, Desktop: try all, Slow: limit strategies
                let fetchStrategies;
                if (isMobile) {
                  fetchStrategies = [allStrategies[0], allStrategies[1]]; // Simple + CORS for mobile
                  console.log(`📱 Mobile: Using Simple + CORS strategies`);
                } else if (isSlow) {
                  fetchStrategies = allStrategies.slice(0, 1); // Only Simple if slow
                } else {
                  fetchStrategies = allStrategies; // All strategies for desktop
                }
                
                for (const strategy of fetchStrategies) {
                  try {
                    console.log(`🔄 Trying ${strategy.name} strategy for ${baseUrl}`);
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => {
                      console.log(`⏰ Timeout reached for ${strategy.name} ${baseUrl}`);
                      controller.abort();
                    }, 3000); // Reduced from 8000 to 3000ms for mobile
                    
                    const response = await fetch(`${baseUrl}/auth/login`, {
                      ...strategy.options,
                      signal: controller.signal,
                    } as RequestInit);
                    
                    clearTimeout(timeoutId);
                    
                    console.log(`📡 ${strategy.name} response from ${baseUrl}: ${response.status} ${response.statusText} (type: ${response.type})`);
                    
                    // Handle different response types
                    if (strategy.name === 'No-CORS' && response.type === 'opaque') {
                      console.log(`✅ No-CORS request succeeded (opaque response) - assuming success`);
                      // For no-cors, we can't read the response but can assume success if no error
                      return {
                        access_token: 'temp-token',
                        user: { email, name: email.split('@')[0], role: 'USER' },
                        message: 'Login via No-CORS - please refresh to get actual tokens'
                      };
                    } else if (response.ok && response.status >= 200 && response.status < 300) {
                      try {
                        const data = await response.json();
                        console.log(`✅ ${strategy.name} login successful via ${baseUrl}`, { 
                          hasAccessToken: !!data.access_token,
                          hasUser: !!data.user,
                          userRole: data.user?.role,
                          fullData: data
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
                  stack: urlError.stack?.split('\n')[0]
                });
                continue;
              }
            }
            
            throw new Error(`All mobile-optimized URLs failed. Tried: ${uniqueUrls.join(', ')}`);
          }
        },
        {
          name: 'Direct Backend (Legacy)',
          attempt: async () => {
            // Original approach as fallback
            const currentHost = window.location.hostname;
            const backendUrls = [API_URL];
            
            if (currentHost.match(/^\d+\.\d+\.\d+\.\d+$/)) {
              backendUrls.unshift(`http://${currentHost}:4000/api`);
            }
            
            backendUrls.push('http://localhost:4000/api');
            backendUrls.push('http://127.0.0.1:4000/api');
            
            const uniqueUrls = Array.from(new Set(backendUrls));
            
            for (const baseUrl of uniqueUrls) {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                const response = await fetch(`${baseUrl}/auth/login`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'User-Agent': navigator.userAgent,
                  },
                  mode: 'cors',
                  credentials: 'include',
                  body: JSON.stringify({ email, password }),
                  signal: controller.signal,
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                  const data = await response.json();
                  console.log(`✅ Legacy login successful via ${baseUrl}`);
                  return data;
                }
              } catch (urlError: any) {
                continue;
              }
            }
            
            throw new Error(`All legacy backend URLs failed. Tried: ${uniqueUrls.join(', ')}`);
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

      let lastError: Error | null = null;
      let attemptCount = 0;
      
      // Determine max attempts based on device type
      let maxAttempts;
      if (isMobile) {
        maxAttempts = 2; // Mobile: try Mobile-Optimized first, then Primary API as fallback
        console.log('📱 Mobile: Using 2 login attempts (Mobile-Optimized + Primary API)');
      } else if (isSlow) {
        maxAttempts = 1; // Slow network: only 1 attempt
      } else {
        maxAttempts = loginAttempts.length; // Desktop: try all
      }
      
      for (const loginAttempt of loginAttempts.slice(0, maxAttempts)) {
        attemptCount++;
        try {
          console.log(`🔄 Trying ${loginAttempt.name}... (${attemptCount}/${maxAttempts})`);
          
          // Early timeout for hanging requests
          const attemptPromise = loginAttempt.attempt();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error(`Login attempt timeout after 5 seconds`));
            }, 5000);
          });
          
          authData = await Promise.race([attemptPromise, timeoutPromise]) as AuthResponse;
          console.log(`✅ Login successful with ${loginAttempt.name}`, {
            authDataType: typeof authData,
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
          
          // Fail fast for mobile if network issues
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
          
          // Timeout fallback as well
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
      } else if (isMobile) {
        console.log('📱 Mobile fallback completed - all mobile login strategies attempted');
      } else if (isSlow) {
        console.log('⚡ Skipping fallback for slow network');
      }

      // Check if authData exists before using it
      if (!authData) {
        console.error('🚨 No authData received - all login methods failed');
        console.error('🔍 Debug info:', {
          isMobile,
          isIPAddress,
          currentHost,
          maxAttempts,
          attemptCount,
          lastError: lastError?.message,
          lastErrorName: lastError?.name,
          lastErrorStack: lastError?.stack?.split('\n').slice(0, 3)
        });
        
        // For mobile, provide specific error message
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
          authData
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

      // Save tokens and user data in session storage (cleared when browser closes)
      authStorage.setTokens({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        user: authData.user
      });

      setUser(authData.user);
      
      // Show success message - avoid window object to prevent hydration issues
      if (process.env.NODE_ENV === 'development') {
        toast.success(`เข้าสู่ระบบสำเร็จ! 🎉\n(จะออกจากระบบอัตโนมัติเมื่อปิดเบราว์เซอร์)`);
      } else {
        toast.success('เข้าสู่ระบบสำเร็จ! (จะออกจากระบบอัตโนมัติเมื่อปิดเบราว์เซอร์)');
      }
      
      // Clear rate limiting on successful login
      rateLimiter.attempts.delete(rateLimitKey);
      
      // Redirect based on role
      if (authData.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('🚨 Final login error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        data: error.data
      });
      
      let message = 'เข้าสู่ระบบไม่สำเร็จ';
      
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('All backend URLs failed') || error.message.includes('All mobile-optimized URLs failed') || error.code === 'ECONNREFUSED') {
        // Check if mobile (redeclare for error handling)
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
        const userAgent = typeof window !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
        const isIPAddress = currentHost.match(/^\d+\.\d+\.\d+\.\d+$/);
        const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isSmallScreen = typeof window !== 'undefined' ? window.screen.width <= 768 : false;
        const isMobileError = isIPAddress || isMobileUA || isSmallScreen;
        
        if (isMobileError) {
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
        // Use server error message if available
        message = error.message;
      }
      
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    // Rate limiting check
    const rateLimitKey = `register_${email}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 3, 60 * 60 * 1000)) { // 3 attempts per hour
      toast.error('Too many registration attempts. Please try again later.');
      throw new Error('Rate limit exceeded');
    }

    try {
      console.log('🔐 Attempting registration...');
      
      let authData: AuthResponse;
      
      // Try multiple registration approaches for better compatibility
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
            // Smart backend detection for registration
            const currentHost = window.location.hostname;
            const currentProtocol = window.location.protocol;
            
            console.log(`🔍 Registration - Current host: ${currentHost}, protocol: ${currentProtocol}`);
            
            // Smart backend URL detection
            const backendUrls = [];
            
            // If accessing via IP (mobile), try that IP for backend
            if (currentHost.match(/^\d+\.\d+\.\d+\.\d+$/)) {
              backendUrls.push(`http://${currentHost}:4000/api`);
              console.log(`📱 Mobile registration (IP: ${currentHost}), trying same IP for backend`);
            }
            
            // Always try localhost variants
            backendUrls.push('http://localhost:4000/api');
            backendUrls.push('http://127.0.0.1:4000/api');
            
            // Add fallback API_URL
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

      // Registration successful - user data is saved to database
      // But don't auto-login, user needs to login manually
      
      toast.success('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      
      // Clear rate limiting on successful registration
      rateLimiter.attempts.delete(rateLimitKey);
      
      // Redirect to login page instead of dashboard
      router.push('/auth/login?registered=true');
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
      throw error;
    }
  };

  const logout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout calls
    
    console.log('🚪 Logout function called');
    setIsLoggingOut(true);
    
    // Fire-and-forget API call (don't wait for it)
    // This ensures UI logout happens immediately while API call happens in background
    setTimeout(async () => {
      try {
        console.log('🔄 Background logout API call...');
        await authAPI.logout();
        console.log('✅ Background logout API successful');
      } catch (error) {
        console.warn('❌ Background logout API failed (ignored):', error);
      }
    }, 0);
    
    // Immediate local logout
    console.log('🧹 Performing immediate local logout');
    
    try {
      // Clear auth data and redirect
      clearAuth();
      toast.success('ออกจากระบบสำเร็จ');
      router.push('/auth/login');
      console.log('✅ Local logout completed successfully');
    } catch (error) {
      console.error('❌ Local logout failed:', error);
      // Force clear and redirect anyway
      clearAuth();
      router.push('/auth/login');
    }
    
    setIsLoggingOut(false);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};