import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { RequestExtensionDto } from '../../dto/request-extension.dto';

@Injectable()
export class RequestBookingExtensionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(providerId: string, bookingId: string, dto: RequestExtensionDto) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.provider_id !== providerId) {
      throw new ForbiddenException('You are not the provider for this booking');
    }

    if (booking.status !== 'IN_PROGRESS' && booking.status !== 'CHECKED_IN') {
      throw new BadRequestException('Can only request extension for active bookings');
    }

    const currentNote = booking.provider_note ? JSON.parse(booking.provider_note) : {};
    const updatedNote = {
      ...currentNote,
      extension_requests: [
        ...(currentNote.extension_requests || []),
        { minutes: dto.minutes, reason: dto.reason, requested_at: new Date().toISOString() }
      ]
    };

    const updatedBooking = await this.prisma.bookings.update({
      where: { id: bookingId },
      data: {
        provider_note: JSON.stringify(updatedNote)
      }
    });

    // Notify customer
    await this.prisma.notifications.create({
      data: {
        user_id: booking.customer_id,
        type: 'BOOKING_NEW',
        title: 'Yêu cầu thêm thời gian',
        content: `Provider đã xin thêm ${dto.minutes} phút cho booking với lý do: ${dto.reason}`,
        related_booking_id: bookingId
      }
    });

    return {
      success: true,
      message: 'Đã gửi yêu cầu xin thêm thời gian cho khách hàng',
    };
  }
}
