'use client';

import React, { useEffect, useState } from 'react';

interface HydrationSafeFormProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * A form wrapper that prevents hydration errors from browser extensions
 * by ensuring consistent rendering between server and client
 */
const HydrationSafeForm: React.FC<HydrationSafeFormProps> = ({ 
  children, 
  fallback = null, 
  className = '',
  onSubmit
}) => {
  const [mounted, setMounted] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Force re-render to clear any browser extension artifacts
    setFormKey(1);
  }, []);

  // Show fallback until hydration is complete
  if (!mounted) {
    return (
      <div className={className}>
        {fallback || (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <form 
      key={formKey}
      className={className} 
      onSubmit={onSubmit}
      suppressHydrationWarning={true}
    >
      {children}
    </form>
  );
};

export default HydrationSafeForm;