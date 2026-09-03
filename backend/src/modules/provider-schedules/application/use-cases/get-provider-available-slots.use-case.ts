import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { availability_slot_status } from '@prisma/client';
import { PROVIDER_SCHEDULES_REPOSITORY } from '../../provider-schedules.tokens';
import type { ProviderSchedulesRepositoryPort } from '../ports/provider-schedules.repository.port';
import {
  ProviderAvailableDayView,
  ProviderAvailableSlotView,
} from '../types/provider-schedules.types';

@Injectable()
export class GetProviderAvailableSlotsUseCase {
  constructor(
    @Inject(PROVIDER_SCHEDULES_REPOSITORY)
    private readonly schedulesRepo: ProviderSchedulesRepositoryPort,
  ) {}

  async execute(
    providerId: string,
    startDateStr?: string,
    endDateStr?: string,
  ): Promise<ProviderAvailableDayView[]> {
    const profile = await this.schedulesRepo.findProviderProfileById(providerId);
    if (!profile) {
      throw new NotFoundException(`Không tìm thấy thông tin đối tác với ID: ${providerId}`);
    }

    // Default startDate to today
    let startDate: Date;
    if (startDateStr) {
      startDate = new Date(startDateStr);
    } else {
      startDate = new Date();
    }
    startDate.setHours(0, 0, 0, 0);

    // Default endDate to 6 days after startDate (1 week total)
    let endDate: Date;
    if (endDateStr) {
      endDate = new Date(endDateStr);
    } else {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
    }
    endDate.setHours(23, 59, 59, 999);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Ngày bắt đầu hoặc ngày kết thúc không hợp lệ.');
    }

    if (startDate > endDate) {
      throw new BadRequestException('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
    }

    // Limit maximum query range to 31 days
    const diffDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays > 31) {
      throw new BadRequestException('Khoảng thời gian tra cứu không được vượt quá 31 ngày.');
    }

    const [allMasterSlots, workingDays] = await Promise.all([
      this.schedulesRepo.findAllTimeSlots(),
      this.schedulesRepo.findWorkingDaysWithSlots(profile.id, startDate, endDate),
    ]);

    // Build map of existing working days by date string (YYYY-MM-DD)
    const workingDaysMap = new Map<string, any>();
    for (const wd of workingDays) {
      const dateKey = this.formatDateKey(wd.work_date);
      workingDaysMap.set(dateKey, wd);
    }

    // Iterate through all days in range
    const result: ProviderAvailableDayView[] = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      const dateKey = this.formatDateKey(currentDate);
      const existingWd = workingDaysMap.get(dateKey);

      // Build slot views for all master slots without exposing private customer information
      const slotsView: ProviderAvailableSlotView[] = allMasterSlots.map((ts) => {
        const pws = existingWd?.provider_working_slots?.find(
          (s: any) => s.slot_id === ts.id,
        );

        const status = (pws?.status as availability_slot_status) || 'BLOCKED';
        const isAvailable = status === availability_slot_status.AVAILABLE;

        return {
          providerWorkingSlotId: pws?.id || null,
          slotId: ts.id,
          name: ts.name,
          startTime: ts.start_time,
          endTime: ts.end_time,
          slotOrder: ts.slot_order,
          status,
          isAvailable,
        };
      });

      result.push({
        workingDayId: existingWd?.id || null,
        workDate: dateKey,
        workingMode: existingWd?.working_mode || 'FULL_TIME',
        slots: slotsView,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  private formatDateKey(d: Date | string): string {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
