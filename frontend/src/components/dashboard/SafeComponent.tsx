'use client';

import React from 'react';
import { SimpleFallback } from './SimpleFallback';

interface SafeComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

export const SafeComponent: React.FC<SafeComponentProps> = ({
  children,
  fallback,
  componentName = 'Component'
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.warn(`${componentName} error:`, error);
    
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <SimpleFallback
        title="ไม่สามารถแสดงข้อมูลได้"
        message="กำลังใช้โหมดตัวอย่าง"
        type="offline"
      />
    );
  }
};

// HOC for wrapping components safely
export const withSafeComponent = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const SafeWrappedComponent = (props: P) => {
    return (
      <SafeComponent componentName={componentName || Component.name}>
        <Component {...props} />
      </SafeComponent>
    );
  };
  
  SafeWrappedComponent.displayName = `Safe(${componentName || Component.name})`;
  return SafeWrappedComponent;
};

export default SafeComponent;