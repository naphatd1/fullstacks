'use client';

import React from 'react';
import { usePermissions, UserRole } from '@/hooks/usePermissions';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
  showFallback = false
}) => {
  const { userRole, isAuthenticated } = usePermissions();

  if (!isAuthenticated) {
    if (showFallback && fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    if (showFallback && fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;