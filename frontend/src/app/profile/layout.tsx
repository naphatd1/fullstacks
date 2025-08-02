'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import SidebarLayout from '@/components/Layout/SidebarLayout';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarLayout>
        {children}
      </SidebarLayout>
    </ProtectedRoute>
  );
}