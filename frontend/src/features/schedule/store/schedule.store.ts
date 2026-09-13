import { create } from 'zustand';
import { scheduleService } from '../services/schedule.service';
import { 
  ProviderWorkingDayView, 
  TimeSlotRecord, 
  UpdateProviderScheduleInput, 
  CopyWeekScheduleInput 
} from '../types';

interface ScheduleState {
  // Data
  timeSlots: TimeSlotRecord[];
  providerSchedules: ProviderWorkingDayView[];
  
  // Loading states
  isLoadingSlots: boolean;
  isLoadingSchedules: boolean;
  isUpdating: boolean;
  
  // Errors
  error: string | null;

  // Actions
  fetchTimeSlots: () => Promise<void>;
  fetchProviderSchedules: (startDate: string, endDate: string) => Promise<void>;
  updateSchedules: (data: UpdateProviderScheduleInput) => Promise<void>;
  copyWeekSchedule: (data: CopyWeekScheduleInput) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  timeSlots: [],
  providerSchedules: [],
  isLoadingSlots: false,
  isLoadingSchedules: false,
  isUpdating: false,
  error: null,

  fetchTimeSlots: async () => {
    const { timeSlots } = get();
    // Avoid re-fetching if already have data
    if (timeSlots.length > 0) return;

    set({ isLoadingSlots: true, error: null });
    try {
      const slots = await scheduleService.getTimeSlots();
      set({ timeSlots: slots });
    } catch (err: any) {
      set({ error: err.message || 'Lỗi khi lấy danh sách khung giờ' });
    } finally {
      set({ isLoadingSlots: false });
    }
  },

  fetchProviderSchedules: async (startDate: string, endDate: string) => {
    set({ isLoadingSchedules: true, error: null });
    try {
      const schedules = await scheduleService.getProviderSchedules(startDate, endDate);
      set({ providerSchedules: schedules });
    } catch (err: any) {
      set({ error: err.message || 'Lỗi khi lấy lịch làm việc' });
    } finally {
      set({ isLoadingSchedules: false });
    }
  },

  updateSchedules: async (data: UpdateProviderScheduleInput) => {
    set({ isUpdating: true, error: null });
    try {
      await scheduleService.updateProviderSchedules(data);
      
      // Optionally we could refresh the schedule list here if we know the date range
      // For now, caller will re-fetch
    } catch (err: any) {
      set({ error: err.message || 'Lỗi khi cập nhật lịch làm việc' });
      throw err;
    } finally {
      set({ isUpdating: false });
    }
  },

  copyWeekSchedule: async (data: CopyWeekScheduleInput) => {
    set({ isUpdating: true, error: null });
    try {
      await scheduleService.copyWeekSchedule(data);
    } catch (err: any) {
      set({ error: err.message || 'Lỗi khi sao chép lịch làm việc' });
      throw err;
    } finally {
      set({ isUpdating: false });
    }
  },
}));
