'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions, UserRole } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import AuthLoadingScreen from './AuthLoadingScreen';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: {
    resource: string;
    permission: 'read' | 'write' | 'delete' | 'admin';
  };
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  redirectTo = '/dashboard'
}) => {
  const router = useRouter();
  const { userRole, hasPermission, isAuthenticated } = usePermissions();
  const { loading, isInitialized, isMounted } = useAuth();

  // Show loading screen while auth is being checked
  if (!isMounted || (loading && !isInitialized)) {
    return <AuthLoadingScreen message="กำลังตรวจสอบสิทธิ์..." />;
  }

  // Debug authentication state
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 ProtectedRoute - Auth check:', {
      isAuthenticated,
      userRole,
      requiredRole,
      requiredPermission,
      loading,
      isInitialized,
      isMounted
    });
  }

  // Check authentication
  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <Lock className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to access this page.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && userRole !== requiredRole) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-orange-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Insufficient Permissions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            This page requires <span className="font-semibold">{requiredRole}</span> role.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your current role: <span className="font-semibold">{userRole}</span>
          </p>
          <button
            onClick={() => router.push(redirectTo)}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission) {
    const hasRequiredPermission = hasPermission(
      requiredPermission.resource,
      requiredPermission.permission
    );

    if (!hasRequiredPermission) {
      if (fallback) return <>{fallback}</>;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              You don't have permission to {requiredPermission.permission} {requiredPermission.resource}.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Contact your administrator if you need access.
            </p>
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedRoute;