import { Test, TestingModule } from '@nestjs/testing';
import { OpenDisputeUseCase } from './open-dispute.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { booking_status, dispute_reason } from '@prisma/client';

describe('OpenDisputeUseCase', () => {
  let useCase: OpenDisputeUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenDisputeUseCase,
        {
          provide: PrismaService,
          useValue: {
            bookings: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            complaints: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            booking_events: {
              create: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback(prismaService)),
          },
        },
      ],
    }).compile();

    useCase = module.get<OpenDisputeUseCase>(OpenDisputeUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a dispute and update booking status (Happy Path)', async () => {
    const bookingId = 'booking-1';
    const customerId = 'customer-1';
    const dto = {
      reason: dispute_reason.PROVIDER_NO_SHOW,
      description: 'Provider did not arrive',
    };
    const mockBooking = { id: bookingId, customer_id: customerId, provider_id: 'provider-1', status: booking_status.IN_PROGRESS, provider_profiles: { user_id: 'provider-user-1' } };

    (prismaService.bookings.findUnique as jest.Mock).mockResolvedValue(mockBooking);
    (prismaService.complaints.findFirst as jest.Mock).mockResolvedValue(null);
    (prismaService.complaints.create as jest.Mock).mockResolvedValue({ id: 'complaint-1', ...dto });

    const result = await useCase.execute(bookingId, customerId, dto);

    expect(prismaService.complaints.create).toHaveBeenCalledWith({
      data: {
        booking_id: bookingId,
        complainant_id: customerId,
        accused_id: 'provider-user-1',
        title: `Dispute for booking ${bookingId}`,
        description: dto.description,
        reason: dto.reason,
      },
    });
    expect(prismaService.bookings.update).toHaveBeenCalledWith({
      where: { id: bookingId },
      data: { status: booking_status.DISPUTED },
    });
    expect(prismaService.booking_events.create).toHaveBeenCalled();
    expect(result.id).toBe('complaint-1');
  });

  it('should throw BadRequestException if booking status is invalid', async () => {
    const bookingId = 'booking-1';
    const customerId = 'customer-1';
    const dto = {
      reason: dispute_reason.PROVIDER_NO_SHOW,
      description: 'Provider did not arrive',
    };
    const mockBooking = { id: bookingId, customer_id: customerId, status: booking_status.CANCELLED };

    (prismaService.bookings.findUnique as jest.Mock).mockResolvedValue(mockBooking);

    await expect(useCase.execute(bookingId, customerId, dto)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(bookingId, customerId, dto)).rejects.toThrow('Dispute cannot be opened for this booking status');
    expect(prismaService.complaints.create).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException if user is not the customer', async () => {
    const bookingId = 'booking-1';
    const customerId = 'customer-1';
    const dto = {
      reason: dispute_reason.PROVIDER_NO_SHOW,
      description: 'Provider did not arrive',
    };
    const mockBooking = { id: bookingId, customer_id: 'other-customer', status: booking_status.IN_PROGRESS };

    (prismaService.bookings.findUnique as jest.Mock).mockResolvedValue(mockBooking);

    await expect(useCase.execute(bookingId, customerId, dto)).rejects.toThrow(ForbiddenException);
    expect(prismaService.complaints.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if a dispute is already open', async () => {
    const bookingId = 'booking-1';
    const customerId = 'customer-1';
    const dto = {
      reason: dispute_reason.PROVIDER_NO_SHOW,
      description: 'Provider did not arrive',
    };
    const mockBooking = { id: bookingId, customer_id: customerId, provider_id: 'provider-1', status: booking_status.IN_PROGRESS };

    (prismaService.bookings.findUnique as jest.Mock).mockResolvedValue(mockBooking);
    (prismaService.complaints.findFirst as jest.Mock).mockResolvedValue({ id: 'existing' });

    await expect(useCase.execute(bookingId, customerId, dto)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(bookingId, customerId, dto)).rejects.toThrow('A dispute has already been opened for this booking');
    expect(prismaService.complaints.create).not.toHaveBeenCalled();
  });
});
