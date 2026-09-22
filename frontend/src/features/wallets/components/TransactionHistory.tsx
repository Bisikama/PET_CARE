import React from 'react';
import { useWalletTransactions } from '../hooks/useWallet';
import { WalletTransactionType } from '../types/wallet.types';


const DEFAULT_CONFIG = {
  label: 'Giao dịch',
  color: 'text-slate-600 bg-slate-100',
  isPositive: true,
  icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
};

const TYPE_CONFIG: Record<WalletTransactionType, { label: string, color: string, icon: React.ReactNode, isPositive: boolean }> = {
  CREDIT: { label: 'Cộng tiền', color: 'text-emerald-600 bg-emerald-50', isPositive: true, icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> },
  DEBIT: { label: 'Trừ tiền', color: 'text-rose-600 bg-rose-50', isPositive: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg> },
  DEPOSIT: { label: 'Nạp tiền', color: 'text-blue-600 bg-blue-50', isPositive: true, icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> },
  PAYOUT: { label: 'Rút tiền', color: 'text-orange-600 bg-orange-50', isPositive: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg> },
  PAYMENT: { label: 'Thanh toán', color: 'text-slate-600 bg-slate-100', isPositive: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg> },
  REFUND: { label: 'Hoàn tiền', color: 'text-purple-600 bg-purple-50', isPositive: true, icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg> },
  ESCROW_HOLD: { label: 'Ký quỹ', color: 'text-amber-600 bg-amber-50', isPositive: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
  ESCROW_RELEASE: { label: 'Nhận tiền DV', color: 'text-emerald-600 bg-emerald-50', isPositive: true, icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> },
  FEE_DEDUCTION: { label: 'Phí nền tảng', color: 'text-rose-600 bg-rose-50', isPositive: false, icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
};

export const TransactionHistory = () => {
  const { transactions, isLoading } = useWalletTransactions();

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Lịch sử giao dịch</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <p className="text-slate-500 font-medium">Chưa có giao dịch nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map(tx => {
            const config = TYPE_CONFIG[tx.type] || {
              ...DEFAULT_CONFIG,
              label: tx.description || tx.type || DEFAULT_CONFIG.label,
              isPositive: (tx.amount ?? 0) >= 0
            };
            return (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-2xl group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{config.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(tx.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(tx.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-bold ${config.isPositive ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {config.isPositive ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    SD: {tx.balance_after.toLocaleString('vi-VN')} đ
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
