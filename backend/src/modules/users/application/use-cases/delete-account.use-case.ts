import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class DeleteAccountUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Soft delete user (set isActive = false, status = DEACTIVATED)
        // 2. Anonymize email to allow re-registration if needed
        const deletedEmail = `deleted_${Date.now()}_${user.email}`;

        await tx.user.update({
          where: { id: userId },
          data: {
            isActive: false,
            status: 'DELETED',
            email: deletedEmail,
          },
        });

        // 3. Xóa tất cả refresh token để force logout
        await tx.refresh_tokens.deleteMany({
          where: { user_id: userId },
        });

        // (Tùy chọn) Có thể thêm logic soft-delete cho provider_profiles nếu có
        const providerProfile = await tx.provider_profiles.findUnique({
          where: { user_id: userId },
        });
        
        if (providerProfile) {
          await tx.provider_profiles.update({
            where: { id: providerProfile.id },
            data: { status: 'PAUSED' },
          });
        }
      });

      return { success: true, message: 'Tài khoản đã được xóa (vô hiệu hóa) thành công' };
    } catch (error) {
      throw new InternalServerErrorException('Có lỗi xảy ra khi xóa tài khoản');
    }
  }
}
