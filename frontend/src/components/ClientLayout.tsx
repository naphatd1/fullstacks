'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReduxProvider } from '@/providers/ReduxProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Layout from '@/components/Layout/Layout';
import AuthErrorBoundary from '@/components/AuthErrorBoundary';
import StructuredData from '@/components/SEO/StructuredData';
import { usePathname } from 'next/navigation';
import { createQueryClientWithErrorHandling } from '@/lib/error-handler';
import { initializeConsoleSuppression } from '@/lib/console-suppressor';
import { useEffect } from 'react';

const queryClient = createQueryClientWithErrorHandling();

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Initialize console suppression on client side
  useEffect(() => {
    const cleanup = initializeConsoleSuppression();
    return cleanup;
  }, []);
  
  // Pages that use SidebarLayout (don't need the main Layout wrapper)
  const sidebarPages = [
    '/dashboard',
    '/posts',
    '/files',
    '/monitoring',
    '/admin',
    '/profile'
  ];
  
  const usesSidebar = sidebarPages.some(page => pathname?.startsWith(page));
  
  if (usesSidebar) {
    return <>{children}</>;
  }
  
  return (
    <Layout>
      {children}
    </Layout>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Structured Data for This House Is The Best */}
      <StructuredData 
        type="WebApplication"
        data={{
          name: "This House Is The Best",
          description: "Premium property management and real estate platform",
          url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          applicationCategory: "WebApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD"
          },
          screenshot: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/screenshot.png`
        }}
      />
      
      <ReduxProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthErrorBoundary>
              <RootLayoutContent>
                {children}
              </RootLayoutContent>
            </AuthErrorBoundary>
          </ThemeProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </>
  );
}