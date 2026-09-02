'use client';

import React, { useEffect, useState } from 'react';
import { useScheduleStore } from '../store/schedule.store';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface CustomerProviderScheduleViewProps {
  providerId: string;
  providerName: string;
  onSelectSlot?: (date: string, slotId: string) => void;
}

export const CustomerProviderScheduleView: React.FC<CustomerProviderScheduleViewProps> = ({
  providerId,
  providerName,
  onSelectSlot,
}) => {
  const timeSlots = useScheduleStore(state => state.timeSlots);
  const fetchTimeSlots = useScheduleStore(state => state.fetchTimeSlots);
  const isLoading = useScheduleStore(state => state.isLoadingSlots);
  
  // Create a 7-day view starting from tomorrow
  const [dates, setDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeSlots();
    
    const next7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + 1 + i); // Start from tomorrow
      return d;
    });
    setDates(next7Days);
    setSelectedDate(next7Days[0]);
  }, [fetchTimeSlots]);

  const formatDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // This is a mock function to simulate whether a slot is available for this provider.
  // In reality, you'd fetch this from the backend (e.g., GET /api/service-discovery/providers/:id/schedules)
  const isSlotAvailable = (slotId: string, date: Date) => {
    // Just a mock logic: make some slots randomly available based on date and slotId
    const charCode = slotId.charCodeAt(0) + date.getDate();
    return charCode % 3 !== 0; // ~66% chance of being available
  };

  const handleConfirm = () => {
    if (selectedDate && selectedSlotId && onSelectSlot) {
      onSelectSlot(formatDateString(selectedDate), selectedSlotId);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
      <div className="space-y-1 pb-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Lịch trống của {providerName}
        </h3>
        <p className="text-slate-500 text-xs font-medium">
          Chọn ngày và khung giờ bạn muốn đặt lịch
        </p>
      </div>

      {/* Date selector */}
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {dates.map((d, idx) => {
          const isActive = selectedDate?.toDateString() === d.toDateString();
          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedDate(d);
                setSelectedSlotId(null);
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border min-w-[70px] transition-all shrink-0 ${
                isActive
                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300'
              }`}
            >
              <span className={`text-[10px] font-bold ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>
                {dayNames[d.getDay()]}
              </span>
              <span className="text-lg font-black mt-0.5">{d.getDate()}</span>
              <span className={`text-[10px] font-medium ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>
                Thg {d.getMonth() + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Khung giờ khả dụng
        </h4>
        
        {isLoading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Đang tải lịch...</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {timeSlots.map((slot) => {
              const available = selectedDate ? isSlotAvailable(slot.id, selectedDate) : false;
              const isSelected = selectedSlotId === slot.id;
              
              if (!available) {
                return (
                  <div key={slot.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-300 text-center text-xs font-bold line-through opacity-60">
                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                  </div>
                );
              }

              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all relative ${
                    isSelected
                      ? 'bg-[#031625] border-[#031625] text-[#f0c05a] shadow-md transform scale-[1.02]'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:text-amber-700'
                  }`}
                >
                  {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 absolute -top-1.5 -right-1.5 text-emerald-500 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Action */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedSlotId}
          className="w-full py-3.5 rounded-xl text-sm font-bold bg-[#031625] text-[#f0c05a] hover:bg-[#031625]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Xác nhận thời gian
        </button>
      </div>
    </div>
  );
};
