import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { notification_type } from '@prisma/client';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async sendNotification(
    userId: string,
    type: notification_type,
    title: string,
    content: string,
    bookingId?: string,
  ) {
    // Chống spam: Kiểm tra xem trong 1 phút qua đã có thông báo cùng loại chưa
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentDuplicate = await this.prisma.notifications.findFirst({
      where: {
        user_id: userId,
        type,
        related_booking_id: bookingId,
        created_at: { gte: oneMinuteAgo },
      },
    });

    if (recentDuplicate) {
      // Bỏ qua không gửi nữa
      return recentDuplicate;
    }

    // 1. Lưu thông báo vào DB
    const notification = await this.prisma.notifications.create({
      data: {
        user_id: userId,
        type,
        title,
        content,
        related_booking_id: bookingId,
      },
    });

    // 2. Lấy thông tin user để gửi Email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (user && user.email) {
      // 3. Gửi mail bất đồng bộ (Fire and forget) với Fault Tolerance
      this.mailService
        .sendNotificationEmail(user.email, {
          title,
          content,
          userName: user.fullName || 'Khách hàng',
          type,
          bookingId,
        })
        .catch((error) => {
          this.logger.error(
            `[Email Notification Failed] Không thể gửi mail thông báo cho user ${userId}: ${(error as Error).message}`,
            (error as Error).stack,
          );
        });
    }

    return notification;
  }

  async getMyNotifications(userId: string) {
    return this.prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notifications.findFirst({
      where: { id: notificationId, user_id: userId },
    });

    if (!notification) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    return this.prisma.notifications.update({
      where: { id: notificationId },
      data: { is_read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
  }
}
