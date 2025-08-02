'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { loginUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import HydrationBoundary from './HydrationBoundary';

const schema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .max(254, 'Email is too long')
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
    .test('no-script', 'Invalid email format', (value) => {
      if (!value) return true;
      const suspiciousPatterns = [/javascript:/i, /data:/i, /vbscript:/i, /<script/i, /on\w+=/i];
      return !suspiciousPatterns.some(pattern => pattern.test(value));
    })
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long')
    .required('Password is required'),
});

type FormData = yup.InferType<typeof schema>;

const SafeLoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    setMounted(true);
    
    // Add form submission debugging
    const handleFormSubmit = (e: Event) => {
      console.log('🎯 Global form submit event detected:', {
        target: e.target,
        timestamp: new Date().toISOString()
      });
    };
    
    document.addEventListener('submit', handleFormSubmit);
    
    return () => {
      document.removeEventListener('submit', handleFormSubmit);
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    console.log('🔥 Safe login form submitted:', { 
      email: data.email, 
      passwordLength: data.password?.length,
      timestamp: new Date().toISOString(),
      mounted,
      formData: data,
      location: {
        hostname: window.location.hostname,
        href: window.location.href,
        userAgent: navigator.userAgent.substring(0, 100)
      }
    });
    
    setLoading(true);
    try {
      console.log('🔄 Safe login form calling Redux loginUser...');
      const result = await dispatch(loginUser({ email: data.email, password: data.password })).unwrap();
      console.log('✅ Safe login form Redux loginUser completed');
      
      // Handle redirect
      if (result?.redirectPath) {
        router.push(result.redirectPath);
      }
    } catch (error: any) {
      console.error('🚨 Safe login form error caught:', {
        error,
        message: error?.message,
      });
      // Error handled in Redux slice
    } finally {
      setLoading(false);
      console.log('🏁 Safe login form loading set to false');
    }
  };

  // Show loading state until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <form className="space-y-5">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </form>
    );
  }

  return (
    <HydrationBoundary fallback={
      <form className="space-y-5">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </form>
    }>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning>
        <div className="space-y-4">
          <div>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all"
              placeholder="Email address"
              suppressHydrationWarning
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all"
              placeholder="Password"
              suppressHydrationWarning
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              suppressHydrationWarning
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              )}
            </button>
            {errors.password && (
              <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          suppressHydrationWarning
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin mr-2"></div>
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
      
      {/* Rate Limit Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
          <strong>ข้อจำกัดการเข้าสู่ระบบ:</strong><br />
          ผู้ใช้ทั่วไป: 3 ครั้ง ต่อ 10 นาที<br />
          Admin: ไม่จำกัด
        </p>
      </div>
    </HydrationBoundary>
  );
};

export default SafeLoginForm;