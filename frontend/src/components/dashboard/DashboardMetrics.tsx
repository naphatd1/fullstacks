'use client';

import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  FileText, 
  Upload, 
  Activity, 
  Users,
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
  bgColor: string;
  iconColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  bgColor,
  iconColor
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 md:p-6 transition-all duration-200 hover:shadow-md">
      <div className={`flex items-center justify-center w-12 h-12 ${bgColor} rounded-xl`}>
        <Icon className={`${iconColor} w-6 h-6`} />
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 dark:text-white/90 text-2xl">
            {value}
          </h4>
        </div>
        
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            changeType === 'increase' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {changeType === 'increase' ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

export const DashboardMetrics: React.FC = () => {
  const { posts, files, health, users, isLoading } = useDashboardData();

  // Show loading state if data is loading
  if (isLoading) {
    const { MetricsLoadingSkeleton } = require('./LoadingSpinner');
    return <MetricsLoadingSkeleton />;
  }

  const metrics = [
    {
      title: 'Total Posts',
      value: posts.data?.data?.length || 0,
      change: '+12%',
      changeType: 'increase' as const,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'My Files',
      value: files.data?.data?.length || 0,
      change: '+8%',
      changeType: 'increase' as const,
      icon: Upload,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'System Health',
      value: health.data?.data?.status === 'ok' ? '99.9%' : '85%',
      change: health.data?.data?.status === 'ok' ? '+0.1%' : '-2%',
      changeType: health.data?.data?.status === 'ok' ? 'increase' : 'decrease',
      icon: Activity,
      color: health.data?.data?.status === 'ok' ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600',
      bgColor: health.data?.data?.status === 'ok' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20',
      iconColor: health.data?.data?.status === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Total Users',
      value: users.data?.data?.length || 0,
      change: '+5%',
      changeType: 'increase' as const,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};