'use client';

import React, { useEffect, useState } from 'react';
import { useScheduleStore } from '../store/schedule.store';
import { RegisterScheduleModal } from './RegisterScheduleModal';

export const ScheduleManager = () => {
  const timeSlots = useScheduleStore(state => state.timeSlots);
  const isLoadingSlots = useScheduleStore(state => state.isLoadingSlots);
  const fetchTimeSlots = useScheduleStore(state => state.fetchTimeSlots);

  const schedules = useScheduleStore(state => state.providerSchedules);
  const isLoadingSchedules = useScheduleStore(state => state.isLoadingSchedules);
  const fetchProviderSchedules = useScheduleStore(state => state.fetchProviderSchedules);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = React.useCallback(() => {
    fetchTimeSlots();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    fetchProviderSchedules(formatDate(startOfWeek), formatDate(endOfWeek));
  }, [fetchTimeSlots, fetchProviderSchedules]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper to map 1-7 (Mon-Sun) to Vietnamese day names
  const dayNames = [
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
    'Chủ Nhật',
  ];

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDay();
    // In JS, 0 is Sunday, 1 is Monday...
    // We map 1 -> 0 (Thứ Hai), 2 -> 1, ..., 0 -> 6 (Chủ Nhật)
    const index = day === 0 ? 6 : day - 1;
    return dayNames[index];
  };

  const getTimeRange = (slots: any[]) => {
    const availableSlots = slots.filter((s: any) => s.status === 'AVAILABLE');
    if (availableSlots.length === 0) return 'Chưa đăng ký';
    
    const startTimes = availableSlots.map((s) => s.startTime);
    const endTimes = availableSlots.map((s) => s.endTime);
    
    startTimes.sort();
    endTimes.sort();
    
    const start = startTimes[0].substring(0, 5);
    const end = endTimes[endTimes.length - 1].substring(0, 5);
    return `${start} - ${end}`;
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
      <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Khung giờ nhận lịch nhận việc</h4>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-bold">
        {isLoadingSchedules ? (
          <div className="col-span-full py-4 text-slate-500">
            Đang tải dữ liệu lịch...
          </div>
        ) : (
          <>
            {schedules.map((schedule) => {
              const isActive = selectedDate === schedule.workDate;
              const isRegistered = schedule.slots.some(s => s.status === 'AVAILABLE');
              const modeText = schedule.workingMode === 'FULL_TIME' ? 'Full-time' : 'Part-time';
              return (
                <button
                  key={schedule.workDate}
                  onClick={() => setSelectedDate(schedule.workDate)}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center ${
                    isActive
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : isRegistered
                      ? 'bg-indigo-50/50 border-indigo-100 text-indigo-700 hover:border-indigo-300'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold">{getDayName(schedule.workDate)}</span>
                  {isRegistered ? (
                    <>
                      <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'text-amber-600' : 'text-indigo-500'}`}>
                        {modeText}
                      </span>
                      <span className={`text-[10px] mt-0.5 font-semibold ${isActive ? 'text-amber-600' : 'text-indigo-500'}`}>
                        {getTimeRange(schedule.slots)}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] mt-1 font-medium text-slate-400">
                      Chưa đăng ký
                    </span>
                  )}
                </button>
              );
            })}
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-3 bg-slate-100 border border-dashed border-slate-200 rounded-xl text-slate-400 flex items-center justify-center cursor-pointer hover:bg-slate-200/50 transition-all duration-150 font-bold"
            >
              + Thêm lịch
            </button>
          </>
        )}
      </div>

      {selectedDate && (
        <div className="mt-4 p-4 border border-slate-100 bg-slate-50 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-bold text-slate-800 text-sm">Chi tiết ngày {selectedDate}</h5>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cập nhật lịch ngày này
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {isLoadingSlots ? (
              <p className="col-span-full text-slate-500 text-xs">Đang tải khung giờ...</p>
            ) : (
              timeSlots.map((slot) => {
                const currentSchedule = schedules.find(s => s.workDate === selectedDate);
                const isAvailable = currentSchedule?.slots.some(
                  s => s.slotId === slot.id && s.status === 'AVAILABLE'
                );

                return (
                  <div 
                    key={slot.id} 
                    className={`px-3 py-2 border rounded-xl text-center text-xs font-bold ${
                      isAvailable ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <RegisterScheduleModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          loadData(); // Refresh list when modal is closed
        }}
        selectedDate={selectedDate}
      />
    </div>
  );
};
