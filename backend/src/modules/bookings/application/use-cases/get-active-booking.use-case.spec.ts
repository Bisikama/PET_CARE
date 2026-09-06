import { Test, TestingModule } from '@nestjs/testing';
import { GetActiveBookingUseCase } from './get-active-booking.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('GetActiveBookingUseCase', () => {
  let useCase: GetActiveBookingUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    bookings: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetActiveBookingUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<GetActiveBookingUseCase>(GetActiveBookingUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id')).rejects.toThrow(NotFoundException);
  });

  it('should return active booking for CUSTOMER', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'customer-1',
      role: Role.CUSTOMER,
    });

    const mockBooking = { id: 'booking-1', status: 'IN_PROGRESS' };
    mockPrisma.bookings.findFirst.mockResolvedValue(mockBooking);

    const result = await useCase.execute('customer-1');
    expect(result).toEqual(mockBooking);
    expect(mockPrisma.bookings.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          customer_id: 'customer-1',
          status: {
            in: expect.any(Array),
          },
        }),
      })
    );
  });

  it('should return active booking for PROVIDER', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'provider-user-1',
      role: Role.PROVIDER,
      provider_profiles: {
        id: 'provider-profile-1',
      },
    });

    const mockBooking = { id: 'booking-2', status: 'ACCEPTED' };
    mockPrisma.bookings.findFirst.mockResolvedValue(mockBooking);

    const result = await useCase.execute('provider-user-1');
    expect(result).toEqual(mockBooking);
    expect(mockPrisma.bookings.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          provider_id: 'provider-profile-1',
          status: {
            in: expect.any(Array),
          },
        }),
      })
    );
  });

  it('should throw NotFoundException if provider profile is missing for PROVIDER role', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'provider-user-2',
      role: Role.PROVIDER,
      provider_profiles: null,
    });

    await expect(useCase.execute('provider-user-2')).rejects.toThrow(NotFoundException);
  });
});
