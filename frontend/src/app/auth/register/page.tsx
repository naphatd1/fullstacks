'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch } from '@/store/hooks';
import { registerUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

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
    .min(8, 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'รหัสผ่านต้องประกอบด้วย ตัวอักษรพิมพ์เล็ก (a-z) ตัวอักษรพิมพ์ใหญ่ (A-Z) ตัวเลข (0-9) และอักขระพิเศษ (@$!%*?&)'
    )
    .required('กรุณากรอกรหัสผ่าน'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

type FormData = yup.InferType<typeof schema>;

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      console.log('🚀 Submitting registration form:', { email: data.email, name: data.name });
      
      const result = await dispatch(registerUser({ 
        email: data.email, 
        password: data.password, 
        name: data.name 
      })).unwrap();
      
      console.log('✅ Registration result:', result);
      
      // Redirect to login page after successful registration
      if (result?.user || result?.registered) {
        console.log('✅ Registration successful, redirecting to login...');
        // Add small delay to ensure toast is shown
        setTimeout(() => {
          router.replace('/auth/login?registered=true');
        }, 1000);
      }
    } catch (error: any) {
      console.error('❌ Registration form error:', error);
      
      // Show additional error info in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      // Error toast already handled in Redux slice
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center sm:items-start justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-4 sm:pt-8 sm:pb-4 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md max-h-full overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
            <span className="text-white dark:text-slate-900 font-bold text-lg sm:text-xl">A</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-slate-900 dark:text-white mb-1 sm:mb-2">
            Create account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Join us today
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl border border-slate-200 dark:border-slate-700">

          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning={true}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-3 sm:py-3.5 bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all text-sm sm:text-base"
                  placeholder="Full name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 sm:py-3.5 bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all text-sm sm:text-base"
                  placeholder="Email address"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 sm:py-3.5 pr-12 bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all text-sm sm:text-base"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 sm:py-3.5 pr-12 bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all text-sm sm:text-base"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>
          
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Password Requirements */}
          <div className="mt-3 p-3 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
            <div className="text-center">
              <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 tracking-wide">
                Password Requirements
              </h4>
              <div className="flex flex-wrap justify-center gap-1 text-xs">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-600/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-500/50">
                  <span className="w-1 h-1 bg-slate-400 dark:bg-slate-400 rounded-full mr-1"></span>
                  a-z
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-600/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-500/50">
                  <span className="w-1 h-1 bg-slate-400 dark:bg-slate-400 rounded-full mr-1"></span>
                  A-Z
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-600/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-500/50">
                  <span className="w-1 h-1 bg-slate-400 dark:bg-slate-400 rounded-full mr-1"></span>
                  0-9
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-600/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-500/50">
                  <span className="w-1 h-1 bg-slate-400 dark:bg-slate-400 rounded-full mr-1"></span>
                  @$!%*?&
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;