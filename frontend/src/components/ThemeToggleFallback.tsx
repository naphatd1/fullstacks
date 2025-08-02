'use client';

import React from 'react';

const ThemeToggleFallback: React.FC = () => {
  return (
    <div className="p-2 w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  );
};

export default ThemeToggleFallback;