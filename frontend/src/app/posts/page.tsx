'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI } from '@/lib/api';
import { useAppSelector } from '@/store/hooks';
import { authStorage } from '@/lib/auth-storage';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const PostsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['my-posts'],
    queryFn: async () => {
      try {
        // Check if backend is available first
        const { checkBackendHealth, fallbackPosts, showFallbackNotification } = await import('@/lib/api-fallback');
        const isBackendAvailable = await checkBackendHealth();
        
        if (isBackendAvailable) {
          // Try backend first
          const token = authStorage.getAccessToken();
          if (!token) {
            throw new Error('No authentication token');
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/posts/my-posts`, {
            cache: 'no-store',
            mode: 'cors',
            credentials: 'omit',
            signal: controller.signal,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Authentication failed. Please login again.');
            }
            if (response.status >= 500) {
              throw new Error('Server error. Please try again later.');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          return { data: data || [] };
        } else {
          // Use fallback posts
          console.log('Using fallback posts (demo mode)');
          const fallbackData = await fallbackPosts.getMyPosts();
          showFallbackNotification();
          return fallbackData;
        }
      } catch (error: any) {
        console.error('Posts API error:', error);
        
        // If backend fails, try fallback
        if (error.message.includes('fetch') || 
            error.message.includes('network') || 
            error.message.includes('Failed to fetch') ||
            error.name === 'AbortError') {
          
          try {
            console.log('Backend failed, using fallback posts');
            const { fallbackPosts, showFallbackNotification } = await import('@/lib/api-fallback');
            const fallbackData = await fallbackPosts.getMyPosts();
            showFallbackNotification();
            return fallbackData;
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            throw new Error('ไม่สามารถโหลดโพสต์ได้ กรุณาลองใหม่อีกครั้ง');
          }
        }
        
        if (error.message.includes('Authentication')) {
          toast.error('กรุณาเข้าสู่ระบบใหม่');
          throw error;
        }
        
        throw error;
      }
    },
    enabled: !!user, // Only run query if user is authenticated
    retry: (failureCount, error: any) => {
      // Retry up to 2 times for network/timeout errors
      if (error?.message?.includes('network') || 
          error?.message?.includes('fetch') || 
          error?.message?.includes('timeout') ||
          error?.message?.includes('เชื่อมต่อ') ||
          error?.name === 'AbortError') {
        return failureCount < 2;
      }
      // Don't retry for auth errors
      if (error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        // Check if backend is available first
        const { checkBackendHealth, fallbackPosts } = await import('@/lib/api-fallback');
        const isBackendAvailable = await checkBackendHealth();
        
        if (isBackendAvailable) {
          // Try backend first
          const token = authStorage.getAccessToken();
          if (!token) {
            throw new Error('No authentication token');
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/posts/${id}`, {
            method: 'DELETE',
            cache: 'no-store',
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Authentication failed. Please login again.');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
          }

          return response.json();
        } else {
          // Use fallback delete
          return await fallbackPosts.delete(id);
        }
      } catch (error: any) {
        // If backend fails, try fallback
        if (error.message.includes('fetch') || 
            error.message.includes('network') || 
            error.message.includes('Failed to fetch')) {
          
          try {
            const { fallbackPosts } = await import('@/lib/api-fallback');
            return await fallbackPosts.delete(id);
          } catch (fallbackError) {
            console.error('Fallback delete failed:', fallbackError);
            throw new Error('ไม่สามารถลบโพสต์ได้ กรุณาลองใหม่อีกครั้ง');
          }
        }
        
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      toast.success('ลบโพสต์สำเร็จ');
      setDeleteId(null);
    },
    onError: (error: any) => {
      console.error('Delete post error:', error);
      if (error.message.includes('Authentication')) {
        toast.error('กรุณาเข้าสู่ระบบใหม่');
      } else {
        toast.error(error.message || 'ลบโพสต์ไม่สำเร็จ');
      }
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            คุณต้องเข้าสู่ระบบเพื่อดูโพสต์ของคุณ
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-responsive-subtitle text-gray-900 dark:text-white mb-2">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-responsive-body text-gray-600 dark:text-gray-400 mb-4">
            {error?.message || 'ไม่สามารถโหลดโพสต์ได้'}
          </p>
          <button
            onClick={() => refetch()}
            className="btn-primary"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs sm:text-sm">ลองใหม่</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-responsive-title text-gray-900 dark:text-white transition-colors duration-200">My Posts</h1>
          <p className="text-responsive-body text-gray-600 dark:text-gray-300 transition-colors duration-200">Manage your posts and content</p>
        </div>
        <Link
          href="/posts/create"
          className="btn-primary transition-colors duration-200"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          <span className="text-xs sm:text-sm">Create Post</span>
        </Link>
      </div>

      {/* Posts List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        {posts?.data && posts.data.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.data.map((post: any) => (
              <li key={post.id}>
                <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/posts/${post.id}`}
                            className="text-responsive-subtitle text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 text-truncate transition-colors duration-200"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center flex-shrink-0">
                            {post.published ? (
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 dark:text-green-400" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                          <span>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                          <span>•</span>
                          <span>
                            Created {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          {post.content && (
                            <>
                              <span>•</span>
                              <span>
                                {post.content.length > 100 
                                  ? `${post.content.substring(0, 100)}...` 
                                  : post.content}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.published 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                      } transition-colors duration-200`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Link
                          href={`/posts/${post.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 transition-colors duration-200"
                          title="ดูโพสต์"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/posts/${post.id}/edit`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 p-1 transition-colors duration-200"
                          title="แก้ไขโพสต์"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(post.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 transition-colors duration-200"
                          title="ลบโพสต์"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">No posts</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              Get started by creating your first post.
            </p>
            <div className="mt-6">
              <Link
                href="/posts/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 transition-colors duration-200">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 transition-colors duration-200">Delete Post</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsPage;