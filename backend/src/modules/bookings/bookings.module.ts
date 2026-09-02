import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { BookingsController } from './presentation/controllers/booking.controller';
import { BookingMatchingController } from './presentation/controllers/booking-matching.controller';
import { CreateBookingRequestUseCase } from './application/use-cases/create-booking-request.use-case';
import { ProviderAcceptBookingUseCase } from './application/use-cases/provider-accept-booking.use-case';
import { ProviderRejectBookingUseCase } from './application/use-cases/provider-reject-booking.use-case';
import { SearchMatchingProvidersUseCase } from './application/use-cases/search-matching-providers.use-case';
import { GetBookingChecklistUseCase } from './application/use-cases/get-booking-checklist.use-case';
import { StartBookingServiceUseCase } from './application/use-cases/start-booking-service.use-case';
import { UpdateBookingChecklistItemUseCase } from './application/use-cases/update-booking-checklist-item.use-case';
import { CompleteBookingUseCase } from './application/use-cases/complete-booking.use-case';
import { BookingStateMachineService } from './domain/services/booking-state-machine.service';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from './booking.tokens';
import { PrismaBookingRepository } from './infrastructure/persistence/prisma-booking.repository';
import { PrismaUnitOfWork } from './infrastructure/persistence/prisma-unit-of-work';

import { PaymentsModule } from '../payments/payments.module';
import { SettlementsModule } from '../settlements/settlements.module';
import { GrowthModule } from '../growth/growth.module';
import { CustomerCancelBookingUseCase } from './application/use-cases/customer-cancel-booking.use-case';

@Module({
  imports: [PrismaModule, PaymentsModule, SettlementsModule, GrowthModule],
  controllers: [BookingsController, BookingMatchingController],
  providers: [
    CreateBookingRequestUseCase,
    ProviderAcceptBookingUseCase,
    ProviderRejectBookingUseCase,
    SearchMatchingProvidersUseCase,
    GetBookingChecklistUseCase,
    StartBookingServiceUseCase,
    UpdateBookingChecklistItemUseCase,
    CompleteBookingUseCase,
    CustomerCancelBookingUseCase,
    BookingStateMachineService,
    {
      provide: BOOKING_REPOSITORY,
      useClass: PrismaBookingRepository,
    },
    {
      provide: UNIT_OF_WORK,
      useClass: PrismaUnitOfWork,
    },
  ],
  exports: [
    BOOKING_REPOSITORY,
    GetBookingChecklistUseCase,
    StartBookingServiceUseCase,
    UpdateBookingChecklistItemUseCase,
    CompleteBookingUseCase,
  ],
})
export class BookingsModule {}
