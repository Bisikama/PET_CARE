'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useBookingStore } from '../stores/booking.store';
import { bookingService } from '../services/booking.service';
import { useDiscoverProviders } from '../hooks/useDiscoverProviders';
import { scheduleService } from '@/features/schedule/services/schedule.service';
import { ProviderWorkingSlotView } from '@/features/schedule/types';

// Hook to fetch provider's schedule
function useProviderSchedule(providerId: string | null, date: string) {
  const [loading, setLoading] = React.useState(false);
  const [slots, setSlots] = React.useState<ProviderWorkingSlotView[]>([]);

  React.useEffect(() => {
    if (!providerId) return;
    let isMounted = true;
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const schedules = await scheduleService.getProviderSchedules(date, date, providerId);
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
    notes
  } = useBookingStore();

  const { providers } = useDiscoverProviders({
    serviceId: selectedServiceId || null,
    petId: selectedPetId || null,
    addressId: selectedAddressId || null,
  });

  const provider = providers.find((p) => p.id === selectedProviderId);

  // Today formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = React.useState<string>(todayStr);
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(null);
  const [holdTimer, setHoldTimer] = React.useState<number | null>(null);
  const [isHolding, setIsHolding] = React.useState(false);

  const { slots, loading } = useProviderSchedule(selectedProviderId || null, selectedDate);

  // Countdown logic
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
  }, [holdTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleHoldSlot = async (slotId: string) => {
    if (isHolding) return;
    
    setIsHolding(true);
    try {
      if (!selectedPetId || !selectedAddressId || !selectedServiceId) {
        throw new Error('Thiếu thông tin đặt lịch.');
      }
      // Assuming bookingService.createBooking is available and properly configured
      await bookingService.createBooking({
        petId: selectedPetId,
        providerWorkingSlotId: slotId,
        addressId: selectedAddressId,
        serviceId: selectedServiceId,
        customerNote: notes || '',
      });
      
      setSelectedSlotId(slotId);
      setHoldTimer(10 * 60); // 10 minutes
    } catch (error: any) {
      console.error('Failed to hold slot:', error);
      alert(error?.response?.data?.message || 'Không thể giữ chỗ. Vui lòng thử lại.');
    } finally {
      setIsHolding(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-8 space-y-8 select-none border border-slate-100 shadow-sm animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="space-y-2 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
          Chọn Lịch Chăm Sóc & Giữ Chỗ Tạm Thời
        </h2>
        <p className="text-slate-400 text-sm font-medium">
          Khi bạn chọn 1 khung giờ, hệ thống sẽ Khóa & Giữ Chỗ tạm thời cho bạn trong 10 phút để thanh toán.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Date Selection */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest text-center mb-4 pb-4 border-b border-slate-200/60">
              Chọn ngày chăm sóc
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-4 pl-4 pr-10 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all cursor-pointer"
                />
                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-center text-xs font-semibold text-slate-500">
                Bạn đang xếp lịch phục vụ cho ngày làm việc <span className="font-bold text-slate-700 border-b border-slate-300">{selectedDate}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Slots */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            Khung giờ làm việc của {provider?.fullName?.split(' ').pop()?.toUpperCase() || 'CHUYÊN VIÊN'}:
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
              <span className="text-xs font-semibold text-slate-400">Đang tải lịch trống...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-sm font-semibold text-slate-500">
                Chuyên viên không có lịch làm việc trong ngày này.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slots.map((slot) => {
                const isSelected = selectedSlotId === slot.providerWorkingSlotId;
                const isAvailable = slot.status === 'AVAILABLE';
                return (
                  <button
                    key={slot.slotId}
                    onClick={() => slot.providerWorkingSlotId && handleHoldSlot(slot.providerWorkingSlotId)}
                    disabled={!isAvailable || (selectedSlotId !== null && selectedSlotId !== slot.providerWorkingSlotId) || isHolding}
                    className={`flex items-center justify-between p-4 rounded-[20px] border-2 transition-all ${
                      isSelected
                        ? 'border-[#f0c05a] bg-amber-50/10'
                        : isAvailable
                        ? 'border-slate-100 hover:border-slate-200 bg-white cursor-pointer'
                        : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                      <Clock className={`w-4 h-4 ${isSelected ? 'text-[#f0c05a]' : 'text-slate-400'}`} />
                      {slot.startTime} - {slot.endTime}
                    </div>
                    {isSelected ? (
                      <span className="px-3 py-1 bg-slate-800 text-white text-[10px] font-black rounded-lg">
                        GIỮ CHỖ (PENDING)
                      </span>
                    ) : (
                      <span className={`text-[10px] font-black tracking-wider ${isAvailable ? 'text-teal-600' : 'text-slate-400'}`}>
                        {isAvailable ? 'KHẢ DỤNG' : 'ĐÃ ĐẶT'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Hold Status Box */}
          {selectedSlotId && holdTimer !== null && (
            <div className="mt-6 bg-[#ebf3ff] border border-blue-200 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Đang Giữ Chỗ Tạm Thời</h4>
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
          onClick={() => setStep(5)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>
        <button
          onClick={() => setStep(7)}
          disabled={!selectedSlotId}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all"
        >
          Xem hóa đơn ký quỹ
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
