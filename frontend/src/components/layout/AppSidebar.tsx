'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/lib/constants';
import {
  LayoutDashboard,
  Dog,
  CalendarCheck2,
  HeartHandshake,
  User,
  LogOut,
} from 'lucide-react';
import { removeAuthToken } from '@/lib/auth';

export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: 'Tổng quan', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Thú cưng', href: ROUTES.PETS, icon: Dog },
    { name: 'Đặt lịch', href: ROUTES.BOOKINGS, icon: CalendarCheck2 },
    { name: 'Dịch vụ', href: ROUTES.SERVICES, icon: HeartHandshake },
    { name: 'Tài khoản', href: ROUTES.PROFILE, icon: User },
  ];

  const handleLogout = () => {
    removeAuthToken();
    router.push(ROUTES.LOGIN);
  };

  return (
    <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col h-screen border-r border-slate-800 select-none">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-950">
            🐾
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            PET CARE
          </span>
        </Link>
      </div>

      {/* Nav Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-100'
                )}
              />
              {item.name}
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
