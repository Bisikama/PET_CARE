'use client';

import * as React from 'react';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { bookingService } from '../services/booking.service';
import { usePetStore } from '@/features/pet/stores/pet.store';
import { useServicesStore } from '@/features/services/stores/services.store';
import { useDiscoverProviders } from '../hooks/useDiscoverProviders';

export function BookingInvoice() {
  const { 
    setStep,
    selectedPetId,
    selectedServiceId,
    selectedProviderId,
    selectedAddressId,
    selectedSlotId,
    createdBookingId,
    notes
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
          throw new Error('Thiếu thông tin đơn đặt lịch. Vui lòng quay lại bước trước để tạo đơn.');
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

  const handleProceedPayment = () => {
    setStep(9);
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
    
  const totalAmount = booking?.total_price ? Number(booking.total_price) : (service?.basePrice || 250000);

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
              Hệ thống trung gian của PetCare sẽ đóng băng khoản thanh toán <strong className="text-slate-800">{formatPrice(totalAmount)}</strong>. {providerName} chỉ được nhận giải ngân khi và chỉ khi bạn chính tay xác nhận hoàn thành dịch vụ mỹ mãn.
            </p>
          </div>
        </div>
      </div>

      {/* Total Section */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">
          Tổng tiền cần thanh toán ký quỹ:
        </h3>
        <span className="text-2xl font-black text-slate-900 tracking-tight">
          {formatPrice(totalAmount)}
        </span>
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
          className="flex items-center gap-2 px-8 py-3.5 bg-[#00a86b] hover:bg-[#00915c] text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <span className="font-mono font-normal opacity-80 mr-1">$</span> TIẾN HÀNH KÝ QUỸ VÍ PETCARE
        </button>
      </div>
    </div>
  );
}
