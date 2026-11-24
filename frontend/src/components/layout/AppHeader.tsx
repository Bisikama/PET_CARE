'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useMeStore } from '@/features/me';
import { NotificationBadge, NotificationList } from '@/features/notifications';
import { ShieldCheck, ChevronRight } from 'lucide-react';

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
      const tab = searchParams.get('tab');
      if (user?.role === 'ADMIN') {
        switch (tab || 'verify-partners') {
          case 'dashboard':
            return 'Bảng Điều Khiển';
          case 'verify-partners':
            return 'Duyệt Hồ Sơ eKYC';
          case 'services-manager':
            return 'Quản Lý Dịch Vụ';
          case 'monitor-shifts':
            return 'Giám Sát Ca Làm';
          case 'escrow':
            return 'Tiền Ký Quỹ & Rút Tiền';
          case 'bank-transactions':
            return 'Đối Soát Chuyển Khoản';
          case 'arbitration':
            return 'Trọng Tài Tranh Chấp';
          case 'limits':
            return 'Quản Lý Người Dùng';
          case 'logs':
            return 'Nhật Ký Hệ Thống';
          case 'promotions':
            return 'Mã Khuyến Mãi';
          case 'subscriptions':
            return 'Gói Hội Viên';
          default:
            return 'Duyệt Hồ Sơ eKYC';
        }
      }
      if (tab === 'promotions') return 'Kho Ưu Đãi & Voucher';
      if (tab === 'membership') return 'Gói Hội Viên';
      if (tab === 'wallet') return 'Ví Điện Tử';
      if (tab === 'schedule') return 'Lịch & Năng Lực Dịch Vụ';
      return 'Tổng quan';
    }
    if (pathname === ROUTES.SERVICES) return 'Dịch vụ thú cưng';
    if (pathname === ROUTES.BOOKINGS) return 'Đặt người chăm sóc';
    if (pathname === ROUTES.SUPPORT) return 'Hỗ trợ & Trợ giúp';
    if (pathname === ROUTES.ADMIN_SUPPORT) return 'Trung Tâm CSKH & Tranh Chấp';
    return 'Hệ thống Quản lý';
  };

  const displayName = user?.fullName || 'Người dùng';
  const roleName =
    user?.role === 'ADMIN'
      ? 'Quản trị viên'
      : user?.role === 'PROVIDER'
      ? 'Chuyên viên'
      : 'Khách hàng';
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 md:px-8 border-b border-slate-200/80 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        {user?.role === 'ADMIN' && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>Hệ thống</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </div>
        )}
        <h1 className="text-base md:text-lg font-bold text-[#08243D] tracking-tight truncate">
          {getPageTitle()}
        </h1>
        {user?.role === 'ADMIN' && (
          <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#08243D]/5 border border-slate-200 text-[#08243D] text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3 text-[#F7C948]" />
            Admin
          </span>
        )}
      </div>

      <div className="flex items-center gap-3.5 shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <NotificationBadge onClick={() => setShowNotifications(!showNotifications)} />
          
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 md:w-96 z-50 origin-top-right animate-slide-down">
              <NotificationList className="max-h-[80vh] border border-slate-200/80 shadow-xl rounded-2xl overflow-hidden" />
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* User Info */}
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/80 py-1.5 px-2.5 rounded-xl transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#08243D] flex items-center justify-center text-[#F7C948] font-bold text-xs uppercase shadow-2xs">
            {firstLetter}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{displayName}</p>
            <p className="text-[10px] text-slate-500 font-medium">{roleName}</p>
          </div>
        </button>
      </div>
    </header>
  );
};
