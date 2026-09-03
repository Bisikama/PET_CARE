/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { GetBookingByIdUseCase } from './get-booking-by-id.use-case';
import { BOOKING_REPOSITORY } from '../../booking.tokens';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('GetBookingByIdUseCase', () => {
  let useCase: GetBookingByIdUseCase;

  const mockBookingRepo = { findBookingById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBookingByIdUseCase,
        { provide: BOOKING_REPOSITORY, useValue: mockBookingRepo },
      ],
    }).compile();

    useCase = module.get<GetBookingByIdUseCase>(GetBookingByIdUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  const CUSTOMER_ID = 'customer-uuid';
  const PROVIDER_ID = 'provider-uuid';
  const BOOKING_ID = 'booking-uuid';

  it('should return booking if userId is the customer', async () => {
    const mockBooking = { id: BOOKING_ID, customer_id: CUSTOMER_ID, provider_id: PROVIDER_ID };
    mockBookingRepo.findBookingById.mockResolvedValue(mockBooking);

    const result = await useCase.execute(CUSTOMER_ID, BOOKING_ID);
    expect(result).toEqual(mockBooking);
  });

  it('should return booking if userId is the provider', async () => {
    const mockBooking = { id: BOOKING_ID, customer_id: CUSTOMER_ID, provider_id: PROVIDER_ID };
    mockBookingRepo.findBookingById.mockResolvedValue(mockBooking);

    const result = await useCase.execute(PROVIDER_ID, BOOKING_ID);
    expect(result).toEqual(mockBooking);
  });

  it('🔴 should throw ForbiddenException for a third-party user (IDOR protection)', async () => {
    const mockBooking = { id: BOOKING_ID, customer_id: CUSTOMER_ID, provider_id: PROVIDER_ID };
    mockBookingRepo.findBookingById.mockResolvedValue(mockBooking);

    await expect(useCase.execute('attacker-uuid', BOOKING_ID)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if booking does not exist', async () => {
    mockBookingRepo.findBookingById.mockResolvedValue(null);

    await expect(useCase.execute(CUSTOMER_ID, 'non-existent-id')).rejects.toThrow(NotFoundException);
  });
});
