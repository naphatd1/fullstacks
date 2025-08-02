'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { registerUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import HydrationBoundary from './HydrationBoundary';

const schema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .required('Name is required'),
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

type FormData = yup.InferType<typeof schema>;

const SafeRegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  }, []);

  const onSubmit = async (data: FormData) => {
    console.log('🔥 Safe register form submitted:', { 
      email: data.email, 
      name: data.name,
      passwordLength: data.password?.length,
      timestamp: new Date().toISOString(),
      mounted
    });
    
    setLoading(true);
    try {
      const result = await dispatch(registerUser({ email: data.email, password: data.password, name: data.name })).unwrap();
      
      // Handle redirect
      if (result?.redirectPath) {
        router.push(result.redirectPath);
      }
    } catch (error) {
      console.error('🚨 Safe register form error:', error);
      // Error handled in Redux slice
    } finally {
      setLoading(false);
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
              {...register('name')}
              type="text"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all"
              placeholder="Full name"
              suppressHydrationWarning
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

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
                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
              )}
            </button>
            {errors.password && (
              <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all"
              placeholder="Confirm password"
              suppressHydrationWarning
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              suppressHydrationWarning
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
              )}
            </button>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message}</p>
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
              Creating account...
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </HydrationBoundary>
  );
};

export default SafeRegisterForm;