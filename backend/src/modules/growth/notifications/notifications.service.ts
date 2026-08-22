import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { notification_type } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.notifications.create({
      data: {
        user_id: userId,
        type,
        title,
        content,
        related_booking_id: bookingId,
      },
    });
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
