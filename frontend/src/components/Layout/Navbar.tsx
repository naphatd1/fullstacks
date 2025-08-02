'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LogOut, User, Settings, Home, FileText, Upload, Activity, Menu, X } from 'lucide-react';
import ThemeToggleFallback from '../ThemeToggleFallback';
import HydrationBoundary from '../HydrationBoundary';
import PermissionGuard from '../PermissionGuard';
import ApiStatusToggle from '../ApiStatusToggle';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import Image from 'next/image'
const ThemeToggle = dynamic(() => import('../ThemeToggle'), {
  ssr: false,
  loading: () => <ThemeToggleFallback />
});

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoggingOut, logout, forceLogout, getDisplayName } = useAuth();
  const dispatch = useAppDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async (e?: React.MouseEvent) => {
    // Prevent default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isLoggingOut) {
      return;
    }
    
    try {
      // Use simple logout utility
      const { simpleLogout } = await import('@/lib/logout-utils');
      await simpleLogout();
    } catch (error) {
      // Force logout as last resort
      const { forceLogout } = await import('@/lib/logout-utils');
      await forceLogout();
    }
  };

  return (
    <HydrationBoundary>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 transition-all duration-200" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3 sm:space-x-4 transition-all duration-300 hover:opacity-90">
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-800/30 dark:to-teal-800/30 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                  <Image 
                    src="/image/best-house.jpg" 
                    alt="Logo" 
                    width={40} 
                    height={40} 
                    className="w-7 h-7 sm:w-8 sm:h-8 object-cover rounded-xl opacity-90" 
                  />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-700/20 dark:to-teal-700/20 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all duration-300"></div>
              </div>
              <div className="hidden xs:flex flex-col">
                <span className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent leading-tight">
                  This House
                </span>
                <span className="text-sm sm:text-base font-normal text-emerald-600 dark:text-emerald-400 -mt-1 tracking-wide opacity-80">
                  Is The Best
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <ApiStatusToggle compact />
            <ThemeToggle />
            
            {user ? (
              <>
                {/* Navigation Links */}
                <div className="flex items-center space-x-1 mx-4">
                  <Link href="/dashboard" className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Home className="w-4 h-4" />
                    <span className="hidden xl:inline">Dashboard</span>
                  </Link>
                  <Link href="/posts" className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <FileText className="w-4 h-4" />
                    <span className="hidden xl:inline">Posts</span>
                  </Link>
                  <Link href="/files" className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Upload className="w-4 h-4" />
                    <span className="hidden xl:inline">Files</span>
                  </Link>
                  <Link href="/monitoring" className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Activity className="w-4 h-4" />
                    <span className="hidden xl:inline">Monitoring</span>
                  </Link>
                  <PermissionGuard resource="users" permission="admin">
                    <Link href="/admin/dashboard" className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Settings className="w-4 h-4" />
                      <span className="hidden xl:inline">Admin</span>
                    </Link>
                  </PermissionGuard>
                </div>
                
                {/* User Menu */}
                <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-700 pl-4 ml-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="text-sm hidden xl:block">
                      <p className="text-slate-900 dark:text-white font-medium max-w-24 truncate">{getDisplayName()}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{user?.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    disabled={isLoggingOut} 
                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin"></div>
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    <span className="hidden xl:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link href="/auth/login" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Login
                </Link>
                <Link href="/auth/register" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <ApiStatusToggle compact />
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <div className="px-4 py-4 space-y-2">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 px-3 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium text-sm">{getDisplayName()}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{user?.role}</p>
                    </div>
                  </div>
                  
                  {/* Navigation Links */}
                  <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/posts" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                    <FileText className="w-5 h-5" />
                    <span>Posts</span>
                  </Link>
                  <Link href="/files" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                    <Upload className="w-5 h-5" />
                    <span>Files</span>
                  </Link>
                  <Link href="/monitoring" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                    <Activity className="w-5 h-5" />
                    <span>Monitoring</span>
                  </Link>
                  <PermissionGuard resource="users" permission="admin">
                    <Link href="/admin/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                      <Settings className="w-5 h-5" />
                      <span>Admin</span>
                    </Link>
                  </PermissionGuard>
                  
                  {/* Logout Button */}
                  <button onClick={() => {handleLogout(); setIsMobileMenuOpen(false);}} disabled={isLoggingOut} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 w-full text-left transition-all duration-200 mt-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                    {isLoggingOut ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin"></div>
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/auth/register" className="block px-4 py-3 rounded-xl text-base font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 shadow-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
        </div>
      </nav>
    </HydrationBoundary>
  );
};

export default Navbar;