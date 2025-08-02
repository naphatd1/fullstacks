'use client';

import React, { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { rateLimiter } from '@/lib/security';
import { 
  Shield, 
  Trash2, 
  RefreshCw, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Search,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminRateLimitManager: React.FC = () => {
  const { isAdmin } = usePermissions();
  const [records, setRecords] = useState<Map<string, { count: number; lastAttempt: number }>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Only show for admin users
  if (!isAdmin()) {
    return null;
  }

  const refreshRecords = () => {
    setRecords(rateLimiter.getAllRecords());
  };

  useEffect(() => {
    refreshRecords();
    const interval = setInterval(refreshRecords, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = () => {
    rateLimiter.clearAll();
    toast.success('ล้างข้อมูล Rate Limit ทั้งหมดแล้ว');
    refreshRecords();
  };

  const handleClearLogin = () => {
    const cleared = rateLimiter.clearByPattern('login_');
    toast.success(`ล้างข้อมูล Login Rate Limit แล้ว ${cleared} รายการ`);
    refreshRecords();
  };

  const handleClearRegister = () => {
    const cleared = rateLimiter.clearByPattern('register_');
    toast.success(`ล้างข้อมูล Register Rate Limit แล้ว ${cleared} รายการ`);
    refreshRecords();
  };

  const handleClearSpecific = (key: string) => {
    rateLimiter.clearLimit(key);
    toast.success(`ล้างข้อมูล Rate Limit สำหรับ ${key} แล้ว`);
    refreshRecords();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('th-TH');
  };

  const getTimeRemaining = (key: string, lastAttempt: number) => {
    const windowMs = key.startsWith('login_') ? 10 * 60 * 1000 : 15 * 60 * 1000;
    const timeElapsed = Date.now() - lastAttempt;
    const timeRemaining = windowMs - timeElapsed;
    
    if (timeRemaining <= 0) return 'หมดเวลาแล้ว';
    
    const minutes = Math.ceil(timeRemaining / 1000 / 60);
    return `อีก ${minutes} นาที`;
  };

  const filteredRecords = Array.from(records.entries()).filter(([key]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Admin Rate Limit Manager"
      >
        <Shield className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Admin Rate Limit Manager
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                จัดการข้อจำกัดการเข้าสู่ระบบของผู้ใช้
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาด้วย email หรือ key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={refreshRecords}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>รีเฟรช</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleClearLogin}
              className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              <Users className="h-4 w-4" />
              <span>ล้าง Login Limits</span>
            </button>
            <button
              onClick={handleClearRegister}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Users className="h-4 w-4" />
              <span>ล้าง Register Limits</span>
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>ล้างทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* Records List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                ไม่มี Rate Limits ที่ใช้งานอยู่
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                ผู้ใช้ทั้งหมดสามารถเข้าสู่ระบบได้ปกติ
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map(([key, record]) => {
                const isLoginKey = key.startsWith('login_');
                const email = key.replace(/^(login_|register_)/, '');
                const maxAttempts = isLoginKey ? 3 : 3;
                const remaining = maxAttempts - record.count;
                const timeRemaining = getTimeRemaining(key, record.lastAttempt);
                
                return (
                  <div
                    key={key}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isLoginKey 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                            {isLoginKey ? 'Login' : 'Register'}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {email}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-4 w-4" />
                            <span>ความพยายาม: {record.count}/{maxAttempts}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>ครั้งล่าสุด: {formatTime(record.lastAttempt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RefreshCw className="h-4 w-4" />
                            <span>รีเซ็ต: {timeRemaining}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleClearSpecific(key)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="ล้าง Rate Limit นี้"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              <strong>กฎ Rate Limiting:</strong> ผู้ใช้ทั่วไป 3 ครั้ง/10นาที, Admin ไม่จำกัด
            </div>
            <div>
              รายการทั้งหมด: {records.size}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRateLimitManager;