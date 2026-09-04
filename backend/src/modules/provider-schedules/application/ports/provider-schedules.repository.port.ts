import { working_mode } from '@prisma/client';
import { TimeSlotRecord } from '../types/provider-schedules.types';

export interface ProviderSchedulesRepositoryPort {
  findProviderProfileByUserId(userId: string): Promise<{ id: string } | null>;
  findProviderProfileById(providerId: string): Promise<{ id: string } | null>;
  findAllTimeSlots(): Promise<TimeSlotRecord[]>;
  findWorkingDaysWithSlots(
    providerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]>;
  upsertDaySchedule(
    providerId: string,
    workDate: Date,
    workingMode: working_mode,
    activeSlotIds: string[],
    allTimeSlotIds: string[],
  ): Promise<void>;
  copyWeekSchedule(
    providerId: string,
    sourceStartDate: Date,
    targetStartDate: Date,
    allTimeSlotIds: string[],
  ): Promise<void>;
}
