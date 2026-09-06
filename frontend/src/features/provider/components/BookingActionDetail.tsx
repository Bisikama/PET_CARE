import React, { useEffect } from 'react';
import { useProviderBooking } from '../hooks/useProviderBooking';
import { ShieldAlert, Clock, Package, DollarSign, User, Phone, Mail, MapPin, Check, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BookingGPSCheckIn } from './BookingGPSCheckIn';
import { BookingChecklist } from './BookingChecklist';

interface BookingActionDetailProps {
  bookingId?: string | null;
}

export const BookingActionDetail: React.FC<BookingActionDetailProps> = ({ bookingId }) => {
  const { bookingDetail, isLoading, error, fetchBookingDetail, fetchActiveBooking, acceptBooking, rejectBooking } = useProviderBooking(bookingId || undefined);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetail(bookingId);
    } else if (!bookingDetail) {
      fetchActiveBooking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  if (isLoading && !bookingDetail) {
    return <div className="p-8 text-center text-slate-500 font-medium">Đang tải thông tin ca chăm sóc...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-rose-500 font-medium">{error}</div>;
  }

  if (!bookingDetail) {
    return (
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4 border border-teal-100">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Đang chờ ca chăm sóc mới</h3>
        <p className="text-slate-500 mt-2 text-sm max-w-sm">Hệ thống sẽ tự động cập nhật ngay khi có khách hàng đặt lịch với bạn.</p>
      </div>
    );
  }

  const petInfo = bookingDetail.booking_pets?.[0]; // Assume 1 pet for now, or display first
  const serviceInfo = petInfo?.booking_services?.[0]; // Assume 1 service for simplicity based on UI
  
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = () => {
    switch(bookingDetail.status) {
      case 'PENDING_PROVIDER_ACCEPTANCE':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold uppercase">Chờ bạn chấp nhận</span>;
      case 'ACCEPTED':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold uppercase">Đã chấp nhận</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold uppercase">Đã từ chối</span>;
      case 'AWAITING_CUSTOMER_CONFIRMATION':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold uppercase">CHỜ NGHIỆM THU</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold uppercase">HOÀN THÀNH</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold uppercase">{bookingDetail.status}</span>;
    }
  };

  const isPending = bookingDetail.status === 'PENDING_PROVIDER_ACCEPTANCE';
  const isAccepted = bookingDetail.status === 'ACCEPTED';
  const isInProgress = bookingDetail.status === 'IN_PROGRESS';
  const isAwaitingCustomer = bookingDetail.status === 'AWAITING_CUSTOMER_CONFIRMATION';
  const isCompleted = bookingDetail.status === 'COMPLETED';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium mb-3">
            MÃ CA LÀM: #{bookingDetail.id.slice(0, 7).toUpperCase()}
          </span>
          <h2 className="text-2xl font-bold text-slate-800">
            Tiến Trình Chăm Sóc {petInfo ? `Bé ${petInfo.pet_name}` : 'Thú Cưng'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Trạng thái:</span>
          {getStatusBadge()}
        </div>
      </div>

      {/* Security Alert (only show if pending) */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
          <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-1 flex items-center gap-2">
              <span role="img" aria-label="lock">🔒</span> Chế Độ Bảo Mật Thông Tin Khách Hàng Kích Hoạt
            </h4>
            <p className="text-sm text-amber-700">
              Để bảo vệ sự riêng tư, <strong>số điện thoại, email và số nhà chính xác</strong> của chủ nuôi được mã hóa tạm thời. 
              Thông tin sẽ được tự động mở khóa đầy đủ ngay sau khi bạn đồng ý nhận ca chăm sóc này.
            </p>
          </div>
        </div>
      )}

      {/* Security Alert (only show if pending) */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
          <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-1 flex items-center gap-2">
              <span role="img" aria-label="lock">🔒</span> Chế Độ Bảo Mật Thông Tin Khách Hàng Kích Hoạt
            </h4>
            <p className="text-sm text-amber-700">
              Để bảo vệ sự riêng tư, <strong>số điện thoại, email và số nhà chính xác</strong> của chủ nuôi được mã hóa tạm thời. 
              Thông tin sẽ được tự động mở khóa đầy đủ ngay sau khi bạn đồng ý nhận ca chăm sóc này.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Service Info */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Thông tin dịch vụ & Lịch hẹn</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Thời gian: {new Date(bookingDetail.requested_date).toISOString().split('T')[0]} 
                  {' '}({new Date(bookingDetail.estimated_start_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {new Date(bookingDetail.estimated_end_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})})
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Package className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Dịch vụ: {serviceInfo?.service_name || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <DollarSign className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Bảo chứng Ký quỹ: {formatMoney(bookingDetail.total_price)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Info */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Thú cưng phục vụ</h3>
          {petInfo ? (
            <div className="flex gap-4">
              <img 
                src={petInfo.avatar_url || 'https://via.placeholder.com/60'} 
                alt={petInfo.pet_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  {petInfo.pet_name} <span className="text-gray-400 text-sm font-normal">({petInfo.breed || petInfo.species})</span>
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Thể trạng: {petInfo.age || '?'} tuổi • {petInfo.weight || '?'} kg
                </p>
                {(petInfo.health_note || petInfo.behavior_note) && (
                  <p className="mt-2 text-xs bg-amber-50 text-amber-700 p-2 rounded italic">
                    Lưu ý: {petInfo.health_note} {petInfo.behavior_note}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Không có thông tin thú cưng</p>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-gray-50 rounded-xl p-5 md:p-6 border border-gray-100">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Thông tin chủ nuôi (Khách hàng)</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">HỌ TÊN</p>
              <p className="text-sm font-bold text-gray-800">{bookingDetail.address_snapshot?.receiverName || 'N/A'}</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              <Phone className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">SỐ ĐIỆN THOẠI</p>
              {isPending ? (
                 <p className="text-sm font-bold text-rose-600 flex items-center gap-1 italic">
                    <span role="img" aria-label="lock">🔒</span> 090* *** ***
                 </p>
              ) : (
                <p className="text-sm font-bold text-gray-800">{bookingDetail.address_snapshot?.phone || 'N/A'}</p>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">EMAIL</p>
              <p className="text-sm font-bold text-gray-800">Không có</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-lg border border-gray-100 flex gap-3">
           <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
           <div>
             <p className="text-xs text-gray-400 font-medium mb-1">ĐỊA CHỈ THỰC HIỆN CA CHĂM SÓC</p>
             {isPending ? (
               <>
                 <p className="text-sm font-bold text-rose-600 flex items-center gap-1 italic mb-1">
                    <span role="img" aria-label="lock">🔒</span> [CĂN HỘ VÀ SỐ NHÀ CHÍNH XÁC ĐÃ ẨN]
                 </p>
                 <p className="text-sm text-gray-500 font-medium">{bookingDetail.address_snapshot?.ward}, {bookingDetail.address_snapshot?.district}, {bookingDetail.address_snapshot?.city}</p>
               </>
             ) : (
                <p className="text-sm font-bold text-gray-800">
                  {bookingDetail.address_snapshot ? 
                    `${bookingDetail.address_snapshot.addressLine}, ${bookingDetail.address_snapshot.ward}, ${bookingDetail.address_snapshot.district}, ${bookingDetail.address_snapshot.city}` 
                    : 'N/A'}
                </p>
             )}
           </div>
        </div>

      </div>

      {/* Action Buttons */}
      {isPending && (
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
          <Button 
            className="flex-1 bg-[#009A62] hover:bg-[#008051] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
            onClick={() => acceptBooking(bookingDetail.id)}
          >
            <Check className="w-5 h-5" /> ĐỒNG Ý CHẤP NHẬN ĐƠN (SAFE-PAY ESCROW)
          </Button>
          <Button 
            variant="outline"
            className="sm:w-[200px] bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm"
            onClick={() => rejectBooking(bookingDetail.id)}
          >
            Từ chối đơn hàng
          </Button>
        </div>
      )}

      {/* GPS Check-in (only show if accepted) */}
      {isAccepted && (
        <BookingGPSCheckIn 
          bookingId={bookingDetail.id} 
          suggestedPlaceName={bookingDetail.address_snapshot?.addressLine || ''}
          onCheckInSuccess={() => fetchBookingDetail(bookingDetail.id, true)}
        />
      )}

      {/* Checklist (only show if in progress) */}
      {isInProgress && (
        <BookingChecklist
          bookingId={bookingDetail.id}
          bookingDetail={bookingDetail}
          onRefresh={() => fetchBookingDetail(bookingDetail.id, true)}
        />
      )}

      {/* Awaiting Customer UI */}
      {isAwaitingCustomer && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-amber-500" />
            <h3 className="font-bold text-amber-800 text-lg">Đang chờ chủ nuôi {bookingDetail.address_snapshot?.receiverName || 'khách hàng'} bấm nghiệm thu...</h3>
          </div>
          <p className="text-amber-700 font-medium mb-6">
            Bạn đã hoàn thành toàn bộ kịch bản các bước và tải lên hình ảnh {petInfo?.pet_name}. Thông báo kiểm duyệt đã được gửi trực tiếp tới máy chủ nuôi để giải ngân quỹ.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-amber-200/60 pt-4 mt-4 gap-4 opacity-50 hover:opacity-100 transition-opacity">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Bấm để mô phỏng phản hồi của khách:</span>
            <Button 
              className="bg-[#00a86b] hover:bg-[#008f5a] text-white font-bold rounded-md px-6 py-2"
              onClick={async () => {
                // Mock API call to simulate customer confirming
                try {
                  const { meBookingService } = await import('@/features/me/services/me-booking.service');
                  await meBookingService.customerConfirmBooking(bookingDetail.id);
                  fetchBookingDetail(bookingDetail.id, true);
                } catch (error: any) {
                  console.error('Error simulating customer confirm:', error);
                }
              }}
            >
              <Check className="w-4 h-4 mr-2 inline-block" /> Khách hàng bấm nghiệm thu 5★
            </Button>
          </div>
        </div>
      )}

      {/* Completed UI */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-green-800 text-lg">Ca Làm Việc Đã Hoàn Thành Hoàn Hảo!</h3>
          </div>
          <p className="text-green-700 ml-11">
            Chủ nuôi đã duyệt hóa đơn và đánh giá chất lượng phục vụ 5★. Khoản tiền ký quỹ đã được giải ngân về ví khả dụng của bạn.
          </p>
        </div>
      )}
    </div>
  );
};
