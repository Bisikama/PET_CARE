import React, { useState } from 'react';
import { useProviderSchedule } from '../hooks/useProviderSchedule';
import { ScheduleSlot } from '../types';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists based on common shadcn setups

interface ProviderScheduleProps {
  providerId: string;
  providerName: string;
}

export const ProviderSchedule: React.FC<ProviderScheduleProps> = ({ providerId, providerName }) => {
  // Let's default to today and next week for demo purposes
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Assuming we want to fetch the whole week's schedule
  const startDate = selectedDate; 
  const endDate = new Date(new Date(selectedDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { schedules, isLoading, error, selectedSlot, handleBlockSlot } = useProviderSchedule(providerId, startDate, endDate);

  const currentDaySchedule = schedules.find(s => s.date === selectedDate);
  const slots = currentDaySchedule?.slots || [];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      {/* Left Column - Date Picker (Simplified) */}
      <div className="w-full md:w-1/3 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 uppercase mb-4 border-b pb-2">Chọn Ngày Chăm Sóc</h3>
        <div className="relative">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Calendar className="absolute right-3 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
        </div>
        <p className="text-xs text-slate-500 mt-4">Bạn đang xếp lịch phục vụ cho ngày làm việc <span className="font-medium text-slate-700">{selectedDate}</span>.</p>
      </div>

      {/* Right Column - Slots */}
      <div className="w-full md:w-2/3">
        <h3 className="text-sm font-bold text-slate-800 uppercase mb-4">Khung giờ làm việc của {providerName}:</h3>
        
        {isLoading && <p className="text-slate-500">Đang tải lịch...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!isLoading && !error && slots.length === 0 && (
          <p className="text-slate-500 italic">Không có ca làm việc nào cho ngày này.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {slots.map((slot) => {
            const isAvailable = slot.status === 'AVAILABLE';
            const isPending = slot.status === 'PENDING';
            
            return (
              <button
                key={slot.id}
                disabled={!isAvailable}
                onClick={() => handleBlockSlot(slot, selectedDate)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                  isAvailable ? "bg-white border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer" : "",
                  isPending ? "bg-amber-50 border-amber-400 shadow-sm" : "",
                  !isAvailable && !isPending ? "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed" : ""
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className={cn("w-5 h-5", isPending ? "text-amber-500" : "text-slate-400")} />
                  <span className="font-medium text-slate-700">{slot.startTime} - {slot.endTime}</span>
                </div>
                
                {isAvailable && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">KHẢ DỤNG</span>}
                {isPending && <span className="text-xs font-semibold text-white bg-slate-800 px-2 py-1 rounded-md">GIỮ CHỖ (PENDING)</span>}
              </button>
            );
          })}
        </div>

        {/* Temporary Hold Alert */}
        {selectedSlot && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Đang Giữ Chỗ Tạm Thời</h4>
                <p className="text-sm text-slate-600">Khung giờ <span className="font-bold">{selectedSlot.startTime} - {selectedSlot.endTime}</span> đã được bảo hộ tạm giữ cho bạn.</p>
              </div>
            </div>
            <div className="bg-blue-600 text-white font-mono text-xl font-bold px-4 py-2 rounded-lg shadow-sm">
              09:55
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
