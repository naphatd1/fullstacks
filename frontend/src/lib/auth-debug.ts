'use client';

// Debug utilities for authentication flow
export const authDebug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Auth Debug: ${message}`, data || '');
    }
  },

  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Auth Error: ${message}`, error || '');
    }
  },

  checkStorage: () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    const timestamp = localStorage.getItem('auth_timestamp');

    authDebug.log('Storage Check', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      hasUser: !!user,
      userEmail: user ? JSON.parse(user)?.email : null,
      timestamp: timestamp ? new Date(parseInt(timestamp)).toISOString() : null,
      timeSinceAuth: timestamp ? Date.now() - parseInt(timestamp) : null
    });
  },

  logAuthFlow: (step: string, data?: any) => {
    authDebug.log(`Auth Flow - ${step}`, data);
  }
};

// Auto-check storage on import (development only)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  setTimeout(() => {
    authDebug.checkStorage();
  }, 1000);
}