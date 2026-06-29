'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowRight, Store } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useRegister } from '../hooks/useRegister';

// Zod validation matching reference layout and backend requirements
const registerSchema = z
  .object({
    fullName: z.string().min(1, 'Họ và tên không được để trống'),
    phone: z
      .string()
      .min(1, 'Số điện thoại không được để trống')
      .regex(/^[0-9+]{9,15}$/, 'Số điện thoại không hợp lệ'),
    email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải từ 8 ký tự trở lên'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
    agree: z.boolean().refine((val) => val === true, {
      message: 'Bạn phải đồng ý với Điều khoản sử dụng',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { registerUser, isLoading, error: storeError, clearError } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      agree: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    const success = await registerUser(data);
    if (success) {
      router.push(ROUTES.DASHBOARD);
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
      <div className="max-w-xl w-full bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 p-8 sm:p-10">
        {/* Logo Container */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#e0f2fe] flex items-center justify-center mx-auto mb-4 relative shadow-sm">
            {/* Blue Heart Shape */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-14 h-14 text-sky-400 fill-current"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {/* White Silhouette of Parent & Baby Animals Inside the Heart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
              >
                <path
                  d="M26.5 30c.8 0 1.5.7 1.5 1.5V38c0 1.7-1.3 3-3 3h-5c-1.7 0-3-1.3-3-3v-6.5c0-.8.7-1.5 1.5-1.5h8z"
                  fill="white"
                />
                <circle cx="22.5" cy="26" r="2.5" fill="white" />
                <path
                  d="M38.5 34c.6 0 1 .4 1 1v4c0 1.1-.9 2-2 2h-3c-1.1 0-2-.9-2-2v-4c0-.6.4-1 1-1h5z"
                  fill="white"
                />
                <circle cx="35.5" cy="31" r="1.8" fill="white" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Tạo tài khoản PetCare
          </h2>
        </div>

        {/* Server Error Notification */}
        {storeError && (
          <div className="mb-6 p-4 bg-[#fef2f2] border border-[#fca5a5] rounded-xl flex items-start space-x-3 text-[#dc2626] relative">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium leading-relaxed pr-6">{storeError}</div>
            <button
              type="button"
              onClick={clearError}
              className="absolute top-2 right-2 text-red-400 hover:text-red-650 transition-colors"
            >
              &times;
            </button>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Row 1: Họ tên & Số điện thoại (Grid 2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="fullName">
                Họ và tên
              </label>
              <input
                id="fullName"
                type="text"
                className={`w-full px-4 py-3 bg-white text-slate-850 rounded-xl border ${
                  errors.fullName ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
                } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm font-medium`}
                placeholder="Nhập họ và tên"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="phone">
                Số điện thoại
              </label>
              <input
                id="phone"
                type="text"
                className={`w-full px-4 py-3 bg-white text-slate-850 rounded-xl border ${
                  errors.phone ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
                } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm font-medium`}
                placeholder="Nhập số điện thoại"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Email (Full width) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`w-full px-4 py-3 bg-white text-slate-850 rounded-xl border ${
                errors.email ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
              } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm font-medium`}
              placeholder="Nhập địa chỉ email"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{errors.email.message}</p>
            )}
          </div>

          {/* Row 3: Mật khẩu & Nhập lại mật khẩu (Grid 2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="password">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                className={`w-full px-4 py-3 bg-white text-slate-850 rounded-xl border ${
                  errors.password ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
                } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm font-medium`}
                placeholder="Tạo mật khẩu"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full px-4 py-3 bg-white text-slate-850 rounded-xl border ${
                  errors.confirmPassword ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
                } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm font-medium`}
                placeholder="Nhập lại mật khẩu"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500 font-semibold">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-1">
            <label className="flex items-start space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className={`w-5 h-5 mt-0.5 rounded border-slate-350 text-[#ffca40] focus:ring-0 focus:ring-offset-0 accent-[#ffca40] cursor-pointer ${
                  errors.agree ? 'border-red-400' : ''
                }`}
                {...register('agree')}
              />
              <span className="text-sm font-semibold text-slate-700 leading-normal">
                Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật.
              </span>
            </label>
            {errors.agree && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.agree.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#ffca40] hover:bg-[#ffbf24] active:scale-[0.99] disabled:opacity-50 text-[#0b1c30] font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>{isLoading ? 'Đang đăng ký...' : 'Đăng ký'}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Subtitle / Defaults */}
        <div className="mt-3 text-center text-xs text-slate-400 font-semibold">
          Tài khoản mới mặc định là Khách hàng.
        </div>

        {/* Provider Register Box Notification */}
        <div className="mt-6 p-4 bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl flex items-start space-x-3 text-[#0369a1]">
          <Store className="w-5 h-5 shrink-0 mt-0.5 text-sky-600" />
          <div className="text-sm font-semibold leading-relaxed">
            Bạn muốn trở thành Provider? Bạn có thể đăng ký hồ sơ sau khi tạo tài khoản.
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t border-slate-100 my-6" />

        {/* Back to Login link */}
        <div className="text-center text-sm font-semibold text-slate-650">
          Đã có tài khoản?{' '}
          <Link
            href={ROUTES.LOGIN || '#'}
            className="font-bold text-slate-800 hover:text-[#0b1c30] transition-colors hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
