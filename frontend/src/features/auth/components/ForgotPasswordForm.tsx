'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { authService } from '../services/auth.service';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.forgotPassword(data.email);
      setSuccess(
        response.message || 'Mã OTP khôi phục mật khẩu đã được gửi thành công tới email của bạn.'
      );
      
      // Redirect to reset password after 3 seconds
      setTimeout(() => {
        router.push(`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(data.email)}`);
      }, 3000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi yêu cầu lại mật khẩu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 p-8 sm:p-10">
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#f8fafc] flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 overflow-hidden">
            <img src="/logo.png" alt="PetCare Logo" className="w-16 h-16 object-contain" />
          </div>

          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Vui lòng nhập email của bạn. Chúng tôi sẽ gửi một email hướng dẫn đặt lại mật khẩu cùng mã OTP.
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
              Đang chuyển hướng sang trang nhập mã OTP đặt lại mật khẩu...
            </div>
          </div>
        )}

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="email">
              Địa chỉ Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                id="email"
                type="email"
                className={`w-full pl-11 pr-4 py-3.5 bg-white text-slate-850 rounded-xl border ${
                  errors.email ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-sky-100'
                } focus:outline-none focus:ring-4 focus:border-sky-500 transition-all text-sm font-medium`}
                placeholder="example@gmail.com"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.email.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !!success}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#ffca40] hover:bg-[#ffbf24] active:scale-[0.99] disabled:opacity-50 text-[#0b1c30] font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>{isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}</span>
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
    </>
  );
}
