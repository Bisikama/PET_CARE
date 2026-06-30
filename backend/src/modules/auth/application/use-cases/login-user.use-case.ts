import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../../users/users.service';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';
import { AuthSessionService } from '../services/auth-session.service';
import { SupabaseUserSyncService } from '../services/supabase-user-sync.service';
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
    private readonly supabaseUserSyncService: SupabaseUserSyncService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async execute(input: LoginUserInput) {
    if (!input.password) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const normalizedEmail = this.supabaseAuthService.normalizeEmail(input.email);
    let user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      if (user.supabaseId) {
        const { user: remoteUser } = await this.supabaseAuthService.signInEmail(
          normalizedEmail,
          input.password,
        );

        if (remoteUser.id !== user.supabaseId) {
          throw new ConflictException(AUTH_ERRORS.ACCOUNT_IDENTITY_CONFLICT);
        }
        if (!remoteUser.email_confirmed_at) {
          throw new ForbiddenException(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
        }

        if (!user.emailVerifiedAt && remoteUser.email_confirmed_at) {
          user = await this.usersService.update(user.id, {
            emailVerifiedAt: new Date(remoteUser.email_confirmed_at),
          });
        }
      } else if (!user.supabaseId && user.passwordHash) {
        const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
        if (!passwordMatches) {
          throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
        }
      } else {
        throw new ConflictException(AUTH_ERRORS.ACCOUNT_AUTH_SETUP_INCOMPLETE);
      }
    } else {
      let remoteUser;
      try {
        const result = await this.supabaseAuthService.signInEmail(normalizedEmail, input.password);
        remoteUser = result.user;
      } catch (err) {
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      if (!remoteUser.email_confirmed_at) {
        throw new ForbiddenException(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
      }

      user = await this.supabaseUserSyncService.findOrCreateSupabaseUser(remoteUser);
    }

    if (!user.isActive) {
      throw new ForbiddenException(AUTH_ERRORS.ACCOUNT_LOCKED);
    }

    const tokens = await this.authSessionService.getTokens(user.id, user.email, user.role);
    await this.authSessionService.saveRefreshToken(user.id, tokens.refreshToken, input.context);

    return {
      tokens,
      user: this.authSessionService.toPublicUser(user),
    };
  }
}
