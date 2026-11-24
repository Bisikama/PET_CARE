'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { ROUTES } from '@/lib/constants';

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
  const router = useRouter();
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
      setError(err?.response?.data?.message || err?.message || 'Không thể kết nối dữ liệu thống kê máy chủ.');
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
    <div className="space-y-8 animate-fade-in select-none">
      {/* ── Top Hero GMV & Escrow Featured Card ─────────────────────────── */}
      <div className="relative bg-[#08243D] p-6 md:p-8 rounded-3xl text-white shadow-sm overflow-hidden border border-slate-800/80">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(247,201,72,0.12),transparent_65%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-[#F7C948] border border-white/10">
                Tổng Giá Trị Giao Dịch Nền Tảng (GMV)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Bảo vệ 100% Escrow
              </span>
            </div>

            <div className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-baseline gap-2">
              <span className="text-[#F7C948]">
                {loading ? '...' : formatCurrency(Number(stats?.totalRevenue || 0))}
              </span>
            </div>

            <p className="text-slate-300 text-xs md:text-sm font-normal max-w-xl">
              Toàn bộ dòng tiền thanh toán từ chủ nuôi được giữ an toàn tại tài khoản ủy thác và chỉ giải ngân sau khi dịch vụ hoàn thành.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href={`${ROUTES.DASHBOARD}?tab=escrow`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F7C948] hover:bg-[#eab327] text-[#08243D] text-xs font-bold transition-all duration-150 active:scale-95 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              Quản lý dòng tiền Escrow
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href={`${ROUTES.DASHBOARD}?tab=bank-transactions`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
            >
              Đối soát chuyển khoản
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          {error}
        </div>
      )}

      {/* ── 4 Main Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Users */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-sm transition-all duration-200 space-y-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tổng người dùng
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#08243D] tracking-tight">
              {loading ? '...' : (stats?.totalUsers ?? 0)}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Chủ nuôi và chuyên viên</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Quản trị tài khoản</span>
            <Link
              href={`${ROUTES.DASHBOARD}?tab=limits`}
              className="text-teal-600 hover:text-[#08243D] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              Xem danh sách <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Providers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-sm transition-all duration-200 space-y-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hồ sơ đối tác
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#08243D] tracking-tight">
              {loading ? '...' : (stats?.totalProviders ?? 0)}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Groomer, Sitter, Thú y</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Kiểm duyệt eKYC</span>
            <Link
              href={`${ROUTES.DASHBOARD}?tab=verify-partners`}
              className="text-teal-600 hover:text-[#08243D] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              Duyệt hồ sơ <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-sm transition-all duration-200 space-y-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Lượt đặt lịch
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#08243D] tracking-tight">
              {loading ? '...' : (stats?.totalBookings ?? 0)}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Tổng đơn dịch vụ hoàn tất</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Giám sát ca làm</span>
            <Link
              href={`${ROUTES.DASHBOARD}?tab=monitor-shifts`}
              className="text-teal-600 hover:text-[#08243D] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Disputes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-sm transition-all duration-200 space-y-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tranh chấp &amp; Khiếu nại
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform ${
              (stats?.openDisputes ?? 0) > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className={`text-3xl font-black tracking-tight ${
              (stats?.openDisputes ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {loading ? '...' : (stats?.openDisputes ?? 0)}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {(stats?.openDisputes ?? 0) > 0 ? 'Cần trọng tài xử lý gấp' : 'Hệ thống vận hành an toàn'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Trọng tài phân xử</span>
            <Link
              href={ROUTES.ADMIN_SUPPORT}
              className="text-teal-600 hover:text-[#08243D] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              Xử lý tranh chấp <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Priority Action Queue (Nhiệm Vụ Cần Xử Lý Ngay) ──────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm p-6 md:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h4 className="text-base font-bold text-[#08243D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F7C948]" />
              Trung Tâm Điều Phối &amp; Tác Vụ Ưu Tiên
            </h4>
            <p className="text-slate-400 text-xs">Các phân hệ vận hành chính của ban quản trị PetCare</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1 */}
          <div
            onClick={() => router.push(`${ROUTES.DASHBOARD}?tab=verify-partners`)}
            className="p-4 bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/70 rounded-2xl cursor-pointer transition-all duration-150 group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-white border border-slate-200 text-[#08243D] font-bold text-xs shadow-2xs">
                Duyệt Hồ Sơ eKYC
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#08243D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kiểm tra ảnh CCCD, chân dung và xác thực lý lịch tư pháp của đối tác trước khi cấp quyền nhận lịch.
            </p>
          </div>

          {/* Action 2 */}
          <div
            onClick={() => router.push(`${ROUTES.DASHBOARD}?tab=services-manager`)}
            className="p-4 bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/70 rounded-2xl cursor-pointer transition-all duration-150 group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-white border border-slate-200 text-[#08243D] font-bold text-xs shadow-2xs">
                Gói Dịch Vụ &amp; Bảng Giá
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#08243D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cập nhật biểu phí dịch vụ niêm yết, định mức trọng lượng thú cưng và checklist quy chuẩn từng ca làm.
            </p>
          </div>

          {/* Action 3 */}
          <div
            onClick={() => router.push(`${ROUTES.DASHBOARD}?tab=escrow`)}
            className="p-4 bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/70 rounded-2xl cursor-pointer transition-all duration-150 group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-white border border-slate-200 text-[#08243D] font-bold text-xs shadow-2xs">
                Ký Quỹ Escrow &amp; Đối Soát
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#08243D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Quản lý giải phóng dòng tiền ký quỹ, duyệt yêu cầu rút tiền của đối tác và xử lý giao dịch chuyển khoản.
            </p>
          </div>
        </div>
      </div>

      {/* ── System Assurance Infrastructure ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/70 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="font-bold text-[#08243D]">Bảo Chứng Ký Quỹ Escrow</div>
          <div className="text-slate-400 leading-relaxed">
            Mọi khoản thanh toán đặt lịch đều được giữ an toàn tại tài khoản ủy thác, bảo vệ tuyệt đối quyền lợi chủ nuôi và đối tác.
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/70 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="font-bold text-[#08243D]">Xác Thực eKYC Đa Tầng</div>
          <div className="text-slate-400 leading-relaxed">
            100% đối tác đều phải xác thực CCCD, kiểm tra nhận diện khuôn mặt và đạt chứng chỉ chuyên môn trước khi được nhận việc.
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/70 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div className="font-bold text-[#08243D]">Ghi Nhật Ký Hệ Thống Bất Biến</div>
          <div className="text-slate-400 leading-relaxed">
            Mọi thao tác quản trị, duyệt hồ sơ, khóa tài khoản hoặc can thiệp dòng tiền đều được lưu vết chi tiết trong Audit Log.
          </div>
        </div>
      </div>
    </div>
  );
}
