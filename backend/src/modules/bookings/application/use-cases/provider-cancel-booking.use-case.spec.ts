import { Test, TestingModule } from '@nestjs/testing';
import { ProviderCancelBookingUseCase } from './provider-cancel-booking.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ProviderCancelBookingUseCase', () => {
  let useCase: ProviderCancelBookingUseCase;
  let prisma: PrismaService;
  let settlementsService: SettlementsService;
  let notificationsService: NotificationsService;

  const mockPrisma = {
    $transaction: jest.fn((callback) => callback(mockTx)),
  };

  const mockTx = {
    bookings: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    booking_cancellations: {
      create: jest.fn(),
    },
    payments: {
      update: jest.fn(),
    },
    provider_working_slots: {
      update: jest.fn(),
    },
    chat_rooms: {
      updateMany: jest.fn(),
    },
    booking_status_logs: {
      create: jest.fn(),
    },
    booking_events: {
      create: jest.fn(),
    },
  };

  const mockSettlementsService = {
    refund: jest.fn(),
  };

  const mockNotificationsService = {
    sendNotification: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((cb) => cb(mockTx));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderCancelBookingUseCase,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SettlementsService, useValue: mockSettlementsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    useCase = module.get<ProviderCancelBookingUseCase>(ProviderCancelBookingUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    settlementsService = module.get<SettlementsService>(SettlementsService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  it('should throw NotFoundException if booking not found', async () => {
    mockTx.bookings.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute('provider-user-1', 'booking-1', { reason: 'Xe hỏng' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not the assigned provider', async () => {
    mockTx.bookings.findUnique.mockResolvedValue({
      id: 'booking-1',
      status: 'ACCEPTED',
      provider_profiles: { user_id: 'other-provider-user' },
    });

    await expect(
      useCase.execute('provider-user-1', 'booking-1', { reason: 'Xe hỏng' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException if booking status is already IN_PROGRESS or not ACCEPTED', async () => {
    mockTx.bookings.findUnique.mockResolvedValue({
      id: 'booking-1',
      status: 'IN_PROGRESS',
      provider_profiles: { user_id: 'provider-user-1' },
    });

    await expect(
      useCase.execute('provider-user-1', 'booking-1', { reason: 'Xe hỏng' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should successfully cancel booking in ACCEPTED state, record cancellation, and refund', async () => {
    mockTx.bookings.findUnique.mockResolvedValue({
      id: 'booking-1',
      status: 'ACCEPTED',
      customer_id: 'customer-1',
      total_price: 200000,
      provider_working_slot_id: 'slot-1',
      provider_profiles: { user_id: 'provider-user-1' },
      payments: {
        id: 'payment-1',
        status: 'PAID_HELD_IN_ESCROW',
      },
    });

    mockTx.bookings.update.mockResolvedValue({
      id: 'booking-1',
      status: 'CANCELLED',
    });

    const result = await useCase.execute('provider-user-1', 'booking-1', {
      reason: 'Xe bị hỏng dọc đường',
      note: 'Đã báo khách',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('CANCELLED');
    expect(mockSettlementsService.refund).toHaveBeenCalledWith(
      'booking-1',
      mockTx,
      'Đối tác hủy đơn do sự cố: Xe bị hỏng dọc đường',
    );
    expect(mockTx.booking_cancellations.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        booking_id: 'booking-1',
        requested_by: 'provider-user-1',
        reason: 'Xe bị hỏng dọc đường',
        note: 'Đã báo khách',
        status: 'AUTO_APPROVED',
      }),
    });
    expect(mockTx.provider_working_slots.update).toHaveBeenCalledWith({
      where: { id: 'slot-1' },
      data: { status: 'AVAILABLE', reserved_until: null },
    });
    expect(mockNotificationsService.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'customer-1',
        type: 'BOOKING_CANCELLED',
      }),
    );
  });
});
