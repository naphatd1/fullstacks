'use client';

import React from 'react';
import { Loader2, Shield } from 'lucide-react';

interface AuthLoadingScreenProps {
  message?: string;
}

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ 
  message = 'กำลังตรวจสอบสิทธิ์...' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="relative mb-6">
          <Shield className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" />
          <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin absolute -bottom-1 -right-1" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {message}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          กรุณารอสักครู่...
        </p>
        
        {/* Loading dots animation */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;