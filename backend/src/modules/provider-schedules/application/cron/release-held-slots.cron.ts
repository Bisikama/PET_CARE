import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class ReleaseHeldSlotsCron {
  private readonly logger = new Logger(ReleaseHeldSlotsCron.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running ReleaseHeldSlotsCron to free up expired slots and bookings...');

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    try {
      // 1. Tìm các bookings đang PENDING_PAYMENT quá hạn 10 phút hoặc có slot held_until < now
      const expiredBookings = await this.prisma.bookings.findMany({
        where: {
          status: 'PENDING_PAYMENT',
          OR: [
            { created_at: { lt: tenMinutesAgo } },
            {
              provider_working_slots: {
                held_until: { lt: now },
              },
            },
          ],
        },
        include: {
          payments: true,
        },
      });

      if (expiredBookings.length > 0) {
        this.logger.log(`Found ${expiredBookings.length} expired pending bookings. Processing expiration...`);

        for (const booking of expiredBookings) {
          await this.prisma.$transaction(async (tx) => {
            // Cập nhật trạng thái Booking -> EXPIRED
            await tx.bookings.update({
              where: { id: booking.id },
              data: {
                status: 'EXPIRED',
                updated_at: now,
              },
            });

            // Nếu có bản ghi payment đang PENDING -> Chuyển sang VOIDED
            if (booking.payments && booking.payments.status === 'PENDING') {
              await tx.payments.update({
                where: { id: booking.payments.id },
                data: {
                  status: 'VOIDED',
                  updated_at: now,
                },
              });
            }

            // Ghi log trạng thái booking
            await tx.booking_status_logs.create({
              data: {
                booking_id: booking.id,
                old_status: 'PENDING_PAYMENT',
                new_status: 'EXPIRED',
                changed_by: null,
                note: 'Tự động hủy do quá hạn 10 phút chưa thanh toán',
              },
            });

            // Ghi nhận event
            await tx.booking_events.create({
              data: {
                booking_id: booking.id,
                actor_id: null,
                event_type: 'CANCELLED',
                note: 'Booking expired due to unpaid status after 10 minutes',
              },
            });

            // Giải phóng slot của booking này
            if (booking.provider_working_slot_id) {
              await tx.provider_working_slots.updateMany({
                where: {
                  id: booking.provider_working_slot_id,
                  status: 'HELD_FOR_PAYMENT',
                },
                data: {
                  status: 'AVAILABLE',
                  held_until: null,
                  reserved_until: null,
                  updated_at: now,
                },
              });
            }
          });
        }
      }

      // 2. Quét dọn các slot HELD_FOR_PAYMENT còn lại (kể cả orphaned slots) có held_until < now
      const result = await this.prisma.provider_working_slots.updateMany({
        where: {
          status: 'HELD_FOR_PAYMENT',
          held_until: {
            lt: now,
          },
        },
        data: {
          status: 'AVAILABLE',
          held_until: null,
          reserved_until: null,
          updated_at: now,
        },
      });

      if (result.count > 0) {
        this.logger.log(`Released ${result.count} expired held slots back to AVAILABLE.`);
      }
    } catch (error) {
      this.logger.error('Failed to release held slots and expire bookings', error);
    }
  }
}
