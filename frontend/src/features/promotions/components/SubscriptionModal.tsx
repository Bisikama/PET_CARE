'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, CheckCircle2, CreditCard, Crown, Landmark, Loader2, Wallet, X } from 'lucide-react';
import { useSubscriptionStore } from '../stores/subscription.store';
import { SubscriptionTransferPanel } from './SubscriptionTransferPanel';
import { walletService } from '@/features/wallets/services/wallet.service';
import type { SubscriptionBankTransferCheckout, SubscriptionPaymentMethod } from '../types/subscription.types';

type Method = SubscriptionPaymentMethod;

const METHODS: { key: Method; label: string; hint: string; icon: React.ElementType }[] = [
  { key: 'BANK_TRANSFER', label: 'Chuyển khoản (VietQR)', hint: 'Quét mã QR, kích hoạt tự động', icon: Landmark },
  { key: 'WALLET', label: 'Ví PetCare', hint: 'Thanh toán tức thì bằng số dư ví', icon: Wallet },
  { key: 'VNPAY', label: 'Cổng VNPay', hint: 'Thẻ ATM nội địa / Ví điện tử', icon: CreditCard },
];

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';
export const formatPlanPeriod = (days: number) =>
  days % 365 === 0 ? `${days / 365} năm` : days % 30 === 0 ? `${days / 30} tháng` : `${days} ngày`;

/** Modal mua / gia hạn / thanh toán lại gói hội viên. */
export const SubscriptionModal: React.FC = () => {
  const {
    plans,
    mySubscription,
    myOrders,
    isOpen,
    isSubmitting,
    error,
    selectedPlanCode,
    initialMethod,
    autoStartTransfer,
    closeModal,
    clearError,
    checkoutBankTransfer,
    checkoutVnPay,
    checkoutWallet,
    cancelOrder,
    fetchMySubscription,
  } = useSubscriptionStore();

  const [planCode, setPlanCode] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>('BANK_TRANSFER');
  const [transfer, setTransfer] = useState<SubscriptionBankTransferCheckout | null>(null);
  const [success, setSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const targetPlan = selectedPlanCode ?? mySubscription?.planCode ?? plans[0]?.code ?? null;
    const targetMethod = initialMethod ?? 'BANK_TRANSFER';
    setPlanCode(targetPlan);
    setMethod(targetMethod);
    setTransfer(null);
    setSuccess(false);

    // Lấy số dư Ví PetCare để hiển thị trực quan cho khách
    walletService
      .getMyWallet()
      .then((w) => setWalletBalance(Number(w?.balance ?? 0)))
      .catch(() => setWalletBalance(null));

    // Nếu khách bấm "Xem mã QR / Tiếp tục chuyển khoản" từ đơn đang chờ -> mở thẳng màn hình QR
    if (autoStartTransfer && targetPlan) {
      void checkoutBankTransfer(targetPlan).then((checkout) => {
        if (checkout) setTransfer(checkout);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedPlanCode, initialMethod, autoStartTransfer]);

  const handlePaid = useCallback(() => {
    setTransfer(null);
    setSuccess(true);
    fetchMySubscription();
  }, [fetchMySubscription]);

  if (!isOpen) return null;

  const plan = plans.find((p) => p.code === planCode) ?? null;
  const lockedTo = mySubscription?.planCode ?? null;
  const pendingForSelectedPlan = myOrders.find(
    (o) => o.planCode === plan?.code && o.status === 'PENDING' && o.method === 'BANK_TRANSFER',
  );
  const isWalletInsufficient =
    method === 'WALLET' && walletBalance !== null && plan !== null && walletBalance < plan.price;

  // Tính ngày hết hạn dự kiến sau khi mua / gia hạn
  const estimatedEndDate = (() => {
    if (!plan) return null;
    const baseDate =
      mySubscription && mySubscription.planCode === plan.code && new Date(mySubscription.expiresAt) > new Date()
        ? new Date(mySubscription.expiresAt)
        : new Date();
    return new Date(baseDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  })();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-xl border border-slate-200/70">
        {/* Luxury Navy Header */}
        <div className="bg-[#08243D] px-6 py-5 text-white flex items-start justify-between gap-4 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-[#F7C948]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {transfer
                  ? 'Thanh toán chuyển khoản gói hội viên'
                  : lockedTo
                    ? 'Gia hạn gói hội viên'
                    : pendingForSelectedPlan
                      ? 'Tiếp tục thanh toán gói hội viên'
                      : 'Đăng ký gói hội viên'}
              </h3>
              {mySubscription ? (
                <p className="text-xs text-[#F7C948] mt-0.5">
                  Đang sử dụng: {mySubscription.planName} (hiệu lực đến{' '}
                  {new Date(mySubscription.expiresAt).toLocaleDateString('vi-VN')})
                </p>
              ) : (
                <p className="text-xs text-slate-300 mt-0.5">
                  Chọn gói và phương thức thanh toán phù hợp để kích hoạt đặc quyền hội viên
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-xl p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <h4 className="mt-4 text-lg font-bold text-[#08243D]">Kích hoạt gói hội viên thành công!</h4>
              <p className="mt-1.5 text-xs text-slate-500 max-w-md mx-auto">
                {plan?.name} đã được kích hoạt
                {mySubscription
                  ? `, hiệu lực sử dụng đến ngày ${new Date(mySubscription.expiresAt).toLocaleDateString('vi-VN')}`
                  : ''}
                .
              </p>
              <button
                type="button"
                onClick={closeModal}
                className="mt-6 rounded-xl bg-[#08243D] px-7 py-2.5 text-xs font-bold text-[#F7C948] hover:bg-[#0c3254] cursor-pointer"
              >
                Hoàn tất
              </button>
            </div>
          ) : isSubmitting && autoStartTransfer && !transfer ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-[#08243D]" />
              <p className="text-xs font-medium text-slate-500">Đang tải mã VietQR và thông tin chuyển khoản…</p>
            </div>
          ) : transfer ? (
            <SubscriptionTransferPanel
              checkout={transfer}
              onPaid={handlePaid}
              onBack={() => setTransfer(null)}
              onCancelOrder={async (orderId) => {
                const ok = await cancelOrder(orderId);
                if (ok) {
                  setTransfer(null);
                  closeModal();
                }
              }}
            />
          ) : (
            <div className="space-y-6">
              {/* Step 1: Select Plan */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  1. Chọn gói hội viên
                </p>
                {plans.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">Hiện chưa có gói nào được mở bán.</p>
                ) : (
                  <div className="space-y-2.5">
                    {plans.map((p) => {
                      const disabled = Boolean(lockedTo && lockedTo !== p.code);
                      const selected = planCode === p.code;
                      const hasPendingOrder = myOrders.some((o) => o.planCode === p.code && o.status === 'PENDING');

                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setPlanCode(p.code);
                            clearError();
                          }}
                          className={`w-full text-left rounded-2xl border p-4 transition-all ${
                            selected
                              ? 'border-[#08243D] bg-slate-50/90 ring-1 ring-[#08243D]'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={disabled ? 'Chỉ có thể gia hạn gói đang dùng cho đến khi gói hết hạn' : undefined}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-[#08243D] text-sm">{p.name}</span>
                                <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                  {p.code}
                                </span>
                                {lockedTo === p.code && (
                                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    Đang sử dụng
                                  </span>
                                )}
                                {hasPendingOrder && (
                                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                    Có đơn chờ thanh toán
                                  </span>
                                )}
                              </div>
                              {p.description && <p className="text-xs text-slate-500 mt-1">{p.description}</p>}
                              {p.benefits.length > 0 && (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                  {p.benefits.map((b) => (
                                    <span key={b} className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                                      <Check className="w-3 h-3 text-teal-600 shrink-0" />
                                      {b}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-bold text-base text-[#08243D] tabular-nums">{formatPrice(p.price)}</div>
                              <div className="text-[11px] text-slate-400">
                                / {formatPlanPeriod(p.durationDays)} ({p.durationDays} ngày)
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2: Select Payment Method */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  2. Phương thức thanh toán
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {METHODS.map((m) => {
                    const isSelected = method === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          setMethod(m.key);
                          clearError();
                        }}
                        className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#08243D] bg-[#08243D] text-white shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <m.icon
                          className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-[#F7C948]' : 'text-[#08243D]'}`}
                        />
                        <div className="min-w-0">
                          <span className={`block text-xs font-bold ${isSelected ? 'text-white' : 'text-[#08243D]'}`}>
                            {m.label}
                          </span>
                          <span className={`block text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {m.hint}
                          </span>
                          {m.key === 'WALLET' && walletBalance !== null && (
                            <span
                              className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isSelected
                                  ? 'bg-white/15 text-[#F7C948]'
                                  : walletBalance >= (plan?.price ?? 0)
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              Số dư: {formatPrice(walletBalance)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary before confirming */}
              {plan && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Gói đăng ký</span>
                    <span className="font-bold text-[#08243D]">
                      {plan.name} ({plan.durationDays} ngày)
                    </span>
                  </div>
                  {estimatedEndDate && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Hiệu lực dự kiến đến</span>
                      <span className="font-semibold text-teal-700">
                        {estimatedEndDate.toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  {pendingForSelectedPlan && method === 'BANK_TRANSFER' && (
                    <div className="flex items-center justify-between text-amber-700 pt-1 border-t border-slate-200/70">
                      <span>Mã đơn đang chờ</span>
                      <span className="font-mono font-bold">{pendingForSelectedPlan.paymentCode} (Sẽ dùng lại mã QR này)</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                    <span className="font-bold text-[#08243D]">Tổng thanh toán</span>
                    <span className="text-base font-bold text-[#08243D] tabular-nums">{formatPrice(plan.price)}</span>
                  </div>
                </div>
              )}

              {isWalletInsufficient && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  Số dư Ví PetCare hiện tại ({formatPrice(walletBalance ?? 0)}) chưa đủ để thanh toán gói này. Vui lòng chọn{' '}
                  <strong>Chuyển khoản (VietQR)</strong> hoặc <strong>Cổng VNPay</strong>.
                </div>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={!plan || isSubmitting || isWalletInsufficient}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#08243D] py-3.5 text-xs font-bold text-[#F7C948] hover:bg-[#0c3254] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {!plan
                  ? 'Chọn một gói hội viên'
                  : method === 'BANK_TRANSFER'
                    ? pendingForSelectedPlan
                      ? `Xem lại mã VietQR thanh toán — ${formatPrice(plan.price)}`
                      : `Tạo mã VietQR thanh toán — ${formatPrice(plan.price)}`
                    : method === 'WALLET'
                      ? `Thanh toán bằng Ví PetCare — ${formatPrice(plan.price)}`
                      : `Tiếp tục qua cổng VNPay — ${formatPrice(plan.price)}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
