'use client';

import React from 'react';
import { rateLimiter } from '@/lib/security';
import { usePermissions } from '@/hooks/usePermissions';
import { RefreshCw, Trash2, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const RateLimitDebug: React.FC = () => {
  const { isAdmin, userRole } = usePermissions();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleClearAll = () => {
    rateLimiter.clearAll();
    toast.success('Rate limits cleared!');
  };

  const handleClearLogin = () => {
    const cleared = rateLimiter.clearByPattern('login_');
    toast.success(`Cleared ${cleared} login rate limits!`);
  };

  const handleClearRegister = () => {
    const cleared = rateLimiter.clearByPattern('register_');
    toast.success(`Cleared ${cleared} register rate limits!`);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50">
      <div className="flex items-center space-x-2 mb-2">
        {isAdmin() ? (
          <Shield className="h-4 w-4 text-green-500" />
        ) : (
          <Users className="h-4 w-4 text-blue-500" />
        )}
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Rate Limit Debug
        </h3>
      </div>
      
      <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
        Role: <span className="font-semibold">{userRole}</span>
        {isAdmin() && <span className="text-green-600 ml-2">(No Limits)</span>}
        {!isAdmin() && <span className="text-orange-600 ml-2">(3 attempts/10min)</span>}
      </div>
      
      <div className="space-y-2">
        <button
          onClick={handleClearLogin}
          className="flex items-center space-x-2 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors w-full"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Clear Login Limits</span>
        </button>
        <button
          onClick={handleClearRegister}
          className="flex items-center space-x-2 text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition-colors w-full"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Clear Register Limits</span>
        </button>
        <button
          onClick={handleClearAll}
          className="flex items-center space-x-2 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors w-full"
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear All Limits</span>
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Development only
      </p>
    </div>
  );
};

export default RateLimitDebug;