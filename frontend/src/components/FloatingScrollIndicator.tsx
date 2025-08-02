'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const FloatingScrollIndicator: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      setScrollProgress(scrollPercent);
      
      // Hide when near bottom (90% scrolled)
      setIsVisible(scrollPercent < 90);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    setIsAnimating(true);
    window.scrollBy({
      top: window.innerHeight * 0.8, // Scroll down 80% of viewport height
      behavior: 'smooth'
    });
    
    // Reset animation state after scroll
    setTimeout(() => setIsAnimating(false), 800);
  };

  // Don't render if completely invisible
  if (!isVisible && scrollProgress > 95) return null;

  return (
    <div className={`fixed right-4 sm:right-6 bottom-6 sm:bottom-8 z-50 group transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Main Container */}
      <div className="relative flex flex-col items-center">
        {/* Progress Ring */}
        <div className="relative mb-2">
          <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 64 64">
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-300 dark:text-gray-600"
            />
            {/* Progress circle */}
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - scrollProgress / 100)}`}
              className="transition-all duration-500 ease-out text-slate-400 dark:text-slate-500"
            />
          </svg>
          
          {/* Center button */}
          <button
            onClick={handleClick}
            className={`absolute inset-2 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}`}
          >
            <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-all duration-300 ${isAnimating ? 'animate-bounce' : ''}`} />
          </button>
        </div>

        {/* Progress text */}
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg border border-gray-200 dark:border-gray-600">
          {Math.round(scrollProgress)}%
        </div>

        {/* Tooltip */}
        <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-0 group-hover:scale-100">
          <div className="bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 text-sm font-medium px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-200 dark:border-gray-600">
            Continue exploring
            {/* Arrow pointing right */}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2">
              <div className="w-0 h-0 border-l-[6px] border-l-white dark:border-l-gray-800 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
            </div>
          </div>
        </div>

        {/* Static glow ring */}
        <div className="absolute inset-0 rounded-full bg-gray-200/20 dark:bg-gray-700/20 opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Static glow */}
        <div className="absolute inset-0 rounded-full bg-gray-200/10 dark:bg-gray-700/10 blur-lg group-hover:blur-xl transition-all duration-300"></div>
      </div>
    </div>
  );
};

export default FloatingScrollIndicator;