import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User as PrismaUser, Prisma } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseAuthService } from './supabase-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly supabaseAuthService: SupabaseAuthService,
  ) { }

  async register(dto: RegisterDto) {
    const normalizedEmail = this.supabaseAuthService.normalizeEmail(dto.email);
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException('ACCOUNT_ALREADY_EXISTS');
    }

    const { user: remoteUser, session } = await this.supabaseAuthService.signUpEmail(
      normalizedEmail,
      dto.password,
      dto.fullName,
    );

    if (!remoteUser?.identities || remoteUser.identities.length === 0) {
      return {
        message: 'Nếu email hợp lệ, vui lòng kiểm tra Gmail để tiếp tục.',
        requiresEmailConfirmation: true,
      };
    }

    try {
      await this.usersService.create({
        email: normalizedEmail,
        fullName: dto.fullName,
        passwordHash: null,
        supabaseId: remoteUser.id,
        emailVerifiedAt: remoteUser.email_confirmed_at
          ? new Date(remoteUser.email_confirmed_at)
          : null,
        role: Role.CUSTOMER,
        isActive: true,
      });
    } catch (err: any) {
      const reqId = crypto.randomUUID();
      console.error(`[${reqId}] Local profile create failed for ${normalizedEmail}`, err);
      throw new InternalServerErrorException('AUTH_LOCAL_PROFILE_CREATE_FAILED');
    }

    return {
      message: 'Đăng ký thành công. Vui lòng kiểm tra Gmail để nhập mã OTP xác nhận.',
      requiresEmailConfirmation: true,
    };
  }

  async verifyEmailOtp(
    email: string,
    otp: string,
    userAgent?: string,
    ipAddress?: string,
    deviceId?: string,
  ) {
    const { user: remoteUser } = await this.supabaseAuthService.verifySignupOtp(email, otp);
    if (!remoteUser) {
      throw new BadRequestException('AUTH_OTP_INVALID_OR_EXPIRED');
    }

    const localUser = await this.findOrCreateSupabaseUser(remoteUser);

    if (!localUser.isActive) {
      throw new ForbiddenException('ACCOUNT_LOCKED');
    }

    const tokens = await this.getTokens(localUser.id, localUser.email, localUser.role);
    await this.saveRefreshToken(localUser.id, tokens.refreshToken, userAgent, ipAddress, deviceId);

    return {
      tokens,
      user: this.toPublicUser(localUser),
    };
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string, deviceId?: string) {
    const normalizedEmail = this.supabaseAuthService.normalizeEmail(dto.email);
    let user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      if (user.supabaseId) {
        const { user: remoteUser } = await this.supabaseAuthService.signInEmail(
          normalizedEmail,
          dto.password,
        );

        if (remoteUser.id !== user.supabaseId) {
          throw new ConflictException('ACCOUNT_IDENTITY_CONFLICT');
        }
        if (!remoteUser.email_confirmed_at) {
          throw new ForbiddenException('EMAIL_NOT_VERIFIED');
        }

        if (!user.emailVerifiedAt && remoteUser.email_confirmed_at) {
          user = await this.usersService.update(user.id, {
            emailVerifiedAt: new Date(remoteUser.email_confirmed_at),
          });
        }
      } else if (!user.supabaseId && user.passwordHash) {
        const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatches) {
          throw new UnauthorizedException('AUTH_INVALID_CREDENTIALS');
        }
      } else {
        throw new ConflictException('ACCOUNT_AUTH_SETUP_INCOMPLETE');
      }
    } else {
      let remoteUser;
      try {
        const result = await this.supabaseAuthService.signInEmail(normalizedEmail, dto.password);
        remoteUser = result.user;
      } catch (err) {
        throw new UnauthorizedException('AUTH_INVALID_CREDENTIALS');
      }

      if (!remoteUser.email_confirmed_at) {
        throw new ForbiddenException('EMAIL_NOT_VERIFIED');
      }

      user = await this.findOrCreateSupabaseUser(remoteUser);
    }

    if (!user.isActive) {
      throw new ForbiddenException('ACCOUNT_LOCKED');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken, userAgent, ipAddress, deviceId);

    return {
      tokens,
      user: this.toPublicUser(user),
    };
  }

  async resendSignupOtp(email: string) {
    try {
      await this.supabaseAuthService.resendSignupOtp(email);
    } catch (err) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
    }
    return {
      message: 'Nếu tài khoản cần xác nhận, mã OTP đã được gửi tới Gmail.',
    };
  }

  async signInGoogleIdToken(
    idToken: string,
    nonce?: string,
    userAgent?: string,
    ipAddress?: string,
    deviceId?: string,
  ) {
    const { user: remoteUser } = await this.supabaseAuthService.signInGoogleIdToken(idToken, nonce);

    if (!remoteUser.email) {
      throw new UnauthorizedException('GOOGLE_ID_TOKEN_INVALID');
    }

    const localUser = await this.findOrCreateSupabaseUser(
      remoteUser,
      remoteUser.user_metadata?.full_name,
    );

    if (!localUser.isActive) {
      throw new ForbiddenException('ACCOUNT_LOCKED');
    }

    const tokens = await this.getTokens(localUser.id, localUser.email, localUser.role);
    await this.saveRefreshToken(localUser.id, tokens.refreshToken, userAgent, ipAddress, deviceId);

    return {
      tokens,
      user: this.toPublicUser(localUser),
    };
  }

  private async findOrCreateSupabaseUser(
    remoteUser: SupabaseUser,
    fallbackFullName?: string,
  ): Promise<PrismaUser> {
    const normalizedEmail = this.supabaseAuthService.normalizeEmail(remoteUser.email || '');
    let user = await this.usersService.findBySupabaseId(remoteUser.id);

    if (user) {
      if (remoteUser.email_confirmed_at && !user.emailVerifiedAt) {
        user = await this.usersService.update(user.id, {
          emailVerifiedAt: new Date(remoteUser.email_confirmed_at),
        });
      }
      return user;
    }

    user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      if (user.supabaseId && user.supabaseId !== remoteUser.id) {
        throw new ConflictException('ACCOUNT_IDENTITY_CONFLICT');
      }
      if (!user.supabaseId && user.passwordHash) {
        throw new ConflictException('LEGACY_ACCOUNT_LINK_REQUIRED');
      }
      if (!user.supabaseId && !user.passwordHash) {
        user = await this.usersService.update(user.id, {
          supabaseId: remoteUser.id,
          emailVerifiedAt: remoteUser.email_confirmed_at
            ? new Date(remoteUser.email_confirmed_at)
            : null,
        });
        return user;
      }
    }

    try {
      user = await this.usersService.create({
        email: normalizedEmail,
        fullName: fallbackFullName || (remoteUser.user_metadata?.full_name as string) || 'Customer',
        passwordHash: null,
        supabaseId: remoteUser.id,
        emailVerifiedAt: remoteUser.email_confirmed_at
          ? new Date(remoteUser.email_confirmed_at)
          : null,
        role: Role.CUSTOMER,
        isActive: true,
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
        user = await this.usersService.findByEmail(normalizedEmail);
        if (!user) {
          user = await this.usersService.findBySupabaseId(remoteUser.id);
        }
        if (user) return user;
      }
      throw new InternalServerErrorException('AUTH_LOCAL_PROFILE_CREATE_FAILED');
    }

    return user;
  }

  async getProfile(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('AUTH_USER_CONTEXT_INVALID');
    }
    const user = await this.usersService.findPublicById(userId);
    if (!user || !user.isActive) {
      throw new ForbiddenException('Access denied');
    }
    return user;
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refresh_tokens
      .delete({
        where: { token_hash: tokenHash },
      })
      .catch(() => { });
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
      throw new ForbiddenException('ACCOUNT_LOCKED');
    }

    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.prisma.refresh_tokens.findUnique({
      where: { token_hash: tokenHash },
    });

    if (!tokenRecord || tokenRecord.user_id !== userId || tokenRecord.expires_at < new Date()) {
      if (tokenRecord) {
        await this.prisma.refresh_tokens.delete({ where: { id: tokenRecord.id } }).catch(() => { });
      }
      throw new ForbiddenException('ACCOUNT_LOCKED');
    }

    await this.prisma.refresh_tokens
      .delete({
        where: { id: tokenRecord.id },
      })
      .catch(() => { });

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

    await this.prisma.refresh_tokens
      .deleteMany({
        where: {
          user_id: userId,
          expires_at: { lt: new Date() },
        },
      })
      .catch(() => { });

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

  private toPublicUser(user: Omit<PrismaUser, 'passwordHash'>) {
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
