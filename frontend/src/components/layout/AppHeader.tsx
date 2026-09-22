'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useMeStore } from '@/features/me';
import { NotificationBadge, NotificationList } from '@/features/notifications';

export const AppHeader = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { openModal } = useMeStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (pathname === ROUTES.DASHBOARD) {
      if (user?.role === 'ADMIN') {
        const tab = searchParams.get('tab') || 'verify-partners';
        switch (tab) {
          case 'dashboard':
            return 'Bảng Điều Khiển';
          case 'verify-partners':
            return 'Duyệt Hồ Sơ';
          case 'monitor-shifts':
            return 'Giám Sát Ca Làm';
          case 'escrow':
            return 'Quản Lý Escrow';
          case 'arbitration':
            return 'Trọng Tài Tranh Chấp';
          case 'limits':
            return 'Giới Hạn Tài Khoản';
          case 'logs':
            return 'Nhật Ký Hệ Thống';
          default:
            return 'Duyệt Hồ Sơ';
        }
      }
      return 'Tổng quan';
    }
    if (pathname === ROUTES.SERVICES) return 'Dịch vụ thú cưng';
    if (pathname === ROUTES.BOOKINGS) return 'Đặt người chăm sóc';
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
        <div className="relative" ref={notificationRef}>
          <NotificationBadge onClick={() => setShowNotifications(!showNotifications)} />
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 z-50 origin-top-right">
              <NotificationList className="max-h-[80vh] border border-slate-200 shadow-xl" />
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200" />

        {/* User Info */}
        <div 
          onClick={openModal}
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 -m-1.5 rounded-2xl transition-all duration-200 active:scale-[0.98]"
        >
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

