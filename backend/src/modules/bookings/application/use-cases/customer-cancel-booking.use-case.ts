import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';
import { BookingStateMachineService } from '../../domain/services/booking-state-machine.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';

@Injectable()
export class CustomerCancelBookingUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settlementsService: SettlementsService,
    private readonly stateMachine: BookingStateMachineService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(customerId: string, bookingId: string, reason: string = 'Khách hàng tự hủy Booking') {
    let providerUserId: string | undefined;

    const result = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id: bookingId },
        include: { payments: true, provider_profiles: true },
      });

      if (!booking) {
        throw new BadRequestException('Không tìm thấy Booking');
      }

      if (booking.customer_id !== customerId) {
        throw new BadRequestException('Booking không thuộc về bạn');
      }

      providerUserId = booking.provider_profiles?.user_id;

      // Kiểm tra xem Booking có thể hủy không (chỉ hủy trước khi Provider bắt đầu)
      const allowedCancelStatuses = ['PENDING_PAYMENT', 'PENDING_PROVIDER_ACCEPTANCE', 'ACCEPTED'];
      if (!allowedCancelStatuses.includes(booking.status)) {
        throw new ConflictException(`Không thể hủy Booking ở trạng thái ${booking.status}`);
      }

      const payment = booking.payments;
      
      // Nếu chưa thanh toán hoặc đang PENDING thanh toán, chỉ cần đổi trạng thái Booking & Payment
      if (!payment || payment.status === 'PENDING' || payment.status === 'FAILED') {
        await tx.bookings.update({
          where: { id: bookingId },
          data: { status: 'REJECTED' },
        });

        if (payment) {
          await tx.payments.update({
            where: { id: payment.id },
            data: { status: 'VOIDED' },
          });
        }
        
        await tx.chat_rooms.updateMany({
          where: { booking_id: bookingId },
          data: { is_active: false },
        });

        return { success: true, message: 'Đã hủy Booking (chưa thanh toán)' };
      }

      // Nếu đã thanh toán và tiền đang ở Ký Quỹ -> Cần hoàn tiền 100%
      if (payment.status === 'PAID_HELD_IN_ESCROW' || payment.status === 'ESCROW_ON_HOLD') {
        await this.settlementsService.refund(bookingId, tx, reason);
        await tx.chat_rooms.updateMany({
          where: { booking_id: bookingId },
          data: { is_active: false },
        });
        return { success: true, message: 'Đã hủy Booking và hoàn tiền thành công' };
      }

      throw new ConflictException('Không thể xử lý hủy với trạng thái thanh toán hiện tại');
    });

    // Gửi thông báo Real-time cho Provider nếu có
    if (providerUserId) {
      await this.notificationsService.sendNotification({
        userId: providerUserId,
        type: 'BOOKING_CANCELLED',
        title: 'Khách hàng đã hủy đơn đặt lịch',
        content: 'Đơn đặt lịch đã được khách hàng hủy. Ca làm việc của bạn đã được giải phóng.',
        bookingId,
        actionUrl: `/provider/schedule`,
        metadata: { bookingId, status: 'CANCELLED' },
      }).catch(() => {});
    }

    return result;
  }
}
