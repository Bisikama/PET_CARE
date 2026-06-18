import { ForbiddenException, Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SendEmailOtpDto } from './dto/send-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { EmailService } from './email.service';

const EMAIL_VERIFICATION_PURPOSE = 'EMAIL_VERIFICATION';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name: dto.name,
      role: Role.USER,
      isEmailVerified: false,
    });

    await this.createAndSendEmailVerificationOtp(user.email, user.id);

    // Remove password before returning
    const { password, ...result } = user;
    return {
      ...result,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP xác thực.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(this.normalizeEmail(dto.email));
    if (!user) {
      throw new ForbiddenException('Tài khoản hoặc mật khẩu không chính xác');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Tài khoản hoặc mật khẩu không chính xác');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Email chưa được xác thực');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const { password, refreshToken, ...userInfo } = user;
    return {
      tokens,
      user: userInfo,
    };
  }

  async logout(userId: number) {
    await this.usersService.update(userId, { refreshToken: null });
  }

  async sendEmailVerificationOtp(dto: SendEmailOtpDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Email chưa được đăng ký');
    }

    if (user.isEmailVerified) {
      return { message: 'Email đã được xác thực' };
    }

    await this.createAndSendEmailVerificationOtp(user.email, user.id);

    return { message: 'Mã OTP đã được gửi đến email của bạn' };
  }

  async verifyEmailOtp(dto: VerifyEmailOtpDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Email chưa được đăng ký');
    }

    if (user.isEmailVerified) {
      return { message: 'Email đã được xác thực' };
    }

    const otpRecord = await this.prisma.emailOtp.findFirst({
      where: {
        email,
        purpose: EMAIL_VERIFICATION_PURPOSE,
        consumedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    const maxAttempts = Number(this.configService.get<string>('EMAIL_OTP_MAX_ATTEMPTS') || 5);

    if (otpRecord.attempts >= maxAttempts) {
      await this.prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { consumedAt: new Date() },
      });
      throw new BadRequestException('Mã OTP đã vượt quá số lần thử');
    }

    const isValidOtp = await bcrypt.compare(dto.otp, otpRecord.codeHash);

    if (!isValidOtp) {
      await this.prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: {
          attempts: {
            increment: 1,
          },
          consumedAt: otpRecord.attempts + 1 >= maxAttempts ? new Date() : null,
        },
      });
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    const verifiedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { consumedAt: verifiedAt },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerifiedAt: verifiedAt,
        },
      }),
    ]);

    return { message: 'Xác thực email thành công' };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Truy cập bị từ chối');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Truy cập bị từ chối');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private async getTokens(userId: number, email: string, role: Role) {
    const jwtPayload = {
      sub: userId,
      email,
      role,
    };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (process.env.NODE_ENV === 'production') {
      if (!accessSecret || !refreshSecret) {
        throw new Error(
          'JWT secrets (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET) must be defined in production!',
        );
      }
    }

    const resolvedAccessSecret = accessSecret || 'access_secret_key_123';
    const resolvedRefreshSecret = refreshSecret || 'refresh_secret_key_123';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: resolvedAccessSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: resolvedRefreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async createAndSendEmailVerificationOtp(email: string, userId: number) {
    const otp = this.generateOtp();
    const codeHash = await bcrypt.hash(otp, 10);
    const ttlMinutes = this.emailService.getOtpTtlMinutes();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.emailOtp.updateMany({
        where: {
          email,
          purpose: EMAIL_VERIFICATION_PURPOSE,
          consumedAt: null,
        },
        data: {
          consumedAt: new Date(),
        },
      }),
      this.prisma.emailOtp.create({
        data: {
          email,
          codeHash,
          purpose: EMAIL_VERIFICATION_PURPOSE,
          expiresAt,
          userId,
        },
      }),
    ]);

    await this.emailService.sendEmailVerificationOtp(email, otp);
  }

  private generateOtp() {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
