'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { bookingService } from '../services/booking.service';
import { useDiscoverProviders } from '../hooks/useDiscoverProviders';
import { providerScheduleService } from '../services/provider-schedule.service';
import { ProviderWorkingSlotView } from '@/features/schedule/types';

// Hook to fetch provider's schedule
function useProviderSchedule(providerId: string | null, date: string) {
  const [loading, setLoading] = React.useState(false);
  const [slots, setSlots] = React.useState<ProviderWorkingSlotView[]>([]);

  React.useEffect(() => {
    if (!providerId || !date) return;
    let isMounted = true;
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const schedules = await providerScheduleService.getAvailableSlots(providerId, date, date);
        if (isMounted) {
          const daySchedule = schedules.find((s) => s.workDate === date);
          if (daySchedule) {
            setSlots(daySchedule.slots);
          } else {
            setSlots([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
        if (isMounted) setSlots([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSchedules();

    return () => { isMounted = false; };
  }, [providerId, date]);

  return { slots, loading };
}

export function TimeSelection() {
  const { 
    setStep, 
    selectedProviderId,
    selectedServiceId, 
    selectedPetId,
    selectedAddressId,
    selectedSlotId,
    setSelectedSlotId,
    createdBookingId,
    setCreatedBookingId,
    notes
  } = useBookingStore();

  const { providers } = useDiscoverProviders({
    serviceId: selectedServiceId || null,
    petId: selectedPetId || null,
    addressId: selectedAddressId || null,
  });

  const provider = providers.find((p) => p.id === selectedProviderId);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = React.useState<string>(todayStr);
  const [holdTimer, setHoldTimer] = React.useState<number | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = React.useState(false);

  const { slots, loading } = useProviderSchedule(selectedProviderId || null, selectedDate);

  const availableSlotsCount = React.useMemo(() => {
    return slots.filter((s) => s.status === 'AVAILABLE' && s.providerWorkingSlotId).length;
  }, [slots]);

  // Countdown logic for active hold timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (holdTimer !== null && holdTimer > 0) {
      interval = setInterval(() => {
        setHoldTimer((prev) => (prev ? prev - 1 : 0));
      }, 1000);
    } else if (holdTimer === 0) {
      // Timer expired, reset
      setSelectedSlotId(null);
      setHoldTimer(null);
    }
    return () => clearInterval(interval);
  }, [holdTimer, setSelectedSlotId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectSlot = (slotId: string) => {
    if (createdBookingId) return;
    setSelectedSlotId(slotId);
    setCreatedBookingId(null);
  };

  const handleCreateBooking = async () => {
    if (!selectedPetId || !selectedAddressId || !selectedServiceId || !selectedSlotId) {
      alert('Vui lòng chọn 1 khung giờ làm việc khả dụng.');
      return;
    }
    
    if (createdBookingId) {
      setStep(8);
      return;
    }

    setIsCreatingBooking(true);
    try {
      const createdBooking = await bookingService.createBooking({
        petId: selectedPetId,
        providerWorkingSlotId: selectedSlotId,
        addressId: selectedAddressId,
        serviceId: selectedServiceId,
        customerNote: notes || '',
      });

      const actualBookingId = createdBooking?.data?.booking?.id || createdBooking?.data?.id || createdBooking?.booking?.id || createdBooking?.id;
      if (actualBookingId) {
        setCreatedBookingId(actualBookingId);
        setHoldTimer(10 * 60); // 10 minutes temporary hold countdown
      }
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      alert(error?.response?.data?.message || 'Không thể tạo đơn đặt lịch. Khung giờ có thể đã được người khác giữ.');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-8 space-y-8 select-none border border-slate-100 shadow-sm animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="space-y-2 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
          Chọn Lịch Chăm Sóc & Giữ Chỗ Tạm Thời
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Chọn khung giờ khả dụng bên dưới. Khi bấm <span className="font-bold text-slate-800">"Đặt lịch & Giữ chỗ"</span>, hệ thống sẽ tạm khóa giữ chỗ cho bạn trong 10 phút để thanh toán.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Date Selection */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest text-center mb-4 pb-4 border-b border-slate-200/60">
              Chọn ngày chăm sóc
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlotId(null);
                    setCreatedBookingId(null);
                  }}
                  className="w-full p-4 pl-4 pr-10 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all cursor-pointer"
                />
                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-center text-xs font-semibold text-slate-500">
                Ngày được chọn: <span className="font-bold text-slate-700 border-b border-slate-300">{selectedDate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Provider Slots */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Khung giờ làm việc của {provider?.fullName?.split(' ').pop()?.toUpperCase() || 'CHUYÊN VIÊN'}:
            </h3>
            {availableSlotsCount > 0 && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                {availableSlotsCount} ca khả dụng
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 bg-slate-50/50 rounded-2xl border border-slate-100">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
              <span className="text-xs font-semibold text-slate-400">Đang kiểm tra lịch làm việc...</span>
            </div>
          ) : slots.length === 0 || availableSlotsCount === 0 ? (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Chưa có lịch đăng ký cho ngày này</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Chuyên viên <span className="font-semibold text-slate-800">{provider?.fullName || 'đối tác'}</span> chưa đăng ký ca làm việc nào vào ngày <span className="font-bold">{selectedDate}</span>. Vui lòng chọn ngày khác trên lịch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slots.map((slot) => {
                const hasSlotId = Boolean(slot.providerWorkingSlotId);
                const isAvailable = hasSlotId && slot.status === 'AVAILABLE';
                
                // CRITICAL FIX: Only evaluate isSelected if both IDs are non-null string values
                const isSelected = Boolean(
                  selectedSlotId && 
                  slot.providerWorkingSlotId && 
                  selectedSlotId === slot.providerWorkingSlotId
                );

                return (
                  <button
                    key={slot.slotId}
                    type="button"
                    onClick={() => {
                      if (isAvailable && slot.providerWorkingSlotId) {
                        handleSelectSlot(slot.providerWorkingSlotId);
                      }
                    }}
                    disabled={!isAvailable || !!createdBookingId}
                    className={`flex items-center justify-between p-4 rounded-[20px] border-2 transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/40 shadow-sm ring-2 ring-amber-400/20'
                        : isAvailable
                        ? 'border-slate-200 hover:border-teal-500 hover:shadow-md bg-white cursor-pointer'
                        : 'border-slate-100 bg-slate-50/80 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                      <Clock className={`w-4 h-4 ${isSelected ? 'text-amber-500' : isAvailable ? 'text-teal-500' : 'text-slate-400'}`} />
                      {slot.startTime} - {slot.endTime}
                    </div>

                    {isSelected ? (
                      <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {createdBookingId ? 'ĐANG GIỮ CHỖ' : 'ĐÃ CHỌN'}
                      </span>
                    ) : isAvailable ? (
                      <span className="text-[10px] font-black tracking-wider text-teal-600 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                        KHẢ DỤNG
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        {slot.status === 'BOOKED' ? 'ĐÃ ĐẶT' : 'CHƯA MỞ'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Hold Status Box - Only show when booking is successfully created */}
          {createdBookingId && holdTimer !== null && (
            <div className="mt-6 bg-[#ebf3ff] border border-blue-200 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span>Đang Giữ Chỗ Tạm Thời</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">10 Phút</span>
                  </h4>
                  <p className="text-xs font-medium text-slate-500">
                    Khung giờ <span className="font-bold text-slate-700">{slots.find(s => s.providerWorkingSlotId === selectedSlotId)?.startTime} - {slots.find(s => s.providerWorkingSlotId === selectedSlotId)?.endTime}</span> đã được bảo hộ tạm giữ cho bạn.
                  </p>
                </div>
              </div>
              <div className="px-5 py-2.5 bg-[#0a5cff] text-white text-lg font-black tracking-widest rounded-xl shadow-md">
                {formatTime(holdTimer)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-8">
        <button
          type="button"
          onClick={() => setStep(5)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>
        <button
          type="button"
          onClick={handleCreateBooking}
          disabled={!selectedSlotId || isCreatingBooking}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md"
        >
          {isCreatingBooking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang giữ chỗ...
            </>
          ) : createdBookingId ? (
            <>
              Xem chi tiết đơn & thanh toán
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Đặt lịch & Giữ chỗ
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
