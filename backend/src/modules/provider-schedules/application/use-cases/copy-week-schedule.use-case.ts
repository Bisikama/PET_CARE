import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDER_SCHEDULES_REPOSITORY } from '../../provider-schedules.tokens';
import type { ProviderSchedulesRepositoryPort } from '../ports/provider-schedules.repository.port';
import { CopyWeekScheduleInput } from '../types/provider-schedules.types';

@Injectable()
export class CopyWeekScheduleUseCase {
  constructor(
    @Inject(PROVIDER_SCHEDULES_REPOSITORY)
    private readonly schedulesRepo: ProviderSchedulesRepositoryPort,
  ) {}

  async execute(input: CopyWeekScheduleInput) {
    const profile = await this.schedulesRepo.findProviderProfileByUserId(input.userId);
    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác của bạn.');
    }

    const sourceStartDate = new Date(input.sourceWeekStart);
    sourceStartDate.setHours(0, 0, 0, 0);

    const targetStartDate = new Date(input.targetWeekStart);
    targetStartDate.setHours(0, 0, 0, 0);

    if (isNaN(sourceStartDate.getTime()) || isNaN(targetStartDate.getTime())) {
      throw new BadRequestException('Ngày bắt đầu tuần nguồn hoặc tuần đích không hợp lệ.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Target week start + 6 days must not be completely in the past
    const targetEndDate = new Date(targetStartDate);
    targetEndDate.setDate(targetEndDate.getDate() + 6);
    if (targetEndDate < today) {
      throw new BadRequestException(
        'Không thể sao chép lịch sang một tuần hoàn toàn trong quá khứ.',
      );
    }

    const allSlots = await this.schedulesRepo.findAllTimeSlots();
    const allSlotIds = allSlots.map((s) => s.id);

    await this.schedulesRepo.copyWeekSchedule(
      profile.id,
      sourceStartDate,
      targetStartDate,
      allSlotIds,
    );

    return {
      success: true,
      message: `Sao chép lịch làm việc từ tuần ${input.sourceWeekStart} sang tuần ${input.targetWeekStart} thành công.`,
    };
  }
}
