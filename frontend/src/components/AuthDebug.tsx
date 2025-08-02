'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import { authStorage } from '@/lib/auth-storage';

const AuthDebug: React.FC = () => {
  const auth = useAuth();
  const authState = useAppSelector((state) => state.auth);
  
  const debugInfo = {
    // useAuth hook data
    hookData: {
      isAuthenticated: auth.isAuthenticated,
      isInitialized: auth.isInitialized,
      isMounted: auth.isMounted,
      loading: auth.loading,
      user: auth.user,
      isAdmin: auth.isAdmin,
    },
    
    // Redux state
    reduxState: {
      isAuthenticated: authState.isAuthenticated,
      loading: authState.loading,
      user: authState.user,
      isAdmin: authState.isAdmin,
    },
    
    // Storage data
    storageData: {
      hasAccessToken: !!authStorage.getAccessToken(),
      hasRefreshToken: !!authStorage.getRefreshToken(),
      hasUser: !!authStorage.getUser(),
      isAuthenticated: authStorage.isAuthenticated(),
      user: authStorage.getUser(),
    },
    
    // Browser storage raw data
    rawStorage: typeof window !== 'undefined' ? {
      sessionStorage: {
        access_token: sessionStorage.getItem('access_token'),
        refresh_token: sessionStorage.getItem('refresh_token'),
        user: sessionStorage.getItem('user'),
        auth_timestamp: sessionStorage.getItem('auth_timestamp'),
      },
      localStorage: {
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token'),
        user: localStorage.getItem('user'),
      }
    } : null
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#00ff00' }}>🔍 Auth Debug</h3>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      
      <div style={{ marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
        <button 
          onClick={() => {
            console.log('🔍 Auth Debug Info:', debugInfo);
            alert('Debug info logged to console');
          }}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            marginRight: '5px'
          }}
        >
          Log to Console
        </button>
        
        <button 
          onClick={() => {
            authStorage.clearAll();
            window.location.reload();
          }}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Clear Auth & Reload
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;