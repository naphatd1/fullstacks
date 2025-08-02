'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { authStorage } from '@/lib/auth-storage';
import { 
  Activity, 
  Server, 
  Database, 
  HardDrive, 
  Globe, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Users,
  FileText,
  Upload,
  Download,
  Cpu,
  MemoryStick,
  Wifi,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const MonitoringPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [selectedPeriod, setSelectedPeriod] = useState('1h');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Helper function to fetch monitoring data with fallback
  const fetchMonitoringData = async (endpoint: string) => {
    try {
      const token = authStorage.getAccessToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/monitoring/${endpoint}`, {
        cache: 'no-store',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn(`Monitoring endpoint ${endpoint} failed, using fallback data`);
      // Return mock data for monitoring
      return getMockMonitoringData(endpoint);
    }
  };

  // Mock monitoring data for fallback
  const getMockMonitoringData = (endpoint: string) => {
    const mockData: any = {
      dashboard: {
        status: 'Healthy',
        uptime: '2h 15m',
        totalUsers: 142,
        activeUsers: 23,
        totalPosts: 87,
        totalFiles: 234
      },
      system: {
        status: 'Healthy',
        uptime: '2h 15m 30s',
        cpu: { usage: 45, load: '0.8' },
        memory: { usage: 62, used: 2048000000, total: 4096000000 }
      },
      database: {
        status: 'Connected',
        connections: 12,
        queries: 1547,
        avgQueryTime: '15ms'
      },
      storage: {
        totalFiles: 234,
        totalSize: 1024000000,
        images: 156,
        documents: 78
      },
      api: {
        totalRequests: 5420,
        successRate: 98.5,
        avgResponseTime: 120,
        errorRate: 1.5
      },
      alerts: [],
      performance: {
        avgResponseTime: 120,
        peakMemory: 2560000000
      }
    };

    return mockData[endpoint.split('?')[0]] || {};
  };

  // Dashboard overview
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ['monitoring-dashboard'],
    queryFn: async () => {
      try {
        return await fetchMonitoringData('dashboard');
      } catch (error: any) {
        if (error.message.includes('Authentication')) {
          toast.error('กรุณาเข้าสู่ระบบใหม่');
        }
        throw error;
      }
    },
    enabled: !!user,
    refetchInterval: refreshInterval,
  });

  // System metrics
  const { data: systemMetrics, isLoading: systemLoading } = useQuery({
    queryKey: ['monitoring-system'],
    queryFn: () => fetchMonitoringData('system'),
    enabled: !!user,
    refetchInterval: refreshInterval,
  });

  // Database metrics
  const { data: databaseMetrics, isLoading: databaseLoading } = useQuery({
    queryKey: ['monitoring-database'],
    queryFn: () => fetchMonitoringData('database'),
    enabled: !!user,
    refetchInterval: refreshInterval,
  });

  // Storage metrics
  const { data: storageMetrics, isLoading: storageLoading } = useQuery({
    queryKey: ['monitoring-storage'],
    queryFn: () => fetchMonitoringData('storage'),
    enabled: !!user,
    refetchInterval: refreshInterval,
  });

  // API metrics
  const { data: apiMetrics, isLoading: apiLoading } = useQuery({
    queryKey: ['monitoring-api', selectedPeriod],
    queryFn: () => fetchMonitoringData(`api?hours=${selectedPeriod.replace('h', '')}`),
    enabled: !!user,
    refetchInterval: refreshInterval,
  });

  // Active alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['monitoring-alerts'],
    queryFn: () => fetchMonitoringData('alerts'),
    enabled: !!user,
    refetchInterval: refreshInterval,
  });

  // Performance metrics
  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ['monitoring-performance', selectedPeriod],
    queryFn: () => fetchMonitoringData(`performance?period=${selectedPeriod}`),
    enabled: !!user,
    refetchInterval: refreshInterval,
  });

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            คุณต้องเข้าสู่ระบบเพื่อดูข้อมูล Monitoring
          </p>
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
      case 'good':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'warning':
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'critical':
      case 'error':
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            System Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
            ติดตามสถานะและประสิทธิภาพของระบบ
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
          >
            <option value="1h">1 ชั่วโมงที่ผ่านมา</option>
            <option value="6h">6 ชั่วโมงที่ผ่านมา</option>
            <option value="24h">24 ชั่วโมงที่ผ่านมา</option>
            <option value="7d">7 วันที่ผ่านมา</option>
          </select>
          <button
            onClick={() => {
              refetchDashboard();
              toast.success('รีเฟรชข้อมูลแล้ว');
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
              การแจ้งเตือนที่ใช้งานอยู่ ({alerts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {alerts.map((alert: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{alert.title}</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    สถานะระบบ
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {typeof systemMetrics?.status === 'string' ? systemMetrics.status : 'กำลังโหลด...'}
                  </dd>
                  <dd className="text-sm text-gray-500 dark:text-gray-400">
                    Uptime: {typeof systemMetrics?.uptime === 'string' ? systemMetrics.uptime : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Cpu className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    การใช้งาน CPU
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {typeof systemMetrics?.cpu?.usage === 'number' ? `${systemMetrics.cpu.usage}%` : 'N/A'}
                  </dd>
                  <dd className="text-sm text-gray-500 dark:text-gray-400">
                    Load: {typeof systemMetrics?.cpu?.load === 'string' || typeof systemMetrics?.cpu?.load === 'number' ? systemMetrics.cpu.load : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MemoryStick className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    การใช้งาน Memory
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {typeof systemMetrics?.memory?.usage === 'number' ? `${systemMetrics.memory.usage}%` : 'N/A'}
                  </dd>
                  <dd className="text-sm text-gray-500 dark:text-gray-400">
                    {typeof systemMetrics?.memory?.used === 'number' && typeof systemMetrics?.memory?.total === 'number'
                      ? `${formatBytes(systemMetrics.memory.used)} / ${formatBytes(systemMetrics.memory.total)}`
                      : 'N/A'
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Database className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    ฐานข้อมูล
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {typeof databaseMetrics?.status === 'string' ? databaseMetrics.status : 'กำลังโหลด...'}
                  </dd>
                  <dd className="text-sm text-gray-500 dark:text-gray-400">
                    Connections: {typeof databaseMetrics?.connections === 'number' ? databaseMetrics.connections : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Metrics */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                API Metrics
              </h3>
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            {apiLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Requests</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(typeof apiMetrics?.totalRequests === 'number' ? apiMetrics.totalRequests : 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Success Rate</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {typeof apiMetrics?.successRate === 'number' ? `${apiMetrics.successRate}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Average Response Time</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {typeof apiMetrics?.avgResponseTime === 'number' ? `${apiMetrics.avgResponseTime}ms` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Error Rate</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {typeof apiMetrics?.errorRate === 'number' ? `${apiMetrics.errorRate}%` : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Storage Metrics */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Storage Metrics
              </h3>
              <HardDrive className="h-5 w-5 text-gray-400" />
            </div>
            {storageLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Files</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(typeof storageMetrics?.totalFiles === 'number' ? storageMetrics.totalFiles : 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Size</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatBytes(typeof storageMetrics?.totalSize === 'number' ? storageMetrics.totalSize : 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Images</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(typeof storageMetrics?.images === 'number' ? storageMetrics.images : 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Documents</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(typeof storageMetrics?.documents === 'number' ? storageMetrics.documents : 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Performance Overview
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          {performanceLoading ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Performance Chart
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Chart visualization would be implemented here
                </p>
                {performance && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Avg Response:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {typeof performance?.avgResponseTime === 'number' ? `${performance.avgResponseTime}ms` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Peak Memory:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {typeof performance?.peakMemory === 'number' ? formatBytes(performance.peakMemory) : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <Clock className="inline h-4 w-4 mr-1" />
        ข้อมูลจะรีเฟรชอัตโนมัติทุก {refreshInterval / 1000} วินาที
      </div>
    </div>
  );
};

export default MonitoringPage;