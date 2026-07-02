import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';
import { AuthSessionService } from '../services/auth-session.service';
import { SupabaseUserSyncService } from '../services/supabase-user-sync.service';
import { DeviceContext } from '../types/device-context.type';

export interface GoogleIdTokenSignInInput {
  idToken: string;
  nonce?: string;
  context?: DeviceContext;
}

@Injectable()
export class GoogleIdTokenSignInUseCase {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly supabaseUserSyncService: SupabaseUserSyncService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async execute(input: GoogleIdTokenSignInInput) {
    const { user: remoteUser } = await this.supabaseAuthService.signInGoogleIdToken(input.idToken, input.nonce);

    if (!remoteUser.email) {
      throw new UnauthorizedException(AUTH_ERRORS.GOOGLE_ID_TOKEN_INVALID);
    }

    const localUser = await this.supabaseUserSyncService.findOrCreateSupabaseUser(
      remoteUser,
      remoteUser.user_metadata?.full_name,
    );

    if (!localUser.isActive) {
      throw new ForbiddenException(AUTH_ERRORS.ACCOUNT_LOCKED);
    }

    const tokens = await this.authSessionService.getTokens(localUser.id, localUser.email, localUser.role);
    await this.authSessionService.saveRefreshToken(localUser.id, tokens.refreshToken, input.context);

    return {
      tokens,
      user: this.authSessionService.toPublicUser(localUser),
    };
  }
}
