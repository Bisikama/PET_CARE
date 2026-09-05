import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { CheckConflictSlotDto } from '../../dto/check-conflict-slot.dto';

@Injectable()
export class CheckConflictSlotUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CheckConflictSlotDto) {
    const { providerId, startTime, endTime } = dto;
    
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Check for overlapping bookings
    const conflictingBookings = await this.prisma.bookings.findMany({
      where: {
        provider_id: providerId,
        status: {
          in: ['PENDING_PAYMENT', 'PENDING_PROVIDER_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS']
        },
        AND: [
          { estimated_start_at: { lt: end } },
          { estimated_end_at: { gt: start } }
        ]
      },
      select: {
        id: true,
        estimated_start_at: true,
        estimated_end_at: true,
      }
    });

    if (conflictingBookings.length > 0) {
      return {
        isConflict: true,
        conflicts: conflictingBookings.map(b => ({
          bookingId: b.id,
          startTime: b.estimated_start_at,
          endTime: b.estimated_end_at,
        })),
        reason: 'Overlapping bookings found'
      };
    }

    // 2. Check for blocked/booked working slots
    const conflictingSlots = await this.prisma.provider_working_slots.findMany({
      where: {
        provider_working_days: {
          provider_id: providerId,
        },
        status: {
          in: ['BLOCKED', 'BOOKED']
        },
      },
      select: {
        id: true,
        status: true,
      }
    });

    if (conflictingSlots.length > 0) {
      return {
        isConflict: true,
        conflicts: conflictingSlots.map(s => ({
          slotId: s.id,
          status: s.status
        })),
        reason: 'Slots are blocked or already booked'
      };
    }

    return {
      isConflict: false,
      message: 'Slot is available'
    };
  }
}
