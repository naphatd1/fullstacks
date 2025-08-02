// Auth utilities for better state management
import { authStorage } from './auth-storage';

export class AuthStateManager {
  private static instance: AuthStateManager;
  private isInitialized = false;
  private authCheckPromise: Promise<any> | null = null;

  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  // Ensure auth check runs only once
  async checkAuthOnce(): Promise<any> {
    if (this.authCheckPromise) {
      return this.authCheckPromise;
    }

    this.authCheckPromise = this.performAuthCheck();
    return this.authCheckPromise;
  }

  private async performAuthCheck(): Promise<any> {
    if (typeof window === 'undefined') return null;

    try {
      const token = authStorage.getAccessToken();
      const savedUser = authStorage.getUser();
      const isValidSession = authStorage.isAuthenticated();

      console.log('🔍 AuthStateManager - Auth check:', { 
        hasToken: !!token, 
        hasUser: !!savedUser,
        isValidSession,
        userEmail: savedUser?.email 
      });

      if (token && savedUser && isValidSession) {
        console.log('✅ AuthStateManager - User authenticated:', savedUser.email);
        this.isInitialized = true;
        return savedUser;
      }
      
      // Clear invalid auth data
      if (!isValidSession) {
        console.log('🧹 AuthStateManager - Invalid session, clearing auth data');
        authStorage.clearAll();
      }
      
      console.log('❌ AuthStateManager - No valid auth data found');
      this.isInitialized = true;
      return null;
    } catch (error) {
      console.error('❌ AuthStateManager - Auth check error:', error);
      authStorage.clearAll();
      this.isInitialized = true;
      return null;
    }
  }

  // Force logout with proper cleanup
  async forceLogout(): Promise<void> {
    console.log('🚪 AuthStateManager - Force logout');
    
    try {
      // Clear all storage
      authStorage.clearAll();
      
      // Clear additional browser storage
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        
        const keysToRemove = [
          'user', 'access_token', 'refresh_token', 'csrf_token',
          'authUser', 'authToken', 'token', 'userToken', 'auth_timestamp'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
      }
      
      console.log('✅ AuthStateManager - Force logout completed');
    } catch (error) {
      console.error('❌ AuthStateManager - Force logout error:', error);
    }
  }

  // Reset state for fresh start
  reset(): void {
    this.isInitialized = false;
    this.authCheckPromise = null;
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const authStateManager = AuthStateManager.getInstance();

// Utility functions
export const authHelpers = {
  // Safe redirect that prevents infinite loops
  safeRedirect: (path: string, replace = true) => {
    if (typeof window === 'undefined') return;
    
    const currentPath = window.location.pathname;
    if (currentPath === path) {
      console.log(`🔄 Already on ${path}, skipping redirect`);
      return;
    }
    
    console.log(`🔄 Redirecting from ${currentPath} to ${path}`);
    
    if (replace) {
      window.location.replace(path);
    } else {
      window.location.href = path;
    }
  },

  // Check if current page is auth page
  isAuthPage: (pathname?: string): boolean => {
    const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    return path.startsWith('/auth/');
  },

  // Check if current page is home page
  isHomePage: (pathname?: string): boolean => {
    const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    return path === '/';
  },

  // Get appropriate redirect path based on user role
  getRedirectPath: (user: any): string => {
    if (!user) return '/auth/login';
    return user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
  }
};