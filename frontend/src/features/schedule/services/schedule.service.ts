import axiosInstance from '@/lib/axios';
import {
  CopyWeekScheduleInput,
  ProviderWorkingDayView,
  TimeSlotRecord,
  UpdateProviderScheduleInput,
} from '../types';

export const scheduleService = {
  /**
   * Lấy danh sách các khung giờ làm việc chuẩn của hệ thống
   */
  getTimeSlots: async (): Promise<TimeSlotRecord[]> => {
    const response = await axiosInstance.get('/time-slots');
    return response.data;
  },

  /**
   * Lấy ma trận lịch làm việc và trạng thái slots của Provider theo khoảng ngày
   */
  getProviderSchedules: async (
    startDate: string,
    endDate: string,
    providerId?: string
  ): Promise<ProviderWorkingDayView[]> => {
    const response = await axiosInstance.get('/provider-schedules', {
      params: { startDate, endDate, providerId },
    });
    return response.data;
  },

  /**
   * Đăng ký / Cập nhật lịch làm việc
   */
  updateProviderSchedules: async (
    data: UpdateProviderScheduleInput
  ): Promise<void> => {
    const response = await axiosInstance.post('/provider-schedules', data);
    return response.data;
  },

  /**
   * Sao chép nhanh toàn bộ lịch làm việc từ tuần nguồn sang tuần đích
   */
  copyWeekSchedule: async (data: CopyWeekScheduleInput): Promise<void> => {
    const response = await axiosInstance.post('/provider-schedules/copy-week', data);
    return response.data;
  },
};
