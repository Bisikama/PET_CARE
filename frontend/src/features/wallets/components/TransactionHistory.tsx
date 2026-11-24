import React, { useState } from 'react';
import { Receipt, ArrowUpRight, ArrowDownLeft, Lock, RefreshCw } from 'lucide-react';
import { useWalletTransactions } from '../hooks/useWallet';
import { WalletTransactionType } from '../types/wallet.types';

const DEFAULT_CONFIG = {
  label: 'Giao dịch ví',
  color: 'text-slate-700 bg-slate-100 border-slate-200',
  isPositive: true,
  icon: <Receipt className="w-4 h-4" />,
};

const TYPE_CONFIG: Record<
  WalletTransactionType,
  { label: string; color: string; icon: React.ReactNode; isPositive: boolean }
> = {
  CREDIT: {
    label: 'Cộng tiền vào ví',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    isPositive: true,
    icon: <ArrowDownLeft className="w-4 h-4" />,
  },
  DEBIT: {
    label: 'Trừ tiền ví',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    isPositive: false,
    icon: <ArrowUpRight className="w-4 h-4" />,
  },
  DEPOSIT: {
    label: 'Nạp tiền vào ví',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    isPositive: true,
    icon: <ArrowDownLeft className="w-4 h-4" />,
  },
  PAYOUT: {
    label: 'Rút tiền về ngân hàng',
    color: 'text-amber-800 bg-amber-50 border-amber-200',
    isPositive: false,
    icon: <ArrowUpRight className="w-4 h-4" />,
  },
  PAYMENT: {
    label: 'Thanh toán dịch vụ',
    color: 'text-[#08243D] bg-slate-100 border-slate-200',
    isPositive: false,
    icon: <ArrowUpRight className="w-4 h-4" />,
  },
  REFUND: {
    label: 'Hoàn tiền ký quỹ Escrow',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
    isPositive: true,
    icon: <RefreshCw className="w-4 h-4" />,
  },
  ESCROW_HOLD: {
    label: 'Tạm giữ ký quỹ Escrow',
    color: 'text-amber-800 bg-amber-50 border-amber-200',
    isPositive: false,
    icon: <Lock className="w-4 h-4" />,
  },
  ESCROW_RELEASE: {
    label: 'Giải ngân dịch vụ Escrow',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    isPositive: true,
    icon: <ArrowDownLeft className="w-4 h-4" />,
  },
  FEE_DEDUCTION: {
    label: 'Khấu trừ phí nền tảng',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    isPositive: false,
    icon: <ArrowUpRight className="w-4 h-4" />,
  },
};

export const TransactionHistory = () => {
  const { transactions, isLoading } = useWalletTransactions();
  const [filter, setFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  const filtered = React.useMemo(() => {
    if (filter === 'ALL') return transactions;
    return transactions.filter((tx) => {
      const cfg = TYPE_CONFIG[tx.type];
      const isPos = cfg ? cfg.isPositive : (tx.amount ?? 0) >= 0;
      return filter === 'IN' ? isPos : !isPos;
    });
  }, [transactions, filter]);

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-200/80 shadow-[0_12px_32px_-16px_rgba(8,36,61,0.08)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#08243D] text-[#F7C948] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#08243D]">Sổ Cái & Lịch Sử Biến Động Số Dư</h3>
            <p className="text-xs text-slate-500 font-medium">
              Theo dõi mọi giao dịch thanh toán, hoàn tiền và giải ngân ký quỹ Escrow
            </p>
          </div>
        </div>

        <div className="inline-flex p-1 rounded-2xl bg-slate-100 self-start sm:self-center">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'IN', label: 'Tiền vào / Hoàn tiền' },
            { id: 'OUT', label: 'Thanh toán / Ký quỹ' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as 'ALL' | 'IN' | 'OUT')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#08243D] text-[#F7C948] shadow-xs'
                  : 'text-slate-600 hover:text-[#08243D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-18 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50/70 rounded-3xl border border-dashed border-slate-200 space-y-3">
          <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-center mx-auto text-[#08243D]">
            <Receipt className="w-6 h-6 text-[#F7C948]" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <p className="text-[#08243D] font-black text-sm">Chưa phát sinh giao dịch nào</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Các giao dịch thanh toán đơn đặt lịch, hoàn tiền từ hệ thống ký quỹ Escrow hoặc mua gói Hội viên sẽ được lưu trữ tự động tại đây.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tx) => {
            const config = TYPE_CONFIG[tx.type] || {
              ...DEFAULT_CONFIG,
              label: tx.description || tx.type || DEFAULT_CONFIG.label,
              isPositive: (tx.amount ?? 0) >= 0,
            };
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-[#08243D]/20 hover:shadow-sm transition-all rounded-2xl group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm text-[#08243D] truncate">{config.label}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {new Date(tx.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ·{' '}
                      {new Date(tx.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <p className={`text-base font-black tabular-nums ${config.isPositive ? 'text-emerald-600' : 'text-[#08243D]'}`}>
                    {config.isPositive ? '+' : '-'}
                    {Math.abs(tx.amount).toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    Số dư sau GD: {tx.balance_after.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

