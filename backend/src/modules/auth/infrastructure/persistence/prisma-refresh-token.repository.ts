import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import {
  CreateRefreshTokenData,
  IRefreshTokenRepository,
  RefreshTokenRecord,
} from '../../application/ports/refresh-token.repository.port';

/**
 * Prisma implementation of IRefreshTokenRepository.
 *
 * Maps each port method to the exact Prisma query that AuthService
 * previously executed directly. Error handling (swallowing via .catch())
 * is intentionally left at the AuthService call-site, not here.
 */
@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    return this.prisma.refresh_tokens.findUnique({
      where: { token_hash: tokenHash },
    });
  }

  async deleteByHash(tokenHash: string): Promise<void> {
    await this.prisma.refresh_tokens.delete({
      where: { token_hash: tokenHash },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.refresh_tokens.delete({
      where: { id },
    });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.refresh_tokens.deleteMany({
      where: { user_id: userId },
    });
  }

  async deleteExpiredByUserId(userId: string): Promise<void> {
    await this.prisma.refresh_tokens.deleteMany({
      where: {
        user_id: userId,
        expires_at: { lt: new Date() },
      },
    });
  }

  async create(data: CreateRefreshTokenData): Promise<void> {
    await this.prisma.refresh_tokens.create({
      data: {
        user_id: data.userId,
        token_hash: data.tokenHash,
        device_info: data.deviceInfo,
        ip_address: data.ipAddress,
        device_id: data.deviceId,
        last_active_at: new Date(),
        expires_at: data.expiresAt,
      },
    });
  }
}
