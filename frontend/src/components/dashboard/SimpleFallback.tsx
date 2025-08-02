'use client';

import React from 'react';
import { AlertCircle, Database, Wifi } from 'lucide-react';

interface SimpleFallbackProps {
  title?: string;
  message?: string;
  type?: 'error' | 'offline' | 'loading';
}

export const SimpleFallback: React.FC<SimpleFallbackProps> = ({
  title = 'ไม่สามารถโหลดข้อมูลได้',
  message = 'กำลังใช้ข้อมูลตัวอย่าง',
  type = 'offline'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'offline':
        return <Wifi className="w-8 h-8 text-yellow-500" />;
      case 'loading':
        return <Database className="w-8 h-8 text-blue-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800';
      case 'offline':
        return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800';
      case 'loading':
        return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className={`rounded-2xl border p-6 ${getBgColor()}`}>
      <div className="flex flex-col items-center justify-center text-center space-y-3">
        {getIcon()}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleFallback;