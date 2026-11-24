'use client';

import * as React from 'react';
import { ShieldCheck, RefreshCw, CheckCircle2, Shield, Activity, Sparkles } from 'lucide-react';

interface AdminHeaderProps {
  onSync?: () => void;
  isSyncing?: boolean;
}

export function AdminHeader({ onSync, isSyncing = false }: AdminHeaderProps) {
  const [localSyncing, setLocalSyncing] = React.useState(false);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<string>('Vừa xong');

  const handleSync = async () => {
    if (onSync) {
      onSync();
    } else {
      setLocalSyncing(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLocalSyncing(false);
    }
    const now = new Date();
    setLastSyncedAt(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
  };

  const activeSyncing = isSyncing || localSyncing;

  return (
    <div className="relative bg-[#08243D] p-5 md:p-6 rounded-3xl text-white shadow-sm overflow-hidden border border-slate-800/90 select-none">
      {/* Subtle warm golden ambient glow */}
      <div className="absolute right-0 top-0 w-72 h-72 bg-[radial-gradient(circle_at_top_right,rgba(247,201,72,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute left-1/4 bottom-0 w-60 h-60 bg-[radial-gradient(circle_at_bottom,rgba(20,184,166,0.06),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-2">
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[#F7C948] text-[11px] font-bold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F7C948]" />
              Trung Tâm Quản Trị Hệ Thống
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Máy chủ trực tuyến
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">
              Đồng bộ lúc: <strong className="text-slate-200 font-semibold">{lastSyncedAt}</strong>
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-0.5">
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
              Quản Trị Vận Hành &amp; Kiểm Soát Tài Chính
            </h2>
            <p className="text-slate-300 text-xs font-normal max-w-2xl leading-relaxed">
              Giám sát chất lượng chuyên viên, kiểm soát dòng tiền ký quỹ và đối soát thanh toán an toàn thời gian thực.
            </p>
          </div>
        </div>

        {/* Sync Action Button */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={handleSync}
            disabled={activeSyncing}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#F7C948] hover:bg-[#eab327] text-[#08243D] text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-60 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${activeSyncing ? 'animate-spin' : ''}`} />
            {activeSyncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu'}
          </button>
        </div>
      </div>
    </div>
  );
}
