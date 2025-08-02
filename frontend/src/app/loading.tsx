import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600">Please wait while we prepare your content</p>
        </div>

        {/* Loading Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Decorative Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;