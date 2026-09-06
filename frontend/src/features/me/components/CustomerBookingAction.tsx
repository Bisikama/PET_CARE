import React, { useEffect, useState } from 'react';
import { Clock, ShieldAlert, CheckCircle2, ChevronRight, Check, Star, AlertTriangle, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { meBookingService } from '../services/me-booking.service';
import { ReviewModal, DisputeForm, IncidentModal } from '@/features/customer-care/components';
import { Portal } from '@/components/ui/Portal';

import { bookingService } from '@/features/booking/services/booking.service';

interface CustomerBookingActionProps {
  bookingId?: string;
}

export const CustomerBookingAction: React.FC<CustomerBookingActionProps> = ({ bookingId: propBookingId }) => {
  const [activeBookingId, setActiveBookingId] = useState<string | null>(propBookingId || null);
  const [bookingDetail, setBookingDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propBookingId) {
      setActiveBookingId(propBookingId);
      return;
    }

    const loadLatestBooking = async () => {
      setIsLoading(true);
      try {
        const bookings = await bookingService.getMyBookings();
        if (bookings && bookings.length > 0) {
          // Find latest active or completed booking
          const activeOrRecent = bookings.find(
            (b: any) => b.status === 'AWAITING_CUSTOMER_CONFIRMATION' || b.status === 'COMPLETED'
          ) || bookings[0];
          setActiveBookingId(activeOrRecent.id);
        } else {
          setActiveBookingId(null);
        }
      } catch (err: any) {
        console.error('Error loading my bookings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLatestBooking();
  }, [propBookingId]);

  const fetchBookingDetail = async () => {
    if (!activeBookingId) return;
    setIsLoading(true);
    try {
      const data = await meBookingService.getBookingDetail(activeBookingId);
      setBookingDetail(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải chi tiết đơn');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeBookingId) {
      fetchBookingDetail();
    }
  }, [activeBookingId]);

  const handleConfirm = async () => {
    if (!activeBookingId) return;
    setIsConfirming(true);
    try {
      await meBookingService.customerConfirmBooking(activeBookingId);
      await fetchBookingDetail(); // Reload to see COMPLETED status
      setShowConfirmModal(false);
      setShowReviewModal(true); // Automatically trigger review modal after confirmation
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi nghiệm thu!');
    } finally {
      setIsConfirming(false);
    }
  };

  if (!activeBookingId) return null;
  if (isLoading && !bookingDetail) return <div className="p-4 text-slate-500">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!bookingDetail) return null;

  const isAwaiting = bookingDetail.status === 'AWAITING_CUSTOMER_CONFIRMATION';
  const isCompleted = bookingDetail.status === 'COMPLETED';
  const petInfo = bookingDetail.booking_pets?.[0];
  const provider = bookingDetail.provider_working_slots?.provider_working_days?.provider_profiles?.users;
  const evidence = bookingDetail.booking_media?.[0]; // Get the first uploaded evidence
  const existingReview = bookingDetail.reviews?.[0] || null;

  // Only render if awaiting or completed
  if (!isAwaiting && !isCompleted) return null;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm mt-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 rounded-full bg-amber-400"></div>
          <h3 className="text-xl font-bold text-slate-800 uppercase">
            Xác nhận nghiệm thu & Hỗ trợ
          </h3>
        </div>

        {/* Support quick action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDisputeModal(true)}
            className="h-9 text-xs rounded-xl border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold"
          >
            <FileWarning className="w-3.5 h-3.5 mr-1" />
            Mở khiếu nại
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowIncidentModal(true)}
            className="h-9 text-xs rounded-xl border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-bold"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Báo sự cố an toàn
          </Button>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <p className="text-slate-600">
            Đối tác <span className="font-bold text-slate-800">{provider?.fullName || 'Người chăm sóc'}</span> đã hoàn thành công việc chăm sóc cho bé <span className="font-bold text-amber-600">{petInfo?.pet_name || 'thú cưng'}</span>. 
            Vui lòng xem lại hình ảnh nghiệm thu và xác nhận để hoàn tất dịch vụ.
          </p>

          {isAwaiting && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">Hệ thống sẽ tự động hoàn tất và thanh toán cho đối tác sau 48h nếu bạn không có phản hồi khiếu nại.</p>
            </div>
          )}

          {isCompleted && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-green-600" />
                <div>
                  <p className="font-bold text-slate-800">Đã hoàn thành và thanh toán.</p>
                  {existingReview ? (
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Đánh giá của bạn: <span className="text-amber-500 font-bold">★ {existingReview.rating}/5</span> - {existingReview.comment || 'Không có nhận xét'}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 font-medium">Bạn chưa để lại đánh giá cho dịch vụ này.</p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setShowReviewModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 px-5 rounded-xl shadow-md shadow-amber-500/20 shrink-0"
              >
                <Star className="w-4 h-4 mr-2 fill-white" />
                {existingReview ? 'Sửa đánh giá' : 'Đánh giá ngay'}
              </Button>
            </div>
          )}
        </div>

        <div className="shrink-0 w-full md:w-1/3 flex flex-col items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          {/* Evidence Image */}
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-200 relative shadow-sm border border-slate-100">
            {evidence ? (
              <img src={evidence.media_url} alt="Ảnh nghiệm thu" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Chưa có ảnh</div>
            )}
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs p-1.5 rounded-lg text-center truncate">
              {evidence?.caption || 'Ảnh nghiệm thu từ đối tác'}
            </div>
          </div>

          {/* Action Button */}
          {isAwaiting && (
            <Button 
              onClick={() => setShowConfirmModal(true)}
              disabled={isConfirming}
              className="w-full bg-[#00a86b] hover:bg-[#008f5a] text-white font-bold h-12 shadow-md shadow-green-500/20"
            >
              {isConfirming ? 'Đang xử lý...' : (
                <><Check className="w-4 h-4 mr-2" /> Nghiệm thu ngay</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Beautiful Confirm Modal */}
      {showConfirmModal && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden transform transition-all scale-100">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-[#00a86b]"></div>
              
              <div className="w-16 h-16 bg-[#00a86b]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#00a86b]" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 text-center mb-3">Xác nhận nghiệm thu?</h3>
              
              <p className="text-slate-600 text-center mb-8">
                Bằng việc xác nhận, bạn đồng ý dịch vụ đã hoàn thành tốt. Số tiền thanh toán sẽ được giải ngân cho đối tác <span className="font-bold text-slate-800">{provider?.fullName || 'Người chăm sóc'}</span>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isConfirming}
                  variant="outline"
                  className="flex-1 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-bold h-12 rounded-xl"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="flex-1 bg-[#00a86b] hover:bg-[#008f5a] text-white font-bold h-12 rounded-xl shadow-lg shadow-green-500/30"
                >
                  {isConfirming ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        bookingId={activeBookingId}
        providerName={provider?.fullName || 'Người chăm sóc'}
        existingReview={existingReview}
        onSuccess={() => {
          fetchBookingDetail();
        }}
      />

      {/* Dispute Modal */}
      {showDisputeModal && (
        <DisputeForm
          bookingId={activeBookingId}
          onClose={() => setShowDisputeModal(false)}
          onSuccess={() => {
            setShowDisputeModal(false);
            fetchBookingDetail();
          }}
        />
      )}

      {/* Incident Modal */}
      <IncidentModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        bookingId={activeBookingId}
        onSuccess={() => {
          fetchBookingDetail();
        }}
      />
    </div>
  );
};

