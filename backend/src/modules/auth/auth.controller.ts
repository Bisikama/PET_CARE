import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as express from 'express';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { clearRefreshTokenCookie, setRefreshTokenCookie } from './utils/refresh-token-cookie.util';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type RequestWithCookies = Omit<express.Request, 'cookies'> & {
  cookies?: Record<string, string>;
};

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const userAgent = request.headers['user-agent'];
    const ipAddress = (request.headers['x-forwarded-for'] as string) || request.ip;
    const deviceId = (request.headers['x-device-id'] as string) || (request.headers['device-id'] as string);
    const result = await this.authService.login(dto, userAgent, ipAddress, deviceId);
    setRefreshTokenCookie(response, result.tokens.refreshToken);

    return {
      accessToken: result.tokens.accessToken,
      user: result.user,
    };
  }

  @Get('me')
  async getMe(@GetCurrentUserId() userId: string) {
    return this.authService.getProfile(userId);
  }

  @Roles(Role.PROVIDER)
  @UseGuards(RolesGuard)
  @Get('provider/me')
  async getProviderMe(@GetCurrentUserId() userId: string) {
    return this.authService.getProfile(userId);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get('admin/me')
  async getAdminMe(@GetCurrentUserId() userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    clearRefreshTokenCookie(response);
    return { message: 'Logged out successfully' };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const userAgent = request.headers['user-agent'];
    const ipAddress = (request.headers['x-forwarded-for'] as string) || request.ip;
    const deviceId = (request.headers['x-device-id'] as string) || (request.headers['device-id'] as string);
    const tokens = await this.authService.refreshTokens(userId, refreshToken, userAgent, ipAddress, deviceId);
    setRefreshTokenCookie(response, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }
}
