import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class GetRecommendationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    // Recommend top 5 providers by rating
    const providers = await this.prisma.provider_profiles.findMany({
      where: {
        status: 'ACTIVE' as any,
        kyc_status: 'VERIFIED' as any,
      },
      orderBy: {
        rating_avg: 'desc',
      },
      take: 5,
      include: {
        users: {
          select: {
            fullName: true,
            avatarUrl: true,
          }
        }
      }
    });

    return providers.map(p => ({
      id: p.id,
      userId: p.user_id,
      fullName: (p.users as any)?.fullName,
      avatarUrl: (p.users as any)?.avatarUrl,
      bio: p.bio,
      rating: p.rating_avg ? Number(p.rating_avg) : 0,
      totalReviews: p.total_reviews,
      baseAddress: p.base_address_line,
    }));
  }
}
