'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowRight, ArrowLeft, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { authService } from '../services/auth.service';

const resetPasswordSchema = z
  .object({
    email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
    token: z.string().min(1, 'Vui lòng nhập mã OTP xác thực từ email'),
    password: z.string().min(8, 'Mật khẩu phải từ 8 ký tự trở lên'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu mới'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const decodeJwtPayload = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromUrl,
      token: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Keep email and token in sync if URL query parameters or hash loads after mount
  React.useEffect(() => {
    if (emailFromUrl) {
      setValue('email', emailFromUrl);
    }

    // 1. Check query parameters (?code=... or ?token=...)
    const queryToken = searchParams.get('code') || searchParams.get('token');
    if (queryToken) {
      setValue('token', queryToken);
      // If code looks like a JWT token, try to decode email from it
      if (queryToken.startsWith('eyJ')) {
        const payload = decodeJwtPayload(queryToken);
        if (payload && payload.email) {
          setValue('email', payload.email);
        }
      }
    }

    // 2. Check URL hash parameters (#access_token=... or #token=...)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1); // remove '#'
      const params = new URLSearchParams(hash);
      const hashToken = params.get('access_token') || params.get('token');
      if (hashToken) {
        setValue('token', hashToken);
        // Automatically extract email from the verified JWT access token!
        if (hashToken.startsWith('eyJ')) {
          const payload = decodeJwtPayload(hashToken);
          if (payload && payload.email) {
            setValue('email', payload.email);
          }
        }
      }
    }
  }, [emailFromUrl, searchParams, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.resetPassword(data);
      setSuccess(
        response.message || 'Mật khẩu của bạn đã được đặt lại thành công.'
      );
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại mã OTP.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: '#0b1c30',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='%23132742' fill-opacity='0.45'%3E%3Cpath d='M12 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-4.5-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6-4.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm3 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }}
    >
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 p-8 sm:p-10">
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#fef3c7] flex items-center justify-center mx-auto mb-4 relative shadow-sm text-amber-500">
            <KeyRound className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Đặt lại mật khẩu mới
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Vui lòng nhập mã OTP nhận được từ email và đặt lại mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 bg-[#fef2f2] border border-[#fca5a5] rounded-xl flex items-start space-x-3 text-[#dc2626] relative">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium leading-relaxed pr-6">{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="absolute top-2 right-2 text-red-400 hover:text-red-650 transition-colors"
            >
              &times;
            </button>
          </div>
        )}

        {/* Success Alert Box */}
        {success && (
          <div className="mb-6 p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex flex-col space-y-1.5 text-[#16a34a]">
            <div className="text-sm font-semibold leading-relaxed">{success}</div>
            <div className="text-xs font-medium text-green-600 animate-pulse">
              Đang chuyển hướng về trang đăng nhập...
            </div>
          </div>
        )}

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1" htmlFor="email">
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              className={`w-full px-4 py-3 bg-white text-slate-850 rounded-xl border ${
                errors.email ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
              } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm font-medium`}
              placeholder="example@gmail.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{errors.email.message}</p>
            )}
          </div>

          {/* OTP Token input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1" htmlFor="token">
              Mã OTP xác thực (từ Email)
            </label>
            <input
              id="token"
              type="text"
              className={`w-full px-4 py-3 bg-white text-slate-850 rounded-xl border text-center font-bold tracking-[0.2em] ${
                errors.token ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
              } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm`}
              placeholder="Nhập mã OTP"
              {...register('token')}
            />
            {errors.token && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{errors.token.message}</p>
            )}
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1" htmlFor="password">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-4 pr-12 py-3 bg-white text-slate-850 rounded-xl border ${
                  errors.password ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
                } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm font-medium`}
                placeholder="Tối thiểu 8 ký tự"
                {...register('password')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-650 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1" htmlFor="confirmPassword">
              Nhập lại mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className={`w-full px-4 py-3 bg-white text-slate-850 rounded-xl border ${
                errors.confirmPassword ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
              } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm font-medium`}
              placeholder="Xác nhận mật khẩu"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !!success}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#ffca40] hover:bg-[#ffbf24] active:scale-[0.99] disabled:opacity-50 text-[#0b1c30] font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>{isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Divider */}
        <hr className="border-t border-slate-100 my-6" />

        {/* Back to Login link */}
        <div className="text-center text-sm font-semibold text-slate-650">
          <Link
            href={ROUTES.LOGIN}
            className="font-bold text-slate-600 hover:text-[#0b1c30] transition-colors flex items-center justify-center space-x-1.5 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Quay lại đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
