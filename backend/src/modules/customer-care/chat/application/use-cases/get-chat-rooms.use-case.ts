import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';

export const ALLOWED_CHAT_STATUSES = [
  'ACCEPTED',
  'PROVIDER_ARRIVED',
  'CHECKED_IN',
  'IN_PROGRESS',
  'AWAITING_CUSTOMER_CONFIRMATION',
];

@Injectable()
export class GetChatRoomsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const rooms = await this.prisma.chat_rooms.findMany({
      where: {
        is_active: true,
        bookings: {
          status: {
            in: ALLOWED_CHAT_STATUSES as any,
          },
        },
        OR: [
          { customer_id: userId },
          { provider_user_id: userId },
        ],
      },
      include: {
        users_chat_rooms_customer_idTousers: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
        users_chat_rooms_provider_user_idTousers: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
        chat_messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
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
      orderBy: { created_at: 'desc' },
    });

    const mappedRooms = rooms.map((room) => {
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
        
      return {
        id: room.id,
        booking_id: room.booking_id,
        is_active: room.is_active ?? false,
        created_at: room.created_at,
        partner,
        booking: {
          id: room.bookings?.id,
          status: room.bookings?.status,
          requested_date: room.bookings?.requested_date,
          pet_name: petName,
          service_title: serviceTitle,
        },
        last_message: room.chat_messages[0] || null,
      };
    });

    // Deduplicate by partner ID so each account appears only ONCE
    const uniquePartnerMap = new Map<string, typeof mappedRooms[0]>();
    for (const item of mappedRooms) {
      const partnerId = item.partner?.id;
      if (!partnerId) continue;
      if (!uniquePartnerMap.has(partnerId)) {
        uniquePartnerMap.set(partnerId, item);
      } else {
        const existing = uniquePartnerMap.get(partnerId)!;
        const existingTime = new Date(existing.last_message?.created_at || existing.created_at || 0).getTime();
        const itemTime = new Date(item.last_message?.created_at || item.created_at || 0).getTime();
        if (itemTime > existingTime) {
          uniquePartnerMap.set(partnerId, item);
        }
      }
    }

    return Array.from(uniquePartnerMap.values()).sort((a, b) => {
      const timeA = a.last_message?.created_at || a.created_at;
      const timeB = b.last_message?.created_at || b.created_at;
      if (!timeA) return 1;
      if (!timeB) return -1;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  }

  async getRoomByBookingId(userId: string, bookingId: string) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        provider_profiles: { select: { user_id: true } },
        provider_working_slots: {
          include: {
            provider_working_days: {
              include: {
                provider_profiles: { select: { user_id: true } },
              },
            },
          },
        },
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
    });

    if (!booking) {
      return { room: null, canChat: false, message: 'Không tìm thấy đơn đặt lịch' };
    }

    const providerUserId =
      booking.provider_profiles?.user_id ||
      booking.provider_working_slots?.provider_working_days?.provider_profiles?.user_id ||
      booking.provider_id ||
      '';

    if (booking.customer_id !== userId && providerUserId !== userId) {
      return { room: null, canChat: false, message: 'Bạn không có quyền tham gia cuộc trò chuyện này' };
    }

    const firstPet = booking.booking_pets?.[0];
    const petName = firstPet?.pets?.name || firstPet?.pet_name || 'Bé cưng';
    const firstService = firstPet?.booking_services?.[0];
    const serviceTitle =
      firstService?.provider_services?.services?.name ||
      firstService?.service_name ||
      'Dịch vụ thú cưng';

    const bookingSummary = {
      id: booking.id,
      status: booking.status,
      requested_date: booking.requested_date,
      pet_name: petName,
      service_title: serviceTitle,
    };

    // Check booking status: if not in ALLOWED_CHAT_STATUSES, do not allow chat
    if (!ALLOWED_CHAT_STATUSES.includes(booking.status)) {
      if (booking.status === 'COMPLETED') {
        return {
          room: null,
          canChat: false,
          message: 'Dịch vụ đã hoàn tất nghiệm thu. Phòng chat đã đóng.',
          booking: bookingSummary,
        };
      }
      if (['CANCELLED', 'REJECTED', 'PROVIDER_TIMEOUT', 'EXPIRED'].includes(booking.status)) {
        return {
          room: null,
          canChat: false,
          message: 'Đơn đặt lịch đã kết thúc hoặc bị hủy. Phòng chat không khả dụng.',
          booking: bookingSummary,
        };
      }
      return {
        room: null,
        canChat: false,
        message: 'Phòng chat chỉ mở sau khi đơn đặt lịch thành công và được đối tác chấp nhận.',
        booking: bookingSummary,
      };
    }

    let room: any = await this.prisma.chat_rooms.findUnique({
      where: { booking_id: bookingId },
      include: {
        users_chat_rooms_customer_idTousers: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
        users_chat_rooms_provider_user_idTousers: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
      },
    });

    // If room does not exist yet but booking is active, create it
    if (!room && providerUserId) {
      room = await this.prisma.chat_rooms.upsert({
        where: { booking_id: bookingId },
        create: {
          booking_id: bookingId,
          customer_id: booking.customer_id,
          provider_user_id: providerUserId,
          is_active: true,
        },
        update: {
          is_active: true,
        },
        include: {
          users_chat_rooms_customer_idTousers: {
            select: { id: true, fullName: true, avatarUrl: true, phone: true },
          },
          users_chat_rooms_provider_user_idTousers: {
            select: { id: true, fullName: true, avatarUrl: true, phone: true },
          },
        },
      });
    }

    if (!room) {
      return {
        room: null,
        canChat: false,
        message: 'Không tìm thấy phòng chat cho đơn này',
        booking: bookingSummary,
      };
    }

    const isCustomer = booking.customer_id === userId;
    const rawPartner = isCustomer
      ? room.users_chat_rooms_provider_user_idTousers
      : room.users_chat_rooms_customer_idTousers;

    const partner = rawPartner ? {
      id: rawPartner.id,
      fullName: rawPartner.fullName,
      avatarUrl: rawPartner.avatarUrl,
      phoneNumber: rawPartner.phone,
    } : undefined;

    return {
      room: {
        id: room.id,
        booking_id: room.booking_id,
        is_active: room.is_active ?? false,
        created_at: room.created_at,
        partner,
        booking: bookingSummary,
      },
      canChat: Boolean(room.is_active),
      message: room.is_active
        ? 'Phòng chat đang mở'
        : 'Phòng chat đã đóng vì dịch vụ đã hoàn tất nghiệm thu hoặc bị hủy',
    };
  }
}


