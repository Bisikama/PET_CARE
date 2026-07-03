import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UsersService } from '../../../users/users.service';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';
import { AuthSessionService } from '../services/auth-session.service';
import { DeviceContext } from '../types/device-context.type';

export interface LoginUserInput {
  email: string;
  password?: string;
  context?: DeviceContext;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async execute(input: LoginUserInput) {
    if (!input.password) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const normalizedEmail = this.supabaseAuthService.normalizeEmail(input.email);
    const localUser = await this.usersService.findByEmail(normalizedEmail);

    // CASE A — Không có local profile
    if (!localUser) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // CASE B — Đã register nhưng chưa OTP
    if (localUser.emailVerifiedAt === null) {
      throw new ForbiddenException(AUTH_ERRORS.EMAIL_CONFIRMATION_PENDING);
    }

    // CASE C — Đã OTP nhưng bị khóa
    if (!localUser.isActive) {
      throw new ForbiddenException(AUTH_ERRORS.ACCOUNT_LOCKED);
    }

    // CASE D — Đã OTP và active
    let remoteUser;
    try {
      const result = await this.supabaseAuthService.signInEmail(normalizedEmail, input.password);
      remoteUser = result.user;
    } catch (err: any) {
      if (err?.message?.includes('email_not_confirmed') || err?.name === 'AuthApiError' && err?.status === 400 && err?.message?.includes('Email not confirmed')) {
        // Ghi audit warning về sync mismatch
        console.warn(`[SYNC WARNING] Local user ${localUser.id} is verified but Supabase is not confirmed.`);
        throw new ForbiddenException(AUTH_ERRORS.EMAIL_CONFIRMATION_PENDING);
      }
      
      // Fallback for network or 5xx errors from Supabase
      if (err?.status >= 500) {
        throw new ServiceUnavailableException(AUTH_ERRORS.PROVIDER_UNAVAILABLE);
      }

      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Nếu login success, remoteUser có tồn tại
    if (remoteUser.id !== localUser.supabaseId) {
      throw new ConflictException(AUTH_ERRORS.ACCOUNT_IDENTITY_CONFLICT);
    }

    if (!remoteUser.email_confirmed_at) {
      console.warn(`[SYNC WARNING] Local user ${localUser.id} is verified but Supabase email_confirmed_at is null.`);
      throw new ConflictException(AUTH_ERRORS.AUTH_PROFILE_OUT_OF_SYNC);
    }

    // Hợp lệ: tạo internal JWT + refresh token cookie
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
