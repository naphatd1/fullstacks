'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic imports to prevent hydration errors
const SafeLoginForm = dynamic(() => import('@/components/SafeLoginForm'), {
  ssr: false,
  loading: () => (
    <form className="mt-8 space-y-6">
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </form>
  )
});



const LoginPage: React.FC = () => {
  const [showRegistrationSuccess, setShowRegistrationSuccess] = React.useState(false);

  React.useEffect(() => {
    // Check if user came from registration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      setShowRegistrationSuccess(true);
      // Remove the parameter from URL
      window.history.replaceState({}, '', '/auth/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center sm:items-start justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-4 sm:pt-8 sm:pb-4 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md max-h-full overflow-y-auto">
        {/* Registration Success Message */}
        {showRegistrationSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  สมัครสมาชิกสำเร็จ!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่คุณสมัครไว้
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowRegistrationSuccess(false)}
                  className="inline-flex text-green-400 hover:text-green-600 focus:outline-none"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
            <span className="text-white dark:text-slate-900 font-bold text-lg sm:text-xl">A</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-slate-900 dark:text-white mb-1 sm:mb-2">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border border-slate-200 dark:border-slate-700">
          <SafeLoginForm />
          
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;