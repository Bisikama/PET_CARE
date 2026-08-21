'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { isAuthenticated } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { MeModal } from '@/features/me';
import { PetModal } from '@/features/pet';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const { isAuthenticated: isAuth, isLoading: isAuthLoading } = useAuthStore();

  React.useEffect(() => {
    // 1. Kiểm tra nhanh bằng localStorage đồng bộ để tránh chớp màn hình
    if (!isAuthenticated()) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    // 2. Nếu có token, đợi store xác thực bất đồng bộ (initAuth)
    if (!isAuthLoading) {
      if (!isAuth) {
        // Token hết hạn hoặc không hợp lệ (ví dụ lỗi 401)
        router.replace(ROUTES.LOGIN);
      } else {
        setLoading(false);
      }
    }
  }, [isAuth, isAuthLoading, router]);

  if (loading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Đang kiểm tra bảo mật...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar cố định bên trái */}
      <AppSidebar />

      {/* Vùng nội dung chính bên phải */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header trên cùng */}
        <AppHeader />

        {/* Nội dung trang động cuộn độc lập */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <MeModal />
      <PetModal />
    </div>
  );
}
