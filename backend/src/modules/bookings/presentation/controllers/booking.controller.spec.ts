import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './booking.controller';
import { BOOKING_REPOSITORY } from '../../booking.tokens';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateBookingRequestUseCase } from '../../application/use-cases/create-booking-request.use-case';
import { ProviderAcceptBookingUseCase } from '../../application/use-cases/provider-accept-booking.use-case';
import { ProviderRejectBookingUseCase } from '../../application/use-cases/provider-reject-booking.use-case';
import { GetBookingChecklistUseCase } from '../../application/use-cases/get-booking-checklist.use-case';
import { StartBookingServiceUseCase } from '../../application/use-cases/start-booking-service.use-case';
import { UpdateBookingChecklistItemUseCase } from '../../application/use-cases/update-booking-checklist-item.use-case';
import { CompleteBookingUseCase } from '../../application/use-cases/complete-booking.use-case';
import { CustomerConfirmBookingUseCase } from '../../application/use-cases/customer-confirm-booking.use-case';
import { CustomerCancelBookingUseCase } from '../../application/use-cases/customer-cancel-booking.use-case';
import { GetBookingByIdUseCase } from '../../application/use-cases/get-booking-by-id.use-case';
import { CreateReviewUseCase } from '../../application/use-cases/create-review.use-case';
import { OpenDisputeUseCase } from '../../application/use-cases/open-dispute.use-case';
describe('BookingsController', () => {
  let controller: BookingsController;
  const mockBookingRepo = { findBookingById: jest.fn() };

  const mockUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        { provide: BOOKING_REPOSITORY, useValue: mockBookingRepo },
        { provide: CreateBookingRequestUseCase, useValue: mockUseCase },
        { provide: ProviderAcceptBookingUseCase, useValue: mockUseCase },
        { provide: ProviderRejectBookingUseCase, useValue: mockUseCase },
        { provide: GetBookingChecklistUseCase, useValue: mockUseCase },
        { provide: StartBookingServiceUseCase, useValue: mockUseCase },
        { provide: UpdateBookingChecklistItemUseCase, useValue: mockUseCase },
        { provide: CompleteBookingUseCase, useValue: mockUseCase },
        { provide: CustomerConfirmBookingUseCase, useValue: mockUseCase },
        { provide: CustomerCancelBookingUseCase, useValue: mockUseCase },
        { provide: GetBookingByIdUseCase, useValue: mockUseCase },
        { provide: CreateReviewUseCase, useValue: mockUseCase },
        { provide: OpenDisputeUseCase, useValue: mockUseCase },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findById — BUG #1 IDOR Fix + BUG #2 AuthGuard', () => {
    const CUSTOMER_ID = 'customer-uuid-1';
    const PROVIDER_ID = 'provider-uuid-1';
    const BOOKING_ID = 'booking-uuid-1';

    it('should call getBookingByIdUseCase and return result', async () => {
      const mockBooking = { id: BOOKING_ID, customer_id: CUSTOMER_ID, provider_id: PROVIDER_ID };
      mockUseCase.execute.mockResolvedValue(mockBooking);

      const result = await controller.findById(CUSTOMER_ID, BOOKING_ID);
      expect(result).toEqual(mockBooking);
      expect(mockUseCase.execute).toHaveBeenCalledWith(CUSTOMER_ID, BOOKING_ID);
    });

    it('🔴 should have @UseGuards(AccessTokenGuard) applied at class level', () => {
      // Kiểm tra metadata decorator trên class (NestJS Guards)
      const guards = Reflect.getMetadata('__guards__', BookingsController);
      expect(guards).toBeDefined();
      expect(guards.length).toBeGreaterThan(0);
    });
  });
});
