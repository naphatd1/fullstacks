'use client';

import React from 'react';
import { usePostsData, useFilesData } from '@/hooks/useDashboardData';
import { BarChart3, TrendingUp } from 'lucide-react';

export const ActivityChart: React.FC = () => {
  const posts = usePostsData();
  const files = useFilesData();

  // Generate real data from backend for the last 6 months
  const generateRealData = () => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'];
    const currentDate = new Date();
    
    return months.map((month, index) => {
      // Calculate the target month
      const targetMonth = currentDate.getMonth() - (5 - index);
      const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12);
      const normalizedMonth = ((targetMonth % 12) + 12) % 12;
      
      // Count posts created in this month
      const postsInMonth = posts.data?.data?.filter((post: any) => {
        const postDate = new Date(post.createdAt);
        return postDate.getMonth() === normalizedMonth && postDate.getFullYear() === targetYear;
      }).length || 0;
      
      // Count files uploaded in this month
      const filesInMonth = files.data?.data?.filter((file: any) => {
        const fileDate = new Date(file.createdAt || file.uploadedAt);
        return fileDate.getMonth() === normalizedMonth && fileDate.getFullYear() === targetYear;
      }).length || 0;
      
      return {
        month,
        posts: postsInMonth,
        files: filesInMonth,
      };
    });
  };

  // Show loading state if data is loading
  if (posts.isLoading || files.isLoading) {
    const { ChartLoadingSkeleton } = require('./LoadingSpinner');
    return <ChartLoadingSkeleton />;
  }

  const chartData = generateRealData();
  const maxValue = Math.max(...chartData.flatMap(d => [d.posts, d.files]));

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Overview
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your posts and files activity over time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            +12% this month
          </span>
        </div>
      </div>
      
      {/* Simple Bar Chart */}
      <div className="space-y-4">
        {/* Chart Container */}
        <div className="relative">
          {/* Chart Area */}
          <div className="flex items-end justify-between h-32 px-4">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* Bar Container */}
                <div className="flex items-end space-x-1 h-full">
                  {/* Posts Bar */}
                  <div
                    className="w-4 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                    style={{
                      height: `${maxValue > 0 ? (data.posts / maxValue) * 100 : 4}px`,
                      minHeight: '4px'
                    }}
                    title={`Posts: ${data.posts}`}
                  />
                  {/* Files Bar */}
                  <div
                    className="w-4 bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600 cursor-pointer"
                    style={{
                      height: `${maxValue > 0 ? (data.files / maxValue) * 100 : 4}px`,
                      minHeight: '4px'
                    }}
                    title={`Files: ${data.files}`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Month Labels */}
          <div className="flex justify-between px-4 mt-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {data.month}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-6 text-sm pt-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Posts</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Files</span>
          </div>
        </div>
      </div>
    </div>
  );
};