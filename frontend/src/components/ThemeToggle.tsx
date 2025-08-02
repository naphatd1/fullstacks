'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="p-2 w-9 h-9 rounded-lg bg-gray-100 animate-pulse">
        <div className="w-5 h-5 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative group p-2.5 rounded-xl 
        backdrop-blur-sm 
        shadow-lg shadow-slate-200/20 dark:shadow-slate-900/30
        transition-all duration-300 ease-out
        hover:shadow-xl hover:shadow-slate-200/30 dark:hover:shadow-slate-900/40
        hover:scale-105 active:scale-95
        focus:outline-none
        theme-toggle-border dark:theme-toggle-border-dark
      `}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon with Enhanced Effects */}
        <Sun
          className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-500 ease-out ${
            theme === 'light'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-180 scale-50'
          }`}
        />
        
        {/* Sun Glow Effect */}
        {theme === 'light' && (
          <>
            <div className="absolute inset-0 w-5 h-5 text-yellow-400 animate-ping opacity-30">
              <Sun className="w-full h-full" />
            </div>
            <div className="absolute -inset-1 w-7 h-7 bg-yellow-400/20 rounded-full animate-pulse blur-sm" />
          </>
        )}
        
        {/* Moon Icon with Enhanced Effects */}
        <Moon
          className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-500 ease-out ${
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-180 scale-50'
          }`}
        />
        
        {/* Moon Glow Effect */}
        {theme === 'dark' && (
          <>
            <div className="absolute inset-0 w-5 h-5 text-blue-300 animate-pulse opacity-40">
              <Moon className="w-full h-full" />
            </div>
            <div className="absolute -inset-1 w-7 h-7 bg-blue-400/20 rounded-full animate-pulse blur-sm" />
          </>
        )}
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/0 via-orange-400/0 to-yellow-400/0 group-hover:from-yellow-400/10 group-hover:via-orange-400/10 group-hover:to-yellow-400/10 transition-all duration-500 opacity-0 group-hover:opacity-100 blur-sm" />
      
      {/* Border highlight on hover */}
      <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/20 dark:group-hover:border-slate-400/30 transition-all duration-300" />
      
      {/* Enhanced Tooltip */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none z-50">
        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-medium shadow-2xl border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 min-w-max">
            {theme === 'light' ? (
              <>
                <Moon className="w-3 h-3 text-blue-400" />
                <span className="font-semibold api-tooltip-text" style={{ color: 'white' }}>
                  DARK MODE
                </span>
              </>
            ) : (
              <>
                <Sun className="w-3 h-3 text-yellow-400" />
                <span className="font-semibold api-tooltip-text" style={{ color: 'white' }}>
                  LIGHT MODE
                </span>
              </>
            )}
          </div>
          {/* Enhanced Tooltip Arrow */}
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-l border-t border-slate-700/50" />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;