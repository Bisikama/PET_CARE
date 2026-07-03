import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { ResetPasswordDto } from '../../dto/reset-password.dto';
import { UsersService } from '../../../users/users.service';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';
import { REFRESH_TOKEN_REPOSITORY } from '../../auth.tokens';
import type { IRefreshTokenRepository } from '../ports/refresh-token.repository.port';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly usersService: UsersService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: ResetPasswordDto) {
    if (input.password !== input.confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp.');
    }

    const normalizedEmail = this.supabaseAuthService.normalizeEmail(input.email);

    // Verify OTP and get temporary session from Supabase
    const session = await this.supabaseAuthService.verifyRecoveryOtp(normalizedEmail, input.token);

    // Use session access_token to update the password
    await this.supabaseAuthService.updatePassword(session.access_token, input.password);

    // Revoke all local refresh tokens to require a new login
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (user) {
      if (!user.isActive) {
        throw new ForbiddenException(AUTH_ERRORS.ACCOUNT_LOCKED);
      }
      await this.refreshTokenRepository.deleteAllByUserId(user.id);
    }

    return { message: 'Đặt lại mật khẩu thành công.' };
  }
}
