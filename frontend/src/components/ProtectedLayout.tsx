'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthLoadingScreen from './AuthLoadingScreen';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/auth/login'
}) => {
  const { 
    isAuthenticated, 
    isAdmin, 
    loading, 
    isInitialized, 
    safeRedirect,
    user 
  } = useAuth();

  useEffect(() => {
    // Only check after initialization is complete
    if (!isInitialized || loading) return;

    console.log('🔒 ProtectedLayout check:', {
      requireAuth,
      requireAdmin,
      isAuthenticated,
      isAdmin: isAdmin(),
      user: user?.email,
      isInitialized,
      loading
    });

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      console.log('🚫 ProtectedLayout - Auth required but not authenticated, redirecting to:', redirectTo);
      safeRedirect(redirectTo);
      return;
    }

    // If admin is required but user is not admin
    if (requireAdmin && (!isAuthenticated || !isAdmin())) {
      console.log('🚫 ProtectedLayout - Admin required but user is not admin, redirecting to dashboard');
      safeRedirect('/dashboard');
      return;
    }

    // If user is authenticated but on auth pages, redirect to dashboard
    if (isAuthenticated && (redirectTo === '/auth/login' || redirectTo === '/auth/register')) {
      console.log('✅ ProtectedLayout - User authenticated on auth page, redirecting to dashboard');
      safeRedirect('/dashboard');
      return;
    }
  }, [
    isAuthenticated, 
    isAdmin, 
    loading, 
    isInitialized, 
    requireAuth, 
    requireAdmin, 
    redirectTo, 
    safeRedirect,
    user
  ]);

  // Show loading screen while checking auth
  if (!isInitialized || loading) {
    return <AuthLoadingScreen message="กำลังตรวจสอบสิทธิ์การเข้าถึง..." />;
  }

  // If auth is required but user is not authenticated, show loading
  // (redirect will happen in useEffect)
  if (requireAuth && !isAuthenticated) {
    return <AuthLoadingScreen message="กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ..." />;
  }

  // If admin is required but user is not admin, show loading
  // (redirect will happen in useEffect)
  if (requireAdmin && (!isAuthenticated || !isAdmin())) {
    return <AuthLoadingScreen message="ไม่มีสิทธิ์เข้าถึง กำลังเปลี่ยนเส้นทาง..." />;
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedLayout;