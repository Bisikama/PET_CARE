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
    return this.prisma.user.create({ data });
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
          return tx.user.update({
            where: { id: userBySupabaseId.id },
            data: {
              status: 'ACTIVE',
              emailVerifiedAt: new Date(),
            },
          });
        }

        // Không đổi role, isActive
        return userBySupabaseId;
      }

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
        return tx.user.update({
          where: { id: userByEmail.id },
          data: {
            supabaseId,
            status: 'ACTIVE',
            emailVerifiedAt: userByEmail.emailVerifiedAt ?? new Date(),
            fullName: userByEmail.fullName || safeFullName,
          },
        });
      }

      // CASE 3: Không có cả supabaseId lẫn email -> Tạo local User mới
      return tx.user.create({
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
}
