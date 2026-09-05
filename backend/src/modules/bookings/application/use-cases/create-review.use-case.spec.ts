import { Test, TestingModule } from '@nestjs/testing';
import { CreateReviewUseCase } from './create-review.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { booking_status } from '@prisma/client';

describe('CreateReviewUseCase', () => {
  let useCase: CreateReviewUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReviewUseCase,
        {
          provide: PrismaService,
          useValue: {
            bookings: {
              findUnique: jest.fn(),
            },
            reviews: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback(prismaService)),
            $executeRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateReviewUseCase>(CreateReviewUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a review successfully (Happy Path)', async () => {
    const bookingId = 'booking-1';
    const customerId = 'customer-1';
    const dto = { rating: 5, comment: 'Great!' };
    const mockBooking = { id: bookingId, customer_id: customerId, provider_id: 'provider-1', status: booking_status.COMPLETED };

    (prismaService.bookings.findUnique as jest.Mock).mockResolvedValue(mockBooking);
    (prismaService.reviews.findFirst as jest.Mock).mockResolvedValue(null);
    (prismaService.reviews.create as jest.Mock).mockResolvedValue({ id: 'review-1', ...dto });

    const result = await useCase.execute(bookingId, customerId, dto);

    expect(prismaService.reviews.create).toHaveBeenCalledWith({
      data: {
        booking_id: bookingId,
        reviewer_id: customerId,
        reviewee_id: mockBooking.provider_id,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
    expect(prismaService.$executeRaw).toHaveBeenCalled(); // Should update provider profile rating
    expect(result.id).toBe('review-1');
  });

  it('should throw BadRequestException if booking is not COMPLETED (Negative Case)', async () => {
    const bookingId = 'booking-1';
    const customerId = 'customer-1';
    const dto = { rating: 5, comment: 'Great!' };
    const mockBooking = { id: bookingId, customer_id: customerId, status: booking_status.IN_PROGRESS };

    (prismaService.bookings.findUnique as jest.Mock).mockResolvedValue(mockBooking);

    await expect(useCase.execute(bookingId, customerId, dto)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(bookingId, customerId, dto)).rejects.toThrow('You can only review completed bookings');
    expect(prismaService.reviews.create).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException if user is not the customer (Negative Case)', async () => {
    const bookingId = 'booking-1';
    const customerId = 'customer-1';
    const dto = { rating: 5, comment: 'Great!' };
    const mockBooking = { id: bookingId, customer_id: 'other-customer', status: booking_status.COMPLETED };

    (prismaService.bookings.findUnique as jest.Mock).mockResolvedValue(mockBooking);

    await expect(useCase.execute(bookingId, customerId, dto)).rejects.toThrow(ForbiddenException);
    await expect(useCase.execute(bookingId, customerId, dto)).rejects.toThrow('You can only review your own bookings');
    expect(prismaService.reviews.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if already reviewed', async () => {
    const bookingId = 'booking-1';
    const customerId = 'customer-1';
    const dto = { rating: 5, comment: 'Great!' };
    const mockBooking = { id: bookingId, customer_id: customerId, provider_id: 'provider-1', status: booking_status.COMPLETED };

    (prismaService.bookings.findUnique as jest.Mock).mockResolvedValue(mockBooking);
    (prismaService.reviews.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-review' });

    await expect(useCase.execute(bookingId, customerId, dto)).rejects.toThrow(BadRequestException);
    expect(prismaService.reviews.create).not.toHaveBeenCalled();
  });
});
