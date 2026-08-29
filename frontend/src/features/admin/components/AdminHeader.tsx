'use client';

import * as React from 'react';
import { Shield, RefreshCw } from 'lucide-react';

export function AdminHeader() {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate server sync
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  return (
    <div className="relative bg-[#031625] p-8 md:p-10 rounded-[32px] text-white shadow-xl overflow-hidden border border-slate-800/60">
      {/* Glow effects */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-[radial-gradient(circle_at_bottom,rgba(20,184,166,0.04),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            Ban pháp chế & Phòng chống gian lận (Trust & Safety)
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-white leading-tight">
            Cơ Quan Quản Trị Trung Ương
          </h2>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
            Giám sát toàn diện dòng tiền Escrow bảo mật, kiểm duyệt tư cách pháp nhân của đối tác và phân xử tranh chấp bằng hệ chứng cứ thực địa.
          </p>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-700 bg-slate-800/20 hover:bg-slate-800/40 text-slate-300 text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer self-start md:self-center disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-slate-300 ${isSyncing ? 'animate-spin' : ''}`} />
          Đồng bộ máy chủ
        </button>
      </div>
    </div>
  );
}
