import axiosInstance from '@/lib/axios';
import { ProviderWorkingDayView, ProviderWorkingSlotView } from '@/features/schedule/types';

export const providerScheduleService = {
  getAvailableSlots: async (providerId: string, startDate: string, endDate: string): Promise<ProviderWorkingDayView[]> => {
    const response = await axiosInstance.get(`/provider-schedules/available-slots/${providerId}`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  blockSlot: async (slotId: string): Promise<ProviderWorkingSlotView> => {
    const response = await axiosInstance.put(`/provider-schedules/slots/${slotId}/block`);
    return response.data;
  }
};
