'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/lib/constants';
import { 
  HeartHandshake, 
  LayoutDashboard, 
  LogOut, 
  UserCheck, 
  ClipboardList, 
  Activity, 
  ShieldCheck, 
  Gavel, 
  BarChart3, 
  Database,
  Tag,
  Headphones,
  Calendar,
  Wallet,
  Landmark,
  Crown,
  Shield
} from 'lucide-react';
import { removeAuthToken } from '@/lib/auth';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useAdminStore } from '@/features/admin/stores/admin.store';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number | string;
  badgeColor?: string;
  category?: string;
}

export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { pendingKycCount, fetchPendingKycCount } = useAdminStore();

  React.useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchPendingKycCount();
    }
  }, [user, fetchPendingKycCount]);

  const currentTab = searchParams.get('tab') || (user?.role === 'ADMIN' ? 'verify-partners' : user?.role === 'PROVIDER' ? 'active-cases' : '');

  const adminSections = [
    {
      title: 'VẬN HÀNH & KIỂM DUYỆT',
      items: [
        { name: 'Bảng Điều Khiển', href: `${ROUTES.DASHBOARD}?tab=dashboard`, icon: LayoutDashboard },
        { 
          name: 'Duyệt Hồ Sơ eKYC', 
          href: `${ROUTES.DASHBOARD}?tab=verify-partners`, 
          icon: ClipboardList,
          badge: pendingKycCount > 0 ? pendingKycCount : undefined,
          badgeColor: 'bg-[#F7C948] text-[#08243D]'
        },
        { name: 'Quản Lý Dịch Vụ', href: `${ROUTES.DASHBOARD}?tab=services-manager`, icon: HeartHandshake },
        { name: 'Giám Sát Ca Làm', href: `${ROUTES.DASHBOARD}?tab=monitor-shifts`, icon: Activity },
      ]
    },
    {
      title: 'TÀI CHÍNH & KÝ QUỸ',
      items: [
        { name: 'Tiền Ký Quỹ & Rút Tiền', href: `${ROUTES.DASHBOARD}?tab=escrow`, icon: ShieldCheck },
        { name: 'Đối Soát Chuyển Khoản', href: `${ROUTES.DASHBOARD}?tab=bank-transactions`, icon: Landmark },
      ]
    },
    {
      title: 'KHIẾU NẠI & HỖ TRỢ',
      items: [
        { name: 'Trọng Tài Tranh Chấp', href: `${ROUTES.ADMIN_SUPPORT}?tab=disputes`, icon: Gavel },
        { name: 'Trung Tâm CSKH', href: ROUTES.ADMIN_SUPPORT, icon: Headphones },
      ]
    },
    {
      title: 'HỆ THỐNG & TÀI KHOẢN',
      items: [
        { name: 'Quản Lý Người Dùng', href: `${ROUTES.DASHBOARD}?tab=limits`, icon: BarChart3 },
        { name: 'Nhật Ký Hệ Thống', href: `${ROUTES.DASHBOARD}?tab=logs`, icon: Database },
        { name: 'Mã Khuyến Mãi', href: `${ROUTES.DASHBOARD}?tab=promotions`, icon: Tag },
        { name: 'Gói Hội Viên', href: `${ROUTES.DASHBOARD}?tab=subscriptions`, icon: Crown },
      ]
    }
  ];

  const providerNavigation = [
    { name: 'Ca Chăm Sóc Thực Tế', href: `${ROUTES.DASHBOARD}?tab=active-cases`, icon: Activity },
    { name: 'Lịch & Năng Lực Dịch Vụ', href: `${ROUTES.DASHBOARD}?tab=schedule`, icon: Calendar },
    { name: 'Ví Thu Nhập', href: `${ROUTES.DASHBOARD}?tab=wallet`, icon: Wallet },
    { name: 'Kho Ưu Đãi & Voucher', href: `${ROUTES.DASHBOARD}?tab=promotions`, icon: Tag },
    { name: 'Hỗ Trợ & Trợ Giúp', href: ROUTES.SUPPORT, icon: Headphones },
  ];

  const customerNavigation = [
    { name: 'Tổng quan', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Dịch vụ thú cưng', href: ROUTES.SERVICES, icon: HeartHandshake },
    { name: 'Đặt người chăm sóc', href: ROUTES.BOOKINGS, icon: UserCheck },
    { name: 'Kho Ưu Đãi & Voucher', href: `${ROUTES.DASHBOARD}?tab=promotions`, icon: Tag },
    { name: 'Gói Hội Viên', href: `${ROUTES.DASHBOARD}?tab=membership`, icon: Crown },
    { name: 'Ví Điện Tử', href: `${ROUTES.DASHBOARD}?tab=wallet`, icon: Wallet },
    { name: 'Hỗ trợ & Trợ giúp', href: ROUTES.SUPPORT, icon: Headphones },
  ];

  const handleLogout = () => {
    removeAuthToken();
    router.push(ROUTES.LOGIN);
  };

  const renderNavLink = (item: NavItem) => {
    const itemTab = item.href.includes('tab=') ? item.href.split('tab=')[1] : '';
    const isActive = item.href.includes('tab=')
      ? (pathname === ROUTES.DASHBOARD && currentTab === itemTab)
      : (pathname === item.href && !currentTab) || (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 group w-full',
          isActive
            ? 'bg-white/10 text-white font-bold shadow-2xs'
            : 'text-slate-300/70 hover:bg-white/[0.05] hover:text-white font-medium'
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#F7C948]" />
        )}

        <Icon
          className={cn(
            'h-4 w-4 transition-colors shrink-0',
            isActive ? 'text-[#F7C948]' : 'text-slate-400 group-hover:text-slate-200'
          )}
        />

        <span className="truncate flex-1 text-left">
          {item.name}
        </span>

        {item.badge !== undefined && (
          <span className={cn(
            'rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
            typeof item.badge === 'number' ? 'w-5 h-5' : 'px-2 py-0.5',
            isActive ? item.badgeColor : 'bg-[#F7C948] text-[#08243D]'
          )}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-[#08243D] text-slate-100 flex flex-col h-screen border-r border-slate-800/80 select-none shrink-0">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/[0.08]">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#F7C948]/40 bg-[#051829] flex items-center justify-center shrink-0">
            <img 
              src="/logo.png"
              alt="PetCare Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-wide text-[#F7C948] leading-tight">
              PetCare
            </span>
            {user?.role === 'ADMIN' && (
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Quản trị hệ thống
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Nav Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {user?.role === 'ADMIN' ? (
          adminSections.map((section, idx) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400/80 uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => renderNavLink(item))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-1">
            {(user?.role === 'PROVIDER' ? providerNavigation : customerNavigation).map((item) => renderNavLink(item))}
          </div>
        )}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-white/[0.08]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300/80 hover:bg-rose-500/15 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
