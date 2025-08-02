'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePerformance } from '@/hooks/usePerformance';
import dynamic from 'next/dynamic';
import ClientOnly from './ClientOnly';
import LoadingSpinner from './LoadingSpinner';

// Import components normally to fix loading issues
import ImageCarousel from './ImageCarousel';
import AnimatedCards from './AnimatedCards';
import FloatingScrollIndicator from './FloatingScrollIndicator';
import { 
  Shield, 
  FileText, 
  Upload, 
  Users, 
  Activity, 
  Zap, 
  Lock, 
  Globe, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, isAuthenticated, isAdmin, loading, getDisplayName } = useAuth();
  const performanceMetrics = usePerformance();

  // Loading fallback component for SSR
  const LoadingFallback = () => (
    <div>
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-start justify-center pt-6 xs:pt-5 sm:pt-4 md:pt-4 lg:pt-6 xl:pt-8 2xl:pt-10 3xl:pt-12 4xl:pt-16">
        <div className="relative overflow-hidden w-full max-w-5xl sm:max-w-6xl lg:max-w-7xl xl:max-w-7xl 2xl:max-w-8xl 3xl:max-w-9xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          {/* Image Carousel Section - Placeholder */}
          <div className="relative w-full h-[70vh] xs:h-[72vh] sm:h-[74vh] md:h-[76vh] lg:h-[76vh] xl:h-[78vh] 2xl:h-[80vh] 3xl:h-[82vh] 4xl:h-[84vh] bg-gray-200 dark:bg-gray-700 rounded-2xl sm:rounded-3xl animate-pulse"></div>
        </div>
      </div>
      {/* Loading placeholder for content */}
      <div className="bg-white dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="w-64 h-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="w-96 h-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-6 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading state only during initial auth check
  if (loading) {
    return (
      <ClientOnly fallback={<LoadingFallback />}>
        <LoadingSpinner 
          size="lg"
          text="กำลังตรวจสอบสถานะการเข้าสู่ระบบ..."
          fullScreen={true}
        />
      </ClientOnly>
    );
  }

  const features = [
    {
      name: 'Premium Properties',
      description: 'Exceptional selection of high-quality houses and properties with professional photography.',
      icon: Shield,
      color: 'bg-blue-500',
    },
    {
      name: 'Property Management',
      description: 'Complete property management services including maintenance, tenant management, and inspections.',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      name: 'Virtual Tours',
      description: 'High-quality virtual tours and comprehensive property documentation for better viewing experience.',
      icon: Upload,
      color: 'bg-purple-500',
    },
    {
      name: 'Expert Consultation',
      description: 'Professional real estate consultation and personalized service for property investment decisions.',
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  const benefits = [
    'Premium quality properties',
    'Professional management',
    'Comprehensive inspections',
    'Market expertise',
    'Personalized service',
    '24/7 support available'
  ];

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium mb-4">
              <CheckCircle className="h-4 w-4 mr-2" />
              Successfully logged in
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
              <span className="block mb-2">Welcome back,</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 break-words">
                {getDisplayName()}
              </span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4 sm:px-0">
              You're logged in as <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.role}</span>. 
              Ready to explore your dashboard and manage your content?
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 sm:px-0">
            <Link
              href="/dashboard"
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 touch-manipulation"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Dashboard
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  View analytics, recent activity, and system overview
                </p>
              </div>
            </Link>

            <Link
              href="/posts"
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors duration-300">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  My Posts
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create, edit, and publish your content
                </p>
              </div>
            </Link>

            <Link
              href="/files"
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors duration-300">
                    <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  File Manager
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload and organize your media files
                </p>
              </div>
            </Link>

            {isAdmin() && (
              <Link
                href="/admin/dashboard"
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors duration-300">
                      <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Admin Panel
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage users and system settings
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-smooth">
      {/* Full Screen Hero Section with Carousel */}
      <div className="relative min-h-screen bg-white dark:bg-gray-900">

        
        {/* Carousel Container - Full Height */}
        <div className="h-screen flex items-start justify-center px-3 xs:px-4 sm:px-6 lg:px-8 pt-6 xs:pt-5 sm:pt-4 md:pt-4 lg:pt-6 xl:pt-8 2xl:pt-10 3xl:pt-12 4xl:pt-16">
          <div className="w-full max-w-5xl sm:max-w-6xl lg:max-w-7xl xl:max-w-7xl 2xl:max-w-8xl 3xl:max-w-9xl mx-auto">
            <ImageCarousel />
          </div>
        </div>
        
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
      </div>

      {/* Content Sections - Below the fold */}
      <div className="bg-white dark:bg-gray-900">
        {/* Animated Cards Section */}
        <AnimatedCards />
      {/* Text Content Section */}
      <div className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6 lg:mb-8">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Premium Property Management
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              <span className="block">This House</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
                Is The Best
              </span>
            </h1>
            
            <p className="mt-4 sm:mt-6 lg:mt-8 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed px-4 sm:px-0">
              Your premier destination for exceptional property management and real estate services. 
              Discover premium properties with professional management, comprehensive listings, and outstanding service.
            </p>
            
            <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 lg:py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why This House Is The Best
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4 sm:px-0">
              Experience exceptional property management with premium services, expert consultation, and comprehensive property solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.name} 
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${feature.color} text-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {feature.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                Why choose This House Is The Best?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <span className="text-lg text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <Star className="h-6 w-6 text-yellow-300 mr-2" />
                  <span className="text-lg font-semibold">Premium Service</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Premium Property Excellence
                </h3>
                <p className="text-blue-100 mb-6">
                  This House Is The Best delivers exceptional property management services with professional expertise, 
                  comprehensive maintenance, and outstanding customer service to ensure your property investment thrives.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Trusted & Secure</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>Wide Coverage</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    <span>Quick Response</span>
                  </div>
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    <span>Always Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Floating Scroll Indicator */}
      <FloatingScrollIndicator />
    </div>
  );
};

export default HomePage;