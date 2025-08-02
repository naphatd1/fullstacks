'use client';

import { useAuth } from './useAuth';

export type UserRole = 'ADMIN' | 'USER';
export type Permission = 'read' | 'write' | 'delete' | 'admin';

interface PermissionConfig {
  [key: string]: {
    [role in UserRole]: Permission[];
  };
}

// Define permissions for each role and resource
const PERMISSIONS: PermissionConfig = {
  dashboard: {
    ADMIN: ['read', 'write', 'delete', 'admin'],
    USER: ['read', 'write'] // Allow USER to access dashboard with write permissions
  },
  posts: {
    ADMIN: ['read', 'write', 'delete'],
    USER: ['read', 'write'] // Allow USER to create and edit their own posts
  },
  files: {
    ADMIN: ['read', 'write', 'delete'],
    USER: ['read', 'write'] // Allow USER to upload and manage their own files
  },
  users: {
    ADMIN: ['read', 'write', 'delete', 'admin'],
    USER: []
  },
  monitoring: {
    ADMIN: ['read', 'write', 'admin'],
    USER: ['read']
  }
};

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  // Get user role
  const getUserRole = (): UserRole => {
    if (!user || !isAuthenticated) return 'USER';
    return user.role as UserRole;
  };

  // Check if user has specific permission for a resource
  const hasPermission = (resource: string, permission: Permission): boolean => {
    if (!isAuthenticated || !user) return false;

    const userRole = getUserRole();
    const resourcePermissions = PERMISSIONS[resource];

    if (!resourcePermissions) return false;

    const rolePermissions = resourcePermissions[userRole] || [];
    return rolePermissions.includes(permission);
  };

  // Check if user can read a resource
  const canRead = (resource: string): boolean => {
    return hasPermission(resource, 'read');
  };

  // Check if user can write/edit a resource
  const canWrite = (resource: string): boolean => {
    return hasPermission(resource, 'write');
  };

  // Check if user can delete a resource
  const canDelete = (resource: string): boolean => {
    return hasPermission(resource, 'delete');
  };

  // Check if user has admin permissions
  const canAdmin = (resource: string): boolean => {
    return hasPermission(resource, 'admin');
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return getUserRole() === 'ADMIN';
  };

  // Check if user is regular user
  const isUser = (): boolean => {
    return getUserRole() === 'USER';
  };

  // Get all permissions for current user and resource
  const getPermissions = (resource: string): Permission[] => {
    if (!isAuthenticated || !user) return [];

    const userRole = getUserRole();
    const resourcePermissions = PERMISSIONS[resource];

    if (!resourcePermissions) return [];

    return resourcePermissions[userRole] || [];
  };

  // Check if user can access a specific page/route
  const canAccessRoute = (route: string): boolean => {
    const routePermissions: { [key: string]: (role: UserRole) => boolean } = {
      '/admin': (role) => role === 'ADMIN',
      '/admin/dashboard': (role) => role === 'ADMIN',
      '/admin/users': (role) => role === 'ADMIN',
      '/dashboard': () => true, // All authenticated users
      '/posts': () => true,
      '/files': () => true,
      '/monitoring': () => true,
    };

    if (!isAuthenticated) return false;

    const checkPermission = routePermissions[route];
    if (!checkPermission) return true; // Allow access if no specific rule

    return checkPermission(getUserRole());
  };

  return {
    // User info
    user,
    userRole: getUserRole(),
    isAuthenticated,
    
    // Role checks
    isAdmin,
    isUser,
    
    // Permission checks
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    canAdmin,
    canAccessRoute,
    getPermissions,
  };
};

export default usePermissions;