'use client';

import * as React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useCustomerBookings } from '../hooks/useCustomerBookings';
import { CancelBookingModal } from './CancelBookingModal';
import { Booking, BookingStatus } from '../types';

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  PENDING_PROVIDER_ACCEPTANCE: {
    label: 'Chờ xác nhận',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  ACCEPTED: {
    label: 'Đã xác nhận',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  IN_PROGRESS: {
    label: 'Đang thực hiện',
    color: 'text-violet-700',
    bgColor: 'bg-violet-100',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: 'Đã hủy',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  DISPUTED: {
    label: 'Đang khiếu nại',
    color: 'text-rose-700',
    bgColor: 'bg-rose-100',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

const CANCELLABLE_STATUSES: BookingStatus[] = [
  'PENDING_PAYMENT',
  'PENDING_PROVIDER_ACCEPTANCE',
  'ACCEPTED',
];

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onCancelClick,
}: {
  booking: Booking;
  onCancelClick: (b: Booking) => void;
}) {
  const config = STATUS_CONFIG[booking.status] || {
    label: booking.status,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    icon: <XCircle className="w-3.5 h-3.5" />,
  };
  const canCancel = CANCELLABLE_STATUSES.includes(booking.status);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + ' đ';

  const isCancelled = booking.status === 'CANCELLED' || booking.status === 'REJECTED';
  const isRefunded = isCancelled && (booking.payments?.status === 'REFUNDED' || !!booking.payments);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Status bar */}
      <div className={`h-1 ${booking.status === 'COMPLETED' ? 'bg-emerald-400' : isCancelled ? 'bg-slate-300' : 'bg-blue-400'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
              {booking.service?.name || 'Dịch vụ thú cưng'}
            </p>
            <h3 className="font-black text-slate-800 text-base truncate">
              {booking.provider?.full_name || 'Người chăm sóc'}
            </h3>
          </div>
          <span
            className={`ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${config.bgColor} ${config.color}`}
          >
            {config.icon}
            {config.label}
          </span>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" />
            <span className="font-medium">{formatDate(booking.requested_date)}</span>
          </div>
          {booking.pet && (
            <div className="flex items-center gap-1.5">
              <span>🐾</span>
              <span className="font-medium">{booking.pet.name}</span>
            </div>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Tổng tiền</span>
            <p className="text-lg font-black text-slate-800">
              {formatPrice(Number(booking.total_price))}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isRefunded && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                💸 Đã hoàn ví
              </span>
            )}
            {canCancel && (
              <button
                onClick={() => onCancelClick(booking)}
                className="flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors"
              >
                Hủy
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CustomerBookingList() {
  const { bookings, isLoading, refreshBookings } = useCustomerBookings();
  const [cancelTarget, setCancelTarget] = React.useState<Booking | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleCancelSuccess = () => {
    setSuccessMessage('Đơn đã hủy thành công. Tiền đã được hoàn vào ví điện tử của bạn! 🎉');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  if (isLoading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Đang tải danh sách đặt lịch...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800">Lịch sử đặt dịch vụ</h2>
          <button
            onClick={refreshBookings}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-sm font-semibold text-emerald-700 animate-in slide-in-from-top-3 duration-300">
            {successMessage}
          </div>
        )}

        {/* Empty state */}
        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <div className="text-5xl mb-4">🐾</div>
            <h3 className="font-bold text-slate-700 text-lg mb-1">Chưa có đặt lịch nào</h3>
            <p className="text-slate-400 text-sm">Bắt đầu đặt dịch vụ chăm sóc thú cưng ngay!</p>
          </div>
        ) : (
          /* Booking list */
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancelClick={(b) => setCancelTarget(b)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={handleCancelSuccess}
        />
      )}
    </>
  );
}
