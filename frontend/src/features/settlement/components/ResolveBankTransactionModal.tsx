'use client';

import * as React from 'react';
import { CheckCircle2, Link2, Loader2, Wallet, X, AlertCircle, Info, Landmark, ArrowRight, ShieldCheck } from 'lucide-react';
import { bankTransactionService } from '../services/bank-transaction.service';
import { bankTxnErrorMessage } from '../hooks/useBankTransactions';
import type { BankTransaction, ResolveBankTransactionInput } from '../types';
import { systemConfirm } from '@/components/ui/SystemDialogProvider';
import { Portal } from '@/components/ui/Portal';

type ActionKey = ResolveBankTransactionInput['action'];

const ACTIONS: { key: ActionKey; title: string; description: string; icon: React.ElementType }[] = [
  {
    key: 'ASSIGN',
    title: 'Gán thủ công vào đơn hàng',
    description: 'Khách ghi sai/thiếu nội dung chuyển khoản. Nhập mã PC... của đơn đặt lịch hoặc đơn mua gói hội viên để hệ thống kích hoạt đơn ngay.',
    icon: Link2,
  },
  {
    key: 'CREDIT_WALLET',
    title: 'Hoàn tiền vào ví PetCare của khách',
    description: 'Xác định được email khách nhưng đơn đã hủy hoặc hết hạn. Toàn bộ số tiền sẽ được cộng trực tiếp vào Số dư Ví của khách.',
    icon: Wallet,
  },
  {
    key: 'MARK_RESOLVED',
    title: 'Đánh dấu đã xử lý ngoài hệ thống',
    description: 'Đã hoàn trả trực tiếp qua tài khoản ngân hàng, hoặc khoản tiền nhầm lẫn không thuộc hệ thống PetCare.',
    icon: CheckCircle2,
  },
];

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

interface Props {
  transaction: BankTransaction;
  onClose: () => void;
  onResolved: () => void;
}

export function ResolveBankTransactionModal({ transaction, onClose, onResolved }: Props) {
  const [action, setAction] = React.useState<ActionKey>('ASSIGN');
  const [assignBy, setAssignBy] = React.useState<'paymentCode' | 'bookingId'>('paymentCode');
  const [assignValue, setAssignValue] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const amount = Number(transaction.transfer_amount);
  const reasonOk = reason.trim().length >= 5;
  const targetOk =
    action === 'MARK_RESOLVED' ||
    (action === 'ASSIGN' && assignValue.trim().length > 0) ||
    (action === 'CREDIT_WALLET' && /\S+@\S+\.\S+/.test(customerEmail.trim()));

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSubmitting, onClose]);

  const confirmText = (): string => {
    if (action === 'ASSIGN') return `Gán khoản ${formatCurrency(amount)} vào ${assignBy === 'paymentCode' ? 'mã thanh toán' : 'đơn booking'} "${assignValue.trim()}"?`;
    if (action === 'CREDIT_WALLET') return `Cộng ${formatCurrency(amount)} vào Ví PetCare của tài khoản "${customerEmail.trim()}"?`;
    return 'Xác nhận đánh dấu giao dịch này đã được giải quyết ngoài hệ thống?';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonOk || !targetOk) return;
    const ok = await systemConfirm({
      title: 'Xác nhận xử lý đối soát giao dịch',
      message: confirmText(),
      confirmText: 'Xác nhận xử lý',
      cancelText: 'Kiểm tra lại',
      variant: 'warning',
    });
    if (!ok) return;

    const payload: ResolveBankTransactionInput =
      action === 'ASSIGN'
        ? { action, reason: reason.trim(), [assignBy]: assignValue.trim() }
        : action === 'CREDIT_WALLET'
          ? { action, reason: reason.trim(), customerEmail: customerEmail.trim() }
          : { action, reason: reason.trim() };

    setIsSubmitting(true);
    setError(null);
    try {
      await bankTransactionService.resolve(transaction.id, payload);
      onResolved();
    } catch (err) {
      setError(bankTxnErrorMessage(err, 'Không xử lý được giao dịch'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resolve-bank-txn-title"
      >
        {/* Solid Dark Backdrop with blur */}
        <div
          className="fixed inset-0 bg-[#041320]/80 backdrop-blur-md animate-fade-in"
          onClick={() => !isSubmitting && onClose()}
        />

        {/* Modal Window */}
        <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-h-[92vh] overflow-y-auto animate-scale-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 bg-[#FAFAFA]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#08243D] text-[#F7C948] flex items-center justify-center font-bold shadow-2xs">
                <Landmark className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 id="resolve-bank-txn-title" className="text-base font-bold text-[#08243D] tracking-tight">
                  Xử Lý Đối Soát Giao Dịch Ngân Hàng
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Gán đơn hàng hoặc hoàn tiền cho khách</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Đóng"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* High-Contrast Transaction Summary Card */}
            <div className="bg-[#08243D] text-white rounded-2xl p-4.5 space-y-2.5 shadow-sm border border-slate-800">
              <div className="flex justify-between items-baseline border-b border-white/10 pb-2.5">
                <span className="text-xs text-slate-300 font-medium">Số tiền nhận thực tế:</span>
                <span className="font-black text-[#F7C948] text-lg tabular-nums">
                  +{formatCurrency(amount)}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-xs text-slate-400 font-medium shrink-0">Nội dung chuyển khoản:</span>
                <span className="font-mono text-xs font-bold text-white text-right break-all bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  {transaction.content || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Mã tham chiếu ngân hàng:</span>
                <span className="font-mono text-xs font-semibold text-teal-300">
                  {transaction.reference_code || `#${transaction.external_id}`}
                </span>
              </div>
              {transaction.note && (
                <div className="pt-1.5 text-xs text-amber-300 font-medium border-t border-white/10">
                  Ghi chú: {transaction.note}
                </div>
              )}
            </div>

            {/* Action options */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold text-[#08243D] uppercase tracking-wider mb-2">
                Chọn phương thức xử lý đối soát
              </legend>
              {ACTIONS.map(({ key, title, description, icon: Icon }) => {
                const isSelected = action === key;
                return (
                  <label
                    key={key}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#08243D] bg-slate-50 shadow-xs ring-1 ring-[#08243D]/20'
                        : 'border-slate-200/80 hover:bg-slate-50/70 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolve-action"
                      value={key}
                      checked={isSelected}
                      onChange={() => setAction(key)}
                      className="mt-1 accent-[#08243D]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#08243D]' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#08243D]' : 'text-slate-800'}`}>
                          {title}
                        </span>
                      </div>
                      <span className="block text-[11px] text-slate-500 leading-relaxed mt-1">
                        {description}
                      </span>
                    </div>
                  </label>
                );
              })}
            </fieldset>

            {/* Inputs based on selected action */}
            {action === 'ASSIGN' && (
              <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in">
                <div className="flex gap-2 text-xs font-bold">
                  {(['paymentCode', 'bookingId'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAssignBy(opt)}
                      className={`px-3 py-1.5 rounded-xl cursor-pointer text-xs transition-colors ${
                        assignBy === opt
                          ? 'bg-[#08243D] text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt === 'paymentCode' ? 'Theo mã thanh toán (PC...)' : 'Theo Booking ID (UUID)'}
                    </button>
                  ))}
                </div>
                <input
                  value={assignValue}
                  onChange={(e) => setAssignValue(e.target.value)}
                  placeholder={assignBy === 'paymentCode' ? 'Nhập mã PC... (ví dụ: PC728617HQ7R)' : 'Nhập mã UUID của booking'}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#08243D] focus:ring-2 focus:ring-[#08243D]/10"
                  autoFocus
                />
              </div>
            )}

            {action === 'CREDIT_WALLET' && (
              <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in">
                <label htmlFor="credit-email" className="text-xs font-bold text-slate-700 block">
                  Email tài khoản PetCare của khách hàng
                </label>
                <input
                  id="credit-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="khachhang@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#08243D] focus:ring-2 focus:ring-[#08243D]/10"
                  autoFocus
                />
              </div>
            )}

            {/* Reason field */}
            <div className="space-y-1.5">
              <label htmlFor="resolve-reason" className="text-xs font-bold text-[#08243D] uppercase tracking-wider block">
                Lý do / Căn cứ đối soát <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="resolve-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Khách gửi biên lai chuyển khoản qua CSKH, đã kiểm tra khớp thời gian và số tiền sao kê MB Bank."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#08243D] focus:ring-2 focus:ring-[#08243D]/10 resize-none transition-all"
              />
              <p className="text-[11px] text-slate-400">
                Thao tác này sẽ được ghi vết vĩnh viễn vào nhật ký hệ thống kèm tài khoản của bạn.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                {error}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reasonOk || !targetOk}
                className="flex-1 py-2.5 bg-[#08243D] hover:bg-[#0c2f4e] text-[#F7C948] font-bold rounded-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Xác nhận đối soát
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
