'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsAPI, filesAPI } from '@/lib/api';
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Download,
  Upload,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface StatItemProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ 
  label, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <div className={`flex items-center text-xs font-medium ${
            changeType === 'increase' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${
              changeType === 'decrease' ? 'rotate-180' : ''
            }`} />
            {change}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
};

export const UsageStats: React.FC = () => {
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

  // Calculate stats from actual data
  const publishedPosts = posts?.data?.filter((post: any) => post.published) || [];
  const draftPosts = posts?.data?.filter((post: any) => !post.published) || [];
  const totalFiles = files?.data?.length || 0;

  // Mock engagement data (in real app, this would come from analytics API)
  const stats = [
    {
      label: 'การดูโพสต์ทั้งหมด',
      value: '12.5K',
      change: '+15%',
      changeType: 'increase' as const,
      icon: Eye,
      color: 'bg-blue-500',
    },
    {
      label: 'โพสต์ที่เผยแพร่',
      value: publishedPosts.length,
      change: '+8%',
      changeType: 'increase' as const,
      icon: Heart,
      color: 'bg-red-500',
    },
    {
      label: 'ไฟล์ที่อัปโหลด',
      value: totalFiles,
      change: '+12%',
      changeType: 'increase' as const,
      icon: Upload,
      color: 'bg-green-500',
    },
    {
      label: 'การดาวน์โหลด',
      value: '2.1K',
      change: '+5%',
      changeType: 'increase' as const,
      icon: Download,
      color: 'bg-purple-500',
    },
    {
      label: 'ความคิดเห็น',
      value: '847',
      change: '+22%',
      changeType: 'increase' as const,
      icon: MessageCircle,
      color: 'bg-orange-500',
    },
    {
      label: 'การแชร์',
      value: '1.2K',
      change: '+18%',
      changeType: 'increase' as const,
      icon: Share2,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            สถิติการใช้งาน
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ข้อมูลการใช้งานในเดือนนี้
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>กุมภาพันธ์ 2025</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatItem key={index} {...stat} />
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {((publishedPosts.length / (posts?.data?.length || 1)) * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              อัตราการเผยแพร่
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              4.2
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              คะแนนเฉลี่ย
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {draftPosts.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              โพสต์ร่าง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};