'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { checkAuth, logoutUser, clearAuth } from '@/store/slices/authSlice';
import { authStateManager, authHelpers } from '@/lib/auth-utils';
import { authDebug } from '@/lib/auth-debug';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Track if component is mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
    if (process.env.NODE_ENV === 'development') {
      authDebug.logAuthFlow('useAuth mounted');
      authDebug.checkStorage();
    }
  }, []);

  // Initialize auth check only once
  useEffect(() => {
    if (isMounted && !hasCheckedAuth && !authState.loading) {
      console.log('🔄 useAuth - Initializing auth check...');
      setHasCheckedAuth(true);
      
      dispatch(checkAuth()).finally(() => {
        console.log('✅ useAuth - Auth check completed');
        setIsInitialized(true);
      });
    }
  }, [dispatch, isMounted, hasCheckedAuth, authState.loading]);

  // Logout function with proper cleanup
  const logout = async () => {
    if (authState.isLoggingOut) {
      console.log('🚫 Logout already in progress');
      return;
    }

    console.log('🚪 useAuth - Logout initiated');

    try {
      // Dispatch logout action
      const result = await dispatch(logoutUser()).unwrap();
      console.log('✅ useAuth - Logout completed:', result);
      
      // Immediate redirect without delay
      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login');
      }
      
      return result;
    } catch (error) {
      console.error('❌ useAuth - Logout error:', error);
      
      // Force clear state even on error
      dispatch(clearAuth());
      
      // Force redirect even on error
      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login');
      }
      
      return { success: false, error };
    }
  };

  // Force logout with immediate cleanup
  const forceLogout = async () => {
    console.log('🚪 useAuth - Force logout initiated');
    
    try {
      // Clear auth state manager
      await authStateManager.forceLogout();
      
      // Clear Redux state
      dispatch(clearAuth());
      
      // Immediate redirect
      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login');
      }
    } catch (error) {
      console.error('❌ useAuth - Force logout error:', error);
      
      // Force clear and redirect even on error
      dispatch(clearAuth());
      
      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login');
      }
    }
  };

  // Check if user has specific role
  const hasRole = (role: string): boolean => {
    return authState.user?.role === role;
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return hasRole('ADMIN');
  };

  // Get user display name
  const getDisplayName = (): string => {
    if (!authState.user) return '';
    return authState.user.name || authState.user.email || 'User';
  };

  return {
    // Auth state
    ...authState,
    isInitialized,
    isMounted,
    // Override loading to prevent hydration mismatch
    loading: !isMounted || authState.loading,
    
    // Helper functions
    logout,
    forceLogout,
    hasRole,
    isAdmin,
    getDisplayName,
    
    // Utility functions
    safeRedirect: authHelpers.safeRedirect,
    getRedirectPath: authHelpers.getRedirectPath,
    isAuthPage: authHelpers.isAuthPage,
    isHomePage: authHelpers.isHomePage,
  };
};

export default useAuth;