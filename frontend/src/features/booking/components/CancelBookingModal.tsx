'use client';

import * as React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useCancelBooking } from '../hooks/useCustomerBookings';
import { Booking, CancelReason } from '../types';

interface CancelBookingModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  /** Callback sau khi hủy thành công (vd: show toast, refresh wallet UI) */
  onSuccess?: () => void;
}

const CANCEL_REASONS: { value: CancelReason; label: string }[] = [
  { value: 'CUSTOMER_REQUEST', label: 'Tôi muốn thay đổi lịch hẹn' },
  { value: 'SCHEDULE_CONFLICT', label: 'Bận việc đột xuất, không sắp xếp được' },
  { value: 'PROVIDER_UNAVAILABLE', label: 'Người chăm sóc không phù hợp' },
  { value: 'OTHER', label: 'Lý do khác' },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN').format(price) + ' đ';

export function CancelBookingModal({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: CancelBookingModalProps) {
  const { cancelBooking, isLoading, error } = useCancelBooking();
  const [selectedReason, setSelectedReason] = React.useState<CancelReason>('CUSTOMER_REQUEST');
  const [note, setNote] = React.useState('');

  const handleConfirm = async () => {
    const success = await cancelBooking(booking.id, selectedReason, note || undefined);
    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  // Reset state khi đóng modal
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedReason('CUSTOMER_REQUEST');
      setNote('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-rose-50 px-6 pt-6 pb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Xác nhận hủy đặt lịch</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Thao tác này không thể hoàn tác
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Refund Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3">
            <span className="text-2xl">💸</span>
            <div>
              <p className="text-sm font-bold text-emerald-800">Hoàn tiền vào Ví điện tử</p>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Sau khi hủy, số tiền{' '}
                <span className="font-black">{formatPrice(Number(booking.total_price))}</span>{' '}
                sẽ được hoàn lại vào ví của bạn ngay lập tức để dùng cho lần đặt sau.
              </p>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Lý do hủy <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {CANCEL_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedReason === r.value
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancel-reason"
                    value={r.value}
                    checked={selectedReason === r.value}
                    onChange={() => setSelectedReason(r.value)}
                    className="accent-rose-500"
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedReason === r.value ? 'text-rose-700' : 'text-slate-600'
                    }`}
                  >
                    {r.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          {selectedReason === 'OTHER' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-sm font-bold text-slate-700">Ghi chú thêm</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập lý do của bạn..."
                rows={3}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:border-rose-400 focus:outline-none resize-none transition-colors"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Giữ lại đặt lịch
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang hủy...
                </>
              ) : (
                'Xác nhận hủy'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
