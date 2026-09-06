import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { PayoutRequestModal } from './PayoutRequestModal';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export const WalletOverview = () => {
  const { wallet, isLoading } = useWallet();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-[32px] p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-900/20">
      {/* Decorative background elements */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
            <span className="font-medium text-emerald-100">Ví Bisikama</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-emerald-200 uppercase tracking-wider">{wallet?.status || 'ACTIVE'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4 items-end">
          <div>
            <p className="text-emerald-200 text-sm font-medium mb-1">Số dư khả dụng</p>
            {isLoading ? (
              <div className="h-10 w-48 bg-white/10 animate-pulse rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {(wallet?.balance || 0).toLocaleString('vi-VN')}
                </h2>
                <span className="text-xl text-emerald-300 font-medium">đ</span>
              </div>
            )}
            
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-100/70">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Chờ duyệt: <strong className="text-white">{(wallet?.pending_balance || 0).toLocaleString('vi-VN')} đ</strong></span>
            </div>
          </div>

          {!isCustomer && (
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-2xl transition-all shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 19V5"/></svg>
                Rút tiền
              </button>
            </div>
          )}
        </div>
      </div>

      {!isCustomer && isModalOpen && (
        <PayoutRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
