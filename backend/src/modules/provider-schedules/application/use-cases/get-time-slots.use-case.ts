import { Inject, Injectable } from '@nestjs/common';
import { PROVIDER_SCHEDULES_REPOSITORY } from '../../provider-schedules.tokens';
import type { ProviderSchedulesRepositoryPort } from '../ports/provider-schedules.repository.port';
import { TimeSlotRecord } from '../types/provider-schedules.types';

@Injectable()
export class GetTimeSlotsUseCase {
  constructor(
    @Inject(PROVIDER_SCHEDULES_REPOSITORY)
    private readonly schedulesRepo: ProviderSchedulesRepositoryPort,
  ) {}

  async execute(): Promise<TimeSlotRecord[]> {
    return this.schedulesRepo.findAllTimeSlots();
  }
}
