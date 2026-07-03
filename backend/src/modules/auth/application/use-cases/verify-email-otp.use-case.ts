import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
  ) {}

  async execute(input: VerifyEmailOtpInput) {
    const { user: remoteUser } = await this.supabaseAuthService.verifySignupOtp(
      input.email,
      input.otp,
    );
    if (!remoteUser) {
      throw new BadRequestException(AUTH_ERRORS.OTP_INVALID_OR_EXPIRED);
    }

    const localUser = await this.usersService.findBySupabaseId(remoteUser.id);
    if (!localUser) {
      throw new InternalServerErrorException('AUTH_PROFILE_OUT_OF_SYNC');
    }

    if (!localUser.isActive) {
      throw new ForbiddenException(AUTH_ERRORS.ACCOUNT_LOCKED);
    }

    // Do NOT update emailVerifiedAt here. 
    // The Postgres TRIGGER on auth.users will automatically sync email_verified_at.

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
