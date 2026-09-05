import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { CopyWeekScheduleUseCase } from './application/use-cases/copy-week-schedule.use-case';
import { GetProviderAvailableSlotsUseCase } from './application/use-cases/get-provider-available-slots.use-case';
import { GetProviderScheduleUseCase } from './application/use-cases/get-provider-schedule.use-case';
import { GetTimeSlotsUseCase } from './application/use-cases/get-time-slots.use-case';
import { UpdateProviderScheduleUseCase } from './application/use-cases/update-provider-schedule.use-case';
import { BlockProviderSlotUseCase } from './application/use-cases/block-provider-slot.use-case';
import { CheckConflictSlotUseCase } from './application/use-cases/check-conflict-slot.use-case';
import { ReleaseHeldSlotsCron } from './application/cron/release-held-slots.cron';
import { PrismaProviderSchedulesRepository } from './infrastructure/persistence/prisma-provider-schedules.repository';
import { ProviderSchedulesController } from './provider-schedules.controller';
import { PROVIDER_SCHEDULES_REPOSITORY } from './provider-schedules.tokens';
import { TimeSlotsController } from './time-slots.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TimeSlotsController, ProviderSchedulesController],
  providers: [
    GetTimeSlotsUseCase,
    GetProviderScheduleUseCase,
    GetProviderAvailableSlotsUseCase,
    UpdateProviderScheduleUseCase,
    CopyWeekScheduleUseCase,
    BlockProviderSlotUseCase,
    CheckConflictSlotUseCase,
    ReleaseHeldSlotsCron,
    {
      provide: PROVIDER_SCHEDULES_REPOSITORY,
      useClass: PrismaProviderSchedulesRepository,
    },
  ],
  exports: [
    PROVIDER_SCHEDULES_REPOSITORY,
    GetTimeSlotsUseCase,
    GetProviderScheduleUseCase,
    GetProviderAvailableSlotsUseCase,
    UpdateProviderScheduleUseCase,
    CopyWeekScheduleUseCase,
    BlockProviderSlotUseCase,
    CheckConflictSlotUseCase,
  ],
})
export class ProviderSchedulesModule {}
