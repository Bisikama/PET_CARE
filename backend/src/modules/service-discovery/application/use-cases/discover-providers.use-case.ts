import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

export interface DiscoverProvidersInput {
  serviceId: string;
  city?: string;
  district?: string;
  ward?: string;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  hasTrustBadge?: boolean;
}

export interface DiscoveredProviderOutput {
  id: string;
  userId: string;
  fullName: string;
  ratingAvg: number;
  trustScore: number;
  totalCompletedBookings: number;
  price: number;
  score: number;
  recommendationReasons: string[];
}

@Injectable()
export class DiscoverProvidersUseCase {
  private readonly logger = new Logger(DiscoverProvidersUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: DiscoverProvidersInput): Promise<DiscoveredProviderOutput[]> {
    if (!input.serviceId) {
      throw new BadRequestException('Bắt buộc phải có serviceId');
    }

    // 1. Prisma Query - Only APPROVED providers who offer the requested service
    const providers = await this.prisma.provider_profiles.findMany({
      where: {
        status: 'APPROVED',
        provider_services: {
          some: {
            service_id: input.serviceId,
            ...(input.priceMin !== undefined && { price: { gte: input.priceMin } }),
            ...(input.priceMax !== undefined && { price: { lte: input.priceMax } }),
          },
        },
        ...(input.city || input.district || input.ward ? {
          provider_service_areas: {
            some: {
              ...(input.city && { city: input.city }),
              ...(input.district && { district: input.district }),
              ...(input.ward && { ward: input.ward }),
            },
          },
        } : {}),
      },
      include: {
        users: { select: { fullName: true } },
        provider_services: { where: { service_id: input.serviceId } },
        provider_trust_badges: true,
      },
    });

    if (providers.length === 0) {
      return [];
    }

    // Determine max completed bookings for normalization
    const maxBookings = providers.reduce(
      (max, p) => Math.max(max, p.total_completed_bookings || 0), 
      0
    );

    // 2. Filter in memory (ratingMin, trustBadge)
    let filtered = providers;

    if (input.ratingMin !== undefined) {
      filtered = filtered.filter((p) => Number(p.rating_avg) >= input.ratingMin!);
    }
    if (input.hasTrustBadge) {
      filtered = filtered.filter((p) => p.provider_trust_badges.length > 0);
    }

    // 3. Map and Calculate Scores
    const outputs: DiscoveredProviderOutput[] = filtered.map((p) => {
      const ratingAvg = Number(p.rating_avg || 0);
      const trustScore = p.trust_score || 100;
      const completedBookings = p.total_completed_bookings || 0;
      const price = Number(p.provider_services[0]?.price || 0);

      const score = this.calculateProviderScore(ratingAvg, trustScore, completedBookings, maxBookings);

      const reasons: string[] = [];
      if (ratingAvg >= 4.8) reasons.push(`Rating rất cao ${ratingAvg}⭐`);
      if (trustScore >= 95) reasons.push('Đối tác Uy tín cao');
      if (completedBookings > 50) reasons.push(`Kinh nghiệm dày dặn (${completedBookings} bookings)`);

      return {
        id: p.id,
        userId: p.user_id,
        fullName: p.users?.fullName || 'Unknown',
        ratingAvg,
        trustScore,
        totalCompletedBookings: completedBookings,
        price,
        score: Number(score.toFixed(4)),
        recommendationReasons: reasons,
      };
    });

    // 4. Sort by score descending
    return outputs.sort((a, b) => b.score - a.score);
  }

  /**
   * Tính điểm xếp hạng sử dụng chuẩn hóa (Normalization)
   * Rating (40%): rating / 5
   * Trust Score (30%): trust_score / 100
   * Completed Bookings (30%): log10(bookings + 1) / log10(maxBookings + 1)
   */
  private calculateProviderScore(rating: number, trustScore: number, bookings: number, maxBookings: number): number {
    const W_RATING = 0.4;
    const W_TRUST = 0.3;
    const W_BOOKING = 0.3;

    // Normalization
    const normRating = Math.min(Math.max(rating / 5, 0), 1);
    const normTrust = Math.min(Math.max(trustScore / 100, 0), 1);
    
    // Logarithmic Normalization for bookings
    const safeMaxBookings = Math.max(maxBookings, 1);
    const normBooking = Math.log10(bookings + 1) / Math.log10(safeMaxBookings + 1);

    const finalScore = (normRating * W_RATING) + (normTrust * W_TRUST) + (normBooking * W_BOOKING);
    
    // Trả về thang điểm 100
    return Math.round(finalScore * 100);
  }
}
