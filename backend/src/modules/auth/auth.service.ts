import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, User as PrismaUser } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SupabaseAuthService } from './supabase-auth.service';
import { AUTH_ERRORS } from '../../common/constants/error-messages.constant';
import { AUTH_MESSAGES } from '../../common/constants/success-messages.constant';
import { REFRESH_TOKEN_REPOSITORY } from './auth.tokens';
import type { IRefreshTokenRepository } from './application/ports/refresh-token.repository.port';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { VerifyEmailOtpUseCase } from './application/use-cases/verify-email-otp.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { GoogleIdTokenSignInUseCase } from './application/use-cases/google-id-token-sign-in.use-case';
import { RefreshAuthSessionUseCase } from './application/use-cases/refresh-auth-session.use-case';
import { AuthSessionService } from './application/services/auth-session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly verifyEmailOtpUseCase: VerifyEmailOtpUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly googleIdTokenSignInUseCase: GoogleIdTokenSignInUseCase,
    private readonly refreshAuthSessionUseCase: RefreshAuthSessionUseCase,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async register(dto: RegisterDto) {
    return this.registerUserUseCase.execute({
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
    });
  }

  async verifyEmailOtp(
    email: string,
    otp: string,
    userAgent?: string,
    ipAddress?: string,
    deviceId?: string,
  ) {
    return this.verifyEmailOtpUseCase.execute({
      email,
      otp,
      context: { userAgent, ipAddress, deviceId },
    });
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string, deviceId?: string) {
    return this.loginUserUseCase.execute({
      email: dto.email,
      password: dto.password,
      context: { userAgent, ipAddress, deviceId },
    });
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
      message: AUTH_MESSAGES.OTP_RESENT_SUCCESS,
    };
  }

  async signInGoogleIdToken(
    idToken: string,
    nonce?: string,
    userAgent?: string,
    ipAddress?: string,
    deviceId?: string,
  ) {
    return this.googleIdTokenSignInUseCase.execute({
      idToken,
      nonce,
      context: { userAgent, ipAddress, deviceId },
    });
  }

  async getProfile(userId: string) {
    if (!userId) {
      throw new UnauthorizedException(AUTH_ERRORS.USER_CONTEXT_INVALID);
    }
    const user = await this.usersService.findPublicById(userId);
    if (!user || !user.isActive) {
      throw new ForbiddenException(AUTH_ERRORS.ACCESS_DENIED);
    }
    return user;
  }

  async logout(refreshToken: string) {
    const tokenHash = this.authSessionService.hashToken(refreshToken);
    await this.refreshTokenRepository.deleteByHash(tokenHash).catch(() => {});
  }

  async logoutAll(userId: string) {
    await this.refreshTokenRepository.deleteAllByUserId(userId);
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
    deviceId?: string,
  ) {
    return this.refreshAuthSessionUseCase.execute({
      userId,
      rawRefreshToken: refreshToken,
      context: { userAgent, ipAddress, deviceId },
    });
  }
}
