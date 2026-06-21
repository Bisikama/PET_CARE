'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import { setAuthToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Giả lập cuộc gọi API
      await new Promise((resolve) => setTimeout(resolve, 800));

      setAuthToken('mock-auth-token-xyz');
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi đăng nhập.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 shadow-xl p-8">
        <div className="text-center mb-8">
          <Link href={ROUTES.LANDING} className="inline-block text-2xl font-bold text-teal-600 mb-2">
            🐾 PET CARE
          </Link>
          <h2 className="text-xl font-bold text-slate-800">Chào mừng trở lại!</h2>
          <p className="text-sm text-slate-400 mt-1">Đăng nhập tài khoản quản trị/thành viên</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-colors bg-white text-slate-800"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                Mật khẩu
              </label>
              <a href="#" className="text-xs font-semibold text-teal-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-colors bg-white text-slate-800"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            Đăng nhập
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link href={ROUTES.REGISTER} className="font-semibold text-teal-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
