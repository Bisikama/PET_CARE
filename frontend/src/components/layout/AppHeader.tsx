'use client';

import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export const AppHeader = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const getPageTitle = () => {
    if (pathname === ROUTES.DASHBOARD) return 'Tổng quan';
    return 'Hệ thống Quản lý';
  };

  const displayName = user?.fullName || 'Người dùng';
  const roleName =
    user?.role === 'ADMIN'
      ? 'Quản trị viên'
      : user?.role === 'PROVIDER'
      ? 'Nhà cung cấp'
      : 'Khách hàng';
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 select-none">
      <h1 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h1>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
        </button>

        <div className="h-8 w-px bg-slate-200" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold border border-teal-200 uppercase">
            {firstLetter}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</p>
            <p className="text-xs text-slate-500">{roleName}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
