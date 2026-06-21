'use client';

import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { Bell } from 'lucide-react';

export const AppHeader = () => {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === ROUTES.DASHBOARD) return 'Tổng quan';
    if (pathname.startsWith(ROUTES.PETS)) return 'Danh sách Thú cưng';
    if (pathname.startsWith(ROUTES.BOOKINGS)) return 'Lịch đặt dịch vụ';
    if (pathname.startsWith(ROUTES.SERVICES)) return 'Dịch vụ Chăm sóc';
    if (pathname.startsWith(ROUTES.PROFILE)) return 'Thông tin cá nhân';
    return 'Hệ thống Quản lý';
  };

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
          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold border border-teal-200">
            A
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-tight">Admin</p>
            <p className="text-xs text-slate-500">Quản trị viên</p>
          </div>
        </div>
      </div>
    </header>
  );
};
