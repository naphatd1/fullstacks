'use client';

// Global console error suppression for API-related errors
export const initializeConsoleSuppression = () => {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  // List of error patterns to suppress
  const suppressPatterns = [
    'Network Error',
    'Failed to fetch',
    'API Error',
    'Forbidden resource',
    'HTTP 403',
    'HTTP 401',
    'HTTP 500',
    'CORS',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
    'TypeError: Failed to fetch',
    'AbortError',
    'Request timeout',
    'Connection refused',
    'getaddrinfo ENOTFOUND',
    'ECONNREFUSED',
    'API failed, using fallback',
    'Backend health check failed',
    'Query failed',
    'Mutation failed'
  ];

  // Override console.error
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Check if this error should be suppressed
    const shouldSuppress = suppressPatterns.some(pattern => 
      message.includes(pattern)
    );
    
    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };

  // Override console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Check if this warning should be suppressed
    const shouldSuppress = suppressPatterns.some(pattern => 
      message.includes(pattern)
    );
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Suppress specific React Query errors
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || '';
    
    const shouldSuppress = suppressPatterns.some(pattern => 
      message.includes(pattern)
    );
    
    if (shouldSuppress) {
      event.preventDefault();
    }
  });

  // Return cleanup function
  return () => {
    console.error = originalError;
    console.warn = originalWarn;
    console.log = originalLog;
  };
};