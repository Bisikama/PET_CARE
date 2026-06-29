import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { REFRESH_TOKEN_REPOSITORY } from '../../auth.tokens';
import type { IRefreshTokenRepository } from '../ports/refresh-token.repository.port';
import { DeviceContext } from '../types/device-context.type';
import { Role, User as PrismaUser } from '@prisma/client';

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async saveRefreshToken(
    userId: string,
    refreshToken: string,
    context?: DeviceContext,
  ) {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.deleteExpiredByUserId(userId).catch(() => {});

    await this.refreshTokenRepository.create({
      userId,
      tokenHash,
      deviceInfo: context?.userAgent,
      ipAddress: context?.ipAddress,
      deviceId: context?.deviceId,
      expiresAt,
    });
  }

  async getTokens(userId: string, email: string, role: Role) {
    const accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const payload = { sub: userId, email, role, tokenId: crypto.randomUUID() };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: accessSecret, expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }

  toPublicUser(user: Omit<PrismaUser, 'passwordHash'>) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
