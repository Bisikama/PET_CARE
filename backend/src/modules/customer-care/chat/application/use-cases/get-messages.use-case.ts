import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { ALLOWED_CHAT_STATUSES } from './get-chat-rooms.use-case';

@Injectable()
export class GetMessagesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, roomId: string, page: number = 1, limit: number = 50) {
    const room = await this.prisma.chat_rooms.findUnique({
      where: { id: roomId },
      include: {
        users_chat_rooms_customer_idTousers: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
        users_chat_rooms_provider_user_idTousers: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            requested_date: true,
            booking_pets: {
              select: {
                pet_name: true,
                pets: { select: { name: true, breed: true, avatar_url: true } },
                booking_services: {
                  select: {
                    service_name: true,
                    provider_services: {
                      select: {
                        services: { select: { name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chat');
    }

    if (room.customer_id !== userId && room.provider_user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem phòng chat này');
    }

    const isCustomer = room.customer_id === userId;
    const rawPartner = isCustomer
      ? room.users_chat_rooms_provider_user_idTousers
      : room.users_chat_rooms_customer_idTousers;

    const partner = rawPartner ? {
      id: rawPartner.id,
      fullName: rawPartner.fullName,
      avatarUrl: rawPartner.avatarUrl,
      phoneNumber: rawPartner.phone,
    } : undefined;

    const firstPet = room.bookings?.booking_pets?.[0];
    const petName = firstPet?.pets?.name || firstPet?.pet_name || 'Bé cưng';
    const firstService = firstPet?.booking_services?.[0];
    const serviceTitle =
      firstService?.provider_services?.services?.name ||
      firstService?.service_name ||
      'Dịch vụ thú cưng';

    const isChatActive =
      Boolean(room.is_active) &&
      Boolean(room.bookings && ALLOWED_CHAT_STATUSES.includes(room.bookings.status));

    // If chat is inactive / booking is completed (nghiệm thu thành công) / cancelled:
    // Close room and do not display messages
    if (!isChatActive) {
      return {
        room: {
          id: room.id,
          booking_id: room.booking_id,
          is_active: false,
          created_at: room.created_at,
          partner,
          booking: {
            id: room.bookings?.id,
            status: room.bookings?.status,
            requested_date: room.bookings?.requested_date,
            pet_name: petName,
            service_title: serviceTitle,
          },
        },
        messages: [],
        meta: {
          total: 0,
          page: 1,
          limit,
          totalPages: 0,
        },
      };
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chat_messages.findMany({
        where: { chat_room_id: roomId },
        include: {
          users: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
        orderBy: { created_at: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.chat_messages.count({
        where: { chat_room_id: roomId },
      }),
    ]);

    // Mark partner's messages as read asynchronously
    this.prisma.chat_messages.updateMany({
      where: {
        chat_room_id: roomId,
        sender_id: { not: userId },
        is_read: false,
      },
      data: { is_read: true },
    }).catch(err => console.error('Failed to mark messages as read', err));

    return {
      room: {
        id: room.id,
        booking_id: room.booking_id,
        is_active: true,
        created_at: room.created_at,
        partner,
        booking: {
          id: room.bookings?.id,
          status: room.bookings?.status,
          requested_date: room.bookings?.requested_date,
          pet_name: petName,
          service_title: serviceTitle,
        },
      },
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

