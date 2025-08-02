'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2, Globe, Zap } from 'lucide-react';
import { envConfig } from '@/lib/env-config';

interface ApiStatus {
  isOnline: boolean;
  responseTime?: number;
  lastChecked: Date;
  serverInfo?: any;
}

const ApiStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<ApiStatus>({
    isOnline: false,
    lastChecked: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const checkApiStatus = async () => {
    const startTime = Date.now();
    
    try {
      // Get available API URLs to try
      const apiUrls = envConfig.getApiUrls();
      let lastError;
      
      // Try each URL until one works
      for (const baseUrl of apiUrls) {
        const healthUrl = `${baseUrl}/health`;
        
        try {
          console.log('🔍 Checking API health at:', healthUrl);
          
          const response = await fetch(healthUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(8000)
          });
          
          const responseTime = Date.now() - startTime;
          
          if (response.ok) {
            // Try to get server info from response
            let serverInfo;
            try {
              serverInfo = await response.json();
            } catch (e) {
              // If JSON parsing fails, it's still OK
              serverInfo = { message: 'Server is running' };
            }
            
            console.log('✅ API health check successful:', { url: healthUrl, responseTime, serverInfo });
            setStatus({
              isOnline: true,
              responseTime,
              lastChecked: new Date(),
              serverInfo: { ...serverInfo, url: healthUrl }
            });
            return; // Success, exit function
          } else {
            lastError = new Error(`API returned error status: ${response.status} from ${healthUrl}`);
          }
        } catch (error) {
          lastError = error;
          console.log(`❌ Failed to reach ${healthUrl}:`, error);
          continue; // Try next URL
        }
      }
      
      // If we get here, all URLs failed
      throw lastError || new Error('All API endpoints failed');
      
    } catch (error) {
      console.log('❌ All API health checks failed:', error);
      setStatus({
        isOnline: false,
        responseTime: undefined,
        lastChecked: new Date(),
        serverInfo: undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkApiStatus();
    
    // Set up interval for periodic checks
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isLoading) return 'text-yellow-500';
    return status.isOnline ? 'text-emerald-500' : 'text-red-500';
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    return status.isOnline ? 
      <Zap className="w-4 h-4" /> : 
      <WifiOff className="w-4 h-4" />;
  };

  const getTooltipContent = () => {
    if (isLoading) return 'Checking API status...';
    if (status.isOnline) {
      return `API ONLINE ${status.responseTime}ms`;
    }
    return 'API OFFLINE';
  };

  const getTooltipText = () => {
    const lastCheckedTime = status.lastChecked.toLocaleTimeString();
    
    if (status.isOnline) {
      const lines = [
        `✅ API is online`,
        `⚡ Response time: ${status.responseTime}ms`,
        `🕒 Last checked: ${lastCheckedTime}`
      ];
      
      if (status.serverInfo?.url) {
        lines.push(`🌐 Connected to: ${status.serverInfo.url}`);
      }
      
      if (status.serverInfo?.status) {
        lines.push(`📊 Status: ${status.serverInfo.status}`);
      }
      
      return lines.join('\n');
    }
    
    return [
      `❌ API is offline`,
      `🕒 Last checked: ${lastCheckedTime}`,
      `💡 Check if backend server is running on port 4000`
    ].join('\n');
  };

  const handleClick = () => {
    if (!isLoading) {
      checkApiStatus();
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Icon Button */}
      <button
        onClick={handleClick}
        className={`relative p-2 rounded-xl bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-800/70 hover:scale-105 ${getStatusColor()}`}
        disabled={isLoading}
      >
        <div className="relative">
          {getStatusIcon()}
          {/* Status pulse effect when online */}
          {status.isOnline && !isLoading && (
            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20"></div>
          )}
        </div>
      </button>

      {/* Custom Tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
          <div className="relative">
            {/* Tooltip Arrow */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45"></div>
            
            {/* Tooltip Content */}
            <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg">
              {getTooltipContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiStatusIndicator;