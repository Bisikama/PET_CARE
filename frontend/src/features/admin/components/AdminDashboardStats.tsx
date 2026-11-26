'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Briefcase,
  CalendarCheck,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Lock,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { ROUTES } from '@/lib/constants';

interface RevenuePoint {
  date: string;
  label: string;
  revenue: number;
  bookings: number;
}

interface StatsData {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  openDisputes: number;
  totalRevenue: number;
  totalCommission?: number;
  periodBookings?: number;
  periodRevenue?: number;
  bookingsByStatus?: Record<string, number>;
  revenueSeries?: RevenuePoint[];
  range?: { fromDate: string; toDate: string };
}

interface AdminDashboardStatsProps {
  refreshKey?: number;
  onLoadingChange?: (loading: boolean) => void;
}

type RangePreset = '7d' | '30d' | 'month' | 'custom';

const STATUS_LABELS: Record<string, { label: string; barClass: string }> = {
  COMPLETED: { label: 'Hoàn thành', barClass: 'bg-emerald-500' },
  IN_PROGRESS: { label: 'Đang thực hiện', barClass: 'bg-teal-500' },
  AWAITING_CUSTOMER_CONFIRMATION: { label: 'Chờ nghiệm thu', barClass: 'bg-purple-500' },
  ACCEPTED: { label: 'Đã nhận lịch', barClass: 'bg-sky-500' },
  PENDING_PROVIDER_ACCEPTANCE: { label: 'Chờ chuyên viên nhận', barClass: 'bg-amber-400' },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', barClass: 'bg-slate-400' },
  DISPUTED: { label: 'Tranh chấp', barClass: 'bg-rose-500' },
  CANCELLED: { label: 'Đã hủy', barClass: 'bg-slate-300' },
};

const toIsoDateInput = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function AdminDashboardStats({ refreshKey = 0, onLoadingChange }: AdminDashboardStatsProps) {
  const router = useRouter();
  const [stats, setStats] = React.useState<StatsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [preset, setPreset] = React.useState<RangePreset>('30d');
  const [fromDate, setFromDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return toIsoDateInput(d);
  });
  const [toDate, setToDate] = React.useState(() => toIsoDateInput(new Date()));
  const [chartMetric, setChartMetric] = React.useState<'revenue' | 'bookings'>('revenue');

  const applyPreset = (nextPreset: Exclude<RangePreset, 'custom'>) => {
    const today = new Date();
    const start = new Date(today);
    if (nextPreset === '7d') {
      start.setDate(today.getDate() - 6);
    } else if (nextPreset === '30d') {
      start.setDate(today.getDate() - 29);
    } else {
      start.setDate(1);
    }
    setPreset(nextPreset);
    setFromDate(toIsoDateInput(start));
    setToDate(toIsoDateInput(today));
  };

  const fetchStats = React.useCallback(async () => {
    setLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    setError(null);
    try {
      const data = await adminService.getDashboardStats({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể kết nối dữ liệu thống kê máy chủ.');
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [onLoadingChange, fromDate, toDate]);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshKey]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const series = stats?.revenueSeries || [];
  const maxBarValue = React.useMemo(() => {
    const maxVal = series.reduce(
      (max, item) => Math.max(max, chartMetric === 'revenue' ? item.revenue : item.bookings),
      0,
    );
    return maxVal > 0 ? maxVal : 1;
  }, [series, chartMetric]);

  const statusEntries = React.useMemo(() => {
    const map = stats?.bookingsByStatus || {};
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [stats?.bookingsByStatus]);

  const totalPeriodBookings = stats?.periodBookings || 0;

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* ── Top Hero GMV & Escrow Featured Card ─────────────────────────── */}
      <div className="relative bg-[#08243D] p-6 md:p-8 rounded-3xl text-white shadow-sm overflow-hidden border border-slate-800/80">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(247,201,72,0.12),transparent_65%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
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

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-slate-200">
                Tổng hoa hồng sàn:{' '}
                <strong className="text-[#F7C948]">
                  {loading ? '...' : formatCurrency(Number(stats?.totalCommission || 0))}
                </strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-slate-200">
                GMV trong kỳ:{' '}
                <strong className="text-emerald-400">
                  {loading ? '...' : formatCurrency(Number(stats?.periodRevenue || 0))}
                </strong>
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
            <p className="text-xs text-slate-400 font-medium mt-1">
              Trong kỳ lọc: {stats?.periodBookings ?? 0} đơn
            </p>
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
              href={`${ROUTES.ADMIN_SUPPORT}?tab=disputes`}
              className="text-teal-600 hover:text-[#08243D] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              Xử lý tranh chấp <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Time Range Filter + Analytics Charts ────────────────────────── */}
      <div className="space-y-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/70 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#08243D]">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Khoảng thời gian phân tích:</span>
            <div className="flex flex-wrap items-center gap-1.5 ml-1">
              {[
                { key: '7d', label: '7 ngày' },
                { key: '30d', label: '30 ngày' },
                { key: 'month', label: 'Tháng này' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => applyPreset(item.key as '7d' | '30d' | 'month')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    preset === item.key
                      ? 'bg-[#08243D] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setPreset('custom');
                setFromDate(e.target.value);
              }}
              aria-label="Từ ngày"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 outline-none focus:border-teal-500"
            />
            <span className="text-slate-400">→</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setPreset('custom');
                setToDate(e.target.value);
              }}
              aria-label="Đến ngày"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 cols: Revenue & Bookings Bar Chart */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-[#08243D] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  Biểu Đồ Xu Hướng Theo Ngày
                </h4>
                <p className="text-[11px] text-slate-400">
                  Hiển thị dữ liệu từ {stats?.range?.fromDate || fromDate} đến {stats?.range?.toDate || toDate}
                </p>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs self-start">
                <button
                  type="button"
                  onClick={() => setChartMetric('revenue')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    chartMetric === 'revenue' ? 'bg-white text-[#08243D] shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Doanh thu (VNĐ)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('bookings')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    chartMetric === 'bookings' ? 'bg-white text-[#08243D] shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Số lượt đặt lịch
                </button>
              </div>
            </div>

            {series.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-xs text-slate-400">
                Chưa có dữ liệu biểu đồ trong khoảng thời gian đã chọn.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-52 flex items-end gap-1 pt-6 border-b border-slate-100">
                  {series.map((point, idx) => {
                    const value = chartMetric === 'revenue' ? point.revenue : point.bookings;
                    const heightPct = value > 0 ? Math.max(6, Math.round((value / maxBarValue) * 100)) : 2;
                    return (
                      <div key={point.date} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                        <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 z-20 bg-[#08243D] text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
                          <div className="font-bold text-[#F7C948]">{point.date}</div>
                          <div>GMV: {formatCurrency(point.revenue)}</div>
                          <div>Đơn: {point.bookings}</div>
                        </div>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full max-w-[18px] rounded-t-md transition-all ${
                            value > 0
                              ? chartMetric === 'revenue'
                                ? 'bg-[#08243D] group-hover:bg-[#F7C948]'
                                : 'bg-teal-600 group-hover:bg-[#08243D]'
                              : 'bg-slate-100'
                          }`}
                        />
                        {idx === 0 || idx === series.length - 1 || idx % Math.max(1, Math.floor(series.length / 6)) === 0 ? (
                          <span className="text-[9px] text-slate-400 mt-1.5 whitespace-nowrap hidden sm:block">
                            {point.label}
                          </span>
                        ) : (
                          <span className="text-[9px] text-transparent mt-1.5 hidden sm:block">.</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right 4 cols: Booking Status Distribution */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#08243D]">Phân Bổ Trạng Thái Đơn</h4>
              <p className="text-[11px] text-slate-400">
                Tổng {totalPeriodBookings} đơn phát sinh trong kỳ
              </p>
            </div>

            {statusEntries.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Chưa có đơn phát sinh trong khoảng thời gian này.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {statusEntries.map(([statusKey, count]) => {
                  const meta = STATUS_LABELS[statusKey] || { label: statusKey, barClass: 'bg-slate-400' };
                  const pct = totalPeriodBookings > 0 ? Math.round((count / totalPeriodBookings) * 100) : 0;
                  return (
                    <div key={statusKey} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">{meta.label}</span>
                        <span className="font-bold text-[#08243D]">
                          {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${meta.barClass}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
          <div className="font-bold text-[#08243D]">Quy Trình Kiểm Duyệt Đa Lớp</div>
          <div className="text-slate-400 leading-relaxed">
            Chứng chỉ nghề, giấy tờ tùy thân và nhận diện khuôn mặt AI giúp duy trì chất lượng dịch vụ chuẩn 5 sao trên toàn quốc.
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/70 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="font-bold text-[#08243D]">Kiểm Toán Nhật Ký Bất Biến</div>
          <div className="text-slate-400 leading-relaxed">
            Tất cả thay đổi về trạng thái tài khoản, giải ngân hay phân xử tranh chấp đều được ghi lại không thể xóa sửa trong Audit Logs.
          </div>
        </div>
      </div>
    </div>
  );
}
