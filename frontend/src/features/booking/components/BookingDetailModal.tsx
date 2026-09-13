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
    booking,
    checklist,
    isLoading,
    updateChecklistItem,
    submitReview,
    submitDispute,
    requestExtension,
  } = useBookingDetail(isOpen && bookingId ? bookingId : undefined);

  const [activeTab, setActiveTab] = useState<'info' | 'checklist' | 'actions'>('info');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [extMinutes, setExtMinutes] = useState(30);
  const [extReason, setExtReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen || !bookingId) return null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitReview(reviewRating, reviewComment);
    if (ok) setMessage('Đã gửi đánh giá thành công!');
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitDispute(disputeReason, disputeDesc);
    if (ok) setMessage('Đã gửi yêu cầu khiếu nại thành công!');
  };

  const handleExtensionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await requestExtension(extMinutes, extReason);
    if (ok) setMessage('Đã gửi yêu cầu gia hạn thời gian!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Chi Tiết Đơn Booking #{bookingId.slice(0, 8)}
            </h2>
            <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {booking?.status || 'Đang tải...'}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            ✕
          </button>
        </div>

        {message && (
          <div className="mt-3 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            {message}
          </div>
        )}

        {/* Tab Header */}
        <div className="mt-4 flex border-b dark:border-gray-800 text-sm">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2 px-4 font-medium border-b-2 transition ${
              activeTab === 'info'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Thông tin đơn
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-2 px-4 font-medium border-b-2 transition ${
              activeTab === 'checklist'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Checklist ({checklist.length})
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`pb-2 px-4 font-medium border-b-2 transition ${
              activeTab === 'actions'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tương tác & Khiếu nại
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-4 max-h-[360px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Đang tải thông tin đơn...</div>
          ) : activeTab === 'info' ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-xs text-gray-400">Tổng giá trị:</span>
                  <div className="text-base font-bold text-emerald-600">
                    {booking?.total_price ? Number(booking.total_price).toLocaleString('vi-VN') + ' đ' : 'N/A'}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-xs text-gray-400">Ngày yêu cầu:</span>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {booking?.requested_date ? new Date(booking.requested_date).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                </div>
              </div>

              {booking?.pet && (
                <div className="rounded-xl border p-3 dark:border-gray-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Thú Cưng</span>
                  <div className="mt-1 font-medium text-gray-800 dark:text-gray-200">{booking.pet.name} ({booking.pet.species})</div>
                </div>
              )}
            </div>
          ) : activeTab === 'checklist' ? (
            <div className="space-y-2">
              {checklist.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">Chưa có checklist item nào.</div>
              ) : (
                checklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-2.5 dark:border-gray-800">
                    <div>
                      <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{item.title}</div>
                      <span className="text-xs text-gray-400">{item.status}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateChecklistItem(item.id, { status: 'DONE' })}
                        className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      >
                        Hoàn thành
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Form Đánh giá */}
              <form onSubmit={handleReviewSubmit} className="space-y-3 rounded-xl border p-3.5 dark:border-gray-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Đánh giá dịch vụ</h4>
                <div className="flex gap-2 items-center text-sm">
                  <label>Số sao:</label>
                  <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="rounded border p-1 dark:bg-gray-800">
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} sao</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Nhập nhận xét..."
                  className="w-full rounded-lg border p-2 text-xs dark:bg-gray-800 dark:border-gray-700"
                  rows={2}
                />
                <button type="submit" className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                  Gửi đánh giá
                </button>
              </form>

              {/* Form Gia hạn */}
              <form onSubmit={handleExtensionSubmit} className="space-y-3 rounded-xl border p-3.5 dark:border-gray-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Yêu cầu gia hạn</h4>
                <div className="flex gap-2 items-center text-sm">
                  <label>Số phút gia hạn:</label>
                  <input
                    type="number"
                    value={extMinutes}
                    onChange={(e) => setExtMinutes(Number(e.target.value))}
                    className="w-20 rounded border p-1 text-xs dark:bg-gray-800"
                  />
                </div>
                <input
                  type="text"
                  value={extReason}
                  onChange={(e) => setExtReason(e.target.value)}
                  placeholder="Lý do gia hạn..."
                  className="w-full rounded-lg border p-2 text-xs dark:bg-gray-800 dark:border-gray-700"
                />
                <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700">
                  Yêu cầu gia hạn
                </button>
              </form>

              {/* Form Khiếu nại */}
              <form onSubmit={handleDisputeSubmit} className="space-y-3 rounded-xl border p-3.5 dark:border-gray-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-500">Gửi khiếu nại (Dispute)</h4>
                <input
                  type="text"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Tiêu đề khiếu nại..."
                  className="w-full rounded-lg border p-2 text-xs dark:bg-gray-800 dark:border-gray-700"
                />
                <textarea
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Mô tả chi tiết sự cố..."
                  className="w-full rounded-lg border p-2 text-xs dark:bg-gray-800 dark:border-gray-700"
                  rows={2}
                />
                <button type="submit" className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700">
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
