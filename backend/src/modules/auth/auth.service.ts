import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
      role: Role.CUSTOMER,
    });

    return this.toPublicUser(user);
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string, deviceId?: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new ForbiddenException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new ForbiddenException('Invalid email or password');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken, userAgent, ipAddress, deviceId);

    return {
      tokens,
      user: this.toPublicUser(user),
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findPublicById(userId);
    if (!user || !user.isActive) {
      throw new ForbiddenException('Access denied');
    }

    return this.toPublicUser(user);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refresh_tokens
      .delete({
        where: { token_hash: tokenHash },
      })
      .catch(() => {});
  }

  async logoutAll(userId: string) {
    await this.prisma.refresh_tokens.deleteMany({
      where: { user_id: userId },
    });
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
    deviceId?: string,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new ForbiddenException('Access denied');
    }

    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.prisma.refresh_tokens.findUnique({
      where: { token_hash: tokenHash },
    });

    if (!tokenRecord || tokenRecord.user_id !== userId || tokenRecord.expires_at < new Date()) {
      if (tokenRecord) {
        await this.prisma.refresh_tokens.delete({ where: { id: tokenRecord.id } }).catch(() => {});
      }
      throw new ForbiddenException('Access denied');
    }

    // Delete the rotated token
    await this.prisma.refresh_tokens
      .delete({
        where: { id: tokenRecord.id },
      })
      .catch(() => {});

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken, userAgent, ipAddress, deviceId);
    return tokens;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async saveRefreshToken(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
    deviceId?: string,
  ) {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Passive cleanup of expired tokens for this user
    await this.prisma.refresh_tokens
      .deleteMany({
        where: {
          user_id: userId,
          expires_at: { lt: new Date() },
        },
      })
      .catch(() => {});

    await this.prisma.refresh_tokens.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        device_info: userAgent,
        ip_address: ipAddress,
        device_id: deviceId,
        last_active_at: new Date(),
        expires_at: expiresAt,
      },
    });
  }

  private async getTokens(userId: string, email: string, role: Role) {
    const accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const payload = { sub: userId, email, role, tokenId: crypto.randomUUID() };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: accessSecret, expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }

  private toPublicUser(user: Omit<User, 'passwordHash'>) {
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
