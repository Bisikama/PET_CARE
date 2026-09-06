import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';
import { ProviderCancelBookingDto } from '../../presentation/dto/provider-cancel-booking.dto';

@Injectable()
export class ProviderCancelBookingUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settlementsService: SettlementsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(
    providerUserId: string,
    bookingId: string,
    dto: ProviderCancelBookingDto,
  ) {
    let customerUserId: string | undefined;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra sự tồn tại của đơn đặt lịch
      const booking = await tx.bookings.findUnique({
        where: { id: bookingId },
        include: {
          payments: true,
          provider_profiles: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('Không tìm thấy đơn đặt lịch');
      }

      // 2. Xác thực quyền sở hữu: Phải là Provider được chỉ định cho đơn này
      if (booking.provider_profiles?.user_id !== providerUserId) {
        throw new ForbiddenException('Bạn không phải là đối tác được chỉ định cho đơn đặt lịch này');
      }

      // 3. Kiểm tra trạng thái: CHỈ cho phép hủy khi đơn ở trạng thái ACCEPTED (chưa bắt đầu thực hiện)
      if (booking.status !== 'ACCEPTED') {
        throw new BadRequestException(
          `Không thể hủy đơn. Đối tác chỉ được phép hủy khi đơn ở trạng thái đã nhận (ACCEPTED) và chưa bắt đầu thực hiện. Trạng thái hiện tại: ${booking.status}`,
        );
      }

      customerUserId = booking.customer_id;
      const payment = booking.payments;

      // 4. Xử lý hoàn tiền ký quỹ nếu đã thanh toán
      if (payment) {
        if (payment.status === 'PAID_HELD_IN_ESCROW' || payment.status === 'ESCROW_ON_HOLD') {
          await this.settlementsService.refund(
            bookingId,
            tx,
            `Đối tác hủy đơn do sự cố: ${dto.reason}`,
          );
        } else if (payment.status === 'PENDING' || payment.status === 'FAILED') {
          await tx.payments.update({
            where: { id: payment.id },
            data: { status: 'VOIDED' },
          });
        }
      }

      // 5. Cập nhật trạng thái Booking về CANCELLED
      const updatedBooking = await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancellation_reason: dto.reason,
          cancelled_at: new Date(),
        },
      });

      // 6. Ghi nhận record vào bảng booking_cancellations
      await tx.booking_cancellations.create({
        data: {
          booking_id: bookingId,
          requested_by: providerUserId,
          reason: dto.reason,
          note: dto.note || null,
          status: 'AUTO_APPROVED',
          refund_amount: booking.total_price,
          penalty_amount: 0,
          reviewed_by: null,
          reviewed_at: new Date(),
        },
      });

      // 7. Giải phóng slot làm việc về trạng thái AVAILABLE
      if (booking.provider_working_slot_id) {
        await tx.provider_working_slots.update({
          where: { id: booking.provider_working_slot_id },
          data: {
            status: 'AVAILABLE',
            reserved_until: null,
          },
        });
      }

      // 8. Đóng phòng chat giữa Customer và Provider
      await tx.chat_rooms.updateMany({
        where: { booking_id: bookingId },
        data: { is_active: false },
      });

      // 9. Ghi log trạng thái (booking_status_logs) và sự kiện (booking_events)
      await tx.booking_status_logs.create({
        data: {
          booking_id: bookingId,
          old_status: 'ACCEPTED',
          new_status: 'CANCELLED',
          changed_by: providerUserId,
          note: `Đối tác chủ động hủy đơn: ${dto.reason}`,
        },
      });

      await tx.booking_events.create({
        data: {
          booking_id: bookingId,
          actor_id: providerUserId,
          event_type: 'CANCELLED',
          note: `Đối tác hủy đơn: ${dto.reason}`,
        },
      });

      return {
        success: true,
        message: 'Đối tác đã hủy đơn thành công. Tiền ký quỹ đã được hoàn lại cho khách hàng.',
        bookingId: updatedBooking.id,
        status: updatedBooking.status,
      };
    });

    // 10. Gửi thông báo Real-time cho Khách hàng
    if (customerUserId) {
      await this.notificationsService.sendNotification({
        userId: customerUserId,
        type: 'BOOKING_CANCELLED',
        title: 'Đối tác đã hủy đơn đặt lịch',
        content: `Đối tác đã hủy đơn do sự cố: ${dto.reason}. Toàn bộ tiền cọc/ký quỹ đã được hoàn lại vào ví của bạn.`,
        bookingId,
        actionUrl: `/customer/bookings/${bookingId}`,
        metadata: { bookingId, status: 'CANCELLED', reason: dto.reason },
      }).catch(() => {});
    }

    return result;
  }
}
