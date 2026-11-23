import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../database/prisma.service';

/** Thời gian giữ chỗ mặc định khi tạo booking (VNPay/MoMo/Ví). Chuyển khoản được gia hạn qua held_until. */
export const DEFAULT_PAYMENT_HOLD_MINUTES = 10;

@Injectable()
export class ReleaseHeldSlotsCron {
  private readonly logger = new Logger(ReleaseHeldSlotsCron.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running ReleaseHeldSlotsCron to free up expired slots and bookings...');

    const now = new Date();
    const defaultHoldAgo = new Date(now.getTime() - DEFAULT_PAYMENT_HOLD_MINUTES * 60 * 1000);

    try {
      // 1. Booking PENDING_PAYMENT hết hạn khi:
      //    - slot giữ chỗ đã qua held_until (mốc chính — chuyển khoản được gia hạn mốc này), hoặc
      //    - không có slot / slot không có held_until và đã quá thời gian giữ chỗ mặc định (dự phòng)
      const expiredBookings = await this.prisma.bookings.findMany({
        where: {
          status: 'PENDING_PAYMENT',
          OR: [
            { provider_working_slots: { is: { held_until: { lt: now } } } },
            { provider_working_slots: { is: { held_until: null } }, created_at: { lt: defaultHoldAgo } },
            { provider_working_slot_id: null, created_at: { lt: defaultHoldAgo } },
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
            // Chỉ hết hạn nếu booking VẪN đang chờ thanh toán — tránh ghi đè đơn vừa được
            // IPN/webhook xác nhận thanh toán giữa lúc quét và lúc cập nhật
            const { count } = await tx.bookings.updateMany({
              where: { id: booking.id, status: 'PENDING_PAYMENT' },
              data: {
                status: 'EXPIRED',
                updated_at: now,
              },
            });
            if (count === 0) return;

            // Nếu có bản ghi payment đang PENDING -> Chuyển sang VOIDED
            if (booking.payments && booking.payments.status === 'PENDING') {
              await tx.payments.updateMany({
                where: { id: booking.payments.id, status: 'PENDING' },
                data: {
                  status: 'VOIDED',
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
                note: 'Tự động hủy do quá thời gian giữ chỗ mà chưa thanh toán',
              },
            });

            // Ghi nhận event
            await tx.booking_events.create({
              data: {
                booking_id: booking.id,
                actor_id: null,
                event_type: 'CANCELLED',
                note: 'Booking expired: payment hold window elapsed without payment',
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
