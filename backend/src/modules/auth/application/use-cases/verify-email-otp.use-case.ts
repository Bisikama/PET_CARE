import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';
import { AuthSessionService } from '../services/auth-session.service';
import { UsersService } from '../../../users/users.service';
import { DeviceContext } from '../types/device-context.type';

export interface VerifyEmailOtpInput {
  email: string;
  otp: string;
  context?: DeviceContext;
}

@Injectable()
export class VerifyEmailOtpUseCase {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly usersService: UsersService,
    private readonly authSessionService: AuthSessionService,
  ) { }

  async execute(input: VerifyEmailOtpInput) {
    const { user: remoteUser } =
      await this.supabaseAuthService.verifySignupOtp(
        input.email,
        input.otp,
      );

    if (!remoteUser || !remoteUser.id || !remoteUser.email) {
      throw new BadRequestException(AUTH_ERRORS.OTP_INVALID_OR_EXPIRED);
    }

    const emailConfirmedAt = remoteUser.email_confirmed_at;

    if (!emailConfirmedAt) {
      throw new InternalServerErrorException(
        AUTH_ERRORS.AUTH_PROFILE_OUT_OF_SYNC,
      );
    }

    const localUser =
      await this.usersService.ensureLocalUserFromVerifiedSupabaseUser({
        supabaseId: remoteUser.id,
        email: remoteUser.email,
        fullName:
          remoteUser.user_metadata?.full_name ??
          remoteUser.user_metadata?.fullName ??
          null,
      });

    // Kiểm tra trạng thái tài khoản sau khi đồng bộ
    // Chỉ chặn nếu bị khóa (SUSPENDED/BANNED) hoặc vô hiệu hóa (isActive = false)
    if (!localUser.isActive || localUser.status === 'SUSPENDED' || localUser.status === 'BANNED') {
      throw new ForbiddenException(AUTH_ERRORS.ACCOUNT_LOCKED);
    }

    const tokens = await this.authSessionService.getTokens(
      localUser.id,
      localUser.email,
      localUser.role,
    );

    await this.authSessionService.saveRefreshToken(
      localUser.id,
      tokens.refreshToken,
      input.context,
    );

    return {
      tokens,
      user: this.authSessionService.toPublicUser(localUser),
    };
  }
}
