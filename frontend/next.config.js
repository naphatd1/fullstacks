/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to reduce hydration warnings
  // Suppress hydration warnings in development for mobile/tablet compatibility
  // Development specific settings for hydration compatibility
  poweredByHeader: false,
  // Enable standalone output for Docker
  output: 'standalone',
  // SWC minification is enabled by default in Next.js 15
  // Skip type checking during build for faster deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
    webpackBuildWorker: true,
  },
  
  // Bundle optimization
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle for client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Tree shaking optimization (only in production)
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
      };
    }
    
    return config;
  },
  
  // Compress CSS and JS
  compress: true,
  
  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  // Compiler options
  compiler: {
    // Remove console.logs in production but keep in development
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  // Allow specific origins for development
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.1.39'
  ],
  images: {
    // Allow images from localhost and common private IP ranges
    domains: [
      'localhost', 
      '127.0.0.1', 
      'images.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'http',  
        hostname: 'localhost',
        port: '4000',
        pathname: '/api/files/serve/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000', 
        pathname: '/api/files/serve/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    // Optimize images for better performance
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year cache
    // Disable optimization for development to allow more flexible image sources
    unoptimized: process.env.NODE_ENV === 'development',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  },
  async headers() {
    return [
      // Allow all static resources for development
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
      // API specific headers
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;