'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error: React.FC<ErrorProps> = ({ error, reset }) => {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Route Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Something went wrong!
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            We encountered an error while loading this page. Please try again or go back to the previous page.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
              <p className="text-sm font-medium text-gray-900 mb-2">Error Details:</p>
              <p className="text-sm text-red-600 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={reset}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If this error continues to occur, please refresh the page or contact support.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full opacity-60 animate-bounce"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-300 rounded-full opacity-40 animate-bounce delay-200"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-yellow-400 rounded-full opacity-50 animate-bounce delay-100"></div>
        </div>
      </div>
    </div>
  );
};

export default Error;