'use client';

import * as React from 'react';
import {
  ChevronRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowLeft,
  Landmark,
  Crown,
  CheckCircle2,
  CalendarDays,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { usePayment } from '../hooks/usePayment';
import { bookingService } from '../services/booking.service';
import type { BankTransferCheckout } from '../services/payment.service';
import { VietQrTransferPanel } from './VietQrTransferPanel';
import { extractBookingDisplayInfo } from './CustomerBookingList';
import { useWallet } from '@/features/wallets/hooks/useWallet';
import { useRouter } from 'next/navigation';
import { systemConfirm } from '@/components/ui/SystemDialogProvider';
import { Portal } from '@/components/ui/Portal';

interface PaymentGatewayProps {
  onViewBookings?: () => void;
}

interface PaymentSuccessInfo {
  methodLabel: string;
  transactionCode: string;
  transferContent?: string;
  paidAt: string;
}

export function PaymentGateway({ onViewBookings }: PaymentGatewayProps = {}) {
  const { setStep, createdBookingId, resetBooking } = useBookingStore();
  const {
    createCheckoutUrl,
    createMomoCheckoutUrl,
    createBankTransferCheckout,
    checkoutWithWallet,
    loading,
    error,
  } = usePayment();
  const { wallet } = useWallet();
  const router = useRouter();
  // Số tiền thật của đơn (đã gồm phí di chuyển, đã trừ giảm giá lúc tạo đơn). null = chưa tải được
  const [totalAmount, setTotalAmount] = React.useState<number | null>(null);
  const [memberInfo, setMemberInfo] = React.useState<{ tierLabel: string; discountAmount: number } | null>(null);
  const [bookingSummary, setBookingSummary] = React.useState<{
    serviceName: string;
    petName: string | null;
    providerName: string;
  } | null>(null);
  const [isFetchingBooking, setIsFetchingBooking] = React.useState(true);

  // Chuyển khoản VietQR: giữ lại mã đã tạo để mở lại không sinh mã mới
  const [qrCheckout, setQrCheckout] = React.useState<BankTransferCheckout | null>(null);
  const [showQrPanel, setShowQrPanel] = React.useState(false);

  // Popup xác nhận thanh toán thành công
  const [paymentSuccess, setPaymentSuccess] = React.useState<PaymentSuccessInfo | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const fetchBookingAmount = async () => {
      if (!createdBookingId) {
        setIsFetchingBooking(false);
        return;
      }
      try {
        const bookingDetails = await bookingService.getBooking(createdBookingId);
        const fetchedBooking = bookingDetails?.data?.booking || bookingDetails?.data || bookingDetails;
        if (isMounted && fetchedBooking) {
          if (fetchedBooking.total_price !== undefined && fetchedBooking.total_price !== null) {
            setTotalAmount(Number(fetchedBooking.total_price));
          }
          const displayInfo = extractBookingDisplayInfo(fetchedBooking);
          setBookingSummary({
            serviceName: displayInfo.serviceName,
            petName: displayInfo.petName,
            providerName: displayInfo.providerName,
          });
        }
        const snap = fetchedBooking?.price_snapshot || fetchedBooking?.priceSnapshot || {};
        if (isMounted && snap?.memberDiscountAmount) {
          setMemberInfo({
            tierLabel:
              snap.memberTier === 'PREMIUM'
                ? 'Gói VIP Pro'
                : snap.memberTier === 'YEARLY'
                ? 'Gói Tiết Kiệm Năm'
                : 'Gói Cơ Bản',
            discountAmount: Number(snap.memberDiscountAmount),
          });
        }
      } catch (err) {
        console.error('Failed to fetch booking amount for payment gateway', err);
      } finally {
        if (isMounted) setIsFetchingBooking(false);
      }
    };
    fetchBookingAmount();
    return () => {
      isMounted = false;
    };
  }, [createdBookingId]);

  // Mã khuyến mãi đã áp khi tạo đơn => không gửi lại / không trừ lần nữa ở bước này
  const finalAmount = totalAmount ?? 0;
  const amountReady = totalAmount !== null;

  const handleVNPayCheckout = () => {
    if (!createdBookingId) return;
    createCheckoutUrl({ bookingId: createdBookingId, amount: finalAmount });
  };

  const handleMoMoCheckout = () => {
    if (!createdBookingId) return;
    createMomoCheckoutUrl({ bookingId: createdBookingId, amount: finalAmount });
  };

  const handleBankTransferCheckout = async () => {
    if (!createdBookingId) return;
    if (qrCheckout) {
      setShowQrPanel(true);
      return;
    }
    const checkout = await createBankTransferCheckout({ bookingId: createdBookingId });
    if (checkout) {
      setQrCheckout(checkout);
      setShowQrPanel(true);
    }
  };

  const handleQrPaid = React.useCallback(() => {
    setPaymentSuccess({
      methodLabel: 'Chuyển khoản ngân hàng (VietQR)',
      transactionCode: qrCheckout?.paymentCode || (createdBookingId ? `#${createdBookingId.slice(0, 8).toUpperCase()}` : 'VIETQR'),
      transferContent: qrCheckout?.transferContent,
      paidAt: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  }, [qrCheckout, createdBookingId]);

  const handleQrBack = React.useCallback(async () => {
    const ok = await systemConfirm({
      title: 'Đổi phương thức thanh toán?',
      message:
        'Nếu bạn ĐÃ chuyển khoản, vui lòng ở lại trang này để hệ thống tự động xác nhận giao dịch.\n\nChọn phương thức khác sẽ làm mã chuyển khoản hiện tại không còn hiệu lực. Bạn có chắc muốn đổi phương thức?',
      confirmText: 'Đổi phương thức khác',
      cancelText: 'Ở lại trang mã QR',
      variant: 'warning',
    });
    if (ok) setShowQrPanel(false);
  }, []);

  const handleWalletCheckout = async () => {
    if (!createdBookingId) return;
    const success = await checkoutWithWallet({ bookingId: createdBookingId, amount: finalAmount });
    if (success) {
      setPaymentSuccess({
        methodLabel: 'Ví Điện Tử PetCare',
        transactionCode: `WALLET-${createdBookingId.slice(0, 8).toUpperCase()}`,
        paidAt: new Date().toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }
  };

  const handleFinishToBookingsList = () => {
    setPaymentSuccess(null);
    resetBooking();
    if (onViewBookings) {
      onViewBookings();
    } else {
      router.push('/bookings');
    }
  };

  const handleFinishNewBooking = () => {
    setPaymentSuccess(null);
    resetBooking();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  if (isFetchingBooking) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#00a86b] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-10 flex flex-col items-center border border-slate-200/70 shadow-2xs animate-fade-in">
      {/* Title */}
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
          Bảo vệ thanh toán Escrow
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-[#08243D] mt-2 tracking-tight">
          Chọn Phương Thức Thanh Toán
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Số tiền sẽ được hệ thống giữ an toàn cho đến khi ca chăm sóc hoàn tất.
        </p>
      </div>

      {error && (
        <div className="w-full max-w-lg bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl mb-6 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {showQrPanel && qrCheckout && createdBookingId ? (
        <VietQrTransferPanel
          key={createdBookingId}
          bookingId={createdBookingId}
          checkout={qrCheckout}
          onPaid={handleQrPaid}
          onBack={handleQrBack}
        />
      ) : (
        <div className="w-full max-w-lg bg-slate-50/60 border border-slate-200/80 rounded-3xl p-6 md:p-7">
          {/* Active Member Badge if applied */}
          {memberInfo && (
            <div className="flex items-center justify-between bg-amber-50/90 border border-[#F7C948]/50 rounded-2xl px-4 py-2.5 mb-4 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#08243D] text-[#F7C948] flex items-center justify-center shrink-0">
                  <Crown className="w-3.5 h-3.5 text-[#F7C948]" />
                </div>
                <div>
                  <span className="font-bold text-[#08243D]">
                    Đặc quyền {memberInfo.tierLabel}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Miễn phí nền tảng & giảm giá dịch vụ</span>
                </div>
              </div>
              <span className="font-bold text-amber-700 tabular-nums">
                Đã giảm {formatPrice(memberInfo.discountAmount)}
              </span>
            </div>
          )}

          {/* Amount Summary */}
          <div className="flex justify-between items-center bg-white border border-slate-200/70 rounded-2xl px-5 py-4 mb-5">
            <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Số tiền thanh toán
            </span>
            <span className="text-2xl font-bold text-[#08243D] tabular-nums">
              {amountReady ? formatPrice(finalAmount) : 'Đang tải...'}
            </span>
          </div>

          {/* Minimalist Payment Options */}
          <div className="space-y-3">
            {/* Option 1: VietQR */}
            <button
              type="button"
              onClick={handleBankTransferCheckout}
              disabled={loading || !createdBookingId || !amountReady}
              className="w-full flex justify-between items-center bg-white hover:bg-slate-50 text-slate-800 p-4 rounded-2xl border border-slate-200/80 hover:border-[#08243D] disabled:opacity-50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#08243D] text-[#F7C948] flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-sm text-[#08243D]">
                    {qrCheckout ? 'Xem lại mã chuyển khoản VietQR' : 'Chuyển khoản ngân hàng (VietQR)'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Quét mã QR bằng ứng dụng ngân hàng · Tự động xác nhận
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#08243D] transition-colors shrink-0" />
            </button>

            {/* Option 2: VNPay */}
            <button
              type="button"
              onClick={handleVNPayCheckout}
              disabled={loading || !createdBookingId || !amountReady}
              className="w-full flex justify-between items-center bg-white hover:bg-slate-50 text-slate-800 p-4 rounded-2xl border border-slate-200/80 hover:border-[#08243D] disabled:opacity-50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#08243D] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-sm text-[#08243D]">
                    Cổng thanh toán VNPay
                  </span>
                  <span className="text-xs text-slate-500">
                    Thẻ ATM nội địa, Visa / MasterCard, Ví VNPay
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#08243D] transition-colors shrink-0" />
            </button>

            {/* Option 3: MoMo */}
            <button
              type="button"
              onClick={handleMoMoCheckout}
              disabled={loading || !createdBookingId || !amountReady}
              className="w-full flex justify-between items-center bg-white hover:bg-slate-50 text-slate-800 p-4 rounded-2xl border border-slate-200/80 hover:border-[#08243D] disabled:opacity-50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#08243D] flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-sm text-[#08243D]">Ví điện tử MoMo</span>
                  <span className="text-xs text-slate-500">
                    Thanh toán nhanh qua ứng dụng MoMo
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#08243D] transition-colors shrink-0" />
            </button>

            {/* Option 4: Ví PetCare */}
            <button
              type="button"
              onClick={handleWalletCheckout}
              disabled={loading || !createdBookingId || !amountReady || !wallet || Number(wallet.balance) < finalAmount}
              className="w-full flex justify-between items-center bg-white hover:bg-slate-50 text-slate-800 p-4 rounded-2xl border border-slate-200/80 hover:border-[#08243D] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-sm text-[#08243D]">Số dư Ví Điện Tử PetCare</span>
                  <span className="text-xs text-slate-500">
                    Khả dụng: {wallet ? formatPrice(Number(wallet.balance)) : '0 đ'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {wallet && Number(wallet.balance) < finalAmount && (
                  <span className="text-[11px] font-semibold text-rose-500">Không đủ số dư</span>
                )}
                <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#08243D] transition-colors" />
              </div>
            </button>
          </div>
        </div>
      )}

      {!showQrPanel && (
        <button
          type="button"
          onClick={() => setStep(8)}
          className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#08243D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại kiểm tra Hóa đơn
        </button>
      )}

      {/* Popup Biên Lai Xác Nhận Thanh Toán Đặt Lịch Thành Công */}
      {paymentSuccess && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#041320]/75 p-4 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80 animate-scale-up">
              {/* Top Celebratory Header */}
              <div className="relative overflow-hidden bg-[#08243D] px-6 py-7 text-center text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(247,201,72,0.18),transparent_70%)] pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/40 mb-3">
                    <span className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping" />
                    <CheckCircle2 className="h-9 w-9 text-emerald-400 relative z-10" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7C948]/15 border border-[#F7C948]/40 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#F7C948] mb-2">
                    <Sparkles className="w-3 h-3" />
                    Safe-Pay Escrow Active
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Thanh Toán Đặt Lịch Thành Công!
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-300 max-w-sm leading-relaxed">
                    Khoản thanh toán của bạn đã được hệ thống Ký quỹ (Escrow) bảo hộ an toàn 100%. Chuyên viên chăm sóc đã nhận thông báo lịch hẹn.
                  </p>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-6 space-y-5">
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200/70">
                    <span className="text-slate-500 font-medium">Số tiền đã thanh toán</span>
                    <span className="text-lg font-black text-emerald-600 tabular-nums">
                      {formatPrice(finalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 font-medium">Mã giao dịch</span>
                    <span className="font-mono font-bold text-[#08243D] bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {paymentSuccess.transactionCode}
                    </span>
                  </div>

                  {bookingSummary && (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 font-medium">Gói dịch vụ</span>
                        <span className="font-bold text-[#08243D] text-right">
                          {bookingSummary.serviceName}
                          {bookingSummary.petName ? ` (${bookingSummary.petName})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 font-medium">Chuyên viên chăm sóc</span>
                        <span className="font-semibold text-slate-700 text-right">
                          {bookingSummary.providerName}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 font-medium">Phương thức</span>
                    <span className="font-semibold text-slate-800">{paymentSuccess.methodLabel}</span>
                  </div>

                  {paymentSuccess.transferContent && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-medium shrink-0">Nội dung CK</span>
                      <span className="font-mono text-[11px] font-semibold text-slate-700 text-right break-all">
                        {paymentSuccess.transferContent}
                      </span>
                    </div>
                  )}

                  {memberInfo && (
                    <div className="flex items-center justify-between gap-3 text-amber-800 bg-amber-50/80 border border-amber-200/70 rounded-xl px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 font-bold">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        Đặc quyền {memberInfo.tierLabel}
                      </span>
                      <span className="font-bold tabular-nums">-{formatPrice(memberInfo.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/70">
                    <span className="text-slate-500 font-medium">Thời gian xác nhận</span>
                    <span className="font-medium text-slate-700">{paymentSuccess.paidAt}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 font-medium">Trạng thái</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      ĐÃ THANH TOÁN & KÝ QUỸ
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={handleFinishToBookingsList}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#08243D] py-3.5 px-4 text-xs font-bold text-[#F7C948] hover:bg-[#0c3254] transition-colors cursor-pointer shadow-xs"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Xem lịch hẹn của tôi
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishNewBooking}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#08243D] transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Đặt thêm lịch mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
