'use client';

import * as React from 'react';
import { CheckCircle2, Link2, Loader2, Wallet, X } from 'lucide-react';
import { bankTransactionService } from '../services/bank-transaction.service';
import { bankTxnErrorMessage } from '../hooks/useBankTransactions';
import type { BankTransaction, ResolveBankTransactionInput } from '../types';

type ActionKey = ResolveBankTransactionInput['action'];

const ACTIONS: { key: ActionKey; title: string; description: string; icon: React.ElementType }[] = [
  {
    key: 'ASSIGN',
    title: 'Gán vào đơn',
    description: 'Khách ghi sai/thiếu nội dung. Nhập mã PC… của đơn đặt lịch hoặc đơn mua gói hội viên. Đủ tiền và đơn còn hiệu lực → xác nhận đơn / kích hoạt gói; nếu không → hoàn vào ví khách.',
    icon: Link2,
  },
  {
    key: 'CREDIT_WALLET',
    title: 'Hoàn vào ví khách',
    description: 'Xác định được người chuyển nhưng không gán được đơn. Cộng toàn bộ số tiền vào Ví PetCare của họ.',
    icon: Wallet,
  },
  {
    key: 'MARK_RESOLVED',
    title: 'Đã xử lý ngoài hệ thống',
    description: 'Đã chuyển trả qua ngân hàng, hoặc khoản tiền không liên quan đến nền tảng. Không di chuyển tiền trong hệ thống.',
    icon: CheckCircle2,
  },
];

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

const inputClass =
  'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500';

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
    if (action === 'ASSIGN') return `Gán khoản ${formatCurrency(amount)} vào ${assignBy === 'paymentCode' ? 'mã' : 'booking'} ${assignValue.trim()}?`;
    if (action === 'CREDIT_WALLET') return `Cộng ${formatCurrency(amount)} vào ví của ${customerEmail.trim()}? Thao tác này chuyển tiền thật vào ví khách.`;
    return 'Đánh dấu giao dịch này đã được xử lý ngoài hệ thống?';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonOk || !targetOk) return;
    if (!window.confirm(confirmText())) return;

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
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolve-bank-txn-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h3 id="resolve-bank-txn-title" className="text-lg font-black text-slate-800">
            Xử lý giao dịch chưa khớp
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Thông tin giao dịch */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Số tiền</span>
              <span className="font-black text-emerald-700">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 shrink-0">Nội dung CK</span>
              <span className="font-mono text-xs text-slate-800 text-right break-all">{transaction.content || '—'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Mã tham chiếu</span>
              <span className="font-mono text-xs text-slate-800">{transaction.reference_code || '—'}</span>
            </div>
            {transaction.note && <p className="text-xs text-amber-700 pt-1">{transaction.note}</p>}
          </div>

          {/* Chọn cách xử lý */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-bold text-slate-700 mb-2">Cách xử lý</legend>
            {ACTIONS.map(({ key, title, description, icon: Icon }) => (
              <label
                key={key}
                className={`flex gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                  action === key ? 'border-teal-500 bg-teal-50/60' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="resolve-action"
                  value={key}
                  checked={action === key}
                  onChange={() => setAction(key)}
                  className="mt-1 accent-teal-600"
                />
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${action === key ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>
                  <span className="block text-sm font-bold text-slate-800">{title}</span>
                  <span className="block text-xs text-slate-500 leading-relaxed mt-0.5">{description}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {/* Thông tin theo cách xử lý */}
          {action === 'ASSIGN' && (
            <div className="space-y-2">
              <div className="flex gap-2 text-xs font-bold">
                {(['paymentCode', 'bookingId'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAssignBy(opt)}
                    className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                      assignBy === opt ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt === 'paymentCode' ? 'Theo mã thanh toán' : 'Theo Booking ID'}
                  </button>
                ))}
              </div>
              <input
                value={assignValue}
                onChange={(e) => setAssignValue(e.target.value)}
                placeholder={assignBy === 'paymentCode' ? 'VD: PCX7K2M9QA4B' : 'UUID của booking'}
                className={`${inputClass} font-mono`}
                autoFocus
              />
            </div>
          )}

          {action === 'CREDIT_WALLET' && (
            <div className="space-y-1.5">
              <label htmlFor="credit-email" className="text-xs font-bold text-slate-700">
                Email tài khoản khách
              </label>
              <input
                id="credit-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="khachhang@example.com"
                className={inputClass}
                autoFocus
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="resolve-reason" className="text-xs font-bold text-slate-700">
              Lý do / bằng chứng <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="resolve-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="VD: Khách gửi ảnh chụp giao dịch qua CSKH, đã đối chiếu sao kê MB."
              className={`${inputClass} resize-none`}
            />
            <p className="text-[11px] text-slate-400">Được ghi vào nhật ký hệ thống cùng tài khoản của bạn.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3" role="alert">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm cursor-pointer"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reasonOk || !targetOk}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Xác nhận xử lý
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
