import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { BookingsController } from './presentation/controllers/booking.controller';
import { BookingMatchingController } from './presentation/controllers/booking-matching.controller';
import { CreateBookingRequestUseCase } from './application/use-cases/create-booking-request.use-case';
import { ProviderAcceptBookingUseCase } from './application/use-cases/provider-accept-booking.use-case';
import { ProviderRejectBookingUseCase } from './application/use-cases/provider-reject-booking.use-case';
import { SearchMatchingProvidersUseCase } from './application/use-cases/search-matching-providers.use-case';
import { BookingStateMachineService } from './domain/services/booking-state-machine.service';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from './booking.tokens';
import { PrismaBookingRepository } from './infrastructure/persistence/prisma-booking.repository';
import { PrismaUnitOfWork } from './infrastructure/persistence/prisma-unit-of-work';

@Module({
  imports: [PrismaModule],
  controllers: [BookingsController, BookingMatchingController],
  providers: [
    CreateBookingRequestUseCase,
    ProviderAcceptBookingUseCase,
    ProviderRejectBookingUseCase,
    SearchMatchingProvidersUseCase,
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
  exports: [BOOKING_REPOSITORY],
})
export class BookingsModule {}
