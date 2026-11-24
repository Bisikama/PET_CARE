import React, { useState } from 'react';
import { Wallet, Clock, ArrowDownToLine } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { PayoutRequestModal } from './PayoutRequestModal';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export const WalletOverview = () => {
  const { wallet, isLoading } = useWallet();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isCustomer = user?.role === 'CUSTOMER' || (user?.role !== 'PROVIDER' && user?.role !== 'ADMIN');

  return (
    <div className="bg-[#08243D] rounded-3xl p-7 md:p-9 text-white relative overflow-hidden shadow-sm animate-fade-in select-none">
      <div className="absolute right-0 top-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(247,201,72,0.12),transparent_65%)] pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F7C948]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white block">Ví Điện Tử PetCare</span>
              <span className="text-xs text-slate-400">Thanh toán & hoàn tiền tự động</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {wallet?.status || 'ACTIVE'}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-slate-300 text-xs font-medium uppercase tracking-wider mb-1">Số dư khả dụng</p>
            {isLoading ? (
              <div className="h-10 w-48 bg-white/10 animate-pulse rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight tabular-nums">
                  {(wallet?.balance || 0).toLocaleString('vi-VN')}
                </h2>
                <span className="text-lg text-[#F7C948] font-bold">đ</span>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#F7C948]" />
              <span>
                Đang ký quỹ / Chờ xử lý: <strong className="text-white">{(wallet?.pending_balance || 0).toLocaleString('vi-VN')} đ</strong>
              </span>
            </div>
          </div>

          {!isCustomer && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-[#F7C948] hover:bg-[#e5b83b] text-[#08243D] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
            >
              <ArrowDownToLine className="w-4 h-4" />
              Rút tiền
            </button>
          )}
        </div>
      </div>

      {!isCustomer && isModalOpen && (
        <PayoutRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};


