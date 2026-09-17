import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class GetProviderDetailsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(providerId: string) {
    const provider = await this.prisma.provider_profiles.findUnique({
      where: {
        id: providerId,
      },
      include: {
        users: {
          select: {
            fullName: true,
            avatarUrl: true,
          }
        },
      }
    });

    if (!provider) {
      throw new NotFoundException('Không tìm thấy thông tin đối tác');
    }

    return {
      id: provider.id,
      userId: provider.user_id,
      fullName: (provider.users as any)?.fullName,
      avatarUrl: (provider.users as any)?.avatarUrl,
      coverUrl: null,
      bio: provider.bio,
      rating: provider.rating_avg ? Number(provider.rating_avg) : 0,
      totalReviews: provider.total_reviews,
      baseAddress: provider.base_address_line,
    };
  }
}
