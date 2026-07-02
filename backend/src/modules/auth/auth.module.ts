import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PrismaModule } from '../../database/prisma.module';
import { SupabaseAuthService } from './supabase-auth.service';
import { REFRESH_TOKEN_REPOSITORY } from './auth.tokens';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/prisma-refresh-token.repository';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { VerifyEmailOtpUseCase } from './application/use-cases/verify-email-otp.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { GoogleIdTokenSignInUseCase } from './application/use-cases/google-id-token-sign-in.use-case';
import { RefreshAuthSessionUseCase } from './application/use-cases/refresh-auth-session.use-case';
import { AuthSessionService } from './application/services/auth-session.service';
import { SupabaseUserSyncService } from './application/services/supabase-user-sync.service';

@Module({
  imports: [PassportModule, JwtModule.register({}), UsersModule, PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SupabaseAuthService,
    AuthSessionService,
    SupabaseUserSyncService,
    RegisterUserUseCase,
    VerifyEmailOtpUseCase,
    LoginUserUseCase,
    GoogleIdTokenSignInUseCase,
    RefreshAuthSessionUseCase,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    RolesGuard,
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: PrismaRefreshTokenRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
