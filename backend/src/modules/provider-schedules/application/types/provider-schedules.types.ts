import { availability_slot_status, working_mode } from '@prisma/client';

export interface TimeSlotRecord {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  slot_order: number;
  created_at: Date;
}

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
  status: availability_slot_status | 'BLOCKED';
  heldUntil?: Date | null;
  reservedUntil?: Date | null;
  booking?: BookingSummaryItem | null;
}

export interface ProviderWorkingDayView {
  workingDayId: string | null;
  workDate: string; // YYYY-MM-DD
  workingMode: working_mode;
  slots: ProviderWorkingSlotView[];
}

export interface ProviderAvailableSlotView {
  providerWorkingSlotId: string | null;
  slotId: string;
  name: string;
  startTime: string;
  endTime: string;
  slotOrder: number;
  status: availability_slot_status | 'BLOCKED';
  isAvailable: boolean;
}

export interface ProviderAvailableDayView {
  workingDayId: string | null;
  workDate: string; // YYYY-MM-DD
  workingMode: working_mode;
  slots: ProviderAvailableSlotView[];
}

export interface UpdateDayScheduleItem {
  workDate: string; // YYYY-MM-DD
  workingMode?: working_mode;
  slotIds: string[]; // List of slot_id that provider wants to set as AVAILABLE
}

export interface UpdateProviderScheduleInput {
  userId: string;
  schedules: UpdateDayScheduleItem[];
}

export interface CopyWeekScheduleInput {
  userId: string;
  sourceWeekStart: string; // YYYY-MM-DD (Monday)
  targetWeekStart: string; // YYYY-MM-DD (Monday)
}
