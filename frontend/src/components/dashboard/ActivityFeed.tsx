'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsAPI, filesAPI } from '@/lib/api';
import { 
  FileText, 
  Upload, 
  Edit3, 
  Trash2,
  Eye,
  Clock,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'post_created' | 'post_updated' | 'post_deleted' | 'file_uploaded' | 'file_deleted' | 'post_viewed';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  metadata?: any;
}

export const ActivityFeed: React.FC = () => {
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['my-posts'],
    queryFn: () => postsAPI.getMyPosts(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['my-files'],
    queryFn: () => filesAPI.listFiles(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const generateActivityFeed = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Add post activities
    if (posts?.data && posts.data.length > 0) {
      posts.data.forEach((post: any) => {
        // Post created activity
        activities.push({
          id: `post-created-${post.id}`,
          type: 'post_created',
          title: 'สร้างโพสต์ใหม่',
          description: `สร้างโพสต์ "${post.title}"`,
          timestamp: new Date(post.createdAt),
          icon: FileText,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          metadata: { postId: post.id, title: post.title }
        });

        // Post updated activity (if updated date is different from created)
        if (post.updatedAt && post.updatedAt !== post.createdAt) {
          activities.push({
            id: `post-updated-${post.id}`,
            type: 'post_updated',
            title: 'อัปเดตโพสต์',
            description: `แก้ไขโพสต์ "${post.title}"`,
            timestamp: new Date(post.updatedAt),
            icon: Edit3,
            iconColor: 'text-orange-500',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            metadata: { postId: post.id, title: post.title }
          });
        }
      });
    }

    // Add file activities
    if (files?.data && files.data.length > 0) {
      files.data.forEach((file: any) => {
        activities.push({
          id: `file-uploaded-${file.id}`,
          type: 'file_uploaded',
          title: 'อัปโหลดไฟล์',
          description: `อัปโหลด "${file.originalName || file.filename || 'ไฟล์ใหม่'}"`,
          timestamp: new Date(file.createdAt || file.uploadedAt || new Date()),
          icon: Upload,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          metadata: { fileId: file.id, filename: file.originalName || file.filename }
        });
      });
    }

    // Sort by timestamp (newest first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Return top 8 activities
    return activities.slice(0, 8);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'เมื่อสักครู่';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} นาทีที่แล้ว`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ชั่วโมงที่แล้ว`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} วันที่แล้ว`;
    } else {
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const formatFullDate = (date: Date): string => {
    return date.toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (postsLoading || filesLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activities = generateActivityFeed();

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            กิจกรรมทั้งหมด
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ติดตามกิจกรรมและการเปลี่ยนแปลงล่าสุดของคุณ
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>{activities.length} กิจกรรม</span>
        </div>
      </div>
      
      {activities.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <div className={`${activity.bgColor} rounded-lg p-2 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFullDate(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            ยังไม่มีกิจกรรม
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            เริ่มต้นด้วยการสร้างโพสต์หรืออัปโหลดไฟล์
          </p>
        </div>
      )}
    </div>
  );
};