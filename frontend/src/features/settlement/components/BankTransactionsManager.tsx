'use client';

import * as React from 'react';
import { 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Landmark, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  XCircle, 
  Sparkles, 
  Filter, 
  Calendar,
  ExternalLink,
  ShieldCheck,
  Tag,
  CreditCard
} from 'lucide-react';
import { BANK_TXN_PAGE_SIZE, useBankTransactions } from '../hooks/useBankTransactions';
import { ResolveBankTransactionModal } from './ResolveBankTransactionModal';
import type { BankTransaction, BankTransactionStatus } from '../types';

type Filter = BankTransactionStatus | 'ALL';

const STATUS_META: Record<BankTransactionStatus, { label: string; badge: string; color: string }> = {
  UNMATCHED: { 
    label: 'Chưa khớp', 
    badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    color: 'amber' 
  },
  MATCHED: { 
    label: 'Đã khớp đơn', 
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    color: 'emerald' 
  },
  REFUNDED_TO_WALLET: { 
    label: 'Hoàn vào ví', 
    badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
    color: 'sky' 
  },
  RESOLVED_MANUALLY: { 
    label: 'Xử lý thủ công', 
    badge: 'bg-violet-50 text-violet-700 border-violet-200/80',
    color: 'violet' 
  },
  IGNORED: { 
    label: 'Bỏ qua', 
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
    color: 'slate' 
  },
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'UNMATCHED', label: 'Chưa khớp' },
  { key: 'MATCHED', label: 'Đã khớp' },
  { key: 'REFUNDED_TO_WALLET', label: 'Hoàn ví' },
  { key: 'RESOLVED_MANUALLY', label: 'Thủ công' },
  { key: 'IGNORED', label: 'Bỏ qua' },
];

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

const formatDateTime = (val: string | null) =>
  val
    ? new Intl.DateTimeFormat('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).format(new Date(val))
    : '—';

export function BankTransactionsManager() {
  const [statusFilter, setStatusFilter] = React.useState<Filter>('UNMATCHED');
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<BankTransaction | null>(null);
  const [flash, setFlash] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const { data, isLoading, error, reload } = useBankTransactions({ status: statusFilter, page, q: query });

  // Tìm kiếm sau khi ngừng gõ 400ms
  React.useEffect(() => {
    const t = setTimeout(() => {
      setQuery(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / BANK_TXN_PAGE_SIZE)) : 1;
  const unmatched = data?.summary?.UNMATCHED;
  const matched = data?.summary?.MATCHED;
  const refunded = data?.summary?.REFUNDED_TO_WALLET;
  const manual = data?.summary?.RESOLVED_MANUALLY;

  const changeFilter = (key: Filter) => {
    setStatusFilter(key);
    setPage(1);
  };

  const handleResolved = () => {
    setSelected(null);
    setFlash('Đã xử lý đối soát giao dịch thành công. Thao tác đã được ghi vào nhật ký hệ thống.');
    reload();
    setTimeout(() => setFlash(null), 4000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* ── Top Header Title Bar ────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#08243D] tracking-tight flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#08243D]" />
              Đối Soát Giao Dịch Chuyển Khoản Ngân Hàng (SePay)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              VietQR / MB Bank
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Hệ thống tự động lắng nghe Webhook ngân hàng, khớp mã đơn <strong>PC...</strong> và kích hoạt dịch vụ tức thì.
          </p>
        </div>

        <button
          type="button"
          onClick={reload}
          disabled={isLoading}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}
        </button>
      </div>

      {/* ── Unmatched Warning Alert ──────────────────────────────────────── */}
      {unmatched && unmatched.count > 0 && (
        <div className="flex items-start gap-3 bg-amber-50/80 border border-amber-200 rounded-2xl p-4.5 animate-slide-up">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-900">
              Có <strong>{unmatched.count}</strong> giao dịch chuyển khoản chưa khớp (Tổng: <strong>{formatCurrency(unmatched.amount)}</strong>)
            </p>
            <p className="text-xs text-amber-800/85">
              Khách hàng có thể đã ghi thiếu hoặc sai nội dung chuyển khoản. Vui lòng bấm vào từng giao dịch để gán vào mã đơn hoặc hoàn tiền vào ví khách.
            </p>
          </div>
        </div>
      )}

      {/* ── 4 Interactive Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: UNMATCHED */}
        <button
          type="button"
          onClick={() => changeFilter('UNMATCHED')}
          className={`text-left p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
            statusFilter === 'UNMATCHED'
              ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200/70 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Chưa khớp (Cần xử lý)
            </span>
          </div>
          <div className="text-2xl font-black text-amber-700 tracking-tight tabular-nums">
            {unmatched?.count ?? 0}
          </div>
          <div className="text-xs font-bold text-slate-500 mt-1 tabular-nums">
            {formatCurrency(unmatched?.amount ?? 0)}
          </div>
          {statusFilter === 'UNMATCHED' && (
            <div className="absolute right-3 bottom-3 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
              Đang xem
            </div>
          )}
        </button>

        {/* Card 2: MATCHED */}
        <button
          type="button"
          onClick={() => changeFilter('MATCHED')}
          className={`text-left p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
            statusFilter === 'MATCHED'
              ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/70 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Đã khớp đơn tự động
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight tabular-nums">
            {matched?.count ?? 0}
          </div>
          <div className="text-xs font-bold text-slate-500 mt-1 tabular-nums">
            {formatCurrency(matched?.amount ?? 0)}
          </div>
          {statusFilter === 'MATCHED' && (
            <div className="absolute right-3 bottom-3 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              Đang xem
            </div>
          )}
        </button>

        {/* Card 3: REFUNDED_TO_WALLET */}
        <button
          type="button"
          onClick={() => changeFilter('REFUNDED_TO_WALLET')}
          className={`text-left p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
            statusFilter === 'REFUNDED_TO_WALLET'
              ? 'bg-sky-50/50 border-sky-400 ring-2 ring-sky-400/20'
              : 'bg-white border-slate-200/70 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Hoàn vào ví
            </span>
          </div>
          <div className="text-2xl font-black text-sky-700 tracking-tight tabular-nums">
            {refunded?.count ?? 0}
          </div>
          <div className="text-xs font-bold text-slate-500 mt-1 tabular-nums">
            {formatCurrency(refunded?.amount ?? 0)}
          </div>
          {statusFilter === 'REFUNDED_TO_WALLET' && (
            <div className="absolute right-3 bottom-3 text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-md">
              Đang xem
            </div>
          )}
        </button>

        {/* Card 4: RESOLVED_MANUALLY */}
        <button
          type="button"
          onClick={() => changeFilter('RESOLVED_MANUALLY')}
          className={`text-left p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
            statusFilter === 'RESOLVED_MANUALLY'
              ? 'bg-violet-50/50 border-violet-400 ring-2 ring-violet-400/20'
              : 'bg-white border-slate-200/70 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-violet-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              Xử lý thủ công
            </span>
          </div>
          <div className="text-2xl font-black text-violet-700 tracking-tight tabular-nums">
            {manual?.count ?? 0}
          </div>
          <div className="text-xs font-bold text-slate-500 mt-1 tabular-nums">
            {formatCurrency(manual?.amount ?? 0)}
          </div>
          {statusFilter === 'RESOLVED_MANUALLY' && (
            <div className="absolute right-3 bottom-3 text-[10px] font-bold text-violet-700 bg-violet-100/80 px-2 py-0.5 rounded-md">
              Đang xem
            </div>
          )}
        </button>
      </div>

      {/* ── Sub-Filter Bar & Search Box ──────────────────────────────────── */}
      <div className="bg-white p-4.5 rounded-3xl border border-slate-200/70 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* Preset Tabs */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist">
          {FILTERS.map((f) => {
            const count =
              f.key === 'UNMATCHED'
                ? unmatched?.count
                : f.key === 'MATCHED'
                ? matched?.count
                : f.key === 'REFUNDED_TO_WALLET'
                ? refunded?.count
                : f.key === 'RESOLVED_MANUALLY'
                ? manual?.count
                : undefined;

            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={statusFilter === f.key}
                onClick={() => changeFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  statusFilter === f.key
                    ? 'bg-[#08243D] text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span>{f.label}</span>
                {count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      statusFilter === f.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm nội dung CK, mã thanh toán (PC...), mã tham chiếu..."
            aria-label="Tìm giao dịch"
            className="w-full pl-10 pr-9 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-[#08243D] focus:ring-2 focus:ring-[#08243D]/10 transition-all placeholder:text-slate-400"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {flash && (
        <div
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl px-5 py-3.5 flex items-center gap-2 animate-slide-up"
          role="status"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {flash}
        </div>
      )}

      {/* ── Transaction Table / List ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden">
        {error ? (
          <div className="p-10 text-center text-xs font-bold text-rose-600">{error}</div>
        ) : !data && isLoading ? (
          <div className="p-14 text-center text-xs font-semibold text-slate-400">
            Đang tải dữ liệu giao dịch...
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            {statusFilter === 'UNMATCHED' ? (
              <div className="space-y-3 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#08243D]">
                    Tất cả giao dịch chuyển khoản đều đã được đối soát!
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Hiện không có giao dịch nào bị treo hoặc ghi sai nội dung. Hệ thống VietQR &amp; SePay đã tự động nhận diện và gán chính xác các giao dịch.
                  </p>
                </div>
                {matched && matched.count > 0 && (
                  <button
                    type="button"
                    onClick={() => changeFilter('MATCHED')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#08243D] hover:bg-[#0c2f4e] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    Xem {matched.count} giao dịch đã khớp tự động
                  </button>
                )}
              </div>
            ) : (
              <div className="text-slate-400 text-xs font-medium py-6">
                Không tìm thấy giao dịch nào phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </div>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-5">Thời gian &amp; Mã tham chiếu</th>
                  <th className="py-4 px-5 text-right">Số tiền nhận</th>
                  <th className="py-4 px-5">Nội dung chuyển khoản</th>
                  <th className="py-4 px-5">Trạng thái &amp; Đơn liên kết</th>
                  <th className="py-4 px-5">Ghi chú đối soát</th>
                  <th className="py-4 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {data.items.map((txn) => {
                  const meta = STATUS_META[txn.status] || STATUS_META.UNMATCHED;
                  const transferAmount = Number(txn.transfer_amount);

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Column 1: Time & Gateway Ref */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-bold text-[#08243D]">
                          {formatDateTime(txn.transaction_date || txn.created_at)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {txn.reference_code || `#${txn.external_id}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(txn.reference_code || txn.external_id, txn.id)}
                            title="Sao chép mã"
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {copiedId === txn.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Column 2: Amount */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="font-black text-emerald-700 text-sm sm:text-base tabular-nums flex items-center justify-end gap-1">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          +{formatCurrency(transferAmount)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Tài khoản MB</span>
                      </td>

                      {/* Column 3: Transfer Content */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200/70 p-2 rounded-xl break-all">
                          {txn.content || '—'}
                        </div>
                        {txn.code && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-[10px] font-bold mt-1.5 font-mono">
                            <Tag className="w-3 h-3 text-teal-600" />
                            Mã: {txn.code}
                          </div>
                        )}
                      </td>

                      {/* Column 4: Status & Linked Entity */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[10px] font-bold ${meta.badge}`}>
                          {meta.label}
                        </span>

                        {txn.payments?.booking_id && (
                          <div
                            className="text-[11px] font-bold text-[#08243D] mt-1.5 font-mono flex items-center gap-1"
                            title={`Booking ID: ${txn.payments.booking_id}`}
                          >
                            <span>Booking: #{txn.payments.booking_id.slice(0, 8)}…</span>
                          </div>
                        )}

                        {txn.subscription_order && (
                          <div className="mt-1.5 p-1.5 bg-violet-50 border border-violet-100 rounded-lg">
                            <div className="text-[10px] font-bold text-violet-800">
                              Gói: {txn.subscription_order.plan_name || txn.subscription_order.plan_code}
                            </div>
                            {txn.subscription_order.user && (
                              <div className="text-[10px] text-slate-500 font-normal truncate max-w-[160px]">
                                {txn.subscription_order.user.email}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 5: Notes & Resolver */}
                      <td className="py-4 px-5 max-w-sm">
                        <div className="text-xs text-slate-600 leading-relaxed">
                          {txn.note || '—'}
                        </div>
                        {txn.resolver && (
                          <div className="text-[10px] text-slate-400 mt-1 font-medium">
                            Xử lý bởi: <strong>{txn.resolver.fullName}</strong> ({formatDateTime(txn.resolved_at)})
                          </div>
                        )}
                      </td>

                      {/* Column 6: Action Button */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        {txn.status === 'UNMATCHED' ? (
                          <button
                            type="button"
                            onClick={() => setSelected(txn)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-all cursor-pointer shadow-2xs"
                          >
                            Xử lý đối soát
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelected(txn)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#08243D] bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
                          >
                            Chi tiết
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {data && data.total > BANK_TXN_PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <span>
              Trang <strong className="text-[#08243D]">{page}</strong> / {totalPages} · Tổng {data.total} giao dịch
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                aria-label="Trang trước"
                className="px-3 py-1.5 rounded-xl border border-slate-200/80 disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-bold transition-colors"
              >
                Trước
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                aria-label="Trang sau"
                className="px-3 py-1.5 rounded-xl border border-slate-200/80 disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-bold transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal for resolving transactions ────────────────────────────── */}
      {selected && (
        <ResolveBankTransactionModal
          transaction={selected}
          onClose={() => setSelected(null)}
          onResolved={handleResolved}
        />
      )}
    </div>
  );
}
