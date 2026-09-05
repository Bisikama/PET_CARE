import { Test, TestingModule } from '@nestjs/testing';
import { RequestBookingExtensionUseCase } from './request-booking-extension.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('RequestBookingExtensionUseCase', () => {
  let useCase: RequestBookingExtensionUseCase;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestBookingExtensionUseCase,
        {
          provide: PrismaService,
          useValue: {
            bookings: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            notifications: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<RequestBookingExtensionUseCase>(RequestBookingExtensionUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should successfully add extension request and notify customer', async () => {
    const mockBooking = {
      id: 'book-1',
      provider_id: 'prov-1',
      customer_id: 'cust-1',
      status: 'IN_PROGRESS',
      provider_note: null,
    };
    (prisma.bookings.findUnique as jest.Mock).mockResolvedValue(mockBooking);
    (prisma.bookings.update as jest.Mock).mockResolvedValue({});

    const result = await useCase.execute('prov-1', 'book-1', { minutes: 30, reason: 'Pet is dirty' });

    expect(prisma.bookings.update).toHaveBeenCalled();
    expect(prisma.notifications.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user_id: 'cust-1',
        type: 'BOOKING_NEW',
      })
    });
    expect(result.success).toBe(true);
  });

  it('should throw BadRequestException if not in progress', async () => {
    const mockBooking = {
      id: 'book-1',
      provider_id: 'prov-1',
      customer_id: 'cust-1',
      status: 'PENDING_PAYMENT',
    };
    (prisma.bookings.findUnique as jest.Mock).mockResolvedValue(mockBooking);

    await expect(useCase.execute('prov-1', 'book-1', { minutes: 30, reason: 'test' }))
      .rejects.toThrow(BadRequestException);
  });
});
