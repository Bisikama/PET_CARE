import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { UpdateProfileDto } from '../../dto/update-profile.dto';

const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
  ) { }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: {
        ...data,
        wallets: {
          create: {},
        },
      },
    });
  }

  async ensureWalletExists(userId: string) {
    return this.prisma.wallets.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseId },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findPublicById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async ensureLocalUserFromVerifiedSupabaseUser(input: {
    supabaseId: string;
    email: string;
    fullName?: string | null;
  }) {
    const { supabaseId, email, fullName } = input;
    const normalizedEmail = email.trim().toLowerCase();
    const safeFullName = (fullName ?? '').trim() || 'PetCare User';

    if (!supabaseId || !normalizedEmail) {
      throw new BadRequestException(AUTH_ERRORS.AUTH_PROFILE_OUT_OF_SYNC);
    }

    return this.prisma.$transaction(async (tx) => {
      let finalUser;

      // Kiểm tra user theo Supabase ID
      const userBySupabaseId = await tx.user.findUnique({
        where: { supabaseId },
      });

      if (userBySupabaseId) {
        // CASE 1: Đã có user theo supabaseId
        if (userBySupabaseId.email.trim().toLowerCase() !== normalizedEmail) {
          throw new ConflictException(AUTH_ERRORS.ACCOUNT_IDENTITY_CONFLICT);
        }

        // Nếu user đang pending hoặc chưa có emailVerifiedAt, cập nhật thành ACTIVE
        if (userBySupabaseId.status === 'PENDING_VERIFICATION' || !userBySupabaseId.emailVerifiedAt) {
          finalUser = await tx.user.update({
            where: { id: userBySupabaseId.id },
            data: {
              status: 'ACTIVE',
              emailVerifiedAt: new Date(),
            },
          });
        } else {
          // Không đổi role, isActive
          finalUser = userBySupabaseId;
        }
      } else {
        // 2. Kiểm tra user theo email
        const userByEmail = await tx.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (userByEmail) {
          // CASE 2: Có user theo email
          if (userByEmail.supabaseId && userByEmail.supabaseId !== supabaseId) {
            throw new ConflictException(AUTH_ERRORS.ACCOUNT_IDENTITY_CONFLICT);
          }

          // Tự động liên kết supabaseId và kích hoạt tài khoản
          finalUser = await tx.user.update({
            where: { id: userByEmail.id },
            data: {
              supabaseId,
              status: 'ACTIVE',
              emailVerifiedAt: userByEmail.emailVerifiedAt ?? new Date(),
              fullName: userByEmail.fullName || safeFullName,
            },
          });
        } else {
          // CASE 3: Không có cả supabaseId lẫn email -> Tạo local User mới
          finalUser = await tx.user.create({
            data: {
              supabaseId,
              email: normalizedEmail,
              fullName: safeFullName,
              role: 'CUSTOMER',
              status: 'ACTIVE',
              isActive: true,
              emailVerifiedAt: new Date(),
            },
          });
        }
      }

      // ĐẢM BẢO TÍNH ĐỒNG BỘ: Chắc chắn user phải có ví, nếu chưa có (user cũ) thì tạo ví mới 0đ
      await tx.wallets.upsert({
        where: { user_id: finalUser.id },
        update: {},
        create: { user_id: finalUser.id },
      });

      return finalUser;
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
      },
      select: publicUserSelect,
    });
  }

  async updateNotificationSettings(userId: string, settings: Record<string, any>) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const currentSettings = user.notification_settings as Record<string, any> || {};
    const newSettings = { ...currentSettings, ...settings };

    return this.prisma.user.update({
      where: { id: userId },
      data: { notification_settings: newSettings },
      select: { id: true, notification_settings: true },
    });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Upload file using SupabaseStorageService
    const bucket = 'avatars';
    const filePath = `users/${userId}/${Date.now()}-${file.originalname}`;
    const avatarUrl = await this.storageService.uploadFile(file, bucket, filePath);

    try {
      // Update DB
      return await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: publicUserSelect,
      });
    } catch (error) {
      // Rollback: Xóa file rác trên Cloud Storage
      await this.storageService.deleteFile(bucket, filePath);
      throw error;
    }
  }

  /**
   * Lấy nhanh các thông tin ID (id, addressId, petId, providerId...) dùng để test flow booking
   * Hỗ trợ cho user cụ thể hoặc tự động lấy dữ liệu mẫu trong DB
   */
  async getBookingTestContext(requestedUserId?: string) {
    let targetUser: any = null;

    if (requestedUserId) {
      targetUser = await this.prisma.user.findUnique({
        where: { id: requestedUserId },
        select: publicUserSelect,
      });
      if (!targetUser) {
        throw new NotFoundException(`Không tìm thấy người dùng với ID: ${requestedUserId}`);
      }
    } else {
      // Ưu tiên tìm user đã có cả thú cưng và địa chỉ
      targetUser = await this.prisma.user.findFirst({
        where: {
          isActive: true,
          status: 'ACTIVE',
          pets: { some: {} },
          customer_addresses: { some: { deleted_at: null } },
        },
        select: publicUserSelect,
      });

      // Nếu không có user nào đủ cả 2, tìm user có thú cưng
      if (!targetUser) {
        targetUser = await this.prisma.user.findFirst({
          where: {
            isActive: true,
            status: 'ACTIVE',
            pets: { some: {} },
          },
          select: publicUserSelect,
        });
      }

      // Dự phòng: Lấy user active bất kỳ
      if (!targetUser) {
        targetUser = await this.prisma.user.findFirst({
          where: { isActive: true, status: 'ACTIVE' },
          select: publicUserSelect,
        });
      }
    }

    if (!targetUser) {
      throw new NotFoundException('Không tìm thấy người dùng nào trong hệ thống để lấy dữ liệu test');
    }

    const userId = targetUser.id;

    // 1. Lấy danh sách địa chỉ của user
    const addresses = await this.prisma.customer_addresses.findMany({
      where: { customer_id: userId, deleted_at: null },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });

    let addressId = addresses[0]?.id || null;
    if (!addressId) {
      const fallbackAddress = await this.prisma.customer_addresses.findFirst({
        where: { deleted_at: null },
      });
      if (fallbackAddress) {
        addressId = fallbackAddress.id;
      }
    }

    // 2. Lấy danh sách thú cưng của user
    const pets = await this.prisma.pets.findMany({
      where: { customer_id: userId },
      orderBy: { created_at: 'desc' },
    });

    let petId = pets[0]?.id || null;
    if (!petId) {
      const fallbackPet = await this.prisma.pets.findFirst({});
      if (fallbackPet) {
        petId = fallbackPet.id;
      }
    }

    // 3. Kiểm tra xem chính user này có hồ sơ provider hay không
    const myProviderProfile = await this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
      include: {
        provider_services: {
          where: { is_active: true, status: 'APPROVED' },
          include: { services: true },
        },
      },
    });

    // 4. Lấy một provider mẫu đang APPROVED và có sẵn dịch vụ, ca làm việc (để test đặt lịch)
    const sampleProvider = await this.prisma.provider_profiles.findFirst({
      where: {
        status: 'APPROVED',
        kyc_status: 'APPROVED',
        users: { isActive: true },
        provider_services: {
          some: {
            status: 'APPROVED',
            is_active: true,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        provider_services: {
          where: { status: 'APPROVED', is_active: true },
          include: { services: true },
        },
        provider_working_days: {
          include: {
            provider_working_slots: {
              where: { status: 'AVAILABLE' },
              include: { time_slots: true },
            },
          },
        },
      },
    });

    const activeService = sampleProvider?.provider_services?.[0];
    const activeWorkingDay = sampleProvider?.provider_working_days?.find(
      (d) => d.provider_working_slots && d.provider_working_slots.length > 0,
    ) || sampleProvider?.provider_working_days?.[0];
    const activeWorkingSlot = activeWorkingDay?.provider_working_slots?.[0];

    const providerId = myProviderProfile?.id || null;

    const targetProviderId = sampleProvider?.id || null;
    const serviceId = activeService?.service_id || null;
    const providerWorkingSlotId = activeWorkingSlot?.id || null;
    const requestedSlotId = activeWorkingSlot?.slot_id || activeWorkingSlot?.time_slots?.id || null;
    const bookingDate = activeWorkingDay?.work_date
      ? new Date(activeWorkingDay.work_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    return {
      // Các ID cốt lõi đúng theo yêu cầu
      id: userId,
      userId,
      addressId,
      petId,
      providerId, // ID provider profile của user này (nếu có đăng ký provider)

      // Các ID bổ trợ để test ngay flow booking hoàn chỉnh
      targetProviderId, // ID provider đối tác sẵn sàng nhận việc
      serviceId,
      providerWorkingSlotId,
      requestedSlotId,
      bookingDate,

      // Chi tiết thông tin
      user: targetUser,
      addresses: addresses.map((a) => ({
        id: a.id,
        addressLine: a.address_line,
        ward: a.ward,
        district: a.district,
        city: a.city,
        formattedAddress: a.formatted_address,
        isDefault: a.is_default,
        latitude: a.latitude ? Number(a.latitude) : null,
        longitude: a.longitude ? Number(a.longitude) : null,
      })),
      pets: pets.map((p) => ({
        id: p.id,
        name: p.name,
        species: p.species,
        breed: p.breed,
        weight: p.weight ? Number(p.weight) : null,
        gender: p.gender,
        avatarUrl: p.avatar_url,
      })),
      myProviderProfile: myProviderProfile
        ? {
            id: myProviderProfile.id,
            status: myProviderProfile.status,
            kycStatus: myProviderProfile.kyc_status,
            ratingAvg: myProviderProfile.rating_avg ? Number(myProviderProfile.rating_avg) : 0,
            servicesCount: myProviderProfile.provider_services.length,
          }
        : null,
      availableProvider: sampleProvider
        ? {
            providerId: sampleProvider.id,
            providerUserId: sampleProvider.user_id,
            fullName: sampleProvider.users.fullName,
            avatarUrl: sampleProvider.users.avatarUrl,
            ratingAvg: sampleProvider.rating_avg ? Number(sampleProvider.rating_avg) : 5,
            serviceId: activeService?.service_id,
            serviceName:
              (activeService?.services as any)?.title ||
              (activeService?.services as any)?.name ||
              'Dịch vụ chăm sóc',
            servicePrice: activeService?.price ? Number(activeService.price) : 250000,
            petSpecies: activeService?.pet_species,
            providerWorkingSlotId: activeWorkingSlot?.id,
            requestedSlotId: activeWorkingSlot?.slot_id,
            slotTime: activeWorkingSlot?.time_slots
              ? `${activeWorkingSlot.time_slots.start_time} - ${activeWorkingSlot.time_slots.end_time}`
              : null,
            bookingDate,
          }
        : null,
      sampleBookingPayload: {
        customerId: userId,
        addressId,
        petId,
        serviceId,
        providerId: targetProviderId,
        providerWorkingSlotId,
        requestedSlotId,
        bookingDate,
        customerNote: 'Đơn test tự động từ test-context',
      },
    };
  }
}
