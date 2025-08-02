'use client';

import React from 'react';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from 'react-hot-toast';

interface SidebarLayoutContentProps {
  children: React.ReactNode;
}

const SidebarLayoutContent: React.FC<SidebarLayoutContentProps> = ({ children }) => {
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-800"></div>
          <div className="p-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stable-layout min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      
      <div className={`no-flicker transition-all duration-300 ease-in-out ${
        isExpanded || isMobileOpen
          ? 'lg:ml-72'
          : isHovered
          ? 'lg:ml-72'
          : 'lg:ml-16'
      }`}>
        <Header />
        
        <main className="stable-content p-4 lg:p-6">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
        }}
      />
    </div>
  );
};

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <SidebarLayoutContent>
        {children}
      </SidebarLayoutContent>
    </SidebarProvider>
  );
};

export default SidebarLayout;