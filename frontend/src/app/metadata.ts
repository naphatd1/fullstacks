import type { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  title: {
    default: 'This House Is The Best - Premium Property Management',
    template: '%s | This House Is The Best'
  },
  description: 'This House Is The Best - Your premier destination for exceptional property management, real estate services, and home solutions. Discover the finest properties and management services.',
  keywords: [
    'This House Is The Best',
    'Property Management',
    'Real Estate',
    'Home Solutions',
    'Premium Properties',
    'House Management',
    'Property Services',
    'Real Estate Platform',
    'Home Listings',
    'Property Portal',
    'Best Houses',
    'Property Investment'
  ],
  authors: [{ name: 'This House Is The Best Team' }],
  creator: 'This House Is The Best',
  publisher: 'This House Is The Best',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: '/',
    title: 'This House Is The Best - Premium Property Management',
    description: 'Your premier destination for exceptional property management, real estate services, and home solutions. Discover the finest properties with professional management services.',
    siteName: 'This House Is The Best',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'This House Is The Best - Premium Property Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'This House Is The Best - Premium Property Management',
    description: 'Your premier destination for exceptional property management and real estate services.',
    images: ['/og-image.png'],
    creator: '@this_house_best',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-search-console-verification-code',
  },
};

export const metadata: Metadata = defaultMetadata;