'use client';

import { useQuery } from '@tanstack/react-query';
import { postsAPI, filesAPI, healthAPI, usersAPI } from '@/lib/api';
import { GlobalErrorHandler } from '@/lib/error-handler';

const errorHandler = GlobalErrorHandler.getInstance();

// Custom hook for posts data with fallback
export const usePostsData = () => {
  return useQuery({
    queryKey: ['my-posts'],
    queryFn: async () => {
      try {
        return await postsAPI.getMyPosts();
      } catch (error) {
        return errorHandler.handleApiError(error, ['my-posts']);
      }
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Custom hook for files data with fallback
export const useFilesData = () => {
  return useQuery({
    queryKey: ['my-files'],
    queryFn: async () => {
      try {
        return await filesAPI.listFiles();
      } catch (error) {
        return errorHandler.handleApiError(error, ['my-files']);
      }
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Custom hook for health data with fallback
export const useHealthData = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      try {
        return await healthAPI.basic();
      } catch (error) {
        return errorHandler.handleApiError(error, ['health']);
      }
    },
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Custom hook for users data with fallback
export const useUsersData = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        return await usersAPI.getAll();
      } catch (error) {
        // For users, return empty array if no permission
        return { data: [] };
      }
    },
    retry: false,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Combined hook for all dashboard data
export const useDashboardData = () => {
  const posts = usePostsData();
  const files = useFilesData();
  const health = useHealthData();
  const users = useUsersData();

  return {
    posts,
    files,
    health,
    users,
    isLoading: posts.isLoading || files.isLoading || health.isLoading || users.isLoading,
    isError: posts.isError && files.isError && health.isError && users.isError,
    isFallbackMode: errorHandler.isFallbackMode(),
  };
};