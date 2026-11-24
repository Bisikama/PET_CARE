import React, { useState, useEffect, useId, type ComponentProps } from 'react';
import { usePayoutRequests } from '../hooks/usePayoutRequests';
import { useSettlementActions } from '../hooks/useSettlementActions';
import type { PayoutRequest } from '../types';
import { CheckCircle, XCircle, Search, DollarSign, Wallet, Clock, Lock, ArrowUpRight, Landmark } from 'lucide-react';
import { ModalDialog, SuccessDialog } from '@/components/ui/ModalDialog';
import { adminService } from '@/features/admin/services/admin.service';
import { walletService } from '@/features/wallets/services/wallet.service';
import type { Wallet as WalletData } from '@/features/wallets/types/wallet.types';
import { getApiErrorMessage } from '@/lib/api-error';

type SettlementAction =
  | { kind: 'approve' | 'reject'; request: PayoutRequest }
  | { kind: 'release' | 'refund'; bookingId: string };

const actionLabels = {
  approve: { title: 'Xác nhận duyệt giải ngân', confirm: 'Duyệt & Giải ngân', error: 'Duyệt giải ngân thất bại. Vui lòng thử lại.' },
  reject: { title: 'Từ chối yêu cầu rút tiền', confirm: 'Xác nhận từ chối', error: 'Từ chối yêu cầu thất bại. Vui lòng thử lại.' },
  release: { title: 'Xác nhận giải phóng ký quỹ', confirm: 'Giải phóng ký quỹ', error: 'Giải phóng ký quỹ thất bại. Vui lòng thử lại.' },
  refund: { title: 'Xác nhận hoàn tiền', confirm: 'Hoàn tiền', error: 'Hoàn tiền thất bại. Vui lòng thử lại.' },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export const EscrowManagement = () => {
  const { payoutRequests, isLoading, error } = usePayoutRequests();
  const { approvePayout, rejectPayout, releaseEscrow, refundCustomer } = useSettlementActions();
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [stats, setStats] = useState<{ totalRevenue?: number; totalBookings?: number } | null>(null);
  const [adminWallet, setAdminWallet] = useState<WalletData | null>(null);
  
  const [feedback, setFeedback] = useState<Omit<ComponentProps<typeof SuccessDialog>, 'onClose'> | null>(null);
  const [settlementAction, setSettlementAction] = useState<SettlementAction | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchAdminWallet = () => {
    walletService.getMyWallet()
      .then((res) => setAdminWallet(res))
      .catch((err) => console.error('Error fetching admin wallet:', err));
  };

  useEffect(() => {
    adminService.getDashboardStats()
      .then((res) => setStats(res))
      .catch((err) => console.error('Error fetching admin stats in Escrow page:', err));

    fetchAdminWallet();
  }, []);

  const isPending = (status?: string) => status === 'PAYOUT_PENDING' || status === 'PENDING';
  const pendingRequests = payoutRequests.filter(r => isPending(r.status));
  const pendingTotalAmount = pendingRequests.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSettlementAction = async (action: SettlementAction, reason: string) => {
    if ('request' in action) {
      const { request, kind } = action;
      if (kind === 'approve') {
        await approvePayout(request.id);
      } else {
        await rejectPayout(request.id, reason);
      }
      setFeedback({
        title: kind === 'approve' ? 'Đã duyệt giải ngân' : 'Đã từ chối yêu cầu rút tiền',
        message: `Yêu cầu rút ${formatCurrency(request.amount)} của ${request.providerName || 'đối tác'} đã được xử lý.`,
      });
    } else {
      const { bookingId, kind } = action;
      const isRelease = kind === 'release';
      await (isRelease ? releaseEscrow : refundCustomer)(bookingId, reason);
      setBookingIdInput('');
      setFeedback({
        title: isRelease ? 'Đã giải phóng ký quỹ' : 'Đã hoàn tiền cho khách hàng',
        message: `Đã cập nhật giao dịch cho booking ${bookingId}.`,
      });
    }
    setSettlementAction(null);
    fetchAdminWallet();
  };

  const handleAdminWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isWithdrawing) return;
    setWithdrawError(null);
    const amountNum = Number(withdrawAmount);
    if (!Number.isInteger(amountNum) || amountNum < 1000) {
      setWithdrawError('Vui lòng nhập số tiền nguyên từ 1.000 đ trở lên.');
      return;
    }
    if (adminWallet && amountNum > adminWallet.balance) {
      setWithdrawError('Số tiền rút vượt quá số dư ví hoa hồng khả dụng.');
      return;
    }

    setIsWithdrawing(true);
    try {
      await walletService.adminWithdraw({
        amount: amountNum,
        note: withdrawNote || 'Admin rút doanh thu hoa hồng về ngân hàng',
      });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawNote('');
      fetchAdminWallet();
      setFeedback({
        title: 'Đã rút tiền hoa hồng',
        message: `Giao dịch rút ${formatCurrency(amountNum)} từ ví hoa hồng đã được xử lý.`,
      });
    } catch (error) {
      setWithdrawError(getApiErrorMessage(error, 'Rút tiền hoa hồng thất bại. Vui lòng thử lại.'));
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Escrow Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total GMV (Renamed for clarity) */}
        <div className="bg-slate-900 p-5 rounded-3xl text-white shadow-lg space-y-2 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-teal-400 uppercase tracking-wider">Tổng Giá Trị Giao Dịch (GMV)</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-amber-400 tracking-tight">
              {stats ? formatCurrency(stats.totalRevenue || 0) : '0 đ'}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Tổng dòng tiền dịch vụ đã hoàn tất qua Escrow</p>
          </div>
        </div>

        {/* Card 2: Admin Commission Wallet (API /wallets/me) */}
        <div className="bg-gradient-to-br from-teal-900 to-emerald-950 p-5 rounded-3xl text-white shadow-lg space-y-2 relative overflow-hidden flex flex-col justify-between border border-teal-800/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider">Ví Hoa Hồng Sàn (Admin)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-black text-emerald-300 tracking-tight">
                {adminWallet ? formatCurrency(adminWallet.balance || 0) : '0 đ'}
              </div>
              <button
                onClick={() => {
                  setWithdrawError(null);
                  setShowWithdrawModal(true);
                }}
                className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                Rút Tiền <ArrowUpRight size={12} />
              </button>
            </div>
            <p className="text-[11px] text-emerald-200/70 font-medium mt-1">Hoa hồng 10% thực nhận trong ví Admin</p>
          </div>
        </div>

        {/* Card 3: Pending Payouts */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Tiền Rút Đang Chờ Duyệt</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 tracking-tight">
              {formatCurrency(pendingTotalAmount)}
            </div>
            <p className="text-[11px] text-amber-600 font-bold mt-1">{pendingRequests.length} yêu cầu rút tiền từ Provider</p>
          </div>
        </div>

        {/* Card 4: Escrow Status */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Trạng Thái Ký Quỹ</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-base font-black text-emerald-700">100% An Toàn (Active)</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Hệ thống Escrow hoạt động tự động 24/7</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payout Requests */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-lg font-bold text-slate-800">Yêu cầu rút tiền</h3>
            <p className="text-sm text-slate-500">Danh sách các Provider yêu cầu rút tiền từ ví Escrow.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[500px]">
            {isLoading ? (
              <div className="text-center py-10 text-slate-500 font-medium text-sm">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500 font-medium text-sm">{error}</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-medium text-sm">Không có yêu cầu nào đang chờ</div>
            ) : (
              pendingRequests.map(req => (
                <div key={req.id} className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex flex-col gap-3 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-800">{req.providerName}</div>
                      <div className="text-xs text-slate-500 mt-1">Ngân hàng: <span className="font-semibold text-slate-700">{req.bankName}</span></div>
                      <div className="text-xs text-slate-500">STK: <span className="font-semibold text-slate-700">{req.accountNumber}</span> - {req.accountName}</div>
                    </div>
                    <div className="font-extrabold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-sm border border-amber-100">
                      {new Intl.NumberFormat('vi-VN').format(req.amount)} đ
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button 
                      onClick={() => setSettlementAction({ kind: 'reject', request: req })}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle size={14} /> Từ chối
                    </button>
                    <button 
                      onClick={() => setSettlementAction({ kind: 'approve', request: req })}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle size={14} /> Duyệt & Giải ngân
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Manual Actions */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-lg font-bold text-slate-800">Thao tác thủ công</h3>
            <p className="text-sm text-slate-500">Giải quyết tranh chấp hoặc hoàn tiền ngoại lệ.</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Mã Booking (Booking ID)</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={bookingIdInput}
                  onChange={(e) => setBookingIdInput(e.target.value)}
                  placeholder="Nhập mã booking cần xử lý..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setSettlementAction({ kind: 'release', bookingId: bookingIdInput.trim() })}
                disabled={!bookingIdInput.trim()}
                className="flex flex-col items-center justify-center p-5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-2xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <DollarSign size={24} />
                <span className="font-bold text-sm text-center">Giải phóng cho Provider</span>
                <span className="text-[10px] text-teal-600/70 text-center font-medium">Chuyển tiền vào ví Provider</span>
              </button>

              <button 
                onClick={() => setSettlementAction({ kind: 'refund', bookingId: bookingIdInput.trim() })}
                disabled={!bookingIdInput.trim()}
                className="flex flex-col items-center justify-center p-5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-2xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <DollarSign size={24} />
                <span className="font-bold text-sm text-center">Hoàn tiền Customer</span>
                <span className="text-[10px] text-rose-600/70 text-center font-medium">Customer nhận lại 100% tiền</span>
              </button>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                <strong className="block mb-1 font-bold text-amber-800">Lưu ý:</strong> 
                Mọi thao tác thủ công đều được ghi log lưu vết trên hệ thống để đảm bảo minh bạch.
                Chỉ thực hiện khi có bằng chứng rõ ràng hoặc đã thông qua hội đồng quản trị.
              </p>
            </div>
          </div>
        </div>
      </div>

      {settlementAction && (
        <SettlementActionDialog
          action={settlementAction}
          onClose={() => setSettlementAction(null)}
          onConfirm={(reason) => handleSettlementAction(settlementAction, reason)}
        />
      )}

      {feedback && <SuccessDialog {...feedback} onClose={() => setFeedback(null)} />}

      {showWithdrawModal && (
        <ModalDialog
          title="Rút tiền hoa hồng sàn"
          onClose={() => setShowWithdrawModal(false)}
          isBusy={isWithdrawing}
        >
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center">
            <span className="text-xs font-semibold text-emerald-800">Số dư ví Admin khả dụng:</span>
            <span className="text-base font-black text-emerald-700">
              {adminWallet ? formatCurrency(adminWallet.balance) : '0 đ'}
            </span>
          </div>

          <form onSubmit={handleAdminWithdraw} className="mt-4" noValidate>
            <fieldset disabled={isWithdrawing} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="commission-withdraw-amount" className="text-xs font-bold text-slate-700">Số tiền rút (VNĐ)</label>
                <input
                  id="commission-withdraw-amount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Ví dụ: 100000"
                  required
                  min={1000}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="commission-withdraw-note" className="text-xs font-bold text-slate-700">Ghi chú / Lý do rút</label>
                <input
                  id="commission-withdraw-note"
                  type="text"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  placeholder="Rút tiền hoa hồng về ngân hàng công ty..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {withdrawError && <p role="alert" className="text-sm font-medium text-rose-700">{withdrawError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isWithdrawing ? 'Đang xử lý...' : 'Xác Nhận Rút'}
                </button>
              </div>
            </fieldset>
          </form>
        </ModalDialog>
      )}
    </div>
  );
};

interface SettlementActionDialogProps {
  action: SettlementAction;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

function SettlementActionDialog({ action, onClose, onConfirm }: SettlementActionDialogProps) {
  const { kind } = action;
  const needsReason = kind !== 'approve';
  const isDestructive = kind === 'reject' || kind === 'refund';
  const labels = actionLabels[kind];
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reasonId = useId();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || (needsReason && !reason.trim())) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, labels.error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalDialog title={labels.title} onClose={onClose} isBusy={isSubmitting}>
      <p className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        {'request' in action ? (
          <>Yêu cầu rút <strong>{formatCurrency(action.request.amount)}</strong> của{' '}
            <strong>{action.request.providerName || 'đối tác'}</strong>.</>
        ) : (
          <>Mã booking <strong>{action.bookingId}</strong></>
        )}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {needsReason && (
          <div className="space-y-2">
            <label htmlFor={reasonId} className="block text-sm font-semibold text-slate-700">
              {kind === 'reject' ? 'Lý do từ chối (bắt buộc)' : 'Lý do thực hiện (bắt buộc)'}
            </label>
            <textarea
              id={reasonId}
              required
              rows={3}
              value={reason}
              disabled={isSubmitting}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>
        )}
        {error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold hover:bg-slate-200 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (needsReason && !reason.trim())}
            className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {isSubmitting ? 'Đang xử lý...' : labels.confirm}
          </button>
        </div>
      </form>
    </ModalDialog>
  );
}
