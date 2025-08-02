'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export const useApiErrorHandler = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleQueryError = (error: any) => {
      console.error('Query Error:', error);
      
      // Don't show toast for 401 errors (handled by auth system)
      if (error?.status === 401) {
        return;
      }

      // Don't show toast for network errors (handled by fallback system)
      if (error?.message?.includes('Network Error') || 
          error?.message?.includes('Failed to fetch') ||
          error?.message?.includes('Request timeout')) {
        return;
      }

      // Show toast for other API errors
      const message = error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      
      toast.error(message, {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '8px',
        },
      });
    };

    // Listen to query errors
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'error') {
        handleQueryError(event.error);
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const handleError = (error: ApiError) => {
    console.error('API Error:', error);
    
    // Don't show toast for auth errors
    if (error.status === 401) {
      return;
    }

    const message = error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
    
    toast.error(message, {
      duration: 4000,
      position: 'bottom-right',
    });
  };

  const handleSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'bottom-right',
    });
  };

  return {
    handleError,
    handleSuccess,
  };
};