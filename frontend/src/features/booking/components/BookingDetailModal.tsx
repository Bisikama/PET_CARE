'use client';

import React, { useState } from 'react';
import { useBookingDetail } from '../hooks/useBookingDetail';

interface BookingDetailModalProps {
  bookingId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  bookingId,
  isOpen,
  onClose,
}) => {
  const {
    booking: rawBooking,
    checklist,
    isLoading,
    updateChecklistItem,
    submitReview,
    submitDispute,
    requestExtension,
  } = useBookingDetail(isOpen && bookingId ? bookingId : undefined);

  const booking = rawBooking?.data?.booking || rawBooking?.data || rawBooking;

  const [activeTab, setActiveTab] = useState<'info' | 'checklist' | 'actions'>('info');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [extMinutes, setExtMinutes] = useState(30);
  const [extReason, setExtReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !bookingId) return null;

  const status = booking?.status || '';
  const showActionsTab = status !== 'PENDING_PAYMENT' && status !== 'CANCELLED' && status !== 'REJECTED';

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);
    try {
      const ok = await submitReview(reviewRating, reviewComment);
      if (ok) setMessage('Đã gửi đánh giá thành công!');
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
      if (ok) setMessage('Đã gửi yêu cầu khiếu nại thành công!');
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
      if (ok) setMessage('Đã gửi yêu cầu gia hạn thời gian!');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Lỗi khi yêu cầu gia hạn');
    }
  };

  // Data extractors
  const serviceName =
    booking?.booking_pets?.[0]?.booking_services?.[0]?.service_name ||
    booking?.service?.name ||
    booking?.serviceName ||
    'Dịch vụ chăm sóc thú cưng';

  const providerName =
    booking?.provider_profiles?.users?.fullName ||
    booking?.provider_working_slots?.provider_working_days?.provider_profiles?.users?.fullName ||
    booking?.provider?.full_name ||
    booking?.providerName ||
    'Người chăm sóc';

  const petItem = booking?.booking_pets?.[0] || booking?.pet;
  const petName = petItem?.pet_name || petItem?.name || booking?.petName || 'Thú cưng';
  const petBreed = petItem?.breed || null;
  const petSpecies = petItem?.species ? (petItem.species === 'Cat' ? 'Mèo' : 'Chó') : null;
  const petWeight = petItem?.weight ? `${petItem.weight} kg` : null;

  const addressObj = booking?.address_snapshot;
  const addressString = addressObj
    ? [addressObj.addressLine, addressObj.ward, addressObj.district, addressObj.city]
        .filter(Boolean)
        .join(', ')
    : booking?.addressString || null;

  const safeChecklist: any[] = Array.isArray(checklist)
    ? checklist
    : (checklist as any)?.checklistItems || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-800">
                Chi Tiết Đơn Booking
              </h2>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                #{bookingId.slice(0, 8)}
              </span>
            </div>
            <span className="inline-block mt-1.5 text-xs px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Trạng thái: {status || 'Đang tải...'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className="mt-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-700">
            {message}
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Tab Header */}
        <div className="mt-4 flex border-b border-slate-100 text-sm gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-4 font-bold border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-[#00a86b] text-[#00a86b]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Thông tin đơn
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-2.5 px-4 font-bold border-b-2 transition-colors ${
              activeTab === 'checklist'
                ? 'border-[#00a86b] text-[#00a86b]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Checklist ({safeChecklist.length})
          </button>
          {showActionsTab && (
            <button
              onClick={() => setActiveTab('actions')}
              className={`pb-2.5 px-4 font-bold border-b-2 transition-colors ${
                activeTab === 'actions'
                  ? 'border-[#00a86b] text-[#00a86b]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Tương tác & Khiếu nại
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="mt-4 max-h-[400px] overflow-y-auto pr-1 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-sm font-medium text-slate-400">Đang tải thông tin đơn...</div>
          ) : activeTab === 'info' ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Tổng tiền:</span>
                  <div className="text-xl font-black text-[#00a86b]">
                    {booking?.total_price ? Number(booking.total_price).toLocaleString('vi-VN') + ' đ' : 'N/A'}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Ngày làm ca:</span>
                  <div className="text-sm font-bold text-slate-800 mt-1">
                    {booking?.requested_date ? new Date(booking.requested_date).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Dịch vụ thực hiện:</span>
                  <div className="font-extrabold text-slate-800 text-base">{serviceName}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Người chăm sóc (Provider):</span>
                  <div className="font-extrabold text-blue-600 text-base">{providerName}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Thông tin thú cưng:</span>
                <div className="font-extrabold text-slate-800 text-base">
                  {petName}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1 flex flex-wrap gap-2">
                  {petSpecies && <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md">Loài: {petSpecies}</span>}
                  {petBreed && <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md">Giống: {petBreed}</span>}
                  {petWeight && <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md">Cân nặng: {petWeight}</span>}
                </div>
              </div>

              {addressString && (
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Địa chỉ thực hiện:</span>
                  <div className="font-semibold text-slate-700 text-xs leading-relaxed">
                    {addressString}
                  </div>
                </div>
              )}

              {booking?.customer_note && (
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Ghi chú từ khách hàng:</span>
                  <p className="text-slate-600 italic text-xs">{booking.customer_note}</p>
                </div>
              )}
            </div>
          ) : activeTab === 'checklist' ? (
            <div className="space-y-2">
              {safeChecklist.length === 0 ? (
                <div className="py-8 text-center text-sm font-medium text-slate-400">Chưa có mục checklist nào.</div>
              ) : (
                safeChecklist.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                    <div>
                      <div className="font-bold text-sm text-slate-800">{item.title}</div>
                      {item.petName && <div className="text-xs text-slate-400 mt-0.5">Thú cưng: {item.petName}</div>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status === 'DONE' ? 'Đã hoàn thành' : 'Chờ thực hiện'}
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Form Đánh giá (chỉ hiện khi đã COMPLETED) */}
              {status === 'COMPLETED' && (
                <form onSubmit={handleReviewSubmit} className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Đánh giá dịch vụ</h4>
                  <div className="flex gap-2 items-center text-sm font-semibold text-slate-700">
                    <label>Số sao:</label>
                    <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="rounded-xl border border-slate-200 p-1.5 bg-white text-sm font-bold">
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{r} sao</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Nhập nhận xét của bạn về trải nghiệm..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-white text-slate-800"
                    rows={2}
                  />
                  <button type="submit" className="rounded-xl bg-[#00a86b] hover:bg-[#008f5a] px-4 py-2 text-xs font-bold text-white transition-all">
                    Gửi đánh giá
                  </button>
                </form>
              )}

              {/* Form Gia hạn (chỉ hiện khi đơn đang thực hiện / đã chấp nhận) */}
              {(status === 'IN_PROGRESS' || status === 'ACCEPTED' || status === 'PENDING_PROVIDER_ACCEPTANCE') && (
                <form onSubmit={handleExtensionSubmit} className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Yêu cầu gia hạn thời gian (Tối thiểu 15 phút)</h4>
                  <div className="flex gap-2 items-center text-sm font-semibold text-slate-700">
                    <label>Số phút gia hạn:</label>
                    <input
                      type="number"
                      min={15}
                      value={extMinutes}
                      onChange={(e) => setExtMinutes(Number(e.target.value))}
                      className="w-24 rounded-xl border border-slate-200 p-1.5 text-xs bg-white font-bold"
                    />
                  </div>
                  <input
                    type="text"
                    value={extReason}
                    onChange={(e) => setExtReason(e.target.value)}
                    placeholder="Nhập lý do cần gia hạn ca chăm sóc..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-white text-slate-800"
                  />
                  <button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition-all">
                    Gửi yêu cầu gia hạn
                  </button>
                </form>
              )}

              {/* Form Khiếu nại */}
              <form onSubmit={handleDisputeSubmit} className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-600">Gửi khiếu nại dịch vụ</h4>
                <input
                  type="text"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Tiêu đề khiếu nại..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-white text-slate-800"
                />
                <textarea
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Mô tả chi tiết sự cố..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-white text-slate-800"
                  rows={2}
                />
                <button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition-all">
                  Gửi khiếu nại
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


