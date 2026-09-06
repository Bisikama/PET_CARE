import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { GetBookingsDto } from '../../presentation/dto/get-bookings.dto';
import { Role } from '@prisma/client';

@Injectable()
export class GetBookingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: GetBookingsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        provider_profiles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page = 1, limit = 10, status } = dto;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (user.role === Role.PROVIDER) {
      if (!user.provider_profiles) {
        throw new NotFoundException('Provider profile not found for this user');
      }
      whereClause.provider_id = user.provider_profiles.id;
    } else {
      whereClause.customer_id = user.id;
    }

    if (status) {
      whereClause.status = status;
    }

    const [total, data] = await Promise.all([
      this.prisma.bookings.count({ where: whereClause }),
      this.prisma.bookings.findMany({
        where: whereClause,
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
        include: {
          customer_addresses: true,
          users: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              phone: true,
            },
          },
          provider_profiles: {
            include: {
              users: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                  phone: true,
                },
              },
            },
          },
          booking_pets: {
            include: {
              pets: true,
              booking_services: {
                include: {
                  provider_services: {
                    include: {
                      services: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
