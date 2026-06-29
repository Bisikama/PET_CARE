'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Eye, EyeOff, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useLogin } from '../hooks/useLogin';

// Zod schema matching standard login validations
const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email hoặc số điện thoại không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống').min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  // Custom Login hook
  const { login, isLoading, error: storeError, clearError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();

    // Map emailOrPhone field to email since the NestJS backend expects "email" in LoginDto
    const credentials = {
      email: data.emailOrPhone,
      password: data.password,
    };

    const success = await login(credentials);
    if (success) {
      router.push(ROUTES.DASHBOARD);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine error text to display
  const errorText = storeError;

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
                {/* Mother Pet Silhouette */}
                <path
                  d="M26.5 30c.8 0 1.5.7 1.5 1.5V38c0 1.7-1.3 3-3 3h-5c-1.7 0-3-1.3-3-3v-6.5c0-.8.7-1.5 1.5-1.5h8z"
                  fill="white"
                />
                <circle cx="22.5" cy="26" r="2.5" fill="white" />
                {/* Baby Pet Silhouette */}
                <path
                  d="M38.5 34c.6 0 1 .4 1 1v4c0 1.1-.9 2-2 2h-3c-1.1 0-2-.9-2-2v-4c0-.6.4-1 1-1h5z"
                  fill="white"
                />
                <circle cx="35.5" cy="31" r="1.8" fill="white" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Đăng nhập vào PetCare
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Chào mừng bạn quay trở lại. Vui lòng đăng nhập.
          </p>
        </div>

        {/* Lockout Alert Box */}
        {errorText && (
          <div className="mb-6 p-4 bg-[#fef2f2] border border-[#fca5a5] rounded-xl flex items-start space-x-3 text-[#dc2626] relative">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#dc2626]" />
            <div className="text-sm font-medium leading-relaxed pr-6">
              {errorText}
            </div>
            <button 
              type="button"
              onClick={() => {
                clearError();
              }}
              className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
              title="Đóng thông báo"
            >
              &times;
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email or Phone Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="emailOrPhone">
              Email hoặc số điện thoại
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                id="emailOrPhone"
                type="text"
                className={`w-full pl-11 pr-4 py-3.5 bg-white text-slate-850 rounded-xl border ${
                  errors.emailOrPhone ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
                } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm font-medium`}
                placeholder="Nhập email hoặc số điện thoại"
                {...register('emailOrPhone')}
              />
            </div>
            {errors.emailOrPhone && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.emailOrPhone.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="password">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                // Display red border if validation error or backend auth error is active
                className={`w-full pl-11 pr-12 py-3.5 bg-white text-slate-850 rounded-xl border ${
                  errors.password || storeError ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
                } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm font-medium`}
                placeholder="••••••"
                {...register('password')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.password.message}</p>
            )}
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-slate-350 text-[#ffca40] focus:ring-0 focus:ring-offset-0 accent-[#ffca40] cursor-pointer"
                {...register('rememberMe')}
              />
              <span className="text-sm font-semibold text-slate-700">Ghi nhớ đăng nhập</span>
            </label>
            <Link 
              href="#" 
              className="text-sm font-bold text-slate-800 hover:text-[#0b1c30] transition-colors hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#ffca40] hover:bg-[#ffbf24] active:scale-[0.99] disabled:opacity-50 text-[#0b1c30] font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Divider */}
        <hr className="border-t border-slate-100 my-6" />

        {/* Register link */}
        <div className="text-center text-sm font-semibold text-slate-650">
          Chưa có tài khoản?{' '}
          <Link 
            href={ROUTES.REGISTER || '#'} 
            className="font-bold text-slate-800 hover:text-[#0b1c30] transition-colors hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>

        {/* Footnote */}
        <div className="mt-5 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 font-medium">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Provider và Admin sử dụng cùng cổng đăng nhập.</span>
        </div>

      </div>
    </div>
  );
}
