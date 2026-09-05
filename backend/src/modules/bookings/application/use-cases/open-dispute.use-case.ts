import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { OpenDisputeDto } from '../../dto/open-dispute.dto';
import { booking_status } from '@prisma/client';

@Injectable()
export class OpenDisputeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(bookingId: string, customerId: string, dto: OpenDisputeDto) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customer_id !== customerId) {
      throw new ForbiddenException('You can only open a dispute for your own bookings');
    }

    // Only allow dispute if booking is not already cancelled or completed successfully long ago
    // In MVP, we allow disputes on IN_PROGRESS, AWAITING_CUSTOMER_CONFIRMATION, COMPLETED (if recent), but for simplicity:
    const allowedStatuses = [
      booking_status.ACCEPTED,
      booking_status.PROVIDER_ARRIVED,
      booking_status.CHECKED_IN,
      booking_status.IN_PROGRESS,
      booking_status.AWAITING_CUSTOMER_CONFIRMATION,
      booking_status.COMPLETED,
    ];

    if (!allowedStatuses.includes(booking.status as any)) {
      throw new BadRequestException('Dispute cannot be opened for this booking status');
    }

    // Ensure no existing open dispute
    const existingComplaint = await this.prisma.complaints.findFirst({
      where: {
        booking_id: bookingId,
        complainant_id: customerId,
      }
    });

    if (existingComplaint) {
      throw new BadRequestException('A dispute has already been opened for this booking');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create complaint record
      const complaint = await tx.complaints.create({
        data: {
          booking_id: bookingId,
          complainant_id: customerId,
          accused_id: booking.provider_id,
          title: `Dispute for booking ${bookingId}`,
          description: dto.description,
          reason: dto.reason,
        },
      });

      // 2. Update booking status to DISPUTED to pause money transfer
      await tx.bookings.update({
        where: { id: bookingId },
        data: { status: booking_status.DISPUTED },
      });

      // 3. Log event
      await tx.booking_events.create({
        data: {
          booking_id: bookingId,
          event_type: 'DISPUTE_OPENED',
          actor_id: customerId,
          note: `Dispute reason: ${dto.reason}`,
        },
      });

      return complaint;
    });
  }
}
