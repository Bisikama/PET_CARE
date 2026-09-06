import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { SubmitCustomerReviewDto } from '../../dto/create-review.dto';
import { booking_status } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProviderReviews(providerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      this.prisma.reviews.findMany({
        where: { reviewee_id: providerId, is_hidden: false },
        include: {
          users_reviews_reviewer_idTousers: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.reviews.count({
        where: { reviewee_id: providerId, is_hidden: false },
      }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createReview(reviewerId: string, bookingId: string, dto: SubmitCustomerReviewDto) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { provider_profiles: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== booking_status.COMPLETED) {
      throw new ForbiddenException('You can only review a COMPLETED booking');
    }

    // Ensure the reviewer is either the customer or the provider of the booking
    if (booking.customer_id !== reviewerId && booking.provider_id !== reviewerId) {
      throw new ForbiddenException('You are not authorized to review this booking');
    }

    const revieweeId = booking.customer_id === reviewerId ? booking.provider_profiles?.user_id : booking.customer_id;
    if (!revieweeId) {
      throw new BadRequestException('Cannot determine reviewee');
    }

    // Ensure they haven't reviewed yet
    const existingReview = await this.prisma.reviews.findFirst({
      where: { booking_id: bookingId, reviewer_id: reviewerId },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this booking');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the review
      const review = await tx.reviews.create({
        data: {
          booking_id: bookingId,
          reviewer_id: reviewerId,
          reviewee_id: revieweeId,
          rating: dto.rating,
          comment: dto.comment,
        },
      });

      // 2. Aggregate the new rating average
      const agg = await tx.reviews.aggregate({
        _avg: { rating: true },
        _count: { rating: true },
        where: { reviewee_id: revieweeId, is_hidden: false },
      });

      const newRatingAvg = agg._avg.rating || 0;
      const newTotalReviews = agg._count.rating || 0;

      // 3. Update the reviewee's profile (assuming the reviewee is a provider for now, or updating user profile if needed)
      // For this system, we mainly track provider ratings. We'll check if the reviewee is a provider.
      const providerProfile = await tx.provider_profiles.findUnique({
        where: { user_id: revieweeId },
      });

      if (providerProfile) {
        await tx.provider_profiles.update({
          where: { user_id: revieweeId },
          data: {
            rating_avg: newRatingAvg,
            total_reviews: newTotalReviews,
          },
        });
      }

      return review;
    });
  }

  async hideReview(adminId: string, reviewId: string, reason: string) {
    const review = await this.prisma.reviews.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.$transaction(async (tx) => {
      const updatedReview = await tx.reviews.update({
        where: { id: reviewId },
        data: {
          is_hidden: true,
          hidden_reason: reason,
          hidden_by: adminId,
          hidden_at: new Date(),
        },
      });

      // Recalculate average without the hidden review
      const agg = await tx.reviews.aggregate({
        _avg: { rating: true },
        _count: { rating: true },
        where: { reviewee_id: review.reviewee_id, is_hidden: false },
      });

      const newRatingAvg = agg._avg.rating || 0;
      const newTotalReviews = agg._count.rating || 0;

      await tx.provider_profiles.updateMany({
        where: { user_id: review.reviewee_id },
        data: {
          rating_avg: newRatingAvg,
          total_reviews: newTotalReviews,
        },
      });

      return updatedReview;
    });
  }

  async updateReview(reviewerId: string, bookingId: string, dto: SubmitCustomerReviewDto) {
    const review = await this.prisma.reviews.findFirst({
      where: { booking_id: bookingId, reviewer_id: reviewerId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const createdAt = review.created_at ? review.created_at.getTime() : new Date().getTime();
    const timeDiff = new Date().getTime() - createdAt;
    if (timeDiff > 7 * 24 * 60 * 60 * 1000) {
      throw new ForbiddenException('You can only edit a review within 7 days of its creation');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedReview = await tx.reviews.update({
        where: { id: review.id },
        data: {
          rating: dto.rating,
          comment: dto.comment,
        },
      });

      // Recalculate average
      const agg = await tx.reviews.aggregate({
        _avg: { rating: true },
        _count: { rating: true },
        where: { reviewee_id: review.reviewee_id, is_hidden: false },
      });

      const newRatingAvg = agg._avg.rating || 0;
      const newTotalReviews = agg._count.rating || 0;

      await tx.provider_profiles.updateMany({
        where: { user_id: review.reviewee_id },
        data: {
          rating_avg: newRatingAvg,
          total_reviews: newTotalReviews,
        },
      });

      return updatedReview;
    });
  }
}
