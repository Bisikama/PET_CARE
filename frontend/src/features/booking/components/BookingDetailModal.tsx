'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  AlertTriangle,
  Star,
  Clock,
  CheckCircle2,
  CalendarDays,
  MapPin,
  UserCheck,
  ShieldCheck,
  Sparkles,
  FileText,
  Receipt,
  ClipboardCheck,
  MessageSquarePlus,
} from 'lucide-react';
import { useBookingDetail } from '../hooks/useBookingDetail';
import { BOOKING_STATUS_MAP, extractBookingDisplayInfo } from './CustomerBookingList';

interface BookingDetailModalProps {
  bookingId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN').format(price) + ' đ';

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  bookingId,
  isOpen,
  onClose,
}) => {
  const {
    booking: rawBooking,
    checklist,
    isLoading,
    submitReview,
    submitDispute,
    requestExtension,
  } = useBookingDetail(isOpen && bookingId ? bookingId : undefined);

  const booking = rawBooking?.data?.booking || rawBooking?.data || rawBooking;

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'checklist' | 'actions'>('info');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [extMinutes, setExtMinutes] = useState(30);
  const [extReason, setExtReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('info');
    setShowDisputeForm(false);
    setMessage(null);
    setErrorMsg(null);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, bookingId, onClose]);

  if (!isOpen || !bookingId || !mounted) return null;

  const status = String(booking?.status || '');
  const statusInfo = BOOKING_STATUS_MAP[status] || {
    label: status || 'Đang tải...',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100 border-slate-200',
    barColor: 'bg-slate-300',
    dotColor: 'bg-slate-400',
    icon: <Clock className="w-3.5 h-3.5" />,
  };

  const showActionsTab =
    Boolean(status) &&
    status !== 'PENDING_PAYMENT' &&
    status !== 'CANCELLED' &&
    status !== 'REJECTED' &&
    status !== 'EXPIRED';

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);
    try {
      const ok = await submitReview(reviewRating, reviewComment);
      if (ok) setMessage('Đã gửi đánh giá chất lượng dịch vụ thành công!');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Lỗi khi gửi đánh giá');
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);
    try {
      const ok = await submitDispute(disputeReason, disputeDesc);
      if (ok) {
        setMessage('Đã gửi yêu cầu khiếu nại thành công! Đội ngũ Trọng tài sẽ xử lý sớm nhất.');
        setShowDisputeForm(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Lỗi khi gửi khiếu nại');
    }
  };

  const handleExtensionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);
    if (extMinutes < 15) {
      setErrorMsg('Số phút gia hạn phải từ 15 phút trở lên');
      return;
    }
    try {
      const ok = await requestExtension(extMinutes, extReason);
      if (ok) setMessage('Đã gửi yêu cầu gia hạn thời gian ca chăm sóc!');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Lỗi khi yêu cầu gia hạn');
    }
  };

  const displayInfo = extractBookingDisplayInfo(booking || { id: bookingId });
  const petItem = booking?.booking_pets?.[0] || booking?.pet;
  const petBreed = petItem?.breed || petItem?.pets?.breed || null;
  const petAge = petItem?.age || petItem?.pets?.age || null;

  const addressObj = booking?.address_snapshot;
  const fullAddress = addressObj
    ? [addressObj.addressLine, addressObj.ward, addressObj.district, addressObj.city]
        .filter(Boolean)
        .join(', ')
    : booking?.addressString || displayInfo.shortAddress || 'Địa chỉ khách hàng';
  const receiverInfo = addressObj
    ? [addressObj.receiverName, addressObj.receiverPhone].filter(Boolean).join(' · ')
    : null;

  // Price breakdown from price_snapshot
  const snap = booking?.price_snapshot || booking?.priceSnapshot || {};
  const totalPrice = Number(booking?.total_price ?? snap.finalPrice ?? 0);
  const discountAmount = Number(snap.discountAmount ?? booking?.discount_amount ?? 0);
  const travelFee = Number(snap.travelFee ?? 0);
  const distanceKm = snap.distanceKm != null ? Number(snap.distanceKm) : null;
  const servicePrice = Number(snap.servicePrice ?? Math.max(0, totalPrice - travelFee + discountAmount));

  const formattedDate = booking?.requested_date
    ? new Date(booking.requested_date).toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Đang cập nhật';

  const safeChecklist: any[] = Array.isArray(checklist)
    ? checklist
    : (checklist as any)?.checklistItems || [];
  const completedStepsCount = safeChecklist.filter((i) => i.status === 'DONE').length;

  const modalNode = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200/80 animate-scale-up flex flex-col max-h-[90vh]"
      >
        {/* Luxury Navy Editorial Header */}
        <div className="relative bg-[#08243D] px-6 py-5 text-white shrink-0 overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(247,201,72,0.15),transparent_65%)] pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-bold bg-white/10 border border-white/15 text-[#F7C948] px-2.5 py-0.5 rounded-lg">
                  {displayInfo.code}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusInfo.bgColor} ${statusInfo.color}`}
                >
                  {statusInfo.icon}
                  {statusInfo.label}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">
                {isLoading ? 'Đang tải thông tin đơn...' : displayInfo.serviceName}
              </h2>

              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-[#F7C948]" />
                  {formattedDate}
                </span>
                {displayInfo.timeRange && (
                  <>
                    <span className="text-white/30">·</span>
                    <span className="inline-flex items-center gap-1 text-[#F7C948] font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Ca {displayInfo.timeRange}
                    </span>
                  </>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Đóng"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Segmented Pill Tabs inside Header */}
          <div className="relative z-10 mt-5 flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/10 w-fit max-w-full overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-[#F7C948] text-[#08243D] shadow-2xs'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Thông tin đơn
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-[#F7C948] text-[#08243D] shadow-2xs'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              Quy trình thực hiện ({safeChecklist.length})
            </button>
            {showActionsTab && (
              <button
                type="button"
                onClick={() => setActiveTab('actions')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'actions'
                    ? 'bg-[#F7C948] text-[#08243D] shadow-2xs'
                    : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                Đánh giá & Hỗ trợ
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {message && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-700 animate-slide-down">
              {message}
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700 animate-slide-down">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 rounded-full border-3 border-slate-200 border-t-[#08243D] animate-spin" />
              <p className="text-xs font-medium text-slate-400">Đang tải chi tiết đơn đặt lịch...</p>
            </div>
          ) : activeTab === 'info' ? (
            <div className="space-y-4 animate-fade-in">
              {/* Row 1: Pet Profile & Assigned Provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Pet Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#08243D] text-[#F7C948] flex items-center justify-center shrink-0 font-bold text-sm">
                    🐾
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Thú cưng được chăm sóc
                    </span>
                    <div className="font-bold text-[#08243D] text-sm mt-0.5 truncate">
                      {displayInfo.petName || 'Thú cưng'}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {displayInfo.petSpecies && (
                        <span className="text-[11px] font-medium bg-white border border-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md">
                          {displayInfo.petSpecies}
                        </span>
                      )}
                      {petBreed && (
                        <span className="text-[11px] font-medium bg-white border border-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md">
                          {petBreed}
                        </span>
                      )}
                      {displayInfo.petWeight && (
                        <span className="text-[11px] font-semibold bg-white border border-slate-200/80 text-[#08243D] px-2 py-0.5 rounded-md">
                          {displayInfo.petWeight}
                        </span>
                      )}
                      {petAge && (
                        <span className="text-[11px] font-medium bg-white border border-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md">
                          {petAge} tuổi
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Provider Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Chuyên viên phụ trách
                    </span>
                    <div className="font-bold text-[#08243D] text-sm mt-0.5 truncate">
                      {displayInfo.providerName}
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50/80 border border-teal-200/60 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3" />
                      Đã xác minh danh tính
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Service Location */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 text-[#08243D] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Địa chỉ thực hiện tại nhà
                  </span>
                  {receiverInfo && (
                    <div className="text-xs font-bold text-[#08243D] mt-0.5">{receiverInfo}</div>
                  )}
                  <div className="text-xs font-medium text-slate-600 mt-0.5 leading-relaxed">
                    {fullAddress}
                  </div>
                </div>
              </div>

              {/* Customer Note if present */}
              {booking?.customer_note && (
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 text-slate-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Ghi chú cho chuyên viên
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{booking.customer_note}</p>
                  </div>
                </div>
              )}

              {/* Row 3: Financial Receipt & Escrow Breakdown */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 md:p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-[#08243D] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F7C948]" />
                    Chi tiết thanh toán
                  </span>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-0.5 rounded-full">
                    Bảo vệ Escrow 100%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Gói dịch vụ ({displayInfo.serviceName})</span>
                    <span className="font-semibold text-slate-800 tabular-nums">{formatPrice(servicePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>
                      Phí di chuyển tận nhà
                      {distanceKm !== null ? ` (~${distanceKm.toLocaleString('vi-VN')} km)` : ''}
                    </span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {travelFee > 0 ? formatPrice(travelFee) : 'Miễn phí'}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-semibold">
                      <span>Ưu đãi / Voucher{snap.promoCode ? ` (${snap.promoCode})` : ''}</span>
                      <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-[#08243D] uppercase tracking-wider">Tổng thanh toán</span>
                  <span className="text-xl font-bold text-[#08243D] tabular-nums">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          ) : activeTab === 'checklist' ? (
            <div className="space-y-4 animate-fade-in">
              {safeChecklist.length === 0 ? (
                <div className="py-12 text-center text-xs font-medium text-slate-400 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                  Chuyên viên sẽ cập nhật tiến độ từng bước tại đây ngay khi bắt đầu ca chăm sóc.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3">
                    <span className="text-xs font-bold text-[#08243D]">Tiến độ thực hiện quy trình</span>
                    <span className="text-xs font-bold text-teal-700">
                      Hoàn thành {completedStepsCount}/{safeChecklist.length} bước
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {safeChecklist.map((item: any, idx: number) => {
                      const isDone = item.status === 'DONE';
                      return (
                        <div
                          key={item.id || idx}
                          className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-colors ${
                            isDone
                              ? 'border-emerald-200/80 bg-emerald-50/40'
                              : 'border-slate-200/70 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-[#08243D] truncate">{item.title}</div>
                              {item.petName && (
                                <div className="text-[11px] text-slate-400 mt-0.5">Bé: {item.petName}</div>
                              )}
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${
                              isDone
                                ? 'bg-emerald-100/80 text-emerald-800'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isDone ? 'Đã xong' : 'Chờ thực hiện'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Form Đánh giá (chỉ hiện khi đã COMPLETED) */}
              {status === 'COMPLETED' && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="space-y-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#F7C948] fill-[#F7C948]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#08243D]">
                      Đánh giá chất lượng dịch vụ
                    </h4>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating
                              ? 'text-[#F7C948] fill-[#F7C948]'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-[#08243D]">{reviewRating}/5 sao</span>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về chuyên viên chăm sóc..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-white text-slate-800 outline-none focus:border-[#08243D]"
                    rows={2}
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#08243D] hover:bg-[#0c3254] px-4 py-2.5 text-xs font-bold text-[#F7C948] transition-colors cursor-pointer"
                  >
                    Gửi đánh giá
                  </button>
                </form>
              )}

              {/* Form Gia hạn */}
              {(status === 'IN_PROGRESS' || status === 'ACCEPTED' || status === 'PENDING_PROVIDER_ACCEPTANCE') && (
                <form
                  onSubmit={handleExtensionSubmit}
                  className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#08243D]">
                    Yêu cầu gia hạn thời gian (Tối thiểu 15 phút)
                  </h4>
                  <div className="flex gap-2 items-center text-xs font-semibold text-slate-700">
                    <label>Số phút thêm:</label>
                    <input
                      type="number"
                      min={15}
                      value={extMinutes}
                      onChange={(e) => setExtMinutes(Number(e.target.value))}
                      className="w-24 rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white font-bold outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={extReason}
                    onChange={(e) => setExtReason(e.target.value)}
                    placeholder="Lý do cần gia hạn thêm thời gian..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-white text-slate-800 outline-none focus:border-[#08243D]"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#08243D] hover:bg-[#0c3254] px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Gửi yêu cầu gia hạn
                  </button>
                </form>
              )}

              {/* Collapsible Dispute Section */}
              {!showDisputeForm ? (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Bạn gặp sự cố hoặc cần Trọng tài Escrow hỗ trợ cho đơn này?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDisputeForm(true)}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer shrink-0 ml-3"
                  >
                    Mở khiếu nại
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleDisputeSubmit}
                  className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50/40 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      Gửi khiếu nại dịch vụ
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowDisputeForm(false)}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Thu gọn
                    </button>
                  </div>
                  <input
                    type="text"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Tiêu đề sự cố..."
                    required
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-white text-slate-800 outline-none"
                  />
                  <textarea
                    value={disputeDesc}
                    onChange={(e) => setDisputeDesc(e.target.value)}
                    placeholder="Mô tả chi tiết để đội ngũ Trọng tài Escrow hỗ trợ..."
                    required
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-white text-slate-800 outline-none"
                    rows={2}
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Gửi yêu cầu khiếu nại
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Clean Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">
            Mã tham chiếu: <strong className="font-mono text-slate-600">{displayInfo.code}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#08243D] hover:bg-[#0c3254] px-5 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};




