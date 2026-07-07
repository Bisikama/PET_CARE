'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowRight, KeyRound, Mail } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '../stores/auth.store';

const otpSchema = z.object({
  otp: z
    .string()
    .min(8, 'Mã OTP phải có 8 chữ số')
    .max(8, 'Mã OTP phải có 8 chữ số')
    .regex(/^[0-9]+$/, 'Mã OTP chỉ bao gồm chữ số'),
});

type OtpFormData = z.infer<typeof otpSchema>;

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const { verifyEmailOtp, resendOtp, isLoading, error, clearError } = useAuthStore();
  const [cooldown, setCooldown] = React.useState(0);
  const [resendSuccess, setResendSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Cooldown timer logic for resending OTP
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = async (data: OtpFormData) => {
    if (!email) {
      return;
    }
    clearError();
    setResendSuccess(null);
    const success = await verifyEmailOtp(email, data.otp);
    if (success) {
      router.push(ROUTES.DASHBOARD);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    clearError();
    setResendSuccess(null);
    const success = await resendOtp(email);
    if (success) {
      setResendSuccess('Mã OTP mới đã được gửi tới email của bạn.');
      setCooldown(60); // 60 seconds cooldown
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
            Xác thực OTP tài khoản
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-semibold flex items-center justify-center space-x-1.5">
            <Mail className="w-4 h-4 text-sky-500" />
            <span>Mã OTP đã được gửi tới email của bạn:</span>
          </p>
          <p className="mt-1 text-sm text-sky-600 font-bold break-all bg-sky-50 py-1.5 px-3 rounded-lg inline-block">
            {email || 'Chưa cung cấp email'}
          </p>
        </div>

        {/* Server Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-[#fef2f2] border border-[#fca5a5] rounded-xl flex items-start space-x-3 text-[#dc2626] relative">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium leading-relaxed pr-6">{error}</div>
            <button
              type="button"
              onClick={clearError}
              className="absolute top-2 right-2 text-red-400 hover:text-red-650 transition-colors"
            >
              &times;
            </button>
          </div>
        )}

        {/* Resend Success Alert */}
        {resendSuccess && (
          <div className="mb-6 p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-start space-x-3 text-[#16a34a]">
            <div className="text-sm font-semibold leading-relaxed">{resendSuccess}</div>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="otp">
              Mã xác thực OTP (8 chữ số)
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={8}
              className={`w-full px-4 py-3.5 bg-white text-slate-850 rounded-xl border text-center text-2xl font-bold tracking-[0.5em] ${
                errors.otp ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
              } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all`}
              placeholder="00000000"
              {...register('otp')}
            />
            {errors.otp && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold text-center">{errors.otp.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#ffca40] hover:bg-[#ffbf24] active:scale-[0.99] disabled:opacity-50 text-[#0b1c30] font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>{isLoading ? 'Đang xác thực...' : 'Xác nhận OTP'}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Resend Cooldown & Resend Trigger */}
        <div className="mt-6 text-center text-sm font-semibold text-slate-500">
          Chưa nhận được mã?{' '}
          {cooldown > 0 ? (
            <span className="text-slate-400 font-bold">
              Gửi lại sau {cooldown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isLoading || !email}
              className="font-bold text-sky-600 hover:text-sky-800 transition-colors cursor-pointer hover:underline focus:outline-none disabled:opacity-50"
            >
              Gửi lại mã ngay
            </button>
          )}
        </div>

        {/* Divider */}
        <hr className="border-t border-slate-100 my-6" />

        {/* Back to Login link */}
        <div className="text-center text-sm font-semibold text-slate-650">
          Quay lại{' '}
          <Link
            href={ROUTES.REGISTER}
            className="font-bold text-slate-800 hover:text-[#0b1c30] transition-colors hover:underline"
          >
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
