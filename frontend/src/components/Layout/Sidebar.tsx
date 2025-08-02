'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { usePermissions } from '@/hooks/usePermissions';
import { useSidebar } from '@/contexts/SidebarContext';
import { 
  LayoutDashboard,
  FileText,
  Upload,
  Activity,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Home,
  User,
  Shield,
  BarChart3,
  Calendar,
  Bell,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface NavItem {
  name: string;
  icon: React.ElementType;
  path?: string;
  permission?: {
    resource: string;
    permission: 'read' | 'write' | 'admin';
  };
  subItems?: {
    name: string;
    path: string;
    permission?: {
      resource: string;
      permission: 'read' | 'write' | 'admin';
    };
  }[];
}

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const { canRead, canWrite, isAdmin } = usePermissions();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Navigation items
  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      permission: { resource: 'dashboard', permission: 'read' }
    },
    {
      name: 'โพสต์',
      icon: FileText,
      subItems: [
        {
          name: 'ดูโพสต์ทั้งหมด',
          path: '/posts',
          permission: { resource: 'posts', permission: 'read' }
        },
        {
          name: 'สร้างโพสต์ใหม่',
          path: '/posts/create',
          permission: { resource: 'posts', permission: 'write' }
        }
      ]
    },
    {
      name: 'ไฟล์',
      icon: Upload,
      path: '/files',
      permission: { resource: 'files', permission: 'read' }
    },
    {
      name: 'Monitoring',
      icon: Activity,
      path: '/monitoring'
    },
    {
      name: 'โปรไฟล์',
      icon: User,
      path: '/profile'
    }
  ];

  // Admin items
  const adminItems: NavItem[] = [
    {
      name: 'จัดการผู้ใช้',
      icon: Users,
      path: '/admin/users',
      permission: { resource: 'users', permission: 'admin' }
    },
    {
      name: 'ตั้งค่าระบบ',
      icon: Settings,
      path: '/admin/settings',
      permission: { resource: 'users', permission: 'admin' }
    },
    {
      name: 'รายงาน',
      icon: BarChart3,
      path: '/admin/reports',
      permission: { resource: 'users', permission: 'admin' }
    }
  ];

  // Check if user has permission for nav item
  const hasPermission = (item: NavItem) => {
    if (!item.permission) return true;
    
    const { resource, permission } = item.permission;
    switch (permission) {
      case 'read':
        return canRead(resource);
      case 'write':
        return canWrite(resource);
      case 'admin':
        return isAdmin;
      default:
        return true;
    }
  };

  // Check if path is active (exact match only)
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Check if any submenu item is active
  const hasActiveSubItem = (subItems: any[]) => {
    return subItems.some(subItem => isActive(subItem.path));
  };

  // Handle submenu toggle
  const toggleSubmenu = (itemName: string) => {
    setOpenSubmenu(openSubmenu === itemName ? null : itemName);
  };

  // Auto-open submenu if current path matches
  useEffect(() => {
    navItems.forEach(item => {
      if (item.subItems) {
        const hasActive = hasActiveSubItem(item.subItems);
        if (hasActive) {
          setOpenSubmenu(item.name);
        }
      }
    });
  }, [pathname]);

  const renderNavItem = (item: NavItem) => {
    if (!hasPermission(item)) return null;

    const Icon = item.icon;
    const isItemActive = item.path ? isActive(item.path) : false;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isSubmenuOpen = openSubmenu === item.name;

    if (hasSubItems) {
      return (
        <li key={item.name}>
          <button
            onClick={() => toggleSubmenu(item.name)}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
              isSubmenuOpen
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            } ${!isExpanded && !isHovered ? 'lg:justify-center' : ''}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${
              !isExpanded && !isHovered ? '' : 'mr-3'
            }`} />
            {(isExpanded || isHovered || isMobileOpen) && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                  isSubmenuOpen ? 'rotate-180' : ''
                }`} />
              </>
            )}
          </button>
          
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className={`overflow-hidden transition-all duration-300 ${
              isSubmenuOpen ? 'max-h-96 mt-1' : 'max-h-0'
            }`}>
              <ul className="ml-8 space-y-1">
                {item.subItems?.map(subItem => {
                  if (subItem.permission && !hasPermission({ ...item, permission: subItem.permission })) {
                    return null;
                  }
                  
                  return (
                    <li key={subItem.path}>
                      <Link
                        href={subItem.path}
                        onClick={() => window.innerWidth < 1024 && toggleMobileSidebar()}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          isActive(subItem.path)
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        <ChevronRight className="w-3 h-3 mr-2 flex-shrink-0" />
                        {subItem.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </li>
      );
    }

    return (
      <li key={item.name}>
        <Link
          href={item.path!}
          onClick={() => window.innerWidth < 1024 && toggleMobileSidebar()}
          className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
            isItemActive
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          } ${!isExpanded && !isHovered ? 'lg:justify-center' : ''}`}
        >
          <Icon className={`w-5 h-5 flex-shrink-0 ${
            !isExpanded && !isHovered ? '' : 'mr-3'
          }`} />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span>{item.name}</span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
          isExpanded || isMobileOpen
            ? 'w-72'
            : isHovered
            ? 'w-72'
            : 'w-16'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {(isExpanded || isHovered || isMobileOpen) ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Admin Panel
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  จัดการระบบ
                </p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <Home className="w-5 h-5 text-white" />
            </div>
          )}
          
          {/* Mobile close button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div>
              {(isExpanded || isHovered || isMobileOpen) && (
                <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  เมนูหลัก
                </h2>
              )}
              <ul className="space-y-1">
                {navItems.map(renderNavItem)}
              </ul>
            </div>

            {/* Admin Navigation */}
            {isAdmin && (
              <div>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    ผู้ดูแลระบบ
                  </h2>
                )}
                <ul className="space-y-1">
                  {adminItems.map(renderNavItem)}
                </ul>
              </div>
            )}
          </div>
        </nav>

        {/* User info */}
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'User'}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;