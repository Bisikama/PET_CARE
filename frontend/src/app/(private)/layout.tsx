'use client';

import { useState, useEffect, ReactNode, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { MeModal, CustomerAddressModal, ProviderModal } from '@/features/me';
import { PetModal } from '@/features/pet';
import { GlobalChatButton } from '@/features/chat';

export default function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { isAuthenticated: isAuth, isLoading: isAuthLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuth) {
      // Token hết hạn hoặc không hợp lệ
      router.replace(ROUTES.LOGIN);
    } else {
      setLoading(false);
    }
  }, [isAuth, isAuthLoading, router]);

  if (loading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08243D]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#F7C948]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-[#F7C948] border-t-transparent animate-spin" />
            <span className="text-xl">🐾</span>
          </div>
          <p className="text-sm font-bold text-[#F7C948] tracking-wide animate-pulse">
            Đang khởi tạo không gian PetCare...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f4f7fb] overflow-hidden relative">
      {/* Ambient background subtle mesh */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-300/10 blur-[110px]" />
        <div className="absolute bottom-0 right-10 w-[420px] h-[420px] rounded-full bg-teal-400/10 blur-[110px]" />
      </div>

      {/* Sidebar cố định bên trái */}
      <Suspense fallback={<div className="w-68 bg-[#08243D] h-screen shrink-0" />}>
        <AppSidebar />
      </Suspense>

      {/* Vùng nội dung chính bên phải */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Header trên cùng */}
        <AppHeader />

        {/* Nội dung trang động cuộn độc lập */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Đang tải trang...</div>}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>

      <MeModal />
      <CustomerAddressModal />
      <PetModal />
      <ProviderModal />
      <GlobalChatButton />
    </div>
  );
}

