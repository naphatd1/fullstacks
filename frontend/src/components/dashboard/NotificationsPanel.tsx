'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  X,
  Settings,
  MoreHorizontal
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}> = ({ notification, onMarkAsRead, onDismiss }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${
      notification.read 
        ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700' 
        : `${getBgColor()} border-current opacity-90`
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${
              notification.read 
                ? 'text-gray-700 dark:text-gray-300' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {notification.title}
            </h4>
            <p className={`text-sm mt-1 ${
              notification.read 
                ? 'text-gray-500 dark:text-gray-400' 
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {notification.message}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {notification.time}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Mark as read"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDismiss(notification.id)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'โพสต์ใหม่ถูกเผยแพร่',
      message: 'โพสต์ "การเริ่มต้นใช้งาน Dashboard" ได้รับการเผยแพร่เรียบร้อยแล้ว',
      time: '5 นาทีที่แล้ว',
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'อัปเดตระบบ',
      message: 'ระบบจะมีการอัปเดตในวันที่ 15 กุมภาพันธ์ 2025 เวลา 02:00 น.',
      time: '1 ชั่วโมงที่แล้ว',
      read: false,
    },
    {
      id: '3',
      type: 'warning',
      title: 'พื้นที่จัดเก็บเกือบเต็ม',
      message: 'พื้นที่จัดเก็บไฟล์ใช้ไปแล้ว 85% กรุณาลบไฟล์ที่ไม่จำเป็น',
      time: '3 ชั่วโมงที่แล้ว',
      read: true,
    },
    {
      id: '4',
      type: 'info',
      title: 'ฟีเจอร์ใหม่',
      message: 'เพิ่มฟีเจอร์การแชร์โพสต์บน Social Media แล้ว',
      time: '1 วันที่แล้ว',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              การแจ้งเตือน
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {unreadCount > 0 ? `${unreadCount} ข้อความใหม่` : 'ไม่มีข้อความใหม่'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              อ่านทั้งหมด
            </button>
          )}
          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDismiss={handleDismiss}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              ไม่มีการแจ้งเตือน
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              การแจ้งเตือนใหม่จะปรากฏที่นี่
            </p>
          </div>
        )}
      </div>
    </div>
  );
};