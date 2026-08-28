import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { ResetPasswordDto } from '../../dto/reset-password.dto';
import { UsersService } from '../../../users/application/use-cases/users.service';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';
import { AUTH_MESSAGES } from '../../../../common/constants/success-messages.constant';
import { REFRESH_TOKEN_REPOSITORY } from '../../auth.tokens';
import type { IRefreshTokenRepository } from '../ports/refresh-token.repository.port';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly usersService: UsersService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) { }

  async execute(input: ResetPasswordDto) {
    if (input.password !== input.confirmPassword) {
      throw new BadRequestException(AUTH_ERRORS.PASSWORD_CONFIRMATION_MISMATCH);
    }

    const normalizedEmail = this.supabaseAuthService.normalizeEmail(input.email);

    // Xác thực OTP và lấy session tạm từ Supabase
    const session = await this.supabaseAuthService.verifyRecoveryOtp(normalizedEmail, input.token);

    // Dùng access_token tạm để đổi mật khẩu
    await this.supabaseAuthService.updatePassword(session.access_token, input.password);

    // Thu hồi toàn bộ refresh token để bắt đăng nhập lại
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (user) {
      if (!user.isActive) {
        throw new ForbiddenException(AUTH_ERRORS.ACCOUNT_LOCKED);
      }
      
      // Supabase tự động verify email khi user hoàn tất Recovery OTP.
      // Do đó ta cần sync trạng thái về ACTIVE nếu user trước đó chưa verify.
      if (user.status === 'PENDING_VERIFICATION' || !user.emailVerifiedAt) {
        await this.usersService.update(user.id, {
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
        });
      }

      await this.refreshTokenRepository.deleteAllByUserId(user.id);
    }

    return { message: AUTH_MESSAGES.RESET_PASSWORD_SUCCESS };
  }
}
