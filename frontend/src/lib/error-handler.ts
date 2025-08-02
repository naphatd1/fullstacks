'use client';

import { QueryClient } from '@tanstack/react-query';
import { fallbackPosts, fallbackFiles, fallbackHealth, showFallbackNotification } from './api-fallback';

// Global error handler for API calls
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private fallbackMode = false;
  private notificationShown = false;

  private constructor() {}

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  enableFallbackMode() {
    if (!this.fallbackMode) {
      this.fallbackMode = true;
      if (!this.notificationShown) {
        this.notificationShown = true;
        // Show notification only once
        setTimeout(() => {
          showFallbackNotification();
        }, 1000);
      }
    }
  }

  isFallbackMode(): boolean {
    return this.fallbackMode;
  }

  handleApiError(error: any, queryKey: string[]): any {
    // Suppress console errors for API calls
    if (error?.message?.includes('Network Error') || 
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('Forbidden') ||
        error?.status === 403 ||
        error?.status === 401) {
      
      this.enableFallbackMode();
      
      // Return fallback data based on query key
      return this.getFallbackData(queryKey);
    }
    
    // For other errors, still enable fallback but don't suppress
    this.enableFallbackMode();
    return this.getFallbackData(queryKey);
  }

  private getFallbackData(queryKey: string[]): any {
    const key = queryKey[0];
    
    switch (key) {
      case 'my-posts':
        return fallbackPosts.getMyPosts();
      case 'posts':
        return fallbackPosts.getAll();
      case 'my-files':
      case 'files':
        return fallbackFiles.listFiles();
      case 'health':
      case 'system-health':
        return fallbackHealth.basic();
      case 'users':
        return { data: [] }; // Empty array for users if no permission
      default:
        return { data: [] };
    }
  }
}

// Create query client with global error handling
export const createQueryClientWithErrorHandling = () => {
  const errorHandler = GlobalErrorHandler.getInstance();
  
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          // Don't retry for auth errors or network errors
          if (error?.status === 401 || 
              error?.status === 403 || 
              error?.message?.includes('Network Error') ||
              error?.message?.includes('Failed to fetch')) {
            return false;
          }
          return failureCount < 1;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        onError: (error: any, query) => {
          // Handle error and return fallback data
          const fallbackData = errorHandler.handleApiError(error, query.queryKey as string[]);
          return fallbackData;
        },
      },
      mutations: {
        retry: false,
        onError: (error: any) => {
          console.warn('Mutation error:', error?.message || 'Unknown error');
        },
      },
    },
  });
};

// Suppress specific console errors
export const suppressConsoleErrors = () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    const message = args[0];
    
    // Suppress specific API-related errors
    if (typeof message === 'string' && (
      message.includes('Network Error') ||
      message.includes('Failed to fetch') ||
      message.includes('API Error') ||
      message.includes('Forbidden resource') ||
      message.includes('HTTP 403') ||
      message.includes('HTTP 401')
    )) {
      return; // Don't log these errors
    }
    
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args[0];
    
    // Suppress specific API-related warnings
    if (typeof message === 'string' && (
      message.includes('API failed, using fallback') ||
      message.includes('Backend health check failed')
    )) {
      return; // Don't log these warnings
    }
    
    originalWarn.apply(console, args);
  };
};