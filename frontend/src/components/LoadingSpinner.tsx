'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="relative inline-flex">
          <div className={`animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 ${sizes[size]}`}></div>
          <div 
            className={`absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-purple-500 ${sizes[size]}`}
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>
        </div>
        {text && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;