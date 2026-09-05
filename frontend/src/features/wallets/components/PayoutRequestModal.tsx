import React, { useState } from 'react';
import { usePayoutRequests, useWallet } from '../hooks/useWallet';
import { useBankAccounts } from '../../provider/hooks/useBankAccounts';

interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const { requestPayout, isLoading } = usePayoutRequests();
  const { wallet, refreshWallet } = useWallet();
  const { bankAccounts } = useBankAccounts();
  const [selectedBankId, setSelectedBankId] = useState<string>('');

  React.useEffect(() => {
    if (bankAccounts.length > 0 && !selectedBankId) {
      const defaultBank = bankAccounts.find(b => b.is_default) || bankAccounts[0];
      setSelectedBankId(defaultBank.id);
    }
  }, [bankAccounts, selectedBankId]);

  if (!isOpen) return null;

  const maxAmount = wallet?.balance || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (numAmount > 0 && numAmount <= maxAmount && selectedBankId) {
      // In a real app we might pass selectedBankId to requestPayout
      const success = await requestPayout(numAmount);
      if (success) {
        refreshWallet();
        onClose();
        setAmount('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-md p-6 md:p-8 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Rút tiền về ngân hàng</h2>
          <p className="text-slate-500 text-sm mt-1">
            Số dư khả dụng: <span className="font-semibold text-emerald-600">{maxAmount.toLocaleString('vi-VN')} đ</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Số tiền muốn rút (VNĐ)</label>
            <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số tiền..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-slate-800 font-medium"
                required
                min={10000}
                max={maxAmount}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">đ</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-400">Tối thiểu: 10,000 đ</span>
              <button 
                type="button" 
                onClick={() => setAmount(maxAmount.toString())}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Rút toàn bộ
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tài khoản nhận tiền</label>
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none text-slate-800 font-medium"
              required
            >
              <option value="" disabled>-- Chọn tài khoản ngân hàng --</option>
              {bankAccounts.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bank_name} - {bank.account_number} ({bank.account_name}) {bank.is_default ? '★' : ''}
                </option>
              ))}
            </select>
            {bankAccounts.length === 0 && (
              <p className="text-xs text-rose-500 mt-1">Vui lòng thêm tài khoản ngân hàng trước khi rút tiền.</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || Number(amount) <= 0 || Number(amount) > maxAmount || !selectedBankId}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Xác nhận rút tiền'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
