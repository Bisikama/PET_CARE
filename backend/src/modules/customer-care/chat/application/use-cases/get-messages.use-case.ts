import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';

@Injectable()
export class GetMessagesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, roomId: string, page: number = 1, limit: number = 50) {
    const room = await this.prisma.chat_rooms.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chat');
    }

    if (room.customer_id !== userId && room.provider_user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem phòng chat này');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chat_messages.findMany({
        where: { chat_room_id: roomId },
        orderBy: { created_at: 'desc' }, // newest first, usually chat UI displays bottom up
        skip,
        take: limit,
      }),
      this.prisma.chat_messages.count({
        where: { chat_room_id: roomId },
      }),
    ]);

    // Mark partner's messages as read asynchronously (fire and forget)
    this.prisma.chat_messages.updateMany({
      where: {
        chat_room_id: roomId,
        sender_id: { not: userId },
        is_read: false,
      },
      data: { is_read: true },
    }).catch(err => console.error('Failed to mark messages as read', err));

    return {
      messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
