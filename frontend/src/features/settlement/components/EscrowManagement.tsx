import React, { useState, useEffect } from 'react';
import { usePayoutRequests } from '../hooks/usePayoutRequests';
import { useSettlementActions } from '../hooks/useSettlementActions';
import { ShieldCheck, CheckCircle, XCircle, Search, DollarSign, Wallet, Clock, Lock, ArrowUpRight, Landmark } from 'lucide-react';
import { adminService } from '@/features/admin/services/admin.service';
import { walletService } from '@/features/wallets/services/wallet.service';
import { Wallet as WalletData } from '@/features/wallets/types/wallet.types';

export const EscrowManagement = () => {
  const { payoutRequests, isLoading, error } = usePayoutRequests();
  const { approvePayout, rejectPayout, releaseEscrow, refundCustomer } = useSettlementActions();
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [stats, setStats] = useState<{ totalRevenue?: number; totalBookings?: number } | null>(null);
  const [adminWallet, setAdminWallet] = useState<WalletData | null>(null);
  
  // Modal State for Admin Withdrawal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
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

  const pendingRequests = payoutRequests.filter(r => r.status === 'PENDING');
  const pendingTotalAmount = pendingRequests.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleRelease = async () => {
    if (!bookingIdInput) return;
    try {
      await releaseEscrow(bookingIdInput);
      alert('Giải phóng Escrow thành công');
      setBookingIdInput('');
      fetchAdminWallet();
    } catch (e) {
      alert('Lỗi giải phóng Escrow. Vui lòng kiểm tra lại ID.');
    }
  };

  const handleRefund = async () => {
    if (!bookingIdInput) return;
    try {
      await refundCustomer(bookingIdInput);
      alert('Hoàn tiền cho Customer thành công');
      setBookingIdInput('');
      fetchAdminWallet();
    } catch (e) {
      alert('Lỗi hoàn tiền. Vui lòng kiểm tra lại ID.');
    }
  };

  const handleAdminWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (adminWallet && amountNum > adminWallet.balance) {
      alert('Số tiền rút vượt quá số dư ví hoa hồng khả dụng');
      return;
    }

    setIsWithdrawing(true);
    try {
      await walletService.adminWithdraw({
        amount: amountNum,
        note: withdrawNote || 'Admin rút doanh thu hoa hồng về ngân hàng',
      });
      alert('Rút tiền hoa hồng về ngân hàng thành công!');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawNote('');
      fetchAdminWallet();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Lỗi khi rút tiền');
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
                onClick={() => setShowWithdrawModal(true)}
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
                      onClick={() => rejectPayout(req.id)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle size={14} /> Từ chối
                    </button>
                    <button 
                      onClick={() => approvePayout(req.id)}
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
                onClick={handleRelease}
                disabled={!bookingIdInput}
                className="flex flex-col items-center justify-center p-5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-2xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <DollarSign size={24} />
                <span className="font-bold text-sm text-center">Giải phóng cho Provider</span>
                <span className="text-[10px] text-teal-600/70 text-center font-medium">Chuyển tiền vào ví Provider</span>
              </button>

              <button 
                onClick={handleRefund}
                disabled={!bookingIdInput}
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

      {/* Admin Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600" />
                Rút Tiền Hoa Hồng Sàn
              </h3>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center">
              <span className="text-xs font-semibold text-emerald-800">Số dư ví Admin khả dụng:</span>
              <span className="text-base font-black text-emerald-700">
                {adminWallet ? formatCurrency(adminWallet.balance) : '0 đ'}
              </span>
            </div>

            <form onSubmit={handleAdminWithdraw} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Số tiền rút (VNĐ)</label>
                <input
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
                <label className="text-xs font-bold text-slate-700">Ghi chú / Lý do rút</label>
                <input
                  type="text"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  placeholder="Rút tiền hoa hồng về ngân hàng công ty..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

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
                  disabled={isWithdrawing}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isWithdrawing ? 'Đang xử lý...' : 'Xác Nhận Rút'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
