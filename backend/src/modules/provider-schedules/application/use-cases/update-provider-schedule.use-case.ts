import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDER_SCHEDULES_REPOSITORY } from '../../provider-schedules.tokens';
import type { ProviderSchedulesRepositoryPort } from '../ports/provider-schedules.repository.port';
import { UpdateProviderScheduleInput } from '../types/provider-schedules.types';

@Injectable()
export class UpdateProviderScheduleUseCase {
  constructor(
    @Inject(PROVIDER_SCHEDULES_REPOSITORY)
    private readonly schedulesRepo: ProviderSchedulesRepositoryPort,
  ) {}

  async execute(input: UpdateProviderScheduleInput) {
    const profile = await this.schedulesRepo.findProviderProfileByUserId(input.userId);
    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác của bạn.');
    }

    if (!input.schedules || input.schedules.length === 0) {
      throw new BadRequestException('Danh sách lịch làm việc không được để trống.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate all dates first
    for (const schedule of input.schedules) {
      const workDate = new Date(schedule.workDate);
      workDate.setHours(0, 0, 0, 0);

      if (isNaN(workDate.getTime())) {
        throw new BadRequestException(`Ngày ${schedule.workDate} không hợp lệ.`);
      }

      if (workDate < today) {
        throw new BadRequestException(
          `Không thể cập nhật lịch làm việc cho ngày trong quá khứ (${schedule.workDate}).`,
        );
      }
    }

    // Fetch all master time slots to know full set of slots
    const allSlots = await this.schedulesRepo.findAllTimeSlots();
    const allSlotIds = allSlots.map((s) => s.id);

    // Validate that provided slotIds exist in master slots
    for (const schedule of input.schedules) {
      for (const slotId of schedule.slotIds) {
        if (!allSlotIds.includes(slotId)) {
          throw new BadRequestException(`Slot ID ${slotId} không tồn tại trong hệ thống.`);
        }
      }
    }

    // Upsert day schedules
    for (const schedule of input.schedules) {
      const workDate = new Date(schedule.workDate);
      workDate.setHours(0, 0, 0, 0);

      await this.schedulesRepo.upsertDaySchedule(
        profile.id,
        workDate,
        schedule.workingMode || 'FULL_TIME',
        schedule.slotIds,
        allSlotIds,
      );
    }

    return {
      success: true,
      message: 'Cập nhật lịch làm việc thành công.',
      totalDaysUpdated: input.schedules.length,
    };
  }
}
