import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../../../users/users.service';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';
import { AuthSessionService } from '../services/auth-session.service';
import { DeviceContext } from '../types/device-context.type';
import { REFRESH_TOKEN_REPOSITORY } from '../../auth.tokens';
import type { IRefreshTokenRepository } from '../ports/refresh-token.repository.port';

export interface RefreshAuthSessionInput {
  userId: string;
  rawRefreshToken: string;
  context?: DeviceContext;
}

@Injectable()
export class RefreshAuthSessionUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly authSessionService: AuthSessionService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: RefreshAuthSessionInput) {
    const user = await this.usersService.findById(input.userId);
    if (!user || !user.isActive) {
      throw new ForbiddenException(AUTH_ERRORS.ACCOUNT_LOCKED);
    }

    const tokenHash = this.authSessionService.hashToken(input.rawRefreshToken);
    const tokenRecord = await this.refreshTokenRepository.findByHash(tokenHash);

    if (
      !tokenRecord ||
      tokenRecord.user_id !== input.userId ||
      tokenRecord.expires_at < new Date()
    ) {
      if (tokenRecord) {
        await this.refreshTokenRepository.deleteById(tokenRecord.id).catch(() => {});
      }
      throw new ForbiddenException(AUTH_ERRORS.ACCOUNT_LOCKED);
    }

    await this.refreshTokenRepository.deleteById(tokenRecord.id).catch(() => {});

    const tokens = await this.authSessionService.getTokens(user.id, user.email, user.role);
    await this.authSessionService.saveRefreshToken(user.id, tokens.refreshToken, input.context);

    return tokens;
  }
}
