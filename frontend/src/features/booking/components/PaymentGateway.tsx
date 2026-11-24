'use client';

import * as React from 'react';
import { ChevronRight, ShieldCheck, CreditCard, QrCode, ArrowLeft, Landmark, Crown } from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { usePayment } from '../hooks/usePayment';
import { bookingService } from '../services/booking.service';
import type { BankTransferCheckout } from '../services/payment.service';
import { VietQrTransferPanel } from './VietQrTransferPanel';
import { useWallet } from '@/features/wallets/hooks/useWallet';
import { useRouter } from 'next/navigation';
import { systemConfirm } from '@/components/ui/SystemDialogProvider';

export function PaymentGateway() {
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
  const [isFetchingBooking, setIsFetchingBooking] = React.useState(true);

  // Chuyển khoản VietQR: giữ lại mã đã tạo để mở lại không sinh mã mới
  const [qrCheckout, setQrCheckout] = React.useState<BankTransferCheckout | null>(null);
  const [showQrPanel, setShowQrPanel] = React.useState(false);

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
        if (isMounted && fetchedBooking?.total_price !== undefined && fetchedBooking?.total_price !== null) {
          setTotalAmount(Number(fetchedBooking.total_price));
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
    resetBooking();
    router.push('/bookings');
  }, [resetBooking, router]);

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
      resetBooking();
      router.push('/bookings');
    }
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
    </div>
  );
}
