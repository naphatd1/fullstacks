'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth, clearAuth } from '@/store/slices/authSlice';
import { csrfToken } from '@/lib/security';
import { authHelpers } from '@/lib/auth-utils';
import { usePathname } from 'next/navigation';

// Inner component to access dispatch
const ReduxInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Track mounting to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize auth check only once after mounting
  useEffect(() => {
    if (isMounted && !isInitialized) {
      console.log('🔄 ReduxProvider initializing...');
      
      // Check auth on app start
      dispatch(checkAuth()).finally(() => {
        setIsInitialized(true);
      });
      
      // Generate CSRF token on app start
      if (!csrfToken.get()) {
        const token = csrfToken.generate();
        csrfToken.store(token);
      }
    }
  }, [dispatch, isInitialized, isMounted]);

  // Handle redirects only after initialization and mounting
  useEffect(() => {
    if (!isMounted || !isInitialized || loading) return;
    console.log('🔍 Auth state changed:', { 
      isAuthenticated, 
      hasUser: !!user, 
      pathname,
      userEmail: user?.email,
      isInitialized,
      isMounted,
      loading
    });

    const isAuthPage = authHelpers.isAuthPage(pathname);
    const isHomePage = authHelpers.isHomePage(pathname);
    
    // Don't redirect if still loading or not initialized
    if (loading || !isInitialized) return;

    // If not authenticated and not on auth/home pages, redirect to login
    if (!isAuthenticated && !isAuthPage && !isHomePage) {
      console.log('🚫 Not authenticated, redirecting to login');
      authHelpers.safeRedirect('/auth/login');
    }
    
    // If authenticated and on auth pages, redirect to appropriate dashboard
    if (isAuthenticated && isAuthPage) {
      console.log('✅ Authenticated, redirecting to dashboard');
      const redirectPath = authHelpers.getRedirectPath(user);
      authHelpers.safeRedirect(redirectPath);
    }
  }, [isAuthenticated, user, pathname, isInitialized, isMounted, loading]);

  return <>{children}</>;
};

// Main provider component
export const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <ReduxInitializer>
        {children}
      </ReduxInitializer>
    </Provider>
  );
};