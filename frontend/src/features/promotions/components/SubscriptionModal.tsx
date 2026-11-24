'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Landmark, Loader2, Wallet, X } from 'lucide-react';
import { useSubscriptionStore } from '../stores/subscription.store';
import { SubscriptionTransferPanel } from './SubscriptionTransferPanel';
import type { SubscriptionBankTransferCheckout } from '../types/subscription.types';

type Method = 'BANK_TRANSFER' | 'WALLET' | 'VNPAY';

const METHODS: { key: Method; label: string; hint: string; icon: React.ElementType }[] = [
  { key: 'BANK_TRANSFER', label: 'Chuyển khoản (VietQR)', hint: 'Quét mã, kích hoạt tự động', icon: Landmark },
  { key: 'WALLET', label: 'Ví PetCare', hint: 'Dùng số dư hoàn tiền', icon: Wallet },
  { key: 'VNPAY', label: 'VNPay', hint: 'Thẻ ATM / ví điện tử', icon: CreditCard },
];

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';
export const formatPlanPeriod = (days: number) =>
  days % 365 === 0 ? `${days / 365} năm` : days % 30 === 0 ? `${days / 30} tháng` : `${days} ngày`;

/** Modal mua / gia hạn gói hội viên. Mở bằng `useSubscriptionStore().openModal(planCode)`. */
export const SubscriptionModal: React.FC = () => {
  const {
    plans,
    mySubscription,
    isOpen,
    isSubmitting,
    error,
    selectedPlanCode,
    closeModal,
    clearError,
    checkoutBankTransfer,
    checkoutVnPay,
    checkoutWallet,
    fetchMySubscription,
  } = useSubscriptionStore();

  const [planCode, setPlanCode] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>('BANK_TRANSFER');
  const [transfer, setTransfer] = useState<SubscriptionBankTransferCheckout | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPlanCode(selectedPlanCode ?? mySubscription?.planCode ?? plans[0]?.code ?? null);
    setMethod('BANK_TRANSFER');
    setTransfer(null);
    setSuccess(false);
    // Chỉ khởi tạo lại khi mở modal — không reset khi dữ liệu gói được tải lại sau thanh toán
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedPlanCode]);

  const handlePaid = useCallback(() => {
    setTransfer(null);
    setSuccess(true);
    fetchMySubscription();
  }, [fetchMySubscription]);

  if (!isOpen) return null;

  const plan = plans.find((p) => p.code === planCode) ?? null;
  // Đang có gói còn hạn => chỉ gia hạn được cùng gói
  const lockedTo = mySubscription?.planCode ?? null;

  const handlePay = async () => {
    if (!plan) return;
    if (method === 'BANK_TRANSFER') {
      const checkout = await checkoutBankTransfer(plan.code);
      if (checkout) setTransfer(checkout);
    } else if (method === 'WALLET') {
      if (await checkoutWallet(plan.code)) setSuccess(true);
    } else {
      const url = await checkoutVnPay(plan.code);
      if (url) window.location.href = url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {lockedTo ? 'Gia hạn gói hội viên' : 'Đăng ký gói hội viên'}
            </h3>
            {mySubscription && (
              <span className="text-xs text-emerald-600 font-semibold">
                Đang dùng: {mySubscription.planName} (hạn đến{' '}
                {new Date(mySubscription.expiresAt).toLocaleDateString('vi-VN')})
              </span>
            )}
          </div>
          <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">{error}</div>
        )}

        <div className="mt-4">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
              <h4 className="mt-3 text-lg font-black text-slate-800">Thanh toán thành công!</h4>
              <p className="mt-1 text-sm text-slate-500">
                {plan?.name} đã được kích hoạt
                {mySubscription ? `, hiệu lực đến ${new Date(mySubscription.expiresAt).toLocaleDateString('vi-VN')}` : ''}.
              </p>
              <button
                onClick={closeModal}
                className="mt-5 rounded-2xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Hoàn tất
              </button>
            </div>
          ) : transfer ? (
            <SubscriptionTransferPanel checkout={transfer} onPaid={handlePaid} onBack={() => setTransfer(null)} />
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">1. Chọn gói</p>
              {plans.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">Hiện chưa có gói nào được mở bán.</p>
              ) : (
                <div className="space-y-2.5">
                  {plans.map((p) => {
                    const disabled = Boolean(lockedTo && lockedTo !== p.code);
                    const selected = planCode === p.code;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setPlanCode(p.code);
                          clearError();
                        }}
                        className={`w-full text-left flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                          selected ? 'border-emerald-600 bg-emerald-50/60' : 'border-slate-200 hover:border-slate-300'
                        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={disabled ? 'Chỉ có thể gia hạn gói đang dùng cho đến khi gói hết hạn' : undefined}
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-sm">
                            {p.name} <span className="ml-1 text-[10px] font-mono text-slate-400">{p.code}</span>
                          </div>
                          {p.description && <div className="text-xs text-slate-500">{p.description}</div>}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-extrabold text-emerald-600">{formatPrice(p.price)}</div>
                          <div className="text-[11px] text-slate-400">/ {formatPlanPeriod(p.durationDays)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-5 mb-2">
                2. Phương thức thanh toán
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {METHODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMethod(m.key)}
                    className={`flex items-start gap-2.5 rounded-2xl border p-3 text-left transition ${
                      method === m.key ? 'border-[#0a1128] bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <m.icon className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                    <span>
                      <span className="block text-sm font-bold text-slate-800">{m.label}</span>
                      <span className="block text-[11px] text-slate-500">{m.hint}</span>
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handlePay}
                disabled={!plan || isSubmitting}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0a1128] py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {plan ? `Thanh toán ${formatPrice(plan.price)} — ${plan.name}` : 'Chọn một gói'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
