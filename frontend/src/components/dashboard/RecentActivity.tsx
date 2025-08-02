'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsAPI, filesAPI } from '@/lib/api';
import { 
  FileText, 
  Upload, 
  User, 
  Clock,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'post' | 'file' | 'profile';
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

export const RecentActivity: React.FC = () => {
  const { data: posts, isError: postsError } = useQuery({
    queryKey: ['my-posts'],
    queryFn: () => postsAPI.getMyPosts(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: files, isError: filesError } = useQuery({
    queryKey: ['my-files'],
    queryFn: () => filesAPI.listFiles(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate recent activities based on actual data
  const generateActivities = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Combine posts and files with timestamps
    const allItems: Array<{
      id: string;
      type: 'post' | 'file';
      title: string;
      description: string;
      createdAt: string;
      icon: React.ElementType;
      iconColor: string;
      bgColor: string;
    }> = [];

    // Add posts
    if (posts?.data && posts.data.length > 0) {
      posts.data.forEach((post: any) => {
        allItems.push({
          id: `post-${post.id}`,
          type: 'post',
          title: 'สร้างโพสต์ใหม่',
          description: `เผยแพร่ "${post.title}"`,
          createdAt: post.createdAt,
          icon: FileText,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        });
      });
    }

    // Add files
    if (files?.data && files.data.length > 0) {
      files.data.forEach((file: any) => {
        allItems.push({
          id: `file-${file.id}`,
          type: 'file',
          title: 'อัปโหลดไฟล์',
          description: `เพิ่ม ${file.originalName || file.filename || 'ไฟล์ใหม่'}`,
          createdAt: file.createdAt || file.uploadedAt || new Date().toISOString(),
          icon: Upload,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
        });
      });
    }

    // Sort by creation date (newest first)
    allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Convert to ActivityItem format
    allItems.slice(0, 4).forEach(item => {
      const timeAgo = getTimeAgo(new Date(item.createdAt));
      activities.push({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        time: timeAgo,
        icon: item.icon,
        iconColor: item.iconColor,
        bgColor: item.bgColor,
      });
    });

    // Add default activities if no data
    if (activities.length === 0) {
      activities.push(
        {
          id: '1',
          type: 'post',
          title: 'ยินดีต้อนรับสู่ Dashboard',
          description: 'เริ่มต้นด้วยการสร้างโพสต์แรกของคุณ',
          time: 'วันนี้',
          icon: FileText,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
          id: '2',
          type: 'file',
          title: 'จัดการไฟล์',
          description: 'อัปโหลดและจัดการไฟล์ของคุณ',
          time: 'วันนี้',
          icon: Upload,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
          id: '3',
          type: 'profile',
          title: 'ตั้งค่าโปรไฟล์',
          description: 'กรอกข้อมูลโปรไฟล์ให้สมบูรณ์',
          time: 'วันนี้',
          icon: User,
          iconColor: 'text-purple-500',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        }
      );
    }

    return activities;
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date: Date): string => {
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
      return date.toLocaleDateString('th-TH');
    }
  };

  // Show loading state if data is not available
  if (!posts && !files) {
    const { ActivityLoadingSkeleton } = require('./LoadingSpinner');
    return <ActivityLoadingSkeleton />;
  }

  const activities = generateActivities();

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            กิจกรรมล่าสุด
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            กิจกรรมและการเปลี่ยนแปลงล่าสุดของคุณ
          </p>
        </div>
        <Link
          href="/posts"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
        >
          ดูทั้งหมด
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`${activity.bgColor} rounded-lg p-2 flex-shrink-0`}>
              <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {activity.description}
              </p>
              <div className="flex items-center mt-1">
                <Clock className="h-3 w-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};