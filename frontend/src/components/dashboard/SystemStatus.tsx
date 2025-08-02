'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthAPI } from '@/lib/api';
import { 
  Server, 
  Database, 
  Wifi, 
  HardDrive,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface StatusItemProps {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value?: string;
  icon: React.ElementType;
}

const StatusItem: React.FC<StatusItemProps> = ({ name, status, value, icon: Icon }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${getBgColor()}`}>
          <Icon className={`w-4 h-4 ${getStatusColor()}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {name}
          </p>
          {value && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {value}
            </p>
          )}
        </div>
      </div>
      {getStatusIcon()}
    </div>
  );
};

export const SystemStatus: React.FC = () => {
  const { data: health, isLoading, isError } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => healthAPI.basic(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mock system status data
  const systemComponents = [
    {
      name: 'API Server',
      status: health?.data?.status === 'ok' ? 'healthy' : 'error',
      value: health?.data?.status === 'ok' ? 'Online' : 'Offline',
      icon: Server,
    },
    {
      name: 'Database',
      status: 'healthy' as const,
      value: 'Connected',
      icon: Database,
    },
    {
      name: 'Network',
      status: 'healthy' as const,
      value: '< 50ms',
      icon: Wifi,
    },
    {
      name: 'Storage',
      status: 'warning' as const,
      value: '78% used',
      icon: HardDrive,
    },
  ];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            สถานะระบบ
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ตรวจสอบสถานะของระบบทั้งหมด
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {systemComponents.map((component, index) => (
          <StatusItem key={index} {...component} />
        ))}
      </div>

      {/* Overall Status */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            สถานะโดยรวม
          </span>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              ระบบทำงานปกติ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};