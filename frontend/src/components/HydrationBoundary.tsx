'use client';

import React, { useState, useEffect } from 'react';

interface HydrationBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const HydrationBoundary: React.FC<HydrationBoundaryProps> = ({ children, fallback }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return fallback || null;
  }

  return <>{children}</>;
};

export default HydrationBoundary;