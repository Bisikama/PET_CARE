import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SendMessageDto } from './dto/chat.dto';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService
  ) {}

  async getMyRooms(userId: string) {
    const rooms = await this.prisma.chat_rooms.findMany({
      where: {
        OR: [
          { customer_id: userId },
          { provider_user_id: userId }
        ],
        is_active: true
      },
      include: {
        chat_messages: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });

    return rooms;
  }

  async getRoomMessages(userId: string, roomId: string, page: number = 1, limit: number = 20) {
    const room = await this.prisma.chat_rooms.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chat');
    }

    if (room.customer_id !== userId && room.provider_user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem tin nhắn của phòng này');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chat_messages.findMany({
        where: { chat_room_id: roomId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.chat_messages.count({
        where: { chat_room_id: roomId }
      })
    ]);

    return {
      data: messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async saveMessage(userId: string, dto: SendMessageDto) {
    const room = await this.prisma.chat_rooms.findUnique({
      where: { id: dto.roomId }
    });

    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chat');
    }

    if (room.customer_id !== userId && room.provider_user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền gửi tin nhắn vào phòng này');
    }

    const message = await this.prisma.chat_messages.create({
      data: {
        chat_room_id: dto.roomId,
        sender_id: userId,
        content: dto.content,
        message_type: 'TEXT'
      }
    });

    const receiverId = room.customer_id === userId ? room.provider_user_id : room.customer_id;

    return { message, receiverId };
  }

  async saveMediaMessage(userId: string, roomId: string, file: Express.Multer.File) {
    const room = await this.prisma.chat_rooms.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chat');
    }

    if (room.customer_id !== userId && room.provider_user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền gửi tin nhắn vào phòng này');
    }

    if (!file) {
      throw new BadRequestException('Vui lòng chọn file');
    }

    // Determine type
    const isVideo = file.mimetype.startsWith('video/');
    const messageType = isVideo ? 'VIDEO' : 'IMAGE';

    // Upload
    const fileUrl = await this.storageService.uploadFile(
      file, 
      'chat_media', 
      `chat-${Date.now()}-${file.originalname}`
    );

    const message = await this.prisma.chat_messages.create({
      data: {
        chat_room_id: roomId,
        sender_id: userId,
        content: fileUrl,
        message_type: messageType
      }
    });

    const receiverId = room.customer_id === userId ? room.provider_user_id : room.customer_id;

    return { message, receiverId };
  }
}
