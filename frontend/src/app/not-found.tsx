'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
            <FileQuestion className="w-12 h-12 text-indigo-600" />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-indigo-600 mb-2">404</h1>
          <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Sorry, we couldn't find the page you're looking for. 
            The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Need help? Here are some useful links:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/auth/login"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-300 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-300 rounded-full opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-300 rounded-full opacity-50 animate-pulse delay-500"></div>
          <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-indigo-200 rounded-full opacity-30 animate-pulse delay-700"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;