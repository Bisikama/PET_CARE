import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { CopyWeekScheduleUseCase } from './application/use-cases/copy-week-schedule.use-case';
import { GetProviderScheduleUseCase } from './application/use-cases/get-provider-schedule.use-case';
import { GetTimeSlotsUseCase } from './application/use-cases/get-time-slots.use-case';
import { UpdateProviderScheduleUseCase } from './application/use-cases/update-provider-schedule.use-case';
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
    UpdateProviderScheduleUseCase,
    CopyWeekScheduleUseCase,
    {
      provide: PROVIDER_SCHEDULES_REPOSITORY,
      useClass: PrismaProviderSchedulesRepository,
    },
  ],
  exports: [
    PROVIDER_SCHEDULES_REPOSITORY,
    GetTimeSlotsUseCase,
    GetProviderScheduleUseCase,
    UpdateProviderScheduleUseCase,
    CopyWeekScheduleUseCase,
  ],
})
export class ProviderSchedulesModule {}
