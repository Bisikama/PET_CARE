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

@Module({
  imports: [PassportModule, JwtModule.register({}), UsersModule, PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SupabaseAuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    RolesGuard,
  ],
  exports: [AuthService],
})
export class AuthModule { }
