import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { notification_type } from '@prisma/client';
import { NotificationGateway } from './notification.gateway';

export interface SendNotificationDto {
  userId: string;
  type: notification_type;
  title: string;
  content: string;
  bookingId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) { }

  async sendNotification(
    userIdOrDto: string | SendNotificationDto,
    type?: notification_type,
    title?: string,
    content?: string,
    bookingId?: string,
    actionUrl?: string,
    metadata?: Record<string, any>,
  ) {
    let params: SendNotificationDto;
    if (typeof userIdOrDto === 'object') {
      params = userIdOrDto;
    } else {
      params = {
        userId: userIdOrDto,
        type: type!,
        title: title!,
        content: content!,
        bookingId,
        actionUrl,
        metadata,
      };
    }

    // Chống spam: Kiểm tra xem trong 1 phút qua đã có thông báo cùng loại và bookingId chưa
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentDuplicate = await this.prisma.notifications.findFirst({
      where: {
        user_id: params.userId,
        type: params.type,
        related_booking_id: params.bookingId || null,
        created_at: { gte: oneMinuteAgo },
      },
    });

    if (recentDuplicate) {
      // Đã có thông báo gần đây, bỏ qua tạo mới nhưng vẫn đảm bảo emit lại nếu cần
      return recentDuplicate;
    }

    const created = await this.prisma.notifications.create({
      data: {
        user_id: params.userId,
        type: params.type,
        title: params.title,
        content: params.content,
        related_booking_id: params.bookingId || null,
        action_url: params.actionUrl || null,
        metadata: params.metadata || undefined,
      },
    });

    // Bắn WebSocket Real-time Push Event tới phòng riêng của User
    this.notificationGateway.sendToUser(params.userId, 'notification:new', {
      id: created.id,
      userId: created.user_id,
      type: created.type,
      title: created.title,
      content: created.content,
      actionUrl: created.action_url,
      metadata: created.metadata,
      relatedBookingId: created.related_booking_id,
      isRead: created.is_read,
      createdAt: created.created_at,
    });

    return created;
  }

  async getMyNotifications(userId: string, limit = 50) {
    return this.prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.prisma.notifications.count({
      where: { user_id: userId, is_read: false },
    });
    return { unreadCount };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notifications.findFirst({
      where: { id: notificationId, user_id: userId },
    });

    if (!notification) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    const updated = await this.prisma.notifications.update({
      where: { id: notificationId },
      data: { is_read: true },
    });

    // Cập nhật số lượng unread qua socket
    const { unreadCount } = await this.getUnreadCount(userId);
    this.notificationGateway.sendToUser(userId, 'notification:unread_count', { unreadCount });

    return updated;
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    this.notificationGateway.sendToUser(userId, 'notification:unread_count', { unreadCount: 0 });

    return result;
  }
}
