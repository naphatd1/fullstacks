'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Eye, Lock, Shield, AlertCircle } from 'lucide-react';

const ReadOnlyDashboard: React.FC = () => {
  const { user, userRole, canWrite } = usePermissions();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Role Info */}
        <div className="mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  โหมดดูอย่างเดียว (Read-Only Mode)
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  คุณเข้าสู่ระบบในฐานะ <span className="font-semibold">{userRole}</span> - สามารถดูข้อมูลได้เท่านั้น
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ยินดีต้อนรับ, {user?.name || user?.email}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            แดชบอร์ดสำหรับผู้ใช้งานทั่วไป - ดูข้อมูลและสถิติต่างๆ
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  สิทธิ์การเข้าถึง
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ดูอย่างเดียว
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  บทบาท
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {userRole}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Lock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  การแก้ไข
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ไม่อนุญาต
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  สถานะ
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ปกติ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* What you can do */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                สิ่งที่คุณสามารถทำได้
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center text-green-600 dark:text-green-400">
                  <Eye className="h-4 w-4 mr-3" />
                  <span className="text-sm">ดูข้อมูลโพสต์ทั้งหมด</span>
                </li>
                <li className="flex items-center text-green-600 dark:text-green-400">
                  <Eye className="h-4 w-4 mr-3" />
                  <span className="text-sm">ดูไฟล์และเอกสาร</span>
                </li>
                <li className="flex items-center text-green-600 dark:text-green-400">
                  <Eye className="h-4 w-4 mr-3" />
                  <span className="text-sm">ดูสถิติและรายงาน</span>
                </li>
                <li className="flex items-center text-green-600 dark:text-green-400">
                  <Eye className="h-4 w-4 mr-3" />
                  <span className="text-sm">เข้าถึงระบบ monitoring</span>
                </li>
              </ul>
            </div>
          </div>

          {/* What you cannot do */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                สิ่งที่ต้องการสิทธิ์ Admin
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center text-red-600 dark:text-red-400">
                  <Lock className="h-4 w-4 mr-3" />
                  <span className="text-sm">สร้าง แก้ไข หรือลบโพสต์</span>
                </li>
                <li className="flex items-center text-red-600 dark:text-red-400">
                  <Lock className="h-4 w-4 mr-3" />
                  <span className="text-sm">อัปโหลดหรือลบไฟล์</span>
                </li>
                <li className="flex items-center text-red-600 dark:text-red-400">
                  <Lock className="h-4 w-4 mr-3" />
                  <span className="text-sm">จัดการผู้ใช้งาน</span>
                </li>
                <li className="flex items-center text-red-600 dark:text-red-400">
                  <Lock className="h-4 w-4 mr-3" />
                  <span className="text-sm">เข้าถึงแผงควบคุม Admin</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Admin */}
        <div className="mt-8">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  ต้องการสิทธิ์เพิ่มเติม?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  หากคุณต้องการสิทธิ์ในการแก้ไขข้อมูล กรุณาติดต่อผู้ดูแลระบบ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyDashboard;