'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ApiStatusToggleProps {
  className?: string;
  compact?: boolean; // New prop for compact mode
}

const ApiStatusToggle: React.FC<ApiStatusToggleProps> = ({ className = '', compact = false }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const checkApiStatus = async () => {
    setIsChecking(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      });
      
      const endTime = Date.now();
      const responseTimeMs = endTime - startTime;
      
      if (response.ok) {
        setIsOnline(true);
        setResponseTime(responseTimeMs);
      } else {
        setIsOnline(false);
        setResponseTime(null);
      }
    } catch (error) {
      console.error('API health check failed:', error);
      setIsOnline(false);
      setResponseTime(null);
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  };

  const copyApiUrl = async () => {
    try {
      await navigator.clipboard.writeText(API_URL);
      // Could add a toast notification here
      console.log('API URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy API URL:', error);
    }
  };

  // Auto-check on mount and setup interval
  useEffect(() => {
    checkApiStatus();
    
    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      interval = setInterval(checkApiStatus, refreshInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = () => {
    if (isChecking) return 'bg-yellow-500';
    if (isOnline === null) return 'bg-gray-500';
    return isOnline ? 'bg-emerald-500' : 'bg-red-500';
  };

  const getStatusTextColor = () => {
    if (isChecking) return 'text-yellow-500';
    if (isOnline === null) return 'text-gray-500';
    return isOnline ? 'text-emerald-500' : 'text-red-500';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (isOnline === null) return 'Unknown';
    return isOnline ? 'Online' : 'Offline';
  };

  const getStatusIcon = () => {
    if (isChecking) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isOnline === null) return <AlertCircle className="h-4 w-4" />;
    return isOnline ? <CheckCircle className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
  };

  const formatLastChecked = () => {
    if (!lastChecked) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastChecked.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastChecked.toLocaleTimeString();
  };

  if (compact) {
    // Compact version for navbar
    return (
      <div className={`relative group ${className}`}>
        <button
          onClick={checkApiStatus}
          disabled={isChecking}
          className={`
            relative p-2.5 rounded-xl 
            backdrop-blur-sm 
            shadow-lg shadow-slate-200/20 dark:shadow-slate-900/30
            transition-all duration-300 ease-out
            hover:shadow-xl hover:shadow-slate-200/30 dark:hover:shadow-slate-900/40
            hover:scale-105 active:scale-95
            ${isOnline && !isChecking 
              ? 'api-status-border-online dark:api-status-border-online-dark ring-2 ring-emerald-400/20 dark:ring-emerald-500/30' 
              : 'api-status-border dark:api-status-border-dark'
            }
            ${isChecking ? 'cursor-not-allowed animate-pulse opacity-75' : 'cursor-pointer'}
          `}
        >
          <div className="relative">
            {getStatusIcon()}
            {/* Enhanced status effects when online */}
            {isOnline && !isChecking && (
              <>
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping opacity-40" />
                {/* Outer glow */}
                <div className="absolute -inset-1 rounded-full bg-emerald-400/20 animate-pulse opacity-60 blur-sm" />
                {/* Subtle shimmer */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent animate-shimmer" />
              </>
            )}
            {/* Loading spinner overlay */}
            {isChecking && (
              <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-spin border-2 border-transparent border-t-yellow-400/60" />
            )}
          </div>
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-blue-400/10 group-hover:via-purple-400/10 group-hover:to-pink-400/10 transition-all duration-500 opacity-0 group-hover:opacity-100 blur-sm" />
          
          {/* Border highlight on hover */}
          <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/20 dark:group-hover:border-slate-400/30 transition-all duration-300" />
        </button>

        {/* Compact Tooltip */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none z-50">
          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-medium shadow-2xl border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 min-w-max">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isOnline && !isChecking ? 'animate-pulse' : ''}`} />
              <span 
                className="font-semibold api-tooltip-text" 
                style={{ color: 'white' }}
              >
                API {getStatusText().toUpperCase()}
              </span>
            </div>
            {/* Enhanced Tooltip Arrow */}
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-l border-t border-slate-700/50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Main Toggle Button */}
      <button
        onClick={checkApiStatus}
        disabled={isChecking}
        className={`
          relative inline-flex items-center gap-3 px-4 py-2.5 rounded-full
          bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl 
          border border-gray-700/50 hover:border-gray-600/50
          hover:from-gray-800/90 hover:to-gray-700/90
          transition-all duration-500 ease-out
          shadow-2xl hover:shadow-3xl
          transform hover:scale-105 active:scale-95
          ${isChecking ? 'cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}
        `}
      >
        {/* Status Indicator Dot with Glow Effect */}
        <div className="relative">
          <div 
            className={`
              w-3 h-3 rounded-full transition-all duration-500 transform
              ${getStatusColor()}
              ${isOnline && !isChecking ? 'animate-pulse shadow-lg' : ''}
              ${isOnline ? 'shadow-green-400/50' : isOnline === false ? 'shadow-red-400/50' : 'shadow-gray-400/50'}
            `}
          />
          {isOnline && !isChecking && (
            <>
              <div className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor()} animate-ping opacity-75`} />
              <div className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor()} animate-pulse opacity-50 blur-sm scale-150`} />
            </>
          )}
        </div>

        {/* Status Icon */}
        <div className={`${compact ? getStatusTextColor() : 'text-white/90 group-hover:text-white'} transition-colors duration-200`}>
          {getStatusIcon()}
        </div>

        {/* Status Text with Gradient */}
        <span className="text-sm font-semibold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300">
          API {getStatusText()}
        </span>

        {/* Response Time Badge with Animation */}
        {responseTime && isOnline && (
          <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-100 rounded-full border border-green-400/30 animate-fade-in">
            {responseTime}ms
          </span>
        )}

        {/* Animated Border Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500 blur-sm" />
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        </div>
      </button>

      {/* Detailed Status Tooltip with Enhanced Styling */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none z-50">
        <div className="bg-gradient-to-br from-white/98 to-gray-50/98 dark:from-gray-900/98 dark:to-gray-800/98 backdrop-blur-xl text-gray-900 dark:text-white text-xs rounded-xl px-4 py-3 shadow-2xl border border-gray-300/50 dark:border-gray-600/30 min-w-max">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="font-medium text-gray-900 dark:text-white">Status: {getStatusText()}</span>
            </div>
            {responseTime && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-300">
                <Activity className="h-3 w-3" />
                <span>Response: {responseTime}ms</span>
              </div>
            )}
            {lastChecked && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-3 w-3" />
                <span>Updated: {formatLastChecked()}</span>
              </div>
            )}
            <div className="border-t border-gray-300/50 dark:border-gray-600/30 pt-2 mt-2">
              <button
                onClick={copyApiUrl}
                className="text-xs text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors duration-200 truncate max-w-full"
                title="Click to copy API URL"
              >
                📋 {API_URL}
              </button>
            </div>
          </div>
          {/* Enhanced Tooltip Arrow */}
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-white/98 to-gray-50/98 dark:from-gray-900/98 dark:to-gray-800/98 rotate-45 border-l border-t border-gray-300/50 dark:border-gray-600/30" />
        </div>
      </div>
    </div>
  );
};

export default ApiStatusToggle;