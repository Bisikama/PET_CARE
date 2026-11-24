'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Crown, Pencil, Plus, RefreshCw, Search } from 'lucide-react';
import { adminSubscriptionService, getApiErrorMessage } from '../services/subscription.service';
import { SubscriptionPlanFormModal } from './SubscriptionPlanFormModal';
import type {
  AdminSubscriptionOrderList,
  AdminSubscriptionPlan,
  SubscriptionOrderStatus,
  SubscriptionPaymentMethod,
  SubscriptionPlanInput,
} from '../types/subscription.types';

const PAGE_SIZE = 20;
const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';
const formatDateTime = (val: string | null) =>
  val ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(val)) : '—';
const formatDate = (val: string) => new Date(val).toLocaleDateString('vi-VN');

const ORDER_STATUS: Record<SubscriptionOrderStatus, { label: string; badge: string }> = {
  PENDING: { label: 'Chờ thanh toán', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  PAID: { label: 'Đã thanh toán', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Đã huỷ', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
};
const METHOD_LABEL: Record<SubscriptionPaymentMethod, string> = {
  BANK_TRANSFER: 'Chuyển khoản',
  VNPAY: 'VNPay',
  WALLET: 'Ví',
};
type Filter = SubscriptionOrderStatus | 'ALL';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'PAID', label: 'Đã thanh toán' },
  { key: 'PENDING', label: 'Chờ thanh toán' },
  { key: 'CANCELLED', label: 'Đã huỷ' },
  { key: 'ALL', label: 'Tất cả' },
];

/** Admin: quản lý các gói hội viên hệ thống bán ra và theo dõi đơn mua gói. */
export function AdminSubscriptionsManager() {
  const [plans, setPlans] = React.useState<AdminSubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<AdminSubscriptionPlan | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [flash, setFlash] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [orders, setOrders] = React.useState<AdminSubscriptionOrderList | null>(null);
  const [ordersLoading, setOrdersLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<Filter>('PAID');
  const [planFilter, setPlanFilter] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(1);

  const loadPlans = React.useCallback(async () => {
    setPlansLoading(true);
    try {
      setPlans(await adminSubscriptionService.listPlans());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không tải được danh sách gói'));
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const loadOrders = React.useCallback(async () => {
    setOrdersLoading(true);
    try {
      setOrders(
        await adminSubscriptionService.listOrders({
          status: statusFilter,
          planCode: planFilter,
          q: query,
          page,
          limit: PAGE_SIZE,
        }),
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không tải được đơn mua gói'));
    } finally {
      setOrdersLoading(false);
    }
  }, [statusFilter, planFilter, query, page]);

  React.useEffect(() => {
    loadPlans();
  }, [loadPlans]);
  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);
  React.useEffect(() => {
    const t = setTimeout(() => {
      setQuery(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 4000);
  };

  const handleSubmit = async (input: SubscriptionPlanInput): Promise<string | null> => {
    try {
      if (editing) await adminSubscriptionService.updatePlan(editing.id, input);
      else await adminSubscriptionService.createPlan(input);
      setFormOpen(false);
      showFlash(editing ? `Đã cập nhật gói ${editing.code}.` : `Đã tạo gói ${input.code}.`);
      loadPlans();
      return null;
    } catch (err) {
      return getApiErrorMessage(err, 'Lưu gói thất bại');
    }
  };

  const toggleActive = async (plan: AdminSubscriptionPlan) => {
    const next = !plan.isActive;
    if (!window.confirm(`${next ? 'Mở bán lại' : 'Ngừng bán'} gói ${plan.name} (${plan.code})?`)) return;
    try {
      await adminSubscriptionService.updatePlan(plan.id, { isActive: next });
      showFlash(`${next ? 'Đã mở bán' : 'Đã ngừng bán'} gói ${plan.code}. Khách đang dùng gói vẫn giữ nguyên quyền lợi.`);
      loadPlans();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Cập nhật trạng thái thất bại'));
    }
  };

  const totalRevenue = plans.reduce((sum, p) => sum + p.stats.revenue, 0);
  const totalSold = plans.reduce((sum, p) => sum + p.stats.soldCount, 0);
  const totalActive = plans.reduce((sum, p) => sum + p.stats.activeSubscribers, 0);
  const totalPages = orders ? Math.max(1, Math.ceil(orders.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Gói Hội Viên
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Các gói hệ thống bán ra: giá, thời hạn, mở/ngừng bán và doanh số. Nội dung CK của khách có dạng{' '}
            <span className="font-mono text-slate-700">PC… Thanh toan goi &lt;MÃ GÓI&gt;</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              loadPlans();
              loadOrders();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" /> Tạo gói
          </button>
        </div>
      </div>

      {flash && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">{flash}</div>}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-sm text-rose-700 flex justify-between">
          {error}
          <button onClick={() => setError(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Doanh thu gói (đã thanh toán)', value: formatCurrency(totalRevenue) },
          { label: 'Số lượt đã bán', value: totalSold.toLocaleString('vi-VN') },
          { label: 'Khách đang có gói hiệu lực', value: totalActive.toLocaleString('vi-VN') },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-black text-slate-800 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Danh sách gói */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3 text-left">Gói</th>
                <th className="px-5 py-3 text-right">Giá</th>
                <th className="px-5 py-3 text-left">Thời hạn</th>
                <th className="px-5 py-3 text-right">Đã bán</th>
                <th className="px-5 py-3 text-right">Doanh thu</th>
                <th className="px-5 py-3 text-right">Đang dùng</th>
                <th className="px-5 py-3 text-right">Chờ TT</th>
                <th className="px-5 py-3 text-left">Trạng thái</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plansLoading && plans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-400">
                    Đang tải…
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-400">
                    Chưa có gói nào. Bấm “Tạo gói” để bắt đầu bán.
                  </td>
                </tr>
              ) : (
                plans.map((p) => (
                  <tr key={p.id} className={p.isActive ? '' : 'bg-slate-50/60'}>
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{p.code}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-bold tabular-nums">{formatCurrency(p.price)}</td>
                    <td className="px-5 py-3 text-slate-600">{p.durationDays} ngày</td>
                    <td className="px-5 py-3 text-right tabular-nums">{p.stats.soldCount}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-emerald-700">
                      {formatCurrency(p.stats.revenue)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{p.stats.activeSubscribers}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-amber-700">{p.stats.pendingOrders}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Bấm để đổi trạng thái"
                      >
                        {p.isActive ? 'Đang bán' : 'Ngừng bán'}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setFormOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Sửa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Đơn mua gói */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Đơn mua gói</h3>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setStatusFilter(f.key);
                  setPage(1);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                  statusFilter === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
                {f.key !== 'ALL' && orders?.summary?.[f.key] ? ` (${orders.summary[f.key].count})` : ''}
              </button>
            ))}
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-600"
            >
              <option value="">Mọi gói</option>
              {plans.map((p) => (
                <option key={p.id} value={p.code}>
                  {p.code}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Email, tên, mã PC…"
                className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs w-48"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3 text-left">Thời gian</th>
                <th className="px-5 py-3 text-left">Khách hàng</th>
                <th className="px-5 py-3 text-left">Gói</th>
                <th className="px-5 py-3 text-right">Số tiền</th>
                <th className="px-5 py-3 text-left">Thanh toán</th>
                <th className="px-5 py-3 text-left">Trạng thái</th>
                <th className="px-5 py-3 text-left">Hiệu lực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordersLoading && !orders ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Đang tải…
                  </td>
                </tr>
              ) : !orders || orders.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Không có đơn nào.
                  </td>
                </tr>
              ) : (
                orders.items.map((o) => (
                  <tr key={o.id} className="align-top">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-700">{formatDateTime(o.paidAt || o.createdAt)}</div>
                      <div className="text-[11px] text-slate-400">Tạo {formatDateTime(o.createdAt)}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800">{o.customer?.fullName || '—'}</div>
                      <div className="text-[11px] text-slate-400">{o.customer?.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800">{o.planName}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {o.planCode} · {o.durationDays} ngày
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-bold tabular-nums">{formatCurrency(o.amount)}</td>
                    <td className="px-5 py-3">
                      <div className="text-slate-700">{METHOD_LABEL[o.method]}</div>
                      <div className="text-[11px] font-mono text-slate-400 break-all max-w-[220px]">
                        {o.transferContent || o.paymentCode}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-lg border text-[11px] font-bold ${ORDER_STATUS[o.status].badge}`}>
                        {ORDER_STATUS[o.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-600">
                      {o.subscription
                        ? `${formatDate(o.subscription.startDate)} → ${formatDate(o.subscription.endDate)}`
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {orders && orders.total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Trang {page}/{totalPages} · {orders.total} đơn
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-30"
                aria-label="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-30"
                aria-label="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <SubscriptionPlanFormModal
        plan={editing}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
