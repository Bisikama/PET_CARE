'use client';

import * as React from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { LayoutDashboard, Mail, Shield, User } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold">Chào mừng quay trở lại, {user?.fullName || 'Người dùng'}! 👋</h2>
          <p className="text-teal-50/80 text-sm md:text-base mt-2 max-w-xl">
            Hệ thống quản lý chăm sóc thú cưng chuyên nghiệp. Bạn đang đăng nhập với tư cách là <strong className="text-white">{user?.role || 'Khách hàng'}</strong>.
          </p>
        </div>
        <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <LayoutDashboard className="w-48 h-48" />
        </div>
      </div>

      {/* User Information Details Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Thông tin tài khoản</h3>
          <p className="text-slate-400 text-xs mt-0.5">Chi tiết thông tin đăng nhập của bạn từ cơ sở dữ liệu thật.</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Họ và tên</p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">{user?.fullName || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Email</p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">{user?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 col-span-1 sm:col-span-2 md:col-span-1">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Vai trò hệ thống</p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">{user?.role || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
