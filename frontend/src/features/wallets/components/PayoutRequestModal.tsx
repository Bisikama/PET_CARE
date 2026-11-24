import React, { useId, useState } from 'react';
import { ModalDialog, SuccessDialog } from '@/components/ui/ModalDialog';
import { useBankAccounts } from '@/features/provider/hooks/useBankAccounts';
import { usePayoutRequests, useWallet } from '../hooks/useWallet';

interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { requestPayout, isLoading } = usePayoutRequests();
  const { wallet, refreshWallet } = useWallet();
  const { bankAccounts } = useBankAccounts();
  const [bankChoice, setBankChoice] = useState('');
  const amountId = useId();
  const bankId = useId();

  if (!isOpen) return null;

  const maxAmount = wallet?.balance || 0;
  const selectedBank = bankAccounts.find((bank) => bank.id === bankChoice)
    || bankAccounts.find((bank) => bank.is_default)
    || bankAccounts[0];
  const selectedBankId = selectedBank?.id ?? '';

  const handleClose = () => {
    setErrorMsg(null);
    setAmount('');
    setIsSubmitted(false);
    onClose();
  };

  if (isSubmitted) {
    return (
      <SuccessDialog
        title="Đã gửi yêu cầu rút tiền"
        message="Yêu cầu đang chờ duyệt. Bạn có thể theo dõi số tiền chờ duyệt trong ví."
        onClose={handleClose}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);
    const numAmount = Number(amount);

    if (!selectedBankId) {
      setErrorMsg('Vui lòng chọn tài khoản ngân hàng để rút tiền');
      return;
    }

    if (numAmount < 10000) {
      setErrorMsg('Số tiền rút tối thiểu là 10,000 đ');
      return;
    }

    if (numAmount > maxAmount) {
      setErrorMsg('Số dư khả dụng không đủ để rút tiền');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestPayout(numAmount, selectedBankId);
      if (result.success) {
        void refreshWallet();
        setIsSubmitted(true);
      } else {
        setErrorMsg(result.message || 'Yêu cầu rút tiền thất bại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalDialog title="Rút tiền về ngân hàng" onClose={handleClose} isBusy={isSubmitting}>
      <p className="mb-4 text-sm text-slate-500">
        Số dư khả dụng: <span className="font-semibold text-emerald-600">{maxAmount.toLocaleString('vi-VN')} đ</span>
      </p>

      {errorMsg && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset disabled={isSubmitting} className="space-y-6">
          <div>
            <label htmlFor={amountId} className="block text-sm font-medium text-slate-700 mb-2">Số tiền muốn rút (VNĐ)</label>
            <div className="relative">
              <input
                id={amountId}
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
            <label htmlFor={bankId} className="block text-sm font-medium text-slate-700 mb-2">Tài khoản nhận tiền</label>
            <select
              id={bankId}
              value={selectedBankId}
              onChange={(e) => setBankChoice(e.target.value)}
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
            {isSubmitting ? 'Đang gửi yêu cầu...' : 'Xác nhận rút tiền'}
          </button>
        </fieldset>
      </form>
    </ModalDialog>
  );
};
