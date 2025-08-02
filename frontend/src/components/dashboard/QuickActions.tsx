'use client';

import React from 'react';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGuard from '@/components/PermissionGuard';
import { 
  FileText, 
  Upload, 
  Activity, 
  Users,
  ArrowUpRight,
  Plus,
  Settings
} from 'lucide-react';

interface QuickActionProps {
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  textColor?: string;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
  href,
  title,
  description,
  icon: Icon,
  gradient,
  textColor = 'text-white'
}) => {
  return (
    <Link
      href={href}
      className={`group relative ${gradient} p-6 rounded-2xl ${textColor} hover:scale-105 transition-all duration-300 transform shadow-lg hover:shadow-xl`}
    >
      <div className="flex items-center justify-between">
        <div>
          <Icon className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className={`text-sm opacity-90`}>
            {description}
          </p>
        </div>
        <ArrowUpRight className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Link>
  );
};

export const QuickActions: React.FC = () => {
  const { isAdmin } = usePermissions();

  const actions = [
    {
      href: '/posts/create',
      title: 'Create Post',
      description: 'Write a new blog post',
      icon: FileText,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      permission: { resource: 'posts', permission: 'write' as const }
    },
    {
      href: '/files',
      title: 'Upload Files',
      description: 'Manage your files',
      icon: Upload,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      permission: { resource: 'files', permission: 'write' as const }
    },
    {
      href: '/monitoring',
      title: 'Monitoring',
      description: 'System monitoring',
      icon: Activity,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      permission: null
    },
    {
      href: '/posts',
      title: 'Manage Posts',
      description: 'View all posts',
      icon: FileText,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      permission: null
    }
  ];

  // Add admin-only actions
  if (isAdmin) {
    actions.push({
      href: '/admin/users',
      title: 'User Management',
      description: 'Manage users',
      icon: Users,
      gradient: 'bg-gradient-to-br from-red-500 to-red-600',
      permission: { resource: 'users', permission: 'admin' as const }
    });
    
    actions.push({
      href: '/admin/dashboard',
      title: 'Admin Panel',
      description: 'System settings',
      icon: Settings,
      gradient: 'bg-gradient-to-br from-gray-700 to-gray-800',
      permission: { resource: 'users', permission: 'admin' as const }
    });
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Access main features quickly
          </p>
        </div>
        <Plus className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, index) => (
          action.permission ? (
            <PermissionGuard 
              key={index}
              resource={action.permission.resource} 
              permission={action.permission.permission}
            >
              <QuickActionCard {...action} />
            </PermissionGuard>
          ) : (
            <QuickActionCard key={index} {...action} />
          )
        ))}
      </div>
    </div>
  );
};