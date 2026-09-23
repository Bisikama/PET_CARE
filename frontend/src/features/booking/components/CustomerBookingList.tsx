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
  CreditCard,
  Eye,
} from 'lucide-react';
import { useCustomerBookings } from '../hooks/useCustomerBookings';
import { CancelBookingModal } from './CancelBookingModal';
import { BookingDetailModal } from './BookingDetailModal';
import { Booking, BookingStatus } from '../types';
import { useBookingStore } from '../stores/booking.store';

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
  onPayClick,
  onViewDetails,
}: {
  booking: Booking;
  onCancelClick: (b: Booking) => void;
  onPayClick: (b: Booking) => void;
  onViewDetails: (b: Booking) => void;
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
            <button
              onClick={() => onViewDetails(booking)}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              Chi tiết
            </button>
            {booking.status === 'PENDING_PAYMENT' && (
              <button
                onClick={() => onPayClick(booking)}
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#00a86b] hover:bg-[#008f5a] px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Thanh toán ngay
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onCancelClick(booking)}
                className="flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
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

export function CustomerBookingList({
  onPayBooking,
}: {
  onPayBooking?: (booking: Booking) => void;
}) {
  type FilterTab = 'ALL' | 'PENDING_PAYMENT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  const { bookings, isLoading, refreshBookings } = useCustomerBookings();
  const { setCreatedBookingId, setStep } = useBookingStore();
  const [activeTab, setActiveTab] = React.useState<FilterTab>('ALL');
  const [cancelTarget, setCancelTarget] = React.useState<Booking | null>(null);
  const [selectedDetailId, setSelectedDetailId] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const counts = React.useMemo(() => {
    return {
      ALL: bookings.length,
      PENDING_PAYMENT: bookings.filter((b) => b.status === 'PENDING_PAYMENT').length,
      IN_PROGRESS: bookings.filter((b) =>
        ['PENDING_PROVIDER_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS', 'DISPUTED'].includes(b.status)
      ).length,
      COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
      CANCELLED: bookings.filter((b) => ['CANCELLED', 'REJECTED'].includes(b.status)).length,
    };
  }, [bookings]);

  const filteredBookings = React.useMemo(() => {
    if (activeTab === 'ALL') return bookings;
    if (activeTab === 'PENDING_PAYMENT') {
      return bookings.filter((b) => b.status === 'PENDING_PAYMENT');
    }
    if (activeTab === 'IN_PROGRESS') {
      return bookings.filter((b) =>
        ['PENDING_PROVIDER_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS', 'DISPUTED'].includes(b.status)
      );
    }
    if (activeTab === 'COMPLETED') {
      return bookings.filter((b) => b.status === 'COMPLETED');
    }
    if (activeTab === 'CANCELLED') {
      return bookings.filter((b) => ['CANCELLED', 'REJECTED'].includes(b.status));
    }
    return bookings;
  }, [bookings, activeTab]);

  const handlePayClick = (booking: Booking) => {
    setCreatedBookingId(booking.id);
    setStep(9);
    if (onPayBooking) {
      onPayBooking(booking);
    }
  };

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

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
            { id: 'IN_PROGRESS', label: 'Đang thực hiện' },
            { id: 'COMPLETED', label: 'Hoàn thành' },
            { id: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => {
            const count = counts[tab.id as FilterTab];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-sm font-semibold text-emerald-700 animate-in slide-in-from-top-3 duration-300">
            {successMessage}
          </div>
        )}

        {/* Empty state */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 flex flex-col items-center">
            <img src="/images/empty-booking.png" alt="Empty Booking" className="w-32 h-32 mb-4 object-contain opacity-80" />
            <h3 className="font-bold text-slate-700 text-base mb-1">
              {bookings.length === 0 ? 'Chưa có đặt lịch nào' : 'Không tìm thấy đơn đặt lịch nào'}
            </h3>
            <p className="text-slate-400 text-xs">
              {bookings.length === 0
                ? 'Bắt đầu đặt dịch vụ chăm sóc thú cưng ngay!'
                : 'Không có đơn nào phù hợp với bộ lọc hiện tại.'}
            </p>
          </div>
        ) : (
          /* Booking list */
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancelClick={(b) => setCancelTarget(b)}
                onPayClick={handlePayClick}
                onViewDetails={(b) => setSelectedDetailId(b.id)}
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

      {/* Detail Modal */}
      {selectedDetailId && (
        <BookingDetailModal
          bookingId={selectedDetailId}
          isOpen={!!selectedDetailId}
          onClose={() => setSelectedDetailId(null)}
        />
      )}
    </>
  );
}

