'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiConfig, apiUtils } from '@/lib/api-config';

interface ApiState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  baseUrl: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isMobileNetwork: boolean;
}

export const useApi = () => {
  const [state, setState] = useState<ApiState>({
    isConnected: false,
    isLoading: true,
    error: null,
    baseUrl: apiConfig.getBaseUrl(),
    deviceType: 'desktop',
    isMobileNetwork: false,
  });

  // Initialize API connection
  const initializeApi = useCallback(async () => {
    if (typeof window === 'undefined') return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🔄 useApi - Initializing API connection...');
      
      // Get device info
      const deviceType = apiUtils.getDeviceType();
      const isMobileNetwork = apiUtils.isMobileNetwork();
      
      console.log('📱 useApi - Device info:', { deviceType, isMobileNetwork });

      // Optimize connection for mobile devices
      const optimizedUrl = await apiConfig.optimizeConnection();
      
      // Test connectivity
      const isConnected = await apiUtils.isApiReachable(optimizedUrl);
      
      setState({
        isConnected,
        isLoading: false,
        error: isConnected ? null : 'Unable to connect to API',
        baseUrl: optimizedUrl,
        deviceType,
        isMobileNetwork,
      });

      console.log('✅ useApi - Initialization complete:', {
        isConnected,
        baseUrl: optimizedUrl,
        deviceType,
        isMobileNetwork,
      });
    } catch (error) {
      console.error('❌ useApi - Initialization failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'API initialization failed',
        isConnected: false,
      }));
    }
  }, []);

  // Test API connectivity
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const isReachable = await apiUtils.isApiReachable(state.baseUrl);
      setState(prev => ({
        ...prev,
        isConnected: isReachable,
        error: isReachable ? null : 'API connection lost',
      }));
      return isReachable;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      }));
      return false;
    }
  }, [state.baseUrl]);

  // Retry connection
  const retryConnection = useCallback(async () => {
    console.log('🔄 useApi - Retrying connection...');
    apiConfig.reset();
    await initializeApi();
  }, [initializeApi]);

  // Make API request with automatic retry
  const makeRequest = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = `${state.baseUrl}${endpoint}`;
    
    try {
      console.log(`🔄 useApi - Making request to: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        // Add timeout for mobile networks
        signal: AbortSignal.timeout(state.isMobileNetwork ? 10000 : 5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update connection status on successful request
      if (!state.isConnected) {
        setState(prev => ({ ...prev, isConnected: true, error: null }));
      }

      return data;
    } catch (error) {
      console.error(`❌ useApi - Request failed for ${url}:`, error);
      
      // Update connection status on failed request
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Request failed',
      }));

      throw error;
    }
  }, [state.baseUrl, state.isConnected, state.isMobileNetwork]);

  // Initialize on mount
  useEffect(() => {
    initializeApi();
  }, [initializeApi]);

  // Periodic connectivity check for mobile devices
  useEffect(() => {
    if (!state.isMobileNetwork) return;

    const interval = setInterval(async () => {
      if (!state.isConnected) {
        console.log('🔄 useApi - Periodic connectivity check...');
        await testConnection();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [state.isMobileNetwork, state.isConnected, testConnection]);

  return {
    ...state,
    initializeApi,
    testConnection,
    retryConnection,
    makeRequest,
    
    // Utility functions
    getApiUrl: (endpoint: string) => `${state.baseUrl}${endpoint}`,
    isReady: !state.isLoading && state.isConnected,
    
    // Device-specific helpers
    isMobile: state.deviceType === 'mobile',
    isTablet: state.deviceType === 'tablet',
    isDesktop: state.deviceType === 'desktop',
  };
};

export default useApi;