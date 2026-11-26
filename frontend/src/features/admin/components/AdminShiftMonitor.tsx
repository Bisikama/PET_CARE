'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Filter,
  Gavel,
  Loader2,
  MapPin,
  PawPrint,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { Portal } from '@/components/ui/Portal';
import { ROUTES } from '@/lib/constants';
import { getApiErrorMessage } from '@/lib/api-error';

const STATUS_META: Record<string, { label: string; badgeClass: string }> = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  PENDING_PROVIDER_ACCEPTANCE: { label: 'Chờ chuyên viên nhận', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  ACCEPTED: { label: 'Đã nhận lịch', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' },
  PROVIDER_ARRIVED: { label: 'Chuyên viên đã đến', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  CHECKED_IN: { label: 'Đã check-in', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  IN_PROGRESS: { label: 'Đang thực hiện', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200' },
  AWAITING_CUSTOMER_CONFIRMATION: { label: 'Chờ khách xác nhận', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  COMPLETED: { label: 'Hoàn thành', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DISPUTED: { label: 'Tranh chấp', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  INCIDENT_REPORTED: { label: 'Báo cáo sự cố', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  RESOLVED: { label: 'Đã phân xử', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' },
  REJECTED: { label: 'Từ chối', badgeClass: 'bg-rose-50 text-rose-600 border-rose-200' },
  PROVIDER_TIMEOUT: { label: 'Quá hạn nhận đơn', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  EXPIRED: { label: 'Hết hạn', badgeClass: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PAID_HELD_IN_ESCROW: 'Đang giữ Escrow',
  RELEASED: 'Đã giải ngân',
  REFUNDED: 'Đã hoàn tiền',
  PARTIALLY_REFUNDED: 'Hoàn một phần',
  FAILED: 'Thất bại',
  VOIDED: 'Đã hủy',
};

const formatCurrency = (amount: number | string | null | undefined) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0);

const formatDate = (val?: string | null) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (val?: string | null) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getChecklistStats = (booking: any) => {
  let total = 0;
  let done = 0;
  for (const pet of booking?.booking_pets || []) {
    for (const srv of pet?.booking_services || []) {
      for (const item of srv?.booking_checklist_items || []) {
        total += 1;
        if (item.status === 'DONE') done += 1;
      }
    }
  }
  return { done, total };
};

export function AdminShiftMonitor() {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [summary, setSummary] = React.useState({
    inProgress: 0,
    awaitingConfirmation: 0,
    disputed: 0,
    completed: 0,
    pendingAcceptance: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);

  const [statusFilter, setStatusFilter] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detailData, setDetailData] = React.useState<any | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);

  const fetchBookings = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getBookings({
        page,
        limit,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setBookings(res?.data || []);
      setTotal(res?.meta?.total || 0);
      setTotalPages(res?.meta?.totalPages || 1);
      if (res?.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách ca làm từ máy chủ.'));
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchTerm, fromDate, toDate]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleOpenDetail = async (id: string) => {
    setSelectedId(id);
    setDetailData(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const detail = await adminService.getBookingDetail(id);
      setDetailData(detail?.data || detail);
    } catch (err) {
      setDetailError(getApiErrorMessage(err, 'Không thể tải chi tiết ca làm.'));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const applyQuickStatus = (nextStatus: string) => {
    setPage(1);
    setStatusFilter((prev) => (prev === nextStatus ? '' : nextStatus));
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* 4 Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => applyQuickStatus('IN_PROGRESS')}
          className={`text-left p-5 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-[#08243D] text-white border-[#08243D] shadow-sm'
              : 'bg-white border-slate-200/70 hover:border-teal-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'IN_PROGRESS' ? 'text-[#F7C948]' : 'text-slate-400'}`}>
              Đang thực hiện
            </span>
            <Activity className={`w-4 h-4 ${statusFilter === 'IN_PROGRESS' ? 'text-[#F7C948]' : 'text-teal-600'}`} />
          </div>
          <div className="text-2xl font-black">{summary.inProgress}</div>
          <p className={`text-[11px] mt-1 ${statusFilter === 'IN_PROGRESS' ? 'text-slate-300' : 'text-slate-400'}`}>
            Ca đã đến / check-in / đang chăm sóc
          </p>
        </button>

        <button
          type="button"
          onClick={() => applyQuickStatus('AWAITING_CUSTOMER_CONFIRMATION')}
          className={`text-left p-5 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'AWAITING_CUSTOMER_CONFIRMATION'
              ? 'bg-[#08243D] text-white border-[#08243D] shadow-sm'
              : 'bg-white border-slate-200/70 hover:border-purple-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'AWAITING_CUSTOMER_CONFIRMATION' ? 'text-[#F7C948]' : 'text-slate-400'}`}>
              Chờ khách xác nhận
            </span>
            <Clock className={`w-4 h-4 ${statusFilter === 'AWAITING_CUSTOMER_CONFIRMATION' ? 'text-[#F7C948]' : 'text-purple-600'}`} />
          </div>
          <div className="text-2xl font-black">{summary.awaitingConfirmation}</div>
          <p className={`text-[11px] mt-1 ${statusFilter === 'AWAITING_CUSTOMER_CONFIRMATION' ? 'text-slate-300' : 'text-slate-400'}`}>
            Chuyên viên đã hoàn tất chờ nghiệm thu
          </p>
        </button>

        <button
          type="button"
          onClick={() => applyQuickStatus('DISPUTED')}
          className={`text-left p-5 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'DISPUTED'
              ? 'bg-[#08243D] text-white border-[#08243D] shadow-sm'
              : 'bg-white border-slate-200/70 hover:border-rose-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'DISPUTED' ? 'text-[#F7C948]' : 'text-slate-400'}`}>
              Tranh chấp &amp; Sự cố
            </span>
            <AlertTriangle className={`w-4 h-4 ${statusFilter === 'DISPUTED' ? 'text-[#F7C948]' : 'text-rose-600'}`} />
          </div>
          <div className={`text-2xl font-black ${statusFilter === 'DISPUTED' ? 'text-white' : summary.disputed > 0 ? 'text-rose-600' : 'text-[#08243D]'}`}>
            {summary.disputed}
          </div>
          <p className={`text-[11px] mt-1 ${statusFilter === 'DISPUTED' ? 'text-slate-300' : 'text-slate-400'}`}>
            Đơn cần theo dõi và trọng tài xử lý
          </p>
        </button>

        <button
          type="button"
          onClick={() => applyQuickStatus('COMPLETED')}
          className={`text-left p-5 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'COMPLETED'
              ? 'bg-[#08243D] text-white border-[#08243D] shadow-sm'
              : 'bg-white border-slate-200/70 hover:border-emerald-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'COMPLETED' ? 'text-[#F7C948]' : 'text-slate-400'}`}>
              Đã hoàn thành
            </span>
            <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'COMPLETED' ? 'text-[#F7C948]' : 'text-emerald-600'}`} />
          </div>
          <div className="text-2xl font-black">{summary.completed}</div>
          <p className={`text-[11px] mt-1 ${statusFilter === 'COMPLETED' ? 'text-slate-300' : 'text-slate-400'}`}>
            Đã nghiệm thu &amp; giải ngân thành công
          </p>
        </button>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#08243D] tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Giám Sát Ca Làm Toàn Hệ Thống ({total} đơn)
            </h3>
            <p className="text-xs text-slate-400">
              Theo dõi tiến độ checklist, ảnh bằng chứng, trạng thái escrow và lịch sử từng ca chăm sóc.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchBookings}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#08243D] hover:bg-[#0d3254] text-white text-xs font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm mã UUID, tên/email khách hàng hoặc chuyên viên..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-teal-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-teal-500"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setPage(1);
              setFromDate(e.target.value);
            }}
            aria-label="Từ ngày"
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-teal-500"
          />

          <div className="flex gap-2">
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setPage(1);
                setToDate(e.target.value);
              }}
              aria-label="Đến ngày"
              className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-teal-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer shrink-0"
            >
              Lọc
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            Đang tải danh sách ca làm...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center space-y-2 text-xs text-slate-400">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600">Không tìm thấy ca làm nào khớp bộ lọc</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Mã đơn</th>
                  <th className="px-5 py-3.5">Khách hàng &amp; Thú cưng</th>
                  <th className="px-5 py-3.5">Chuyên viên</th>
                  <th className="px-5 py-3.5">Lịch hẹn</th>
                  <th className="px-5 py-3.5">Tiến độ &amp; Ảnh</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thanh toán</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => {
                  const statusMeta = STATUS_META[b.status] || {
                    label: b.status,
                    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                  };
                  const checklist = getChecklistStats(b);
                  const mediaCount = b._count?.booking_media || 0;
                  const petNames = (b.booking_pets || [])
                    .map((p: any) => p.pet_name || 'Thú cưng')
                    .join(', ');

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-[#08243D]">
                          <span>#{b.id.slice(0, 8)}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(b.id)}
                            className="p-1 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Copy full UUID"
                          >
                            {copiedId === b.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-800">{b.users?.fullName || 'Khách hàng'}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <PawPrint className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate max-w-[160px]">{petNames || 'Chưa có thông tin'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {b.provider_profiles?.users ? (
                          <div>
                            <div className="font-semibold text-slate-800">
                              {b.provider_profiles.users.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {b.provider_profiles.users.phone || b.provider_profiles.users.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa gán</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">{formatDate(b.requested_date)}</div>
                        <div className="text-[11px] text-slate-400">{formatDateTime(b.estimated_start_at)}</div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                            {checklist.done}/{checklist.total} mục
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                            <Camera className="w-3.5 h-3.5 text-teal-600" />
                            {mediaCount}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusMeta.badgeClass}`}>
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="font-black text-[#08243D]">{formatCurrency(b.total_price)}</div>
                        {b.payments?.status && (
                          <div className="text-[10px] text-slate-400 font-semibold">
                            {PAYMENT_STATUS_LABELS[b.payments.status] || b.payments.status}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(b.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#08243D] hover:text-white text-[#08243D] font-bold text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
            <span className="text-slate-500 font-medium">
              Trang <strong>{page}</strong> / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedId && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
              <div className="px-6 py-4 bg-[#08243D] text-white flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-black">Chi Tiết Ca Làm #{selectedId.slice(0, 8)}</h4>
                  <p className="text-[11px] font-mono text-slate-300">{selectedId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-xs">
                {detailLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                    Đang tải thông tin chi tiết...
                  </div>
                ) : detailError ? (
                  <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 font-semibold">
                    {detailError}
                  </div>
                ) : detailData ? (
                  <>
                    {/* Customer, Provider, Payment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <div className="font-bold text-[#08243D] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-teal-600" /> Khách hàng
                        </div>
                        <div className="font-semibold text-slate-800">{detailData.users?.fullName || '—'}</div>
                        <div className="text-slate-500">{detailData.users?.email}</div>
                        <div className="text-slate-500">{detailData.users?.phone || 'Chưa có SĐT'}</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <div className="font-bold text-[#08243D] flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Chuyên viên
                        </div>
                        <div className="font-semibold text-slate-800">
                          {detailData.provider_profiles?.users?.fullName || 'Chưa phân công'}
                        </div>
                        <div className="text-slate-500">{detailData.provider_profiles?.users?.email || '—'}</div>
                        <div className="text-slate-500">{detailData.provider_profiles?.users?.phone || '—'}</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <div className="font-bold text-[#08243D]">Tài chính &amp; Escrow</div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tổng đơn:</span>
                          <strong className="text-[#08243D]">{formatCurrency(detailData.total_price)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Phí sàn:</span>
                          <strong className="text-amber-700">{formatCurrency(detailData.payments?.platform_fee)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Trạng thái:</span>
                          <strong>
                            {detailData.payments?.status
                              ? PAYMENT_STATUS_LABELS[detailData.payments.status] || detailData.payments.status
                              : 'Chưa thanh toán'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#08243D] block">Địa điểm chăm sóc</span>
                        <span className="text-slate-600">
                          {detailData.customer_addresses?.address_line ||
                            detailData.address_snapshot?.address_line ||
                            detailData.address_snapshot?.fullAddress ||
                            'Không có thông tin địa chỉ'}
                        </span>
                      </div>
                    </div>

                    {/* Pets & Checklists */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-[#08243D] text-sm">Thú cưng, Dịch vụ &amp; Checklist</h5>
                      {(detailData.booking_pets || []).map((pet: any) => (
                        <div key={pet.id} className="p-4 rounded-2xl border border-slate-200 space-y-3">
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <PawPrint className="w-4 h-4 text-amber-500" />
                            {pet.pet_name || 'Thú cưng'} ({pet.species || '—'} {pet.breed ? `• ${pet.breed}` : ''})
                          </div>
                          {(pet.booking_services || []).map((srv: any) => (
                            <div key={srv.id} className="pl-3 border-l-2 border-teal-500 space-y-2">
                              <div className="flex items-center justify-between font-semibold text-slate-700">
                                <span>{srv.service_name || 'Dịch vụ'} ({srv.duration_minutes} phút)</span>
                                <span className="text-[#08243D]">{formatCurrency(srv.price)}</span>
                              </div>
                              {(srv.booking_checklist_items || []).length > 0 && (
                                <div className="space-y-1">
                                  {srv.booking_checklist_items.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-xl">
                                      <span className="text-slate-700">{item.title}</span>
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                          item.status === 'DONE'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : item.status === 'SKIPPED'
                                              ? 'bg-slate-200 text-slate-600'
                                              : 'bg-amber-100 text-amber-700'
                                        }`}
                                      >
                                        {item.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Evidence Media */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-[#08243D] text-sm">
                        Ảnh / Video Bằng Chứng ({(detailData.booking_media || []).length})
                      </h5>
                      {(detailData.booking_media || []).length === 0 ? (
                        <p className="text-slate-400">Chưa có ảnh/video bằng chứng nào được tải lên.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {detailData.booking_media.map((m: any) => (
                            <a
                              key={m.id}
                              href={m.media_url}
                              target="_blank"
                              rel="noreferrer"
                              className="group block rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-teal-500 transition-colors"
                            >
                              {m.media_type === 'VIDEO' ? (
                                <div className="h-28 flex items-center justify-center text-slate-600 font-bold">
                                  Video ({m.category})
                                </div>
                              ) : (
                                <img
                                  src={m.media_url}
                                  alt={m.caption || m.category}
                                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                                />
                              )}
                              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-600 truncate">
                                {m.category} {m.caption ? `· ${m.caption}` : ''}
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status Logs */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-[#08243D] text-sm">Lịch Sử Trạng Thái</h5>
                      {(detailData.booking_status_logs || []).length === 0 ? (
                        <p className="text-slate-400">Chưa có log chuyển trạng thái.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {detailData.booking_status_logs.map((log: any) => (
                            <div key={log.id} className="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                              <div>
                                <span className="font-bold text-slate-700">
                                  {log.old_status ? `${log.old_status} → ` : ''}
                                  {log.new_status}
                                </span>
                                {log.note && <span className="text-slate-500 ml-2">({log.note})</span>}
                              </div>
                              <span className="text-[11px] text-slate-400">{formatDateTime(log.created_at)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Action Links */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                      <Link
                        href={`${ROUTES.DASHBOARD}?tab=escrow`}
                        onClick={() => setSelectedId(null)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#08243D] font-bold transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        Mở Quản lý Escrow
                      </Link>
                      <Link
                        href={`${ROUTES.ADMIN_SUPPORT}?tab=disputes`}
                        onClick={() => setSelectedId(null)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08243D] hover:bg-[#0d3254] text-white font-bold transition-colors"
                      >
                        <Gavel className="w-4 h-4 text-[#F7C948]" />
                        Mở Trọng tài Tranh chấp
                      </Link>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
