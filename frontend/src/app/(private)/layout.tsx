'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { isAuthenticated } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Kiểm tra trạng thái đăng nhập cơ bản
    if (!isAuthenticated()) {
      router.replace(ROUTES.LOGIN);
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
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
    </div>
  );
}
