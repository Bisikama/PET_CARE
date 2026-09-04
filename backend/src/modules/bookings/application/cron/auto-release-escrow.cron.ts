import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../database/prisma.service';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';
import { BookingStateMachineService } from '../../domain/services/booking-state-machine.service';

@Injectable()
export class AutoReleaseEscrowCron {
  private readonly logger = new Logger(AutoReleaseEscrowCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settlementsService: SettlementsService,
    private readonly stateMachine: BookingStateMachineService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoReleaseEscrow() {
    this.logger.log('Bắt đầu quét các Booking cần Auto-Release Escrow...');

    // Lấy thời điểm 3 ngày trước
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const bookingsToRelease = await this.prisma.bookings.findMany({
      where: {
        status: 'AWAITING_CUSTOMER_CONFIRMATION',
        updated_at: { lt: threeDaysAgo },
      },
    });

    for (const booking of bookingsToRelease) {
      try {
        const nextStatus = this.stateMachine.customerConfirmBooking(booking.status);

        await this.prisma.$transaction(async (tx) => {
          // 1. Cập nhật trạng thái Booking
          await tx.bookings.update({
            where: { id: booking.id },
            data: {
              status: nextStatus,
              updated_at: new Date(),
            },
          });

          // 2. Ghi log
          await tx.booking_status_logs.create({
            data: {
              booking_id: booking.id,
              old_status: booking.status,
              new_status: nextStatus,
              note: 'Hệ thống tự động xác nhận hoàn thành sau 3 ngày',
            },
          });

          // 3. Ghi event
          await tx.booking_events.create({
            data: {
              booking_id: booking.id,
              event_type: 'AUTO_COMPLETED',
              note: 'System auto-completed booking',
            },
          });

          // 4. Gọi giải phóng ký quỹ
          await this.settlementsService.releaseEscrow(booking.id, tx);
        });

        this.logger.log(`Đã auto-release escrow thành công cho Booking ID: ${booking.id}`);
      } catch (error: any) {
        this.logger.error(`Lỗi khi auto-release escrow cho Booking ID: ${booking.id}`, error.stack);
      }
    }

    this.logger.log(`Quét hoàn tất. Số lượng đã xử lý: ${bookingsToRelease.length}`);
  }
}
