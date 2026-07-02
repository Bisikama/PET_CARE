import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';
import { AuthSessionService } from '../services/auth-session.service';
import { SupabaseUserSyncService } from '../services/supabase-user-sync.service';
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
    private readonly supabaseUserSyncService: SupabaseUserSyncService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async execute(input: VerifyEmailOtpInput) {
    const { user: remoteUser } = await this.supabaseAuthService.verifySignupOtp(
      input.email,
      input.otp,
    );
    if (!remoteUser) {
      throw new BadRequestException(AUTH_ERRORS.OTP_INVALID_OR_EXPIRED);
    }

    const localUser = await this.supabaseUserSyncService.findOrCreateSupabaseUser(remoteUser);

    if (!localUser.isActive) {
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
