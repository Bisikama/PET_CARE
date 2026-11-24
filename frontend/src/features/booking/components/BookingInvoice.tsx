'use client';

import * as React from 'react';
import { ChevronLeft, ShieldCheck, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { bookingService } from '../services/booking.service';
import { usePetStore } from '@/features/pet/stores/pet.store';
import { useServicesStore } from '@/features/services/stores/services.store';
import { useDiscoverProviders } from '../hooks/useDiscoverProviders';

interface PriceQuote {
  servicePrice: number;
  travelFee: number;
  distanceKm: number | null;
  discountAmount: number;
  promoCode: string | null;
  totalPrice: number;
}

const apiMessage = (err: any, fallback: string): string => {
  const msg = err?.response?.data?.message;
  return (Array.isArray(msg) ? msg.join(', ') : msg) || err?.message || fallback;
};

/** Kết quả POST /bookings/calculate-price */
function toPriceQuote(res: any): PriceQuote {
  return {
    servicePrice: Number(res?.item?.servicePrice ?? res?.subtotal ?? 0),
    travelFee: Number(res?.distance?.travelFee ?? 0),
    distanceKm: res?.distance?.estimatedRoadDistanceKm != null ? Number(res.distance.estimatedRoadDistanceKm) : null,
    discountAmount: Number(res?.discount?.discountAmount ?? 0),
    promoCode: res?.discount?.promoCode ?? null,
    totalPrice: Number(res?.totalPrice ?? 0),
  };
}

/** Số tiền của đơn đã tạo (price_snapshot do backend chụp lúc tạo đơn). */
function priceFromBooking(booking: any): PriceQuote {
  const snap = booking?.price_snapshot || booking?.priceSnapshot || {};
  const total = Number(booking?.total_price ?? booking?.totalPrice ?? snap.finalPrice ?? 0);
  const discount = Number(snap.discountAmount ?? booking?.discount_amount ?? 0);
  const travel = Number(snap.travelFee ?? 0);
  return {
    servicePrice: Number(snap.servicePrice ?? total - travel + discount),
    travelFee: travel,
    distanceKm: snap.distanceKm != null ? Number(snap.distanceKm) : null,
    discountAmount: discount,
    promoCode: snap.promoCode ?? null,
    totalPrice: total,
  };
}

export function BookingInvoice() {
  const { 
    setStep,
    selectedPetId,
    selectedServiceId,
    selectedProviderId,
    selectedAddressId,
    selectedSlotId,
    createdBookingId,
    setCreatedBookingId,
    notes,
    appliedPromoCode,
    setAppliedDiscount: setStoreAppliedDiscount
  } = useBookingStore();

  const { pets } = usePetStore();
  const { services } = useServicesStore();
  
  const { providers } = useDiscoverProviders({
    serviceId: selectedServiceId || null,
    petId: selectedPetId || null,
    addressId: selectedAddressId || null,
  });

  const [booking, setBooking] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Promo code state
  const [promoInput, setPromoInput] = React.useState(appliedPromoCode || '');
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [promoLoading, setPromoLoading] = React.useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = React.useState(false);

  // Báo giá của server (trước khi tạo đơn): giá gói theo cân nặng + phí di chuyển - giảm giá
  const [quote, setQuote] = React.useState<PriceQuote | null>(null);
  const [quoteError, setQuoteError] = React.useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = React.useState(false);

  const requestQuote = React.useCallback(
    async (promoCode?: string) => {
      if (!selectedPetId || !selectedServiceId || !selectedAddressId || !selectedProviderId) return null;
      const res = await bookingService.calculatePrice({
        petId: selectedPetId,
        serviceId: selectedServiceId,
        addressId: selectedAddressId,
        providerId: selectedProviderId,
        ...(promoCode ? { promoCode } : {}),
      });
      return toPriceQuote(res);
    },
    [selectedPetId, selectedServiceId, selectedAddressId, selectedProviderId],
  );

  React.useEffect(() => {
    if (createdBookingId) return;
    let cancelled = false;
    setQuoteLoading(true);
    setQuoteError(null);
    requestQuote(appliedPromoCode || undefined)
      .catch(async (err) => {
        // Mã đã lưu không còn hợp lệ => báo giá lại không kèm mã
        if (appliedPromoCode) {
          setStoreAppliedDiscount(0, null);
          setPromoError(apiMessage(err, 'Mã khuyến mãi không còn hợp lệ'));
          return requestQuote();
        }
        throw err;
      })
      .then((q) => {
        if (!cancelled) setQuote(q);
      })
      .catch((err) => {
        if (!cancelled) setQuoteError(apiMessage(err, 'Không tính được giá cho đơn này'));
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdBookingId, requestQuote]);

  // Fallback info if API doesn't return full details
  const pet = pets.find(p => p.id === selectedPetId);
  const service = services.find(s => s.id === selectedServiceId);
  const provider = providers.find(p => p.id === selectedProviderId);

  React.useEffect(() => {
    let isMounted = true;

    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        if (!createdBookingId) {
          if (isMounted) setLoading(false);
          return;
        }

        const bookingDetails = await bookingService.getBooking(createdBookingId);
        if (isMounted) {
          const fetchedBooking = bookingDetails?.data?.booking || bookingDetails?.data || bookingDetails;
          setBooking(fetchedBooking);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Lỗi khi tải booking:', err);
        if (isMounted) {
          setError(err?.response?.data?.message || err.message || 'Không thể tải chi tiết đơn đặt lịch');
          setLoading(false);
        }
      }
    };

    fetchBookingDetails();

    return () => {
      isMounted = false;
    };
  }, [createdBookingId]);

  const handleProceedPayment = async () => {
    if (createdBookingId) {
      setStep(9);
      return;
    }

    if (!selectedPetId || !selectedAddressId || !selectedServiceId || !selectedSlotId) {
      alert('Vui lòng quay lại chọn đầy đủ thú cưng, địa chỉ, dịch vụ và khung giờ làm việc.');
      return;
    }

    setIsCreatingBooking(true);
    try {
      const createdBooking = await bookingService.createBooking({
        petId: selectedPetId,
        providerWorkingSlotId: selectedSlotId,
        addressId: selectedAddressId,
        serviceId: selectedServiceId,
        customerNote: notes || '',
        promoCode: appliedPromoCode || undefined,
      });

      const actualBookingId =
        createdBooking?.data?.booking?.id ||
        createdBooking?.data?.id ||
        createdBooking?.booking?.id ||
        createdBooking?.id;

      if (actualBookingId) {
        setCreatedBookingId(actualBookingId);
        setStep(9);
      } else {
        throw new Error('Không thể lấy mã đơn đặt lịch sau khi khởi tạo.');
      }
    } catch (err: any) {
      console.error('Lỗi khi tạo đơn đặt lịch:', err);
      alert(err?.response?.data?.message || err?.message || 'Không thể tạo đơn đặt lịch. Khung giờ có thể đã được người khác đặt trước.');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Đang tải hóa đơn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <p className="text-slate-800 font-bold text-lg mb-2">Có lỗi xảy ra</p>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => setStep(1)} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
          Quay lại từ đầu
        </button>
      </div>
    );
  }

  // Display values (fallback to store data if API doesn't provide them)
  const bookingCode = booking?.id ? `#BK-${booking.id.split('-')[0].toUpperCase()}` : `#BK-${(pet?.name || 'PET').toUpperCase()}-07`;
  const customerName = booking?.address_snapshot?.receiverName || booking?.customerName || 'Khách hàng';
  const providerName = booking?.providerName || provider?.fullName || 'Chuyên viên';
  
  const petName = booking?.petName || `${pet?.name || 'Thú cưng'} (${pet?.species === 'Cat' ? 'Mèo' : 'Chó'}, ${pet?.weight || '?'}kg)`;
  const serviceName = booking?.serviceName || service?.name || 'Dịch vụ';
  
  const addressObj = booking?.address_snapshot;
  const addressString = addressObj ? `${addressObj.addressLine}, ${addressObj.ward}, ${addressObj.district}, ${addressObj.city}` : booking?.addressString || 'Địa chỉ thực hiện';
  
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };
  
  const timeString = booking?.estimated_start_at 
    ? `${formatDateTime(booking.estimated_start_at)} - ${booking.estimated_end_at ? formatDateTime(booking.estimated_end_at).split(' ')[1] : ''}`
    : booking?.timeString || 'Đang cập nhật...'; 
    
  // Đơn đã tạo => số tiền thật của đơn (total_price đã gồm phí di chuyển và đã trừ giảm giá)
  const pricing: PriceQuote | null = booking ? priceFromBooking(booking) : quote;
  const finalTotal = pricing?.totalPrice ?? 0;
  const appliedDiscount = pricing?.discountAmount ?? 0;
  const promoLocked = Boolean(createdBookingId);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim();
    if (!code || promoLocked) return;
    setPromoError(null);
    setPromoLoading(true);
    try {
      const q = await requestQuote(code);
      if (q) {
        setQuote(q);
        setStoreAppliedDiscount(q.discountAmount, code);
      }
    } catch (err) {
      setPromoError(apiMessage(err, 'Mã khuyến mãi không hợp lệ'));
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = async () => {
    setPromoInput('');
    setPromoError(null);
    setStoreAppliedDiscount(0, null);
    try {
      const q = await requestQuote();
      if (q) setQuote(q);
    } catch (err) {
      setQuoteError(apiMessage(err, 'Không tính được giá cho đơn này'));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
          Duyệt Đơn Đặt Lịch & Hóa Đơn Ký Quỹ
        </h2>
        <p className="text-slate-400 text-sm font-medium">
          Vui lòng kiểm tra kỹ kịch bản chăm sóc trước khi gửi tiền ký quỹ tạm giữ.
        </p>
      </div>

      {/* Invoice Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
            BẢNG CHI TIẾT ĐẶT CA {bookingCode}
          </h3>
          <span className="bg-[#f0c05a] text-slate-900 text-[10px] font-black px-3 py-1 rounded-md tracking-wider">
            SAFE-PAY ACTIVE
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Chủ nuôi / Khách hàng:</p>
            <p className="text-slate-800 font-bold text-sm">{customerName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Chuyên viên chăm sóc:</p>
            <p className="text-blue-600 font-bold text-sm">{providerName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Bé thú cưng phục vụ:</p>
            <p className="text-slate-800 font-bold text-sm">{petName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Dịch vụ thực hiện:</p>
            <p className="text-slate-800 font-bold text-sm">{serviceName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Địa chỉ thực hiện ca:</p>
            <p className="text-red-500 font-bold text-sm">{addressString}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Thời gian lên lịch:</p>
            <p className="text-slate-800 font-bold text-sm">{timeString}</p>
          </div>
        </div>

        {/* Escrow Terms */}
        <div className="bg-[#ebf3ff] border border-blue-200 rounded-2xl p-5 flex items-start gap-3 mt-4">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Điều khoản bảo hộ Ký Quỹ Độc Quyền (Escrow-Pay):</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Hệ thống trung gian của PetCare sẽ đóng băng khoản thanh toán <strong className="text-slate-800">{formatPrice(finalTotal)}</strong>. {providerName} chỉ được nhận giải ngân khi và chỉ khi bạn chính tay xác nhận hoàn thành dịch vụ mỹ mãn.
            </p>
          </div>
        </div>
      </div>

      {/* Promo Code Input Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">Mã khuyến mãi / Voucher</h4>
          </div>
          {appliedDiscount > 0 && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã giảm {formatPrice(appliedDiscount)}
            </span>
          )}
        </div>

        {promoLocked ? (
          <p className="text-xs font-medium text-slate-500">
            {appliedPromoCode || appliedDiscount > 0
              ? 'Mã khuyến mãi đã được áp dụng khi tạo đơn.'
              : 'Đơn đã được tạo — không thể thêm mã khuyến mãi.'}
          </p>
        ) : (
        <form onSubmit={handleApplyPromo} className="flex gap-2">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
            placeholder="Nhập mã khuyến mãi (VD: SIUU)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 uppercase placeholder:normal-case placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={promoLoading || !promoInput.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
          >
            {promoLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
          </button>
          {appliedPromoCode && (
            <button
              type="button"
              onClick={handleRemovePromo}
              className="px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-rose-600 shrink-0"
            >
              Bỏ mã
            </button>
          )}
        </form>
        )}

        {promoError && (
          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {promoError}
          </p>
        )}
      </div>

      {/* Total Section */}
      <div className="space-y-2 px-2">
        {quoteLoading && !pricing ? (
          <div className="flex items-center gap-2 py-3 text-sm font-semibold text-slate-400">
            <div className="w-4 h-4 border-2 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
            Đang tính giá theo cân nặng & quãng đường...
          </div>
        ) : quoteError && !pricing ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {quoteError}
          </div>
        ) : pricing ? (
          <>
            <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
              <span>Giá gói {serviceName} (theo cân nặng)</span>
              <span>{formatPrice(pricing.servicePrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
              <span>
                Phí di chuyển
                {pricing.distanceKm !== null ? ` (~${pricing.distanceKm.toLocaleString('vi-VN')} km)` : ''}
              </span>
              <span>{pricing.travelFee > 0 ? formatPrice(pricing.travelFee) : 'Miễn phí'}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex items-center justify-between text-sm font-bold text-emerald-600">
                <span>Giảm giá khuyến mãi{pricing.promoCode ? ` (${pricing.promoCode})` : ''}</span>
                <span>-{formatPrice(appliedDiscount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">
                Tổng tiền cần thanh toán ký quỹ:
              </h3>
              <span className="text-2xl font-black text-slate-900 tracking-tight">{formatPrice(finalTotal)}</span>
            </div>
          </>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={() => setStep(6)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>
        <button
          onClick={handleProceedPayment}
          disabled={isCreatingBooking || (!createdBookingId && !quote)}
          className="flex items-center gap-2 px-8 py-3.5 bg-[#00a86b] hover:bg-[#00915c] disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/20 active:scale-95 cursor-pointer"
        >
          {isCreatingBooking ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>ĐANG TẠO ĐƠN & KÝ QUỸ...</span>
            </>
          ) : (
            <>
              <span className="font-mono font-normal opacity-80 mr-1">$</span> TIẾN HÀNH KÝ QUỸ VÍ PETCARE
            </>
          )}
        </button>
      </div>
    </div>
  );
}
