'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { usersAPI, postsAPI, healthAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRateLimitManager from '@/components/AdminRateLimitManager';
import { Users, FileText, Activity, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin } = useAppSelector((state) => state.auth);

  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => usersAPI.getAll(),
    enabled: isAdmin,
  });

  const { data: posts } = useQuery({
    queryKey: ['all-posts'],
    queryFn: () => postsAPI.getAll(),
    enabled: isAdmin,
  });

  const { data: health } = useQuery({
    queryKey: ['health-detailed'],
    queryFn: () => healthAPI.detailed(),
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Users',
      value: users?.data?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Total Posts',
      value: posts?.data?.length || 0,
      icon: FileText,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'increase',
    },
    {
      name: 'System Health',
      value: health?.data?.status === 'ok' ? 'Healthy' : 'Error',
      icon: Activity,
      color: health?.data?.status === 'ok' ? 'bg-green-500' : 'bg-red-500',
      change: health?.data?.uptime ? `${Math.floor(health.data.uptime / 3600)}h uptime` : '',
      changeType: 'neutral',
    },
    {
      name: 'Active Users',
      value: users?.data?.filter((u: any) => u.isActive).length || 0,
      icon: CheckCircle,
      color: 'bg-purple-500',
      change: '98%',
      changeType: 'increase',
    },
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate transition-colors duration-200">
                  Admin Dashboard
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">
                  Welcome, {user?.name || user?.email}
                </dd>
                <dd className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  System overview and management tools
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate transition-colors duration-200">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">
                      {stat.value}
                    </dd>
                    {stat.change && (
                      <dd className={`text-sm ${
                        stat.changeType === 'increase' 
                          ? 'text-green-600 dark:text-green-400' 
                          : stat.changeType === 'decrease' 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      } transition-colors duration-200`}>
                        {stat.change}
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white transition-colors duration-200">
            System Health
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            Current system status and performance metrics
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          {health?.data ? (
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Status</dt>
                <dd className="mt-1 flex items-center">
                  {health.data.status === 'ok' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                  )}
                  <span className={`text-sm font-medium ${
                    health.data.status === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  } transition-colors duration-200`}>
                    {health.data.status === 'ok' ? 'Healthy' : 'Error'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Uptime</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white transition-colors duration-200">
                  {Math.floor(health.data.uptime / 3600)}h {Math.floor((health.data.uptime % 3600) / 60)}m
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Environment</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white transition-colors duration-200">
                  {health.data.environment}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Response Time</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white transition-colors duration-200">
                  {health.data.responseTime || 'N/A'}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="text-center py-4">
              <Activity className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Loading system health...</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white transition-colors duration-200">
            Recent Users
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            Latest user registrations and activity
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          {users?.data && users.data.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.data.slice(0, 5).map((user: any) => (
                <li key={user.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">
                          {user.name || user.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                          {user.email} • {user.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      } transition-colors duration-200`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                      } transition-colors duration-200`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">No users</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                No users found in the system.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* Admin Rate Limit Manager */}
    <AdminRateLimitManager />
    </ProtectedRoute>
  );
};

export default AdminDashboardPage;