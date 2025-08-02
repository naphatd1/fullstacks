'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import SidebarLayout from '@/components/Layout/SidebarLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <SidebarLayout>
        {children}
      </SidebarLayout>
    </ProtectedRoute>
  );
}