import React, { useState, useEffect } from 'react';
import { useScheduleStore } from '../store/schedule.store';
import { UpdateDayScheduleItem } from '../types';
import { X, Calendar as CalendarIcon, Clock, Check } from 'lucide-react';

interface RegisterScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string | null;
}

export const RegisterScheduleModal: React.FC<RegisterScheduleModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
}) => {
  const timeSlots = useScheduleStore(state => state.timeSlots);
  const isLoadingSlots = useScheduleStore(state => state.isLoadingSlots);
  const fetchTimeSlots = useScheduleStore(state => state.fetchTimeSlots);
  const updateSchedules = useScheduleStore(state => state.updateSchedules);
  const isUpdating = useScheduleStore(state => state.isUpdating);

  // State to manage the schedule form
  const [date, setDate] = useState<string>(
    selectedDate || new Date().toISOString().split('T')[0]
  );
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [workingMode, setWorkingMode] = useState<'FULL_TIME' | 'PART_TIME'>('FULL_TIME');
  const [error, setError] = useState<string | null>(null);

  const providerSchedules = useScheduleStore(state => state.providerSchedules);

  useEffect(() => {
    if (isOpen) {
      fetchTimeSlots();
      if (selectedDate) {
        setDate(selectedDate);
        const daySchedule = providerSchedules.find(s => s.workDate === selectedDate);
        if (daySchedule) {
          setWorkingMode(daySchedule.workingMode);
          const activeSlots = daySchedule.slots
            .filter(s => s.status === 'AVAILABLE')
            .map(s => s.slotId);
          setSelectedSlotIds(activeSlots);
        } else {
          setSelectedSlotIds([]);
          setWorkingMode('FULL_TIME');
        }
      } else {
        setSelectedSlotIds([]);
        setWorkingMode('FULL_TIME');
      }
    }
  }, [isOpen, selectedDate, providerSchedules, fetchTimeSlots]);

  if (!isOpen) return null;

  const handleToggleSlot = (slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSlotIds.length === timeSlots.length) {
      setSelectedSlotIds([]);
    } else {
      setSelectedSlotIds(timeSlots.map((s) => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlotIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 khung giờ nhận việc.');
      return;
    }

    try {
      // Bù trừ lỗi timezone của Backend: Backend đang dùng new Date(dateString).setHours(0) 
      // dẫn đến việc Prisma lưu lùi lại 1 ngày ở các múi giờ khác UTC (như Việt Nam UTC+7).
      // Giải pháp tạm thời ở Frontend (vì không được chạm vào BE): Cộng thêm 1 ngày vào payload.
      const adjustedDate = new Date(date);
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      const payloadDate = adjustedDate.toISOString().split('T')[0];

      const payload: UpdateDayScheduleItem = {
        workDate: payloadDate,
        workingMode,
        slotIds: selectedSlotIds,
      };

      await updateSchedules({ schedules: [payload] });
      onClose();
      // Need a way to refresh parent schedules, 
      // but in this mock, we just close the modal.
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu lịch.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Đăng ký lịch làm việc</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Thiết lập khung giờ bạn có thể nhận việc
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-semibold border border-rose-100 flex items-start gap-2">
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                Ngày làm việc
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-semibold text-slate-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Chế độ làm việc
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWorkingMode('FULL_TIME')}
                  className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                    workingMode === 'FULL_TIME'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  Toàn thời gian (Full-time)
                </button>
                <button
                  type="button"
                  onClick={() => setWorkingMode('PART_TIME')}
                  className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                    workingMode === 'PART_TIME'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  Bán thời gian (Part-time)
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-400" />
                  Khung giờ nhận việc
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg"
                >
                  {selectedSlotIds.length === timeSlots.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>

              {isLoadingSlots ? (
                <div className="p-8 text-center text-slate-500 text-sm">Đang tải khung giờ...</div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlotIds.includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleToggleSlot(slot.id)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span>{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200/50 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#031625] text-[#f0c05a] hover:bg-[#031625]/90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isUpdating ? 'Đang lưu...' : 'Lưu lịch làm việc'}
          </button>
        </div>
      </div>
    </div>
  );
};
