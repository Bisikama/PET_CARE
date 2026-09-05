import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { CreateReviewDto } from '../../dto/create-review.dto';
import { booking_status } from '@prisma/client';

@Injectable()
export class CreateReviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(bookingId: string, customerId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customer_id !== customerId) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    if (booking.status !== booking_status.COMPLETED) {
      throw new BadRequestException('You can only review completed bookings');
    }

    // Ensure not already reviewed
    const existingReview = await this.prisma.reviews.findFirst({
      where: { booking_id: bookingId, reviewer_id: customerId },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this booking');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create review
      const review = await tx.reviews.create({
        data: {
          booking_id: bookingId,
          reviewer_id: customerId,
          reviewee_id: booking.provider_id!, // Assume provider exists for completed booking
          rating: dto.rating,
          comment: dto.comment,
        },
      });

      // Update provider profile safely with SQL to avoid race conditions
      await tx.$executeRaw`
        UPDATE provider_profiles
        SET 
          rating_avg = ROUND((COALESCE(rating_avg, 0) * COALESCE(total_reviews, 0) + ${dto.rating}::numeric) / (COALESCE(total_reviews, 0) + 1), 2),
          total_reviews = COALESCE(total_reviews, 0) + 1
        WHERE user_id = ${booking.provider_id}::uuid
      `;

      return review;
    });
  }
}
