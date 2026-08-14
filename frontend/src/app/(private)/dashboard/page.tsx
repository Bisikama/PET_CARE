'use client';

import * as React from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Heart, Mail, Plus, Shield, Sparkles, User } from 'lucide-react';
import { PetList } from '@/features/pet';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative bg-[#031625] p-8 md:p-10 rounded-[32px] text-white shadow-xl overflow-hidden border border-slate-800/60">
        {/* Glow effects */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(240,192,90,0.12),transparent_60%)] pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-[radial-gradient(circle_at_bottom,rgba(20,184,166,0.04),transparent_60%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3.5">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/5 border border-amber-400/15 text-[#f0c05a] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Khu vực {user?.role === 'PROVIDER' ? 'người chăm sóc' : 'chủ nuôi'}
            </div>
            
            {/* Title */}
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-white leading-tight">
              Chào mừng trở lại, {user?.fullName || 'Người dùng'}!
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-700/80 bg-slate-800/20 hover:bg-slate-800/40 text-white text-sm font-semibold transition-all duration-200 active:scale-95">
              <Plus className="w-4 h-4" />
              Đăng ký bé cưng
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#f0c05a] hover:bg-[#e0b04a] text-slate-950 text-sm font-bold transition-all duration-200 active:scale-95 shadow-md shadow-amber-500/10">
              <Heart className="w-4 h-4 fill-current" />
              Đặt người chăm sóc mới
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: My Pets List */}
        <div className="lg:col-span-2">
          <PetList />
        </div>

        {/* Right column: Account Info Details */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Thông tin tài khoản</h3>
              <p className="text-slate-400 text-xs mt-0.5">Chi tiết tài khoản đăng nhập của bạn.</p>
            </div>

            <div className="space-y-4">
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
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-medium">Email</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
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
      </div>
    </div>
  );
}
