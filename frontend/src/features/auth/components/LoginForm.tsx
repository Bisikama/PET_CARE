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
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// Zod schema matching standard login validations
const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email hoặc số điện thoại không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống').min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormInner() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  // Custom Login hook
  const { login, isLoading, error: storeError, clearError } = useLogin();
  const { loginWithGoogle, isLoading: isGoogleLoading, error: googleError, clearError: clearGoogleError } = useGoogleLogin();

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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    clearGoogleError();
    if (credentialResponse.credential) {
      await loginWithGoogle(credentialResponse.credential);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine error text to display
  const errorText = storeError || googleError;

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
          <div className="w-24 h-24 rounded-full bg-[#e0f2fe] flex items-center justify-center mx-auto mb-4 relative shadow-sm overflow-hidden">
            <img 
              src='/logo.png'
              alt='logo'
              className='w-full h-full object-cover'
            />
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
                clearGoogleError();
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
              href={ROUTES.FORGOT_PASSWORD} 
              className="text-sm font-bold text-slate-800 hover:text-[#0b1c30] transition-colors hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#ffca40] hover:bg-[#ffbf24] active:scale-[0.99] disabled:opacity-50 text-[#0b1c30] font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <hr className="flex-1 border-t border-slate-100" />
          <span className="text-xs font-semibold text-slate-400">hoặc</span>
          <hr className="flex-1 border-t border-slate-100" />
        </div>

        {/* Google Login Button */}
        <div className="flex justify-center">
          {GOOGLE_CLIENT_ID ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.error('Google Login Failed');
              }}
              text="signin_with"
              shape="pill"
              size="large"
              width="100%"
            />
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3 px-6 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-400 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Đăng nhập bằng Google (Chưa cấu hình Client ID)
            </button>
          )}
        </div>

        {/* Register link */}
        <div className="text-center text-sm font-semibold text-slate-650 mt-6">
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

export function LoginForm() {
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginFormInner />
      </GoogleOAuthProvider>
    );
  }
  return <LoginFormInner />;
}
