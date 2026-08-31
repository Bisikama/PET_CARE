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
  Tag 
} from 'lucide-react';
import { removeAuthToken } from '@/lib/auth';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useAdminStore } from '@/features/admin/stores/admin.store';

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

  const currentTab = searchParams.get('tab') || (user?.role === 'ADMIN' ? 'verify-partners' : '');

  const navigation = user?.role === 'ADMIN'
    ? [
        { name: 'Bảng Điều Khiển', href: `${ROUTES.DASHBOARD}?tab=dashboard`, icon: LayoutDashboard },
        { 
          name: 'Duyệt Hồ Sơ', 
          href: `${ROUTES.DASHBOARD}?tab=verify-partners`, 
          icon: ClipboardList,
          badge: pendingKycCount > 0 ? pendingKycCount : undefined,
          badgeColor: 'bg-[#f0c05a] text-[#031625]'
        },
        { name: 'Giám Sát Ca Làm', href: `${ROUTES.DASHBOARD}?tab=monitor-shifts`, icon: Activity },
        { name: 'Quản Lý Escrow', href: `${ROUTES.DASHBOARD}?tab=escrow`, icon: ShieldCheck },
        { name: 'Trọng Tài Tranh Chấp', href: `${ROUTES.DASHBOARD}?tab=arbitration`, icon: Gavel },
        { name: 'Giới Hạn Tài Khoản', href: `${ROUTES.DASHBOARD}?tab=limits`, icon: BarChart3 },
        { name: 'Nhật Ký Hệ Thống', href: `${ROUTES.DASHBOARD}?tab=logs`, icon: Database },
        { name: 'Mã Khuyến Mãi', href: `${ROUTES.DASHBOARD}?tab=promotions`, icon: Tag },
      ]
    : [
        { name: 'Tổng quan', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
        { name: 'Dịch vụ thú cưng', href: ROUTES.SERVICES, icon: HeartHandshake },
        { name: 'Đặt người chăm sóc', href: ROUTES.BOOKINGS, icon: UserCheck },
        { name: 'Kho Ưu Đãi & Voucher', href: `${ROUTES.DASHBOARD}?tab=promotions`, icon: Tag },
      ];

  const handleLogout = () => {
    removeAuthToken();
    router.push(ROUTES.LOGIN);
  };

  return (
    <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col h-screen border-r border-slate-800 select-none shrink-0">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center font-bold text-slate-950">
           <img 
            src='/logo.png'
            alt='logo'
            className='w-full h-full object-cover'
           />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            PET CARE
          </span>
        </Link>
      </div>

      {/* Nav Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const itemTab = item.href.includes('tab=') ? item.href.split('tab=')[1] : '';
          const isActive = user?.role === 'ADMIN'
            ? (pathname === ROUTES.DASHBOARD && currentTab === itemTab)
            : (pathname === item.href || pathname.startsWith(item.href + '/'));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 group w-full',
                isActive
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors shrink-0',
                  isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-100'
                )}
              />
              <span className="truncate flex-1 text-left">{item.name}</span>
              {item.badge !== undefined && (
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-sm shrink-0',
                  isActive ? item.badgeColor : 'bg-slate-800 text-slate-400'
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors border border-transparent cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};
