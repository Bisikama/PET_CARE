'use client';

import * as React from 'react';
import { ChevronRight, ShieldCheck, CreditCard, QrCode, ArrowLeft } from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { usePayment } from '../hooks/usePayment';
import { bookingService } from '../services/booking.service';

export function PaymentGateway() {
  const { setStep, createdBookingId } = useBookingStore();
  const { createCheckoutUrl, loading, error } = usePayment();
  const [totalAmount, setTotalAmount] = React.useState<number>(0);
  const [isFetchingBooking, setIsFetchingBooking] = React.useState(true);

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
        if (isMounted && fetchedBooking?.total_price) {
          setTotalAmount(Number(fetchedBooking.total_price));
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

  const handleVNPayCheckout = () => {
    if (!createdBookingId) return;
    createCheckoutUrl({ bookingId: createdBookingId });
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
    <div className="w-full bg-white rounded-3xl p-6 md:p-10 flex flex-col items-center animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center mb-10 mt-4">
        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm shadow-blue-500/10">
          PETCARE GATEWAY SECURITY
        </span>
        <h2 className="text-3xl font-black text-slate-800 mt-6 tracking-tight">Cổng Thanh Toán Ký Quỹ Trung Gian</h2>
      </div>

      {error && (
        <div className="w-full max-w-md bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium text-center">
          {error}
        </div>
      )}

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[24px] p-6 md:p-8 shadow-sm">
        {/* Nạp ví Escrow row */}
        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-5 mb-6">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Nạp ví Escrow:</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight">{formatPrice(totalAmount)}</span>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button 
            onClick={handleVNPayCheckout}
            disabled={loading || !createdBookingId}
            className="w-full flex justify-between items-center bg-[#0a1128] text-white p-5 rounded-2xl hover:bg-slate-800 disabled:opacity-70 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-[#f0c05a]" />
              <span className="font-bold text-[#f0c05a]">Thanh toán Thẻ Quốc tế (Visa/Master)</span>
            </div>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-[#f0c05a] rounded-full animate-spin"></div>
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            )}
          </button>

          <button 
            onClick={handleVNPayCheckout}
            disabled={loading || !createdBookingId}
            className="w-full flex justify-between items-center bg-[#00a86b] text-white p-5 rounded-2xl hover:bg-[#00915c] disabled:opacity-70 transition-all active:scale-[0.98] group shadow-lg shadow-teal-500/20"
          >
            <div className="flex items-center gap-3">
              <QrCode className="w-5 h-5" />
              <span className="font-bold">Quét mã QR MoMo / VNPAY-QR</span>
            </div>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            )}
          </button>
        </div>
      </div>
      
      <button 
        onClick={() => setStep(8)}
        className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại trang Hóa Đơn
      </button>
    </div>
  );
}
