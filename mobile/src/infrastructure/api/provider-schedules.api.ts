import { apiClient } from './client';

export interface BookingSummaryItem {
  id: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  petName?: string;
  serviceName?: string;
  totalPrice?: number;
}

export interface ProviderWorkingSlotView {
  providerWorkingSlotId: string | null;
  slotId: string;
  name: string;
  startTime: string;
  endTime: string;
  slotOrder: number;
  status:
    | 'AVAILABLE'
    | 'BOOKED'
    | 'HELD_FOR_PAYMENT'
    | 'RESERVED_FOR_PROVIDER_RESPONSE'
    | 'BLOCKED'
    | string;
  heldUntil?: string | null;
  reservedUntil?: string | null;
  booking?: BookingSummaryItem | null;
}

export interface ProviderWorkingDayView {
  workingDayId: string | null;
  workDate: string; // YYYY-MM-DD
  workingMode: 'FULL_TIME' | 'PART_TIME' | string;
  slots: ProviderWorkingSlotView[];
}

export interface DayScheduleDto {
  workDate: string; // YYYY-MM-DD
  slotIds: string[];
  workingMode?: 'FULL_TIME' | 'PART_TIME';
}

export interface UpdateProviderScheduleDto {
  schedules: DayScheduleDto[];
}

export interface CopyWeekScheduleDto {
  sourceWeekStart: string; // YYYY-MM-DD (Monday)
  targetWeekStart: string; // YYYY-MM-DD (Monday)
}

export interface MasterTimeSlot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  slot_order: number;
}

export const providerSchedulesApi = {
  getSchedule: async (
    startDate: string,
    endDate: string
  ): Promise<ProviderWorkingDayView[]> => {
    const { data } = await apiClient.get('/provider-schedules', {
      params: { startDate, endDate },
    });
    const result = data?.data !== undefined ? data.data : data;
    return Array.isArray(result) ? result : [];
  },

  updateSchedule: async (
    dto: UpdateProviderScheduleDto
  ): Promise<{ success: boolean; message?: string; totalDaysUpdated?: number }> => {
    const { data } = await apiClient.post('/provider-schedules', dto);
    return data?.data !== undefined ? data.data : data;
  },

  copyWeek: async (
    dto: CopyWeekScheduleDto
  ): Promise<{ success: boolean; message?: string }> => {
    const { data } = await apiClient.post('/provider-schedules/copy-week', dto);
    return data?.data !== undefined ? data.data : data;
  },

  blockSlot: async (
    slotId: string
  ): Promise<{ success: boolean; message?: string; data?: any }> => {
    const { data } = await apiClient.put(`/provider-schedules/slots/${slotId}/block`);
    return data?.data !== undefined ? data.data : data;
  },

  getTimeSlots: async (): Promise<MasterTimeSlot[]> => {
    const { data } = await apiClient.get('/time-slots');
    const result = data?.data !== undefined ? data.data : data;
    return Array.isArray(result) ? result : [];
  },
};
