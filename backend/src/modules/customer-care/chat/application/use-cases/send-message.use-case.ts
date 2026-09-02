import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { SupabaseStorageService } from '../../../../storage/supabase-storage.service';
import { NotificationsService } from '../../../../growth/notifications/notifications.service';
import { message_type } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(userId: string, roomId: string, content?: string, file?: Express.Multer.File) {
    if (!content && !file) {
      throw new BadRequestException('Phải cung cấp nội dung hoặc file');
    }

    // 1. Validate Room
    const room = await this.prisma.chat_rooms.findUnique({
      where: { id: roomId },
      include: {
        users_chat_rooms_customer_idTousers: { select: { fullName: true } },
        users_chat_rooms_provider_user_idTousers: { select: { fullName: true } },
      },
    });

    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chat');
    }

    if (room.customer_id !== userId && room.provider_user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền tham gia phòng chat này');
    }

    if (!room.is_active) {
      throw new ForbiddenException('Phòng chat đã bị khóa (Booking đã hoàn thành hoặc hủy)');
    }

    // 2. Upload file if exists
    let mediaUrl: string | null = null;
    let msgType: message_type = message_type.TEXT;

    if (file) {
      // Xác định loại tin nhắn
      if (file.mimetype.startsWith('image/')) {
        msgType = message_type.IMAGE;
      } else if (file.mimetype.startsWith('video/')) {
        msgType = message_type.VIDEO;
      } else {
        throw new BadRequestException('Chỉ hỗ trợ file ảnh hoặc video');
      }

      const fileExtension = file.originalname.split('.').pop();
      const uniqueFileName = `${roomId}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${fileExtension}`;
      
      // Upload via StorageService
      mediaUrl = await this.storageService.uploadFile(file, 'chat-media', uniqueFileName);
    }

    // 3. Save Message
    const message = await this.prisma.chat_messages.create({
      data: {
        chat_room_id: roomId,
        sender_id: userId,
        content: content || null,
        media_url: mediaUrl,
        message_type: msgType,
        is_read: false,
      },
    });

    // 4. Bắn thông báo Real-time cho đối phương
    const recipientId = room.customer_id === userId ? room.provider_user_id : room.customer_id;
    const senderName = room.customer_id === userId
      ? room.users_chat_rooms_customer_idTousers?.fullName || 'Khách hàng'
      : room.users_chat_rooms_provider_user_idTousers?.fullName || 'Đối tác';

    await this.notificationsService.sendNotification({
      userId: recipientId,
      type: 'NEW_MESSAGE',
      title: `Tin nhắn mới từ ${senderName}`,
      content: content || (msgType === 'IMAGE' ? '[Đã gửi một hình ảnh]' : '[Đã gửi một video]'),
      bookingId: room.booking_id,
      actionUrl: `/chat/${roomId}`,
      metadata: {
        roomId,
        messageId: message.id,
        senderId: userId,
        senderName,
        messageType: msgType,
      },
    }).catch(() => {});

    return message;
  }
}
