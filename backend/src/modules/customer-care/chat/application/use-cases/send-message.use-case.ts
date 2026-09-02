import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { SupabaseStorageService } from '../../../../storage/supabase-storage.service';
import { message_type } from '@prisma/client';
import * as crypto from 'crypto';
import { ChatGateway } from '../../chat.gateway';

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async execute(userId: string, roomId: string, content?: string, file?: Express.Multer.File) {
    if (!content && !file) {
      throw new BadRequestException('Phải cung cấp nội dung hoặc file');
    }

    // 1. Validate Room
    const room = await this.prisma.chat_rooms.findUnique({
      where: { id: roomId },
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

    // 4. Fire WebSocket event
    if (this.chatGateway && this.chatGateway.server) {
      this.chatGateway.server.to(roomId).emit('newMessage', message);
    }

    // Fire event/notification to the partner here if Notification Module is ready
    // this.eventEmitter.emit('chat.message_sent', message);

    return message;
  }
}
