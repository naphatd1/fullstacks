'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Server, Home, ArrowLeft, RefreshCw } from 'lucide-react';

const ServerErrorPage: React.FC = () => {
  const router = useRouter();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* Server Error Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <Server className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-red-600 mb-2">500</h1>
          <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Internal Server Error
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            We're experiencing some technical difficulties on our end. 
            Our team has been notified and is working to fix this issue.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={handleRefresh}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh Page
          </button>

          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
        </div>

        {/* Status Updates */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            For real-time updates on system status:
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <a
              href="#"
              className="text-red-600 hover:text-red-800 hover:underline"
            >
              Status Page
            </a>
            <a
              href="#"
              className="text-red-600 hover:text-red-800 hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-300 rounded-full opacity-60 animate-ping"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-pink-300 rounded-full opacity-40 animate-ping delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-red-200 rounded-full opacity-50 animate-ping delay-500"></div>
          <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-pink-400 rounded-full opacity-30 animate-ping delay-700"></div>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;