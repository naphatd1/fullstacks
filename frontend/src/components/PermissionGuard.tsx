'use client';

import React from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: string;
  permission: Permission;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  permission,
  fallback = null,
  showFallback = false
}) => {
  const { hasPermission } = usePermissions();

  const hasAccess = hasPermission(resource, permission);

  if (!hasAccess) {
    if (showFallback && fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
};

export default PermissionGuard;