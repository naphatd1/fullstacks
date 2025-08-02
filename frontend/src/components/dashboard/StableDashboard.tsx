'use client';

import React, { memo, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { usePermissions } from '@/hooks/usePermissions';
import { useDashboardData } from '@/hooks/useDashboardData';
import ReadOnlyDashboard from '@/components/ReadOnlyDashboard';
import { SafeComponent } from './SafeComponent';
import { DashboardMetrics } from './DashboardMetrics';
import { ActivityChart } from './ActivityChart';
import { RecentActivity } from './RecentActivity';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';
import { SystemStatus } from './SystemStatus';
import { NotificationsPanel } from './NotificationsPanel';
import { UsageStats } from './UsageStats';
import { UpcomingEvents } from './UpcomingEvents';

import { Calendar, FileText } from 'lucide-react';

// Memoized header component
const DashboardHeader = memo(({ user }: { user: any }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        ยินดีต้อนรับ, <span className="font-medium text-blue-600 dark:text-blue-400">{user?.name || user?.email}</span>! นี่คือสิ่งที่เกิดขึ้นวันนี้
      </p>
    </div>
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">{new Date().toLocaleDateString('th-TH', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</span>
      </div>

    </div>
  </div>
));

DashboardHeader.displayName = 'DashboardHeader';

// Memoized recent posts component
const RecentPostsSection = memo(({ posts }: { posts: any }) => (
  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          โพสต์ล่าสุด
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          โพสต์และกิจกรรมล่าสุดของคุณ
        </p>
      </div>
    </div>
    
    <div className="border-t border-gray-200 dark:border-gray-700 -mx-6 px-6 pt-6">
      {posts?.data?.data && posts.data.data.length > 0 ? (
        <div className="space-y-4">
          {posts.data.data.slice(0, 5).map((post: any) => (
            <div key={post.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {post.published ? 'เผยแพร่แล้ว' : 'ร่าง'} • {new Date(post.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  post.published 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                }`}>
                  {post.published ? 'เผยแพร่' : 'ร่าง'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            ยังไม่มีโพสต์
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            เริ่มต้นด้วยการสร้างโพสต์แรกของคุณ
          </p>
        </div>
      )}
    </div>
  </div>
));

RecentPostsSection.displayName = 'RecentPostsSection';

const StableDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { canWrite } = usePermissions();
  const { posts } = useDashboardData();

  // Memoize permission check
  const hasWriteAccess = useMemo(() => canWrite('dashboard'), [canWrite]);

  // If user doesn't have write permissions, show read-only dashboard
  if (!hasWriteAccess) {
    return <ReadOnlyDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <DashboardHeader user={user} />

      {/* Enhanced Metrics */}
      <SafeComponent componentName="Dashboard Metrics">
        <DashboardMetrics />
      </SafeComponent>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <SafeComponent componentName="Activity Chart">
            <ActivityChart />
          </SafeComponent>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <SafeComponent componentName="Recent Activity">
            <RecentActivity />
          </SafeComponent>
        </div>
      </div>

      {/* Quick Actions */}
      <SafeComponent componentName="Quick Actions">
        <QuickActions />
      </SafeComponent>

      {/* Usage Statistics */}
      <SafeComponent componentName="Usage Statistics">
        <UsageStats />
      </SafeComponent>

      {/* Activity Feed Section */}
      <SafeComponent componentName="Activity Feed">
        <ActivityFeed />
      </SafeComponent>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div>
          <SafeComponent componentName="System Status">
            <SystemStatus />
          </SafeComponent>
        </div>

        {/* Notifications Panel */}
        <div>
          <SafeComponent componentName="Notifications">
            <NotificationsPanel />
          </SafeComponent>
        </div>
      </div>

      {/* Recent Posts Section */}
      <RecentPostsSection posts={posts} />
    </div>
  );
};

export default memo(StableDashboard);