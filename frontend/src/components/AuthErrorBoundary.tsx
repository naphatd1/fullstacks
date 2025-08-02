'use client';

import React, { Component, ReactNode } from 'react';
import { authStateManager } from '@/lib/auth-utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 AuthErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 AuthErrorBoundary error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // If it's an auth-related error, clear auth state
    if (
      error.message.includes('auth') ||
      error.message.includes('token') ||
      error.message.includes('login') ||
      error.message.includes('unauthorized')
    ) {
      console.log('🧹 Auth-related error detected, clearing auth state');
      authStateManager.forceLogout();
    }
  }

  handleRetry = () => {
    console.log('🔄 AuthErrorBoundary retry clicked');
    this.setState({ hasError: false, error: undefined });
    
    // Reset auth state manager
    authStateManager.reset();
    
    // Reload the page to start fresh
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    console.log('🏠 AuthErrorBoundary go home clicked');
    this.setState({ hasError: false, error: undefined });
    
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                เกิดข้อผิดพลาด
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ระบบพบข้อผิดพลาดในการโหลดหน้าเว็บ กรุณาลองใหม่อีกครั้ง
              </p>
              
              {this.state.error && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  ลองใหม่
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  กลับหน้าหลัก
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;