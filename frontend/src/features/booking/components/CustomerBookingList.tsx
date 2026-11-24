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
  ArrowUpRight,
  MapPin,
  UserCheck,
  Search,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useCustomerBookings } from '../hooks/useCustomerBookings';
import { CancelBookingModal } from './CancelBookingModal';
import { BookingDetailModal } from './BookingDetailModal';
import { Booking } from '../types';
import { useBookingStore } from '../stores/booking.store';

export const BOOKING_STATUS_MAP: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    barColor: string;
    dotColor: string;
    isLive?: boolean;
    icon: React.ReactNode;
  }
> = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    color: 'text-amber-800',
    bgColor: 'bg-amber-50 border-amber-200/90',
    barColor: 'bg-[#F7C948]',
    dotColor: 'bg-amber-500',
    isLive: true,
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  PENDING_PROVIDER_ACCEPTANCE: {
    label: 'Chờ chuyên viên nhận',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200/80',
    barColor: 'bg-blue-500',
    dotColor: 'bg-blue-500',
    isLive: true,
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  ACCEPTED: {
    label: 'Đã xác nhận lịch',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200/80',
    barColor: 'bg-indigo-500',
    dotColor: 'bg-indigo-500',
    isLive: true,
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  IN_PROGRESS: {
    label: 'Đang thực hiện',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200/80',
    barColor: 'bg-teal-500',
    dotColor: 'bg-teal-500',
    isLive: true,
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  AWAITING_CUSTOMER_CONFIRMATION: {
    label: 'Chờ bạn nghiệm thu',
    color: 'text-amber-800',
    bgColor: 'bg-amber-50 border-amber-300',
    barColor: 'bg-[#F7C948]',
    dotColor: 'bg-amber-500',
    isLive: true,
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200/80',
    barColor: 'bg-emerald-500',
    dotColor: 'bg-emerald-500',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 border-slate-200/80',
    barColor: 'bg-slate-300',
    dotColor: 'bg-slate-400',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: 'Từ chối / Đã hủy',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 border-slate-200/80',
    barColor: 'bg-slate-300',
    dotColor: 'bg-slate-400',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  EXPIRED: {
    label: 'Hết hạn thanh toán',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100 border-slate-200/80',
    barColor: 'bg-slate-300',
    dotColor: 'bg-slate-400',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  DISPUTED: {
    label: 'Đang khiếu nại',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200/80',
    barColor: 'bg-rose-500',
    dotColor: 'bg-rose-500',
    isLive: true,
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

const CANCELLABLE_STATUSES: string[] = [
  'PENDING_PAYMENT',
  'PENDING_PROVIDER_ACCEPTANCE',
  'ACCEPTED',
];

/** Helper trích xuất chính xác dữ liệu từ mọi cấu trúc trả về của API /bookings */
export function extractBookingDisplayInfo(booking: any) {
  const petItem = booking?.booking_pets?.[0] || booking?.pet;
  const serviceName =
    petItem?.booking_services?.[0]?.service_name ||
    petItem?.booking_services?.[0]?.services?.name ||
    petItem?.services?.name ||
    booking?.service?.name ||
    booking?.serviceName ||
    booking?.price_snapshot?.serviceName ||
    'Gói chăm sóc thú cưng tại nhà';

  const rawProviderName =
    booking?.provider_profiles?.users?.fullName ||
    booking?.provider_working_slots?.provider_working_days?.provider_profiles?.users?.fullName ||
    booking?.provider?.full_name ||
    booking?.provider?.fullName ||
    booking?.providerName ||
    'Chuyên viên PetCare';

  const providerName =
    String(rawProviderName).trim().toUpperCase() === 'PROVIDER'
      ? 'Chuyên viên PetCare'
      : rawProviderName;

  const petName = petItem?.pet_name || petItem?.name || petItem?.pets?.name || booking?.petName || null;
  const petSpecies = petItem?.species === 'Cat' ? 'Mèo' : petItem?.species === 'Dog' ? 'Cún' : null;
  const petWeight = petItem?.weight ? `${petItem.weight} kg` : null;

  const addressObj = booking?.address_snapshot;
  const shortAddress = addressObj
    ? [addressObj.district, addressObj.city].filter(Boolean).join(', ') || addressObj.addressLine
    : booking?.addressString || null;

  const slotStart =
    booking?.provider_working_slots?.start_time ||
    (booking?.estimated_start_at
      ? new Date(booking.estimated_start_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : null);
  const slotEnd =
    booking?.provider_working_slots?.end_time ||
    (booking?.estimated_end_at
      ? new Date(booking.estimated_end_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : null);
  const timeRange = slotStart && slotEnd ? `${slotStart} – ${slotEnd}` : slotStart || null;

  const code = `#PC-${String(booking?.id || '').slice(0, 8).toUpperCase()}`;

  return {
    serviceName,
    providerName,
    petName,
    petSpecies,
    petWeight,
    shortAddress,
    timeRange,
    code,
  };
}

function BookingCard({
  booking,
  index,
  onCancelClick,
  onPayClick,
  onViewDetails,
  onRebook,
}: {
  booking: Booking;
  index: number;
  onCancelClick: (b: Booking) => void;
  onPayClick: (b: Booking) => void;
  onViewDetails: (b: Booking) => void;
  onRebook?: () => void;
}) {
  const rawStatus = String(booking.status || '');
  const config = BOOKING_STATUS_MAP[rawStatus] || {
    label: rawStatus,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 border-slate-200',
    barColor: 'bg-slate-300',
    dotColor: 'bg-slate-400',
    icon: <Clock className="w-3.5 h-3.5" />,
  };
  const canCancel = CANCELLABLE_STATUSES.includes(rawStatus);

  const dateObj = React.useMemo(() => {
    const d = new Date(booking.requested_date);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [booking.requested_date]);

  const dayStr = String(dateObj.getDate()).padStart(2, '0');
  const monthStr = `Th${dateObj.getMonth() + 1}`;
  const fullDateStr = dateObj.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + ' đ';

  const isTerminated = ['CANCELLED', 'REJECTED', 'EXPIRED'].includes(rawStatus);
  const isCompleted = rawStatus === 'COMPLETED';
  const isRefunded = isTerminated && (booking.payments?.status === 'REFUNDED' || !!booking.payments);

  const info = extractBookingDisplayInfo(booking);

  return (
    <div
      style={{ animationDelay: `${Math.min(index * 55, 350)}ms` }}
      onClick={() => onViewDetails(booking)}
      className="group animate-stagger-card card-hover-lift relative bg-white rounded-3xl border border-slate-200/80 hover:border-[#08243D]/25 shadow-2xs overflow-hidden cursor-pointer"
    >
      {/* Left vertical status indicator bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.barColor} transition-all duration-300 group-hover:w-2`} />

      <div className="p-5 md:p-6 pl-6 md:pl-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left & Center: Date Calendar Tile + Main Service & Metadata */}
        <div className="flex items-start sm:items-center gap-4 md:gap-5 min-w-0 flex-1">
          {/* Luxury Date Calendar Badge */}
          <div
            className={`shrink-0 w-15 h-15 rounded-2xl flex flex-col items-center justify-center border transition-transform duration-300 group-hover:scale-105 ${
              isTerminated
                ? 'bg-slate-50 border-slate-200/80 text-slate-400'
                : isCompleted
                  ? 'bg-[#08243D] border-[#08243D] text-white shadow-xs'
                  : 'bg-[#08243D] border-[#08243D] text-[#F7C948] shadow-xs'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{monthStr}</span>
            <span className="text-xl font-bold leading-none mt-0.5 tabular-nums">{dayStr}</span>
          </div>

          {/* Info Column */}
          <div className="min-w-0 flex-1 space-y-2">
            {/* Code + Time Slot Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {info.code}
              </span>
              {info.timeRange && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50/80 border border-teal-200/60 px-2.5 py-0.5 rounded-md">
                  <Clock className="w-3 h-3" />
                  {info.timeRange} · {fullDateStr}
                </span>
              )}
              {!info.timeRange && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <CalendarDays className="w-3 h-3 text-slate-400" />
                  {fullDateStr}
                </span>
              )}
            </div>

            {/* Service Name */}
            <h3 className="font-bold text-[#08243D] text-base md:text-lg tracking-tight group-hover:text-teal-700 transition-colors truncate">
              {info.serviceName}
            </h3>

            {/* Metadata Pills: Pet, Provider, Address */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
              {info.petName && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#08243D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F7C948]" />
                  Bé: {info.petName}
                  {info.petWeight ? ` (${info.petWeight})` : ''}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                {info.providerName}
              </span>

              {info.shortAddress && (
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[230px]">{info.shortAddress}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Zone: Status Pill + Price + Action Buttons */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3.5 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0"
        >
          {/* Status Badge + Price Row */}
          <div className="flex flex-col lg:items-end gap-1.5">
            <div className="flex items-center gap-2">
              {isRefunded && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Đã hoàn ví
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.color}`}
              >
                {config.isLive ? (
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
                  </span>
                ) : (
                  config.icon
                )}
                {config.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2 lg:mt-1">
              <span className="text-[11px] text-slate-400 font-medium">Tổng thanh toán</span>
              <span className="text-lg md:text-xl font-bold text-[#08243D] tabular-nums">
                {formatPrice(Number(booking.total_price))}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {booking.status === 'PENDING_PAYMENT' && (
              <button
                type="button"
                onClick={() => onPayClick(booking)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#08243D] bg-[#F7C948] hover:bg-[#e6b93b] px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Thanh toán ngay
              </button>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={() => onCancelClick(booking)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 bg-rose-50 border border-rose-200/60 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Hủy lịch
              </button>
            )}

            {(isTerminated || isCompleted) && onRebook && (
              <button
                type="button"
                onClick={onRebook}
                title="Đặt lại dịch vụ mới"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#08243D] bg-white hover:bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại
              </button>
            )}

            <button
              type="button"
              onClick={() => onViewDetails(booking)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#08243D] bg-slate-100/90 group-hover:bg-[#08243D] group-hover:text-[#F7C948] px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Chi tiết
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomerBookingList({
  onPayBooking,
  onCreateNewBooking,
}: {
  onPayBooking?: (booking: Booking) => void;
  onCreateNewBooking?: () => void;
}) {
  type FilterTab = 'ALL' | 'PENDING_PAYMENT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  const { bookings, isLoading, refreshBookings } = useCustomerBookings();
  const { setCreatedBookingId, setStep } = useBookingStore();
  const [activeTab, setActiveTab] = React.useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [cancelTarget, setCancelTarget] = React.useState<Booking | null>(null);
  const [selectedDetailId, setSelectedDetailId] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const counts = React.useMemo(() => {
    return {
      ALL: bookings.length,
      PENDING_PAYMENT: bookings.filter((b) => b.status === 'PENDING_PAYMENT').length,
      IN_PROGRESS: bookings.filter((b) =>
        ['PENDING_PROVIDER_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS', 'AWAITING_CUSTOMER_CONFIRMATION', 'DISPUTED'].includes(
          String(b.status),
        ),
      ).length,
      COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
      CANCELLED: bookings.filter((b) => ['CANCELLED', 'REJECTED', 'EXPIRED'].includes(String(b.status))).length,
    };
  }, [bookings]);

  const filteredBookings = React.useMemo(() => {
    let list = bookings;
    if (activeTab === 'PENDING_PAYMENT') {
      list = list.filter((b) => b.status === 'PENDING_PAYMENT');
    } else if (activeTab === 'IN_PROGRESS') {
      list = list.filter((b) =>
        ['PENDING_PROVIDER_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS', 'AWAITING_CUSTOMER_CONFIRMATION', 'DISPUTED'].includes(
          String(b.status),
        ),
      );
    } else if (activeTab === 'COMPLETED') {
      list = list.filter((b) => b.status === 'COMPLETED');
    } else if (activeTab === 'CANCELLED') {
      list = list.filter((b) => ['CANCELLED', 'REJECTED', 'EXPIRED'].includes(String(b.status)));
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter((b) => {
      const info = extractBookingDisplayInfo(b);
      return (
        info.code.toLowerCase().includes(q) ||
        info.serviceName.toLowerCase().includes(q) ||
        info.providerName.toLowerCase().includes(q) ||
        (info.petName && info.petName.toLowerCase().includes(q)) ||
        (info.shortAddress && info.shortAddress.toLowerCase().includes(q))
      );
    });
  }, [bookings, activeTab, searchQuery]);

  const handlePayClick = (booking: Booking) => {
    setCreatedBookingId(booking.id);
    setStep(9);
    if (onPayBooking) {
      onPayBooking(booking);
    }
  };

  const handleCancelSuccess = () => {
    setSuccessMessage('Đơn đã hủy thành công. Tiền đã được hoàn vào ví điện tử của bạn.');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  if (isLoading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-slate-200/70">
        <Loader2 className="w-7 h-7 text-[#08243D] animate-spin" />
        <p className="text-slate-500 font-medium text-xs">Đang tải danh sách đặt lịch...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Filter Bar & Search Box */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 md:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
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
                  type="button"
                  onClick={() => setActiveTab(tab.id as FilterTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#08243D] text-white shadow-xs scale-[1.02]'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                      isActive ? 'bg-[#F7C948] text-[#08243D]' : 'bg-white text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right side: Quick Search & Refresh */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đơn, dịch vụ, bé cưng..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#08243D] transition-all"
              />
            </div>

            <button
              type="button"
              onClick={refreshBookings}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-[#08243D] transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-xs font-semibold text-emerald-700 animate-slide-down">
            {successMessage}
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div
            key={`empty-${activeTab}`}
            className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/70 flex flex-col items-center animate-scale-up"
          >
            <img src="/images/empty-booking.png" alt="Empty Booking" className="w-24 h-24 mb-3 object-contain opacity-80" />
            <h3 className="font-bold text-[#08243D] text-base mb-1">
              {bookings.length === 0 ? 'Chưa có đơn đặt lịch nào' : 'Không tìm thấy đơn đặt lịch phù hợp'}
            </h3>
            <p className="text-slate-400 text-xs max-w-sm">
              {bookings.length === 0
                ? 'Đặt lịch chăm sóc thú cưng tại nhà chỉ trong 30 giây với đội ngũ chuyên viên đã xác minh.'
                : 'Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm của bạn.'}
            </p>
            {onCreateNewBooking && bookings.length === 0 && (
              <button
                type="button"
                onClick={onCreateNewBooking}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#08243D] px-5 py-2.5 text-xs font-bold text-[#F7C948] hover:bg-[#0c3254] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Đặt lịch chăm sóc ngay
              </button>
            )}
          </div>
        ) : (
          <div key={`list-${activeTab}`} className="space-y-3.5">
            {filteredBookings.map((booking, index) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                index={index}
                onCancelClick={(b) => setCancelTarget(b)}
                onPayClick={handlePayClick}
                onViewDetails={(b) => setSelectedDetailId(b.id)}
                onRebook={onCreateNewBooking}
              />
            ))}
          </div>
        )}
      </div>

      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={handleCancelSuccess}
        />
      )}

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





