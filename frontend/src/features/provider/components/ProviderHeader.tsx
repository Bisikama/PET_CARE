'use client';

import * as React from 'react';
import { Star, Lock, Activity, ShieldAlert, Calendar, Wallet } from 'lucide-react';
import { useProvider } from '../hooks/use-provider';

interface ProviderHeaderProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function ProviderHeader({ activeTab, onTabChange }: ProviderHeaderProps) {
  const { providerData, fetchProviderMe } = useProvider();

  React.useEffect(() => {
    fetchProviderMe();
  }, [fetchProviderMe]);

  const user = providerData;
  const fullName = user?.fullName || 'Nguyễn Minh Thư';
  const email = user?.email || 'minhthu.grooming@gmail.com';
  const avatarUrl = user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&q=80';
  const partnerCode = user?.id && user.id.length >= 4
    ? `PROV-${user.id.substring(0, 4).toUpperCase()}`
    : 'PROV-1209';
  const status = 'DRAFT'; // Static DRAFT status (Chưa kiểm duyệt) to match the mockup
  const escrowBalance = 250000; // Static mock as requested

  const statusLabels: Record<string, { text: string; className: string }> = {
    APPROVED: { text: 'Đã kiểm duyệt', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
    PENDING_REVIEW: { text: 'Đang kiểm duyệt', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    NEED_RESUBMIT: { text: 'Cần bổ sung', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    REJECTED: { text: 'Bị từ chối', className: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
    SUSPENDED: { text: 'Tạm khóa', className: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
    DRAFT: { text: 'Chưa kiểm duyệt', className: 'bg-slate-800/60 text-slate-300 border border-slate-700/50' },
  };

  const statusInfo = statusLabels[status] || statusLabels.DRAFT;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(val) + ' đ';
  };

  const tabs = [
    {
      id: 'active-cases',
      label: 'Ca Chăm Sóc Thực Tế',
      icon: Activity,
    },
    {
      id: 'onboarding',
      label: 'Onboarding & Xác Minh',
      icon: ShieldAlert,
      badge: 'CHƯA XONG',
    },
    {
      id: 'schedule',
      label: 'Lịch & Năng Lực Dịch Vụ',
      icon: Calendar,
    },
    {
      id: 'wallet',
      label: 'Ví thu nhập',
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative bg-[#02101b] bg-gradient-to-r from-[#02101b] via-[#081e30] to-[#0c2a43] p-6 md:p-8 rounded-[32px] text-white shadow-xl overflow-hidden border border-slate-800/80">
        {/* Decorative lighting */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(240,192,90,0.08),transparent_60%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-[#f0c05a] shrink-0 shadow-lg shadow-black/30">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl md:text-2xl font-bold tracking-wide">
                  {fullName}
                </h2>
                <span className={`inline-flex self-center px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase select-none ${statusInfo.className}`}>
                  {statusInfo.text}
                </span>
              </div>

              <p className="text-slate-400 text-xs md:text-sm font-medium">
                Mã đối tác: {partnerCode} <span className="mx-1">•</span> {email}
              </p>

              {/* Status details */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 justify-center sm:justify-start text-xs font-semibold pt-1">
                <div className="flex items-center gap-1.5 text-[#f0c05a]">
                  <Star className="w-4 h-4 fill-current stroke-[2]" />
                  <span>Mới tham gia</span>
                </div>
                <span className="hidden sm:inline text-slate-600 font-bold">•</span>
                <div className={`flex items-center gap-1.5 ${user?.isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${user?.isActive ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  <span>{user?.isActive ? 'Đang hoạt động' : 'Tạm dừng'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Escrow Box */}
          <div className="w-full lg:w-auto shrink-0">
            <div className="px-6 py-5 bg-[#0a253b]/40 backdrop-blur-sm border border-[#1e4868]/30 rounded-2xl flex flex-col items-center lg:items-end text-center lg:text-right min-w-[240px] space-y-1 md:space-y-1.5">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                Ví tạm giữ Escrow (Bảo hộ)
              </span>
              <span className="text-2xl md:text-3.5xl font-extrabold text-[#f0c05a] tracking-tight">
                {formatCurrency(escrowBalance)}
              </span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Đang giữ an toàn (Chờ chủ nuôi)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="border-b border-slate-100 flex items-center justify-start overflow-x-auto scrollbar-none gap-8 pt-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 pb-4 font-bold text-sm transition-all duration-200 border-b-2 relative shrink-0 outline-none cursor-pointer ${
                isActive
                  ? 'border-slate-800 text-slate-800 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-black rounded-md tracking-wider">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
