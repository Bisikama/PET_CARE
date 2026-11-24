'use client';

import * as React from 'react';
import { Check, Crown, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionModal, formatPlanPeriod } from './SubscriptionModal';
import type { SubscriptionOrderStatus, SubscriptionPaymentMethod } from '../types/subscription.types';

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';
const formatDate = (val: string) => new Date(val).toLocaleDateString('vi-VN');

const ORDER_STATUS: Record<SubscriptionOrderStatus, { label: string; badge: string }> = {
  PENDING: { label: 'Chờ thanh toán', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  PAID: { label: 'Đã thanh toán', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Đã huỷ', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
};
const METHOD_LABEL: Record<SubscriptionPaymentMethod, string> = {
  BANK_TRANSFER: 'Chuyển khoản',
  VNPAY: 'VNPay',
  WALLET: 'Ví PetCare',
};

/** Khách xem gói đang dùng, các gói đang bán và lịch sử mua gói. */
export function MembershipView() {
  const { plans, mySubscription, myOrders, isLoading, error, openModal } = useSubscription();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          Gói Hội Viên
        </h2>
        <p className="text-sm text-slate-500 mt-1">Đăng ký gói để nhận ưu đãi khi đặt dịch vụ chăm sóc thú cưng.</p>
      </div>

      {mySubscription && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Gói đang dùng</p>
            <p className="text-lg font-black text-slate-900">{mySubscription.planName}</p>
            <p className="text-sm text-slate-600">Hiệu lực đến {formatDate(mySubscription.expiresAt)}</p>
          </div>
          <button
            onClick={() => openModal(mySubscription.planCode)}
            className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Gia hạn
          </button>
        </div>
      )}

      {error && <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-sm text-rose-700">{error}</div>}

      {isLoading && plans.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isCurrent = mySubscription?.planCode === p.code;
            const blocked = Boolean(mySubscription && !isCurrent);
            return (
              <div
                key={p.id}
                className={`rounded-3xl border bg-white p-5 flex flex-col ${
                  isCurrent ? 'border-emerald-400 shadow-sm' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900">{p.name}</h3>
                  {isCurrent && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-lg px-2 py-0.5">
                      Đang dùng
                    </span>
                  )}
                </div>
                <p className="mt-2">
                  <span className="text-2xl font-black text-emerald-600">{formatPrice(p.price)}</span>
                  <span className="text-xs text-slate-400"> / {formatPlanPeriod(p.durationDays)}</span>
                </p>
                {p.description && <p className="mt-2 text-xs text-slate-500">{p.description}</p>}
                {p.benefits.length > 0 && (
                  <ul className="mt-3 space-y-1.5 flex-1">
                    {p.benefits.map((b) => (
                      <li key={b} className="flex gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => openModal(p.code)}
                  disabled={blocked}
                  title={blocked ? 'Bạn có thể chọn gói khác sau khi gói hiện tại hết hạn' : undefined}
                  className="mt-4 rounded-2xl bg-[#0a1128] py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isCurrent ? 'Gia hạn gói' : 'Đăng ký'}
                </button>
              </div>
            );
          })}
          {!isLoading && plans.length === 0 && (
            <p className="text-sm text-slate-500 col-span-full text-center py-8">Hiện chưa có gói nào được mở bán.</p>
          )}
        </div>
      )}

      {myOrders.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
          <h3 className="px-5 py-3 text-sm font-bold text-slate-700 border-b border-slate-100">Lịch sử mua gói</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-2 text-left">Ngày tạo</th>
                  <th className="px-5 py-2 text-left">Gói</th>
                  <th className="px-5 py-2 text-right">Số tiền</th>
                  <th className="px-5 py-2 text-left">Phương thức</th>
                  <th className="px-5 py-2 text-left">Nội dung CK</th>
                  <th className="px-5 py-2 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-600">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{o.planName}</td>
                    <td className="px-5 py-3 text-right font-bold tabular-nums">{formatPrice(o.amount)}</td>
                    <td className="px-5 py-3 text-slate-600">{METHOD_LABEL[o.method]}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{o.transferContent || o.paymentCode}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-lg border text-[11px] font-bold ${ORDER_STATUS[o.status].badge}`}>
                        {ORDER_STATUS[o.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SubscriptionModal />
    </div>
  );
}
