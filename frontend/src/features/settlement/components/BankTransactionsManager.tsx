'use client';

import * as React from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Landmark, RefreshCw, Search } from 'lucide-react';
import { BANK_TXN_PAGE_SIZE, useBankTransactions } from '../hooks/useBankTransactions';
import { ResolveBankTransactionModal } from './ResolveBankTransactionModal';
import type { BankTransaction, BankTransactionStatus } from '../types';

type Filter = BankTransactionStatus | 'ALL';

const STATUS_META: Record<BankTransactionStatus, { label: string; badge: string }> = {
  UNMATCHED: { label: 'Chưa khớp', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  MATCHED: { label: 'Đã khớp đơn', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REFUNDED_TO_WALLET: { label: 'Hoàn vào ví', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  RESOLVED_MANUALLY: { label: 'Xử lý thủ công', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  IGNORED: { label: 'Bỏ qua', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'UNMATCHED', label: 'Chưa khớp' },
  { key: 'MATCHED', label: 'Đã khớp' },
  { key: 'REFUNDED_TO_WALLET', label: 'Hoàn ví' },
  { key: 'RESOLVED_MANUALLY', label: 'Thủ công' },
  { key: 'IGNORED', label: 'Bỏ qua' },
  { key: 'ALL', label: 'Tất cả' },
];

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';
const formatDateTime = (val: string | null) =>
  val
    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(val))
    : '—';

export function BankTransactionsManager() {
  const [statusFilter, setStatusFilter] = React.useState<Filter>('UNMATCHED');
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<BankTransaction | null>(null);
  const [flash, setFlash] = React.useState<string | null>(null);

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

  const changeFilter = (key: Filter) => {
    setStatusFilter(key);
    setPage(1);
  };

  const handleResolved = () => {
    setSelected(null);
    setFlash('Đã xử lý giao dịch. Thao tác đã được ghi vào nhật ký hệ thống.');
    reload();
    setTimeout(() => setFlash(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-teal-600" />
            Giao Dịch Chuyển Khoản (SePay)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tiền khách chuyển vào tài khoản MB. Giao dịch <strong>chưa khớp</strong> cần xử lý thủ công.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Cảnh báo tiền chưa xử lý */}
      {unmatched && unmatched.count > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Có <strong>{unmatched.count}</strong> giao dịch chưa khớp, tổng{' '}
            <strong>{formatCurrency(unmatched.amount)}</strong> đang nằm trong tài khoản nhưng chưa được gán cho ai.
          </p>
        </div>
      )}

      {/* Thẻ tổng quan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['UNMATCHED', 'MATCHED', 'REFUNDED_TO_WALLET', 'RESOLVED_MANUALLY'] as const).map((s) => {
          const item = data?.summary?.[s];
          const active = statusFilter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => changeFilter(s)}
              className={`text-left bg-white p-5 rounded-3xl border shadow-sm transition-all cursor-pointer ${
                active ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                {STATUS_META[s].label}
              </span>
              <div className="text-2xl font-black text-slate-800 mt-2 tabular-nums">{item?.count ?? 0}</div>
              <div className="text-xs font-semibold text-slate-500 tabular-nums">{formatCurrency(item?.amount ?? 0)}</div>
            </button>
          );
        })}
      </div>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc theo trạng thái">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={statusFilter === f.key}
              onClick={() => changeFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                statusFilter === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm nội dung CK, mã thanh toán, mã tham chiếu…"
            aria-label="Tìm giao dịch"
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
        </div>
      </div>

      {flash && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-2xl px-4 py-3" role="status">
          {flash}
        </div>
      )}

      {/* Bảng giao dịch */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {error ? (
          <div className="p-10 text-center text-sm text-rose-600">{error}</div>
        ) : !data && isLoading ? (
          <div className="p-10 text-center text-sm text-slate-500">Đang tải dữ liệu…</div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {statusFilter === 'UNMATCHED' ? 'Không có giao dịch nào cần xử lý 🎉' : 'Không có giao dịch nào.'}
          </div>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-5 py-3 text-right">Số tiền</th>
                  <th className="px-5 py-3">Nội dung CK</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Ghi chú</th>
                  <th className="px-5 py-3" aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((txn) => (
                  <tr key={txn.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-700">{formatDateTime(txn.transaction_date || txn.created_at)}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{txn.reference_code || `#${txn.external_id}`}</div>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap font-black text-slate-800 tabular-nums">
                      {formatCurrency(Number(txn.transfer_amount))}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-mono text-xs text-slate-700 break-all">{txn.content || '—'}</div>
                      {txn.code && <div className="text-[11px] text-teal-700 font-bold mt-1">Mã: {txn.code}</div>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-lg border text-[11px] font-bold ${STATUS_META[txn.status].badge}`}>
                        {STATUS_META[txn.status].label}
                      </span>
                      {txn.payments?.booking_id && (
                        <div className="text-[11px] text-slate-400 font-mono mt-1" title={txn.payments.booking_id}>
                          BK {txn.payments.booking_id.slice(0, 8)}…
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-sm">
                      <div className="text-xs text-slate-600 leading-relaxed">{txn.note || '—'}</div>
                      {txn.resolver && (
                        <div className="text-[11px] text-slate-400 mt-1">
                          {txn.resolver.fullName} · {formatDateTime(txn.resolved_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {txn.status === 'UNMATCHED' && (
                        <button
                          type="button"
                          onClick={() => setSelected(txn)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          Xử lý
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {data && data.total > BANK_TXN_PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Trang {page}/{totalPages} · {data.total} giao dịch
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                aria-label="Trang trước"
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                aria-label="Trang sau"
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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
