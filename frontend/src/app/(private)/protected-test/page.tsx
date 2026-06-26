'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogIn, UserRoundCheck } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { removeAuthToken } from '@/lib/auth';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

type CurrentUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type MeResponse = {
  data: CurrentUser;
};

export default function ProtectedTestPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const response = await axiosInstance.get<MeResponse>(API_ENDPOINTS.ME);
        setUser(response.data.data);
      } catch {
        removeAuthToken();
        setError('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
      } finally {
        setIsLoading(false);
      }
    };

    void checkCurrentUser();
  }, []);

  const handleBackToLogin = () => {
    removeAuthToken();
    router.replace(ROUTES.LOGIN);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="h-8 w-8 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold">Đang kiểm tra phiên đăng nhập...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-white p-8 shadow-sm">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <LogIn className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Không vào được trang protected</h2>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <Button className="mt-6" onClick={handleBackToLogin}>
          Quay lại đăng nhập
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Protected route test
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-800">
          Đăng nhập thành công, bạn đã vào được trang bảo vệ.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Trang này chỉ hiển thị sau khi frontend có access token và backend xác nhận token hợp lệ
          qua API <code className="rounded bg-slate-100 px-1.5 py-0.5">GET /auth/me</code>.
        </p>
      </div>

      {user && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <UserRoundCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Thông tin user từ backend</h3>
              <p className="text-sm text-slate-400">Dữ liệu trả về từ access token hiện tại.</p>
            </div>
          </div>

          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-400">ID</p>
              <p className="mt-1 break-all font-semibold text-slate-700">{user.id}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-400">Email</p>
              <p className="mt-1 font-semibold text-slate-700">{user.email}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-400">Tên</p>
              <p className="mt-1 font-semibold text-slate-700">{user.fullName}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-400">Role</p>
              <p className="mt-1 font-semibold text-slate-700">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
