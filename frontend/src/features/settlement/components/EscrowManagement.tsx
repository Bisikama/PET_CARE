'use client';

import React, { useState, useEffect, useId, type ComponentProps } from 'react';
import { usePayoutRequests } from '../hooks/usePayoutRequests';
import { useSettlementActions } from '../hooks/useSettlementActions';
import type { PayoutRequest } from '../types';
import {
  AlertTriangle, ArrowUpRight, Check, CheckCircle2, Clock, Copy, DollarSign, Info,
  Landmark, RotateCw, Search, Shield, ShieldCheck, Wallet, XCircle,
} from 'lucide-react';
import { ModalDialog, SuccessDialog } from '@/components/ui/ModalDialog';
import { adminService } from '@/features/admin/services/admin.service';
import { bookingService } from '@/features/booking/services/booking.service';
import { walletService } from '@/features/wallets/services/wallet.service';
import type { Wallet as WalletData } from '@/features/wallets/types/wallet.types';
import { getApiErrorMessage } from '@/lib/api-error';

type PayoutFilter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

interface BookingPreview {
  status?: string;
  customer?: { fullName?: string };
  customer_name?: string;
  provider?: { users?: { fullName?: string } };
  provider_name?: string;
  total_price?: number | string;
  total_amount?: number | string;
  amount?: number | string;
}

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
  const { payoutRequests, isLoading, error, refreshPayoutRequests } = usePayoutRequests();
  const { approvePayout, rejectPayout, releaseEscrow, refundCustomer } = useSettlementActions();
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [stats, setStats] = useState<{ totalRevenue?: number; totalBookings?: number } | null>(null);
  const [adminWallet, setAdminWallet] = useState<WalletData | null>(null);

  const [payoutFilter, setPayoutFilter] = useState<PayoutFilter>('PENDING');
  const [copiedStk, setCopiedStk] = useState<string | null>(null);
  const [isLookingUpBooking, setIsLookingUpBooking] = useState(false);
  const [bookingPreview, setBookingPreview] = useState<BookingPreview | null>(null);
  const [bookingLookupError, setBookingLookupError] = useState<string | null>(null);

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
  const isApproved = (status?: string) => status === 'APPROVED' || status === 'PAID_OUT';
  const isRejected = (status?: string) => status === 'REJECTED' || status === 'FAILED';

  const pendingRequests = payoutRequests.filter((r) => isPending(r.status));
  const approvedRequests = payoutRequests.filter((r) => isApproved(r.status));
  const rejectedRequests = payoutRequests.filter((r) => isRejected(r.status));

  const filteredRequests = payoutRequests.filter((r) => {
    if (payoutFilter === 'PENDING') return isPending(r.status);
    if (payoutFilter === 'APPROVED') return isApproved(r.status);
    if (payoutFilter === 'REJECTED') return isRejected(r.status);
    return true;
  });

  const pendingTotalAmount = pendingRequests.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const formatDateTime = (val?: string | null) => {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopyStk = (stk?: string) => {
    if (!stk) return;
    navigator.clipboard.writeText(stk);
    setCopiedStk(stk);
    setTimeout(() => setCopiedStk(null), 2000);
  };

  const handleLookupBooking = async () => {
    const cleanId = bookingIdInput.trim();
    if (!cleanId || isLookingUpBooking) return;

    setIsLookingUpBooking(true);
    setBookingLookupError(null);
    setBookingPreview(null);
    try {
      const data = await bookingService.getBooking(cleanId);
      setBookingPreview(data?.data || data);
    } catch (error) {
      setBookingLookupError(getApiErrorMessage(error, 'Không thể tra cứu đơn đặt lịch. Vui lòng kiểm tra lại mã.'));
    } finally {
      setIsLookingUpBooking(false);
    }
  };

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
      setBookingPreview(null);
      setBookingLookupError(null);
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
        note: withdrawNote || 'Admin rút doanh thu hoa hồng về ngân hàng công ty',
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
    <div className="space-y-8 animate-fade-in select-none">
      {/* ── Top Overview: 4 Sovereign Financial Metric Cards ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {/* Card 1: Admin Commission Wallet */}
        <div className="relative bg-[#08243D] p-6 rounded-3xl text-white shadow-sm border border-slate-800/90 flex flex-col justify-between overflow-hidden">
          <div className="absolute right-0 top-0 w-44 h-44 bg-[radial-gradient(circle_at_top_right,rgba(247,201,72,0.14),transparent_70%)] pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#F7C948] uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-[#F7C948]" />
              Ví Doanh Thu Sàn (Hoa Hồng)
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline justify-between flex-wrap gap-2">
              <span className="text-[#F7C948]">
                {adminWallet ? formatCurrency(adminWallet.balance || 0) : '0 đ'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setWithdrawError(null);
                  setShowWithdrawModal(true);
                }}
                className="text-xs font-bold text-[#08243D] bg-[#F7C948] hover:bg-[#eab327] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Rút Tiền <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-300 font-normal">
              Hoa hồng 10% thực nhận trích tự động sau khi ca làm hoàn tất
            </p>
          </div>
        </div>

        {/* Card 2: Pending Payouts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Tiền Rút Đang Chờ Duyệt
            </span>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              {pendingRequests.length} yêu cầu
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#08243D] tracking-tight">
              {formatCurrency(pendingTotalAmount)}
            </div>
            <p className="text-[11px] text-slate-400 font-normal mt-1">
              Khoản thu nhập đối tác yêu cầu rút về số tài khoản ngân hàng
            </p>
          </div>
        </div>

        {/* Card 3: Total GMV */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-slate-500" />
              Tổng Doanh Số Đặt Lịch (GMV)
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#08243D] tracking-tight">
              {stats ? formatCurrency(stats.totalRevenue || 0) : '0 đ'}
            </div>
            <p className="text-[11px] text-slate-400 font-normal mt-1">
              Toàn bộ dòng tiền dịch vụ thanh toán luân chuyển qua hệ sinh thái
            </p>
          </div>
        </div>

        {/* Card 4: Escrow Protection State */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Cơ Chế Ký Quỹ Escrow
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-base sm:text-lg font-bold text-emerald-700">100% An Toàn Tự Động</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal mt-1">
              Khóa tiền an toàn và chỉ giải ngân khi khách hàng hài lòng
            </p>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Content Grid: Payouts vs Manual Action ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Payout Requests List (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold text-[#08243D] tracking-tight">
                  Duyệt Yêu Cầu Rút Tiền Của Đối Tác
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#08243D]/5 text-[#08243D] border border-slate-200">
                  {payoutRequests.length} đơn rút
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Đối soát tài khoản ngân hàng thụ hưởng và tiến hành giải ngân thu nhập đối tác.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshPayoutRequests}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors cursor-pointer self-start sm:self-auto font-semibold"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              Làm mới
            </button>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl overflow-x-auto">
            {[
              { id: 'PENDING', label: 'Chờ duyệt', count: pendingRequests.length },
              { id: 'APPROVED', label: 'Đã giải ngân', count: approvedRequests.length },
              { id: 'REJECTED', label: 'Đã từ chối', count: rejectedRequests.length },
              { id: 'ALL', label: 'Tất cả lịch sử', count: payoutRequests.length },
            ].map((tab) => {
              const isActive = payoutFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPayoutFilter(tab.id as PayoutFilter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#08243D] shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-[#08243D] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Guidelines Box */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-2xl flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block mb-0.5">Quy trình giải ngân chuẩn:</strong>
              1. Bấm nút sao chép STK ➔ 2. Mở App ngân hàng chuyển đúng số tiền ➔ 3. Bấm <strong>Duyệt &amp; Giải ngân</strong> để hệ thống cập nhật số dư.
            </div>
          </div>

          {/* Payout list container */}
          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="text-center py-14 text-slate-400 text-xs font-semibold">
                Đang nạp danh sách yêu cầu rút tiền...
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200">
                {error}
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl p-6 space-y-2">
                <Landmark className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Không có yêu cầu rút tiền nào</p>
                <p className="text-xs text-slate-400">
                  {payoutFilter === 'PENDING'
                    ? 'Hiện không có đối tác nào đang chờ duyệt rút tiền.'
                    : 'Không tìm thấy bản ghi phù hợp với bộ lọc hiện tại.'}
                </p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const reqStatus = req.status;
                const pending = isPending(reqStatus);
                const approved = isApproved(reqStatus);

                const bankName = req.bankName || req.bank_details?.bank_name || 'Ngân hàng';
                const accountNumber = req.accountNumber || req.bank_details?.account_number || '—';
                const accountName = req.accountName || req.bank_details?.account_name || req.providerName || '—';

                return (
                  <div
                    key={req.id}
                    className="p-5 bg-white hover:bg-slate-50/50 border border-slate-200/90 rounded-2xl flex flex-col gap-4 transition-all shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-bold text-[#08243D] text-sm">
                            {req.providerName || 'Chuyên viên PetCare'}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                              pending
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : approved
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {pending ? 'Chờ duyệt' : approved ? 'Đã giải ngân' : 'Từ chối'}
                          </span>
                        </div>

                        {/* Bank Details Table */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-400 font-medium">Ngân hàng thụ hưởng:</span>
                            <span className="font-bold text-slate-800 uppercase">{bankName}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-400 font-medium">Số tài khoản (STK):</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/80 shadow-2xs">
                                {accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyStk(accountNumber)}
                                title="Sao chép số tài khoản"
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded cursor-pointer transition-colors"
                              >
                                {copiedStk === accountNumber ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-400 font-medium">Tên chủ tài khoản:</span>
                            <span className="font-bold text-slate-800 uppercase">{accountName}</span>
                          </div>
                        </div>

                        {(req.requestedAt || req.created_at) && (
                          <p className="text-[11px] text-slate-400">
                            Thời gian gửi: {formatDateTime(req.requestedAt || req.created_at)}
                          </p>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="sm:text-right shrink-0">
                        <div className="font-black text-emerald-700 text-lg sm:text-xl">
                          {new Intl.NumberFormat('vi-VN').format(req.amount)} đ
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Rút thu nhập từ ví</p>
                      </div>
                    </div>

                    {/* Action buttons for pending requests */}
                    {pending && (
                      <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSettlementAction({ kind: 'reject', request: req })}
                          className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Từ chối
                        </button>

                        <button
                          type="button"
                          onClick={() => setSettlementAction({ kind: 'approve', request: req })}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Duyệt &amp; Giải ngân
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Manual Escrow Interventions (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-5 space-y-1">
            <h3 className="text-base md:text-lg font-bold text-[#08243D] tracking-tight flex items-center gap-2">
              <Shield className="w-4.5 h-4.5 text-[#08243D]" />
              Thao Tác Can Thiệp Ký Quỹ Thủ Công
            </h3>
            <p className="text-xs text-slate-400">
              Giải quyết ngoại lệ tranh chấp hoặc phán quyết hoàn tiền từ Hội đồng quản trị.
            </p>
          </div>

          <div className="space-y-5">
            {/* Input with Lookup button */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#08243D] uppercase tracking-wider block">
                Mã Booking (Booking ID)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={bookingIdInput}
                    disabled={isLookingUpBooking}
                    onChange={(e) => {
                      setBookingIdInput(e.target.value);
                      setBookingPreview(null);
                      setBookingLookupError(null);
                    }}
                    placeholder="Dán mã UUID đơn đặt lịch cần can thiệp..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-[#08243D] focus:ring-2 focus:ring-[#08243D]/10 transition-all font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLookupBooking}
                  disabled={!bookingIdInput.trim() || isLookingUpBooking}
                  className="px-4 py-2.5 bg-[#08243D] hover:bg-[#0c2f4e] text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-2xs"
                >
                  {isLookingUpBooking ? 'Đang tìm...' : 'Kiểm tra mã'}
                </button>
              </div>

              {bookingLookupError && (
                <p className="text-xs font-semibold text-rose-600 pt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {bookingLookupError}
                </p>
              )}
            </div>

            {/* Booking Details Preview Box if found */}
            {bookingPreview && (
              <div className="p-4.5 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-2.5 text-xs animate-fade-in shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-teal-100 font-bold text-teal-900">
                  <span>Thông tin đơn tìm thấy</span>
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono text-[10px]">
                    {bookingPreview.status}
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khách hàng:</span>
                    <strong className="text-slate-800">{bookingPreview.customer?.fullName || bookingPreview.customer_name || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chuyên viên:</span>
                    <strong className="text-slate-800">{bookingPreview.provider?.users?.fullName || bookingPreview.provider_name || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số tiền ký quỹ:</span>
                    <strong className="text-emerald-700 font-black">
                      {new Intl.NumberFormat('vi-VN').format(Number(bookingPreview.total_price ?? bookingPreview.total_amount ?? bookingPreview.amount ?? 0))} đ
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setSettlementAction({ kind: 'release', bookingId: bookingIdInput.trim() })}
                disabled={!bookingIdInput.trim() || isLookingUpBooking}
                className="flex flex-col items-center justify-center p-4.5 bg-teal-50 hover:bg-teal-100/80 border border-teal-200/80 text-teal-800 rounded-2xl gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-8 h-8 rounded-full bg-white text-teal-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-center">Giải phóng cho Provider</span>
                <span className="text-[10px] text-teal-600 text-center font-medium">
                  Chuyển tiền vào ví Provider
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSettlementAction({ kind: 'refund', bookingId: bookingIdInput.trim() })}
                disabled={!bookingIdInput.trim() || isLookingUpBooking}
                className="flex flex-col items-center justify-center p-4.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 text-rose-800 rounded-2xl gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-8 h-8 rounded-full bg-white text-rose-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-center">Hoàn tiền Customer</span>
                <span className="text-[10px] text-rose-600 text-center font-medium">
                  Khách nhận 100% về ví
                </span>
              </button>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-amber-900/90 leading-relaxed">
                <span className="font-bold block text-amber-900">Lưu ý bảo mật &amp; kiểm toán:</span>
                Mọi can thiệp dòng tiền thủ công đều được hệ thống ghi vết vĩnh viễn vào <strong>Audit Logs</strong> cùng danh tính Admin thực hiện. Chỉ thực hiện khi có bằng chứng đối soát rõ ràng hoặc đã thông qua hội đồng quản trị.
              </div>
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
          <>
            Yêu cầu rút <strong>{formatCurrency(action.request.amount)}</strong> của{' '}
            <strong>{action.request.accountName || action.request.providerName || 'đối tác'}</strong>.
            {kind === 'approve' && (
              <> STK <strong>{action.request.accountNumber || action.request.bank_details?.account_number || '—'}</strong>
                {' · '}{action.request.bankName || action.request.bank_details?.bank_name || 'Ngân hàng'}.
                Xác nhận sau khi đã chuyển đúng số tiền.</>
            )}
          </>
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
