import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AUTH_ERRORS } from '../../common/constants/error-messages.constant';

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
  constructor(private readonly prisma: PrismaService) { }

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

      // Kiểm tra user theo email
      const userByEmail = await tx.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (userByEmail) {
        // CASE 2: Không có theo supabaseId nhưng có local User cùng email
        // Dù supabaseId khác null hay null đều ném conflict an toàn
        throw new ConflictException(AUTH_ERRORS.ACCOUNT_IDENTITY_CONFLICT);
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
}
