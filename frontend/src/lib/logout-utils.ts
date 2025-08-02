'use client';

import { authStorage } from './auth-storage';

// Simple logout utility
export const simpleLogout = async () => {
  console.log('🚪 Simple logout initiated');
  
  try {
    // Clear all auth storage
    authStorage.clearAll();
    
    // Clear any Redux state if available
    if (typeof window !== 'undefined') {
      // Clear any cached data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear session storage
      sessionStorage.clear();
      
      // Redirect to login
      window.location.replace('/auth/login');
    }
    
    console.log('✅ Simple logout completed');
    return { success: true };
  } catch (error) {
    console.error('❌ Simple logout error:', error);
    throw error;
  }
};

// Force logout utility
export const forceLogout = async () => {
  console.log('🚪 Force logout initiated');
  
  try {
    // Clear all possible storage
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Force redirect
      window.location.replace('/auth/login');
    }
    
    console.log('✅ Force logout completed');
    return { success: true };
  } catch (error) {
    console.error('❌ Force logout error:', error);
    
    // Last resort - just redirect
    if (typeof window !== 'undefined') {
      window.location.replace('/auth/login');
    }
    
    return { success: false, error };
  }
};

// Enhanced logout with multiple fallbacks
export const enhancedLogout = async () => {
  console.log('🚪 Enhanced logout initiated');
  
  try {
    // Try simple logout first
    await simpleLogout();
    return { success: true };
  } catch (error) {
    console.warn('Simple logout failed, trying force logout:', error);
    
    try {
      // Try force logout
      await forceLogout();
      return { success: true };
    } catch (forceError) {
      console.error('Force logout also failed:', forceError);
      
      // Last resort - just redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      
      return { success: false, error: forceError };
    }
  }
};