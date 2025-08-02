'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Wifi, WifiOff } from 'lucide-react';

interface FallbackNotificationProps {
  show: boolean;
  onDismiss: () => void;
}

export const FallbackNotification: React.FC<FallbackNotificationProps> = ({ 
  show, 
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              โหมดออฟไลน์
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กำลังใช้ข้อมูลตัวอย่าง
            </p>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800/30 transition-colors"
          >
            <X className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Connection Status Indicator
export const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try to fetch a small resource to check connectivity
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        const newOnlineStatus = response.ok;
        
        if (isOnline !== newOnlineStatus) {
          setIsOnline(newOnlineStatus);
          if (!newOnlineStatus) {
            setShowNotification(true);
          }
        }
      } catch (error) {
        if (isOnline) {
          setIsOnline(false);
          setShowNotification(true);
        }
      }
    };

    // Check immediately
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    // Listen to online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return (
    <>
      {/* Connection Status Indicator in Header */}
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
            <Wifi className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">ออนไลน์</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">ออฟไลน์</span>
          </div>
        )}
      </div>

      {/* Fallback Notification */}
      <FallbackNotification 
        show={showNotification && !isOnline}
        onDismiss={() => setShowNotification(false)}
      />
    </>
  );
};

export default FallbackNotification;