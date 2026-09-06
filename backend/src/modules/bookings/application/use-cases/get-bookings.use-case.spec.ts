import { Test, TestingModule } from '@nestjs/testing';
import { GetBookingsUseCase } from './get-bookings.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('GetBookingsUseCase', () => {
  let useCase: GetBookingsUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    bookings: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBookingsUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<GetBookingsUseCase>(GetBookingsUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id', {})).rejects.toThrow(NotFoundException);
  });

  it('should return bookings for CUSTOMER with pagination', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'customer-1',
      role: Role.CUSTOMER,
    });

    const mockData = [{ id: 'booking-1' }, { id: 'booking-2' }];
    mockPrisma.bookings.count.mockResolvedValue(15);
    mockPrisma.bookings.findMany.mockResolvedValue(mockData);

    const result = await useCase.execute('customer-1', { page: 2, limit: 10 });

    expect(mockPrisma.bookings.count).toHaveBeenCalledWith({
      where: { customer_id: 'customer-1' },
    });
    expect(mockPrisma.bookings.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customer_id: 'customer-1' },
        skip: 10,
        take: 10,
        orderBy: { created_at: 'desc' },
      })
    );
    expect(result).toEqual({
      data: mockData,
      meta: {
        page: 2,
        limit: 10,
        total: 15,
        totalPages: 2,
      },
    });
  });

  it('should return bookings for PROVIDER filtering by status', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'provider-user-1',
      role: Role.PROVIDER,
      provider_profiles: {
        id: 'provider-profile-1',
      },
    });

    const mockData = [{ id: 'booking-1' }];
    mockPrisma.bookings.count.mockResolvedValue(1);
    mockPrisma.bookings.findMany.mockResolvedValue(mockData);

    const result = await useCase.execute('provider-user-1', { page: 1, limit: 5, status: 'COMPLETED' });

    expect(mockPrisma.bookings.count).toHaveBeenCalledWith({
      where: { provider_id: 'provider-profile-1', status: 'COMPLETED' },
    });
    expect(mockPrisma.bookings.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { provider_id: 'provider-profile-1', status: 'COMPLETED' },
        skip: 0,
        take: 5,
        orderBy: { created_at: 'desc' },
      })
    );
    expect(result.meta.total).toBe(1);
  });
});
