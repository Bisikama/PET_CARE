import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { booking_status, Role } from '@prisma/client';

@Injectable()
export class GetActiveBookingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        provider_profiles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeStatuses: booking_status[] = [
      'PENDING_PAYMENT',
      'PENDING_PROVIDER_ACCEPTANCE',
      'ACCEPTED',
      'PROVIDER_ARRIVED',
      'CHECKED_IN',
      'IN_PROGRESS',
      'AWAITING_CUSTOMER_CONFIRMATION',
      'DISPUTED',
      'INCIDENT_REPORTED',
    ];

    const whereClause: any = {
      status: { in: activeStatuses },
    };

    if (user.role === Role.PROVIDER) {
      if (!user.provider_profiles) {
        throw new NotFoundException('Provider profile not found for this user');
      }
      whereClause.provider_id = user.provider_profiles.id;
    } else {
      whereClause.customer_id = user.id;
    }

    const activeBooking = await this.prisma.bookings.findFirst({
      where: whereClause,
      orderBy: {
        estimated_start_at: 'asc',
      },
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
    });

    return activeBooking || null;
  }
}
