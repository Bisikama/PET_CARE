import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';

@Injectable()
export class GetChatRoomsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const rooms = await this.prisma.chat_rooms.findMany({
      where: {
        OR: [
          { customer_id: userId },
          { provider_user_id: userId },
        ],
      },
      include: {
        users_chat_rooms_customer_idTousers: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        users_chat_rooms_provider_user_idTousers: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        chat_messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return rooms.map((room) => {
      const isCustomer = room.customer_id === userId;
      const partner = isCustomer
        ? room.users_chat_rooms_provider_user_idTousers
        : room.users_chat_rooms_customer_idTousers;
        
      return {
        id: room.id,
        booking_id: room.booking_id,
        is_active: room.is_active,
        created_at: room.created_at,
        partner,
        last_message: room.chat_messages[0] || null,
      };
    }).sort((a, b) => {
      // Sort by last message time if available, otherwise by room creation time
      const timeA = a.last_message?.created_at || a.created_at;
      const timeB = b.last_message?.created_at || b.created_at;
      // Handle potential nulls
      if (!timeA) return 1;
      if (!timeB) return -1;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  }
}
