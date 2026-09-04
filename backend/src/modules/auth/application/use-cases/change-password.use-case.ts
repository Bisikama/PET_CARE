import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../database/prisma.service';
import { ChangePasswordDto } from '../../dto/change-password.dto';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Tài khoản này không sử dụng mật khẩu (đăng nhập bằng Google)');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true, message: 'Đổi mật khẩu thành công' };
  }
}
