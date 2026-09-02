'use client';

import * as React from 'react';
import { 
  Users, 
  Briefcase, 
  CalendarCheck, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  ShieldAlert,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { adminService } from '../services/admin.service';

interface StatsData {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  openDisputes: number;
  totalRevenue: number;
}

interface AdminDashboardStatsProps {
  refreshKey?: number;
  onLoadingChange?: (loading: boolean) => void;
}

export function AdminDashboardStats({ refreshKey = 0, onLoadingChange }: AdminDashboardStatsProps) {
  const [stats, setStats] = React.useState<StatsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStats = React.useCallback(async () => {
    setLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    setError(null);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải thống kê máy chủ.');
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [onLoadingChange]);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshKey]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header Title Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            Tổng Quan Hệ Thống (Dashboard Stats)
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Dữ liệu thống kê thời gian thực từ API <code className="text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded font-mono text-[11px]">GET /api/admin/dashboard/stats</code>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Users */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Người dùng</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {loading ? '...' : (stats?.totalUsers ?? 0)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Tài khoản khách hàng & đối tác</p>
          </div>
          <div className="h-1 w-full bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-3/4 animate-pulse" />
          </div>
        </div>

        {/* Card 2: Providers */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Đối tác</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {loading ? '...' : (stats?.totalProviders ?? 0)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Hồ sơ đối tác đăng ký</p>
          </div>
          <div className="h-1 w-full bg-teal-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full w-2/3 animate-pulse" />
          </div>
        </div>

        {/* Card 3: Bookings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Lượt Đặt Lịch</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {loading ? '...' : (stats?.totalBookings ?? 0)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Tổng số đơn dịch vụ</p>
          </div>
          <div className="h-1 w-full bg-indigo-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full w-4/5 animate-pulse" />
          </div>
        </div>

        {/* Card 4: Disputes */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Tranh Chấp</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 tracking-tight">
              {loading ? '...' : (stats?.openDisputes ?? 0)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Đơn cần trọng tài xử lý</p>
          </div>
          <div className="h-1 w-full bg-rose-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full w-1/4 animate-pulse" />
          </div>
        </div>

        {/* Card 5: Revenue */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-3xl text-white shadow-lg space-y-3 relative overflow-hidden group col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-teal-400 uppercase tracking-wider">Doanh Thu Đã Xong</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-amber-400 tracking-tight truncate">
              {loading ? '...' : formatCurrency(Number(stats?.totalRevenue || 0))}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Hoàn tất quy trình Escrow</p>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* System Status Summary Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Trạng Thái Vận Hành Hệ Thống
          </h4>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Máy chủ ổn định
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="font-bold text-slate-700">Bảo hộ Escrow</div>
            <div className="text-slate-400">Tiền được tạm giữ an toàn cho tới khi chủ nuôi xác nhận dịch vụ hoàn tất.</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="font-bold text-slate-700">Xác thực KYC & Lý Lịch</div>
            <div className="text-slate-400">Các đối tác phải kiểm duyệt eKYC và lý lịch tư pháp trước khi nhận đơn.</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="font-bold text-slate-700">Ghi vết Audit Logs</div>
            <div className="text-slate-400">Mọi hành động khóa/mở khóa/phê duyệt đều được ghi nhật ký bất biến.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
