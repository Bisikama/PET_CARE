import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, Check, Star, AlertTriangle, FileWarning, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { meBookingService } from '../services/me-booking.service';
import { ReviewModal, DisputeForm, IncidentModal } from '@/features/customer-care/components';
import { Portal } from '@/components/ui/Portal';
import { ChatWindowModal } from '@/features/chat';
import { systemAlert } from '@/components/ui/SystemDialogProvider';

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
  const [showChatModal, setShowChatModal] = useState(false);
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

  const fetchBookingDetail = async (silent = false) => {
    if (!activeBookingId) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await meBookingService.getBookingDetail(activeBookingId);
      setBookingDetail(data);
    } catch (err: any) {
      if (!silent) setError(err.message || 'Lỗi tải chi tiết đơn');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeBookingId) {
      fetchBookingDetail(false);
    }
  }, [activeBookingId]);

  // Silent Auto-polling & Focus sync for customer action card on dashboard
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        if (activeBookingId) {
          fetchBookingDetail(true);
        }
      }
    }, 7000);

    const handleFocus = () => {
      if (activeBookingId) {
        fetchBookingDetail(true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
    };
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
      systemAlert(err.response?.data?.message || 'Lỗi khi nghiệm thu dịch vụ!', {
        title: 'Không thể nghiệm thu',
        type: 'error',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (!activeBookingId) return null;
  if (isLoading && !bookingDetail) return null;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!bookingDetail) return null;

  const isAwaiting = bookingDetail.status === 'AWAITING_CUSTOMER_CONFIRMATION';
  const isCompleted = bookingDetail.status === 'COMPLETED';
  const isOngoing = ['PENDING_PAYMENT', 'PENDING_PROVIDER_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS'].includes(
    String(bookingDetail.status),
  );
  const petInfo = bookingDetail.booking_pets?.[0];
  const serviceName =
    petInfo?.booking_services?.[0]?.service_name ||
    bookingDetail?.service?.name ||
    'Gói chăm sóc thú cưng';
  const provider =
    bookingDetail.provider_profiles?.users ||
    bookingDetail.provider_working_slots?.provider_working_days?.provider_profiles?.users;
  const evidence = bookingDetail.booking_media?.[0]; // Get the first uploaded evidence
  const existingReview = bookingDetail.reviews?.[0] || null;

  // Render if ongoing, awaiting confirmation, OR completed but not reviewed yet
  if (!isOngoing && !isAwaiting && (!isCompleted || existingReview)) return null;

  const statusLabels: Record<string, string> = {
    PENDING_PAYMENT: 'Chờ thanh toán ký quỹ',
    PENDING_PROVIDER_ACCEPTANCE: 'Chờ chuyên viên xác nhận',
    ACCEPTED: 'Đã xác nhận lịch hẹn',
    IN_PROGRESS: 'Đang thực hiện chăm sóc',
  };

  if (isOngoing) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/70">
              {statusLabels[bookingDetail.status] || bookingDetail.status}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              #PC-{String(bookingDetail.id || '').slice(0, 8).toUpperCase()}
            </span>
          </div>
          <h3 className="text-base font-bold text-[#08243D]">
            {serviceName} · Bé {petInfo?.pet_name || 'thú cưng'}
          </h3>
          <p className="text-xs text-slate-500">
            Chuyên viên: <strong className="text-slate-700">{provider?.fullName || 'Đang điều phối'}</strong>
            {bookingDetail.requested_date && (
              <> · Ngày hẹn: <strong className="text-slate-700">{new Date(bookingDetail.requested_date).toLocaleDateString('vi-VN')}</strong></>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {bookingDetail.status !== 'PENDING_PAYMENT' && (
            <button
              type="button"
              onClick={() => setShowChatModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#08243D] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Nhắn tin
            </button>
          )}
          <a
            href="/bookings"
            className="px-4 py-2 rounded-xl bg-[#08243D] hover:bg-[#0c3254] text-[#F7C948] text-xs font-bold transition-colors"
          >
            {bookingDetail.status === 'PENDING_PAYMENT' ? 'Thanh toán ngay →' : 'Xem lịch hẹn →'}
          </a>
        </div>

        <ChatWindowModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          bookingId={activeBookingId}
          partnerName={provider?.fullName}
        />
      </div>
    );
  }


  return (
    <div className="relative bg-white p-6 md:p-8 rounded-[36px] border-2 border-[#F7C948]/50 shadow-[0_20px_50px_-15px_rgba(247,201,72,0.2)] space-y-6 animate-slide-up overflow-hidden">
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#08243D] via-[#F7C948] to-teal-500" />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F7C948]/20 text-[#08243D] flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600">
              Cần phản hồi từ bạn
            </span>
            <h3 className="text-lg md:text-xl font-black text-[#08243D]">
              Xác nhận Nghiệm thu & Đánh giá Dịch vụ
            </h3>
          </div>
        </div>

        {/* Support quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setShowChatModal(true)}
            className="h-9 text-xs rounded-xl bg-[#08243D] hover:bg-[#0d3559] text-[#F7C948] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Nhắn tin Chuyên viên
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDisputeModal(true)}
            className="h-9 text-xs rounded-xl border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold cursor-pointer"
          >
            <FileWarning className="w-3.5 h-3.5 mr-1" />
            Mở khiếu nại
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowIncidentModal(true)}
            className="h-9 text-xs rounded-xl border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Báo sự cố
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-3xl p-6 border border-slate-200/70 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Chuyên viên <span className="font-extrabold text-[#08243D]">{provider?.fullName || 'Người chăm sóc'}</span> đã hoàn thành ca chăm sóc cho bé <span className="font-extrabold text-amber-600">{petInfo?.pet_name || 'thú cưng'}</span>. 
            Vui lòng kiểm tra hình ảnh nghiệm thu thực tế và xác nhận để hệ thống Escrow giải ngân.
          </p>

          {isAwaiting && (
            <div className="bg-amber-50/90 border border-amber-200/80 text-amber-900 p-4 rounded-2xl flex items-start gap-3 shadow-2xs">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <p className="text-xs font-semibold leading-relaxed">
                Hệ thống Escrow sẽ tự động hoàn tất và giải ngân cho đối tác sau <strong>48 giờ</strong> nếu bạn không gửi yêu cầu khiếu nại.
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/90 border border-emerald-200 text-emerald-900 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-extrabold text-sm text-[#08243D]">Đã hoàn thành và giải ngân Escrow.</p>
                  {existingReview ? (
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Đánh giá của bạn: <span className="text-amber-500 font-bold">★ {existingReview.rating}/5</span> - {existingReview.comment || 'Không có nhận xét'}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600 font-medium">Hãy chia sẻ trải nghiệm của bạn để giúp cộng đồng chủ nuôi nhé!</p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setShowReviewModal(true)}
                className="btn-shimmer bg-gradient-to-r from-[#F7C948] to-amber-400 hover:from-[#ffe074] hover:to-[#F7C948] text-[#08243D] font-extrabold h-10 px-5 rounded-xl shadow-md shadow-amber-500/20 shrink-0"
              >
                <Star className="w-4 h-4 mr-1.5 fill-[#08243D]" />
                {existingReview ? 'Sửa đánh giá' : 'Đánh giá ngay'}
              </Button>
            </div>
          )}
        </div>

        <div className="shrink-0 w-full md:w-1/3 flex flex-col items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200/80 pt-4 md:pt-0 md:pl-6">
          {/* Evidence Image */}
          <div className="group w-full aspect-square rounded-2xl overflow-hidden bg-slate-200 relative shadow-sm border border-slate-200">
            {evidence ? (
              <img
                src={evidence.media_url}
                alt="Ảnh nghiệm thu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
                Chưa có ảnh nghiệm thu
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 bg-[#08243D]/80 backdrop-blur-md text-white text-[11px] font-semibold p-2 rounded-xl text-center truncate">
              {evidence?.caption || 'Ảnh nghiệm thu từ chuyên viên'}
            </div>
          </div>

          {/* Action Button */}
          {isAwaiting && (
            <Button 
              onClick={() => setShowConfirmModal(true)}
              disabled={isConfirming}
              className="btn-shimmer w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold h-12 rounded-2xl shadow-lg shadow-emerald-600/25"
            >
              {isConfirming ? 'Đang xử lý...' : (
                <><Check className="w-4 h-4 mr-2 stroke-[3]" /> Xác nhận Nghiệm thu</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Beautiful Confirm Modal */}
      {showConfirmModal && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden transform transition-all scale-100 animate-scale-up">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#F7C948] to-teal-500"></div>
              
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              
              <h3 className="text-2xl font-black text-[#08243D] text-center mb-3">Xác nhận nghiệm thu?</h3>
              
              <p className="text-slate-600 text-sm leading-relaxed text-center mb-8">
                Bằng việc xác nhận, bạn đồng ý ca chăm sóc đã hoàn thành tốt. Số tiền tạm giữ Escrow sẽ được giải ngân cho chuyên viên <span className="font-bold text-[#08243D]">{provider?.fullName || 'Người chăm sóc'}</span>.
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
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-600/25"
                >
                  {isConfirming ? 'Đang xử lý...' : 'Xác nhận & Giải ngân'}
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

      {/* Chat Window Modal */}
      <ChatWindowModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        bookingId={activeBookingId}
        partnerName={provider?.fullName}
      />
    </div>
  );
};


