export type WorkingMode = 'FULL_TIME' | 'PART_TIME';

export type AvailabilitySlotStatus = 'AVAILABLE' | 'BLOCKED' | 'HELD' | 'BOOKED';

export interface TimeSlotRecord {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  slot_order: number;
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
  status: AvailabilitySlotStatus;
  heldUntil?: string | null;
  reservedUntil?: string | null;
  booking?: BookingSummaryItem | null;
}

export interface ProviderWorkingDayView {
  workingDayId: string | null;
  workDate: string; // YYYY-MM-DD
  workingMode: WorkingMode;
  slots: ProviderWorkingSlotView[];
}

export interface UpdateDayScheduleItem {
  workDate: string; // YYYY-MM-DD
  workingMode?: WorkingMode;
  slotIds: string[]; // List of slot_id that provider wants to set as AVAILABLE
}

export interface UpdateProviderScheduleInput {
  schedules: UpdateDayScheduleItem[];
}

export interface CopyWeekScheduleInput {
  sourceWeekStart: string; // YYYY-MM-DD (Monday)
  targetWeekStart: string; // YYYY-MM-DD (Monday)
}
