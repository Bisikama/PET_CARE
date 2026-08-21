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
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
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
import { AUTH_MESSAGES } from '../../common/constants/success-messages.constant';

import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { GoogleIdTokenDto } from './dto/google-id-token.dto';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

type RequestWithCookies = Omit<express.Request, 'cookies'> & {
  cookies?: Record<string, string>;
};

@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản khách hàng mới qua Email' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công, cần xác nhận OTP qua email.' })
  @ApiResponse({ status: 409, description: 'Tài khoản đã tồn tại (ACCOUNT_ALREADY_EXISTS)' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('verify-email-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xác thực email bằng mã OTP từ Supabase' })
  @ApiResponse({ status: 200, description: 'Xác thực thành công, trả về access token.' })
  @ApiResponse({ status: 400, description: 'OTP không hợp lệ hoặc đã hết hạn.' })
  async verifyEmailOtp(
    @Body() dto: VerifyEmailOtpDto,
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const userAgent = request.headers['user-agent'];
    const ipAddress = (request.headers['x-forwarded-for'] as string) || request.ip;
    const deviceId =
      (request.headers['x-device-id'] as string) || (request.headers['device-id'] as string);
    const result = await this.authService.verifyEmailOtp(
      dto.email,
      dto.otp,
      userAgent,
      ipAddress,
      deviceId,
    );

    setRefreshTokenCookie(response, result.tokens.refreshToken);

    return {
      accessToken: result.tokens.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập bằng email và mật khẩu' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công.' })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng (AUTH_INVALID_CREDENTIALS).' })
  @ApiResponse({ status: 403, description: 'Tài khoản bị khóa (ACCOUNT_LOCKED) hoặc chưa xác nhận email (EMAIL_CONFIRMATION_PENDING).' })
  @ApiResponse({ status: 409, description: 'Lỗi đồng bộ hồ sơ (AUTH_PROFILE_OUT_OF_SYNC) hoặc xung đột danh tính (ACCOUNT_IDENTITY_CONFLICT).' })
  async login(
    @Body() dto: LoginDto,
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const userAgent = request.headers['user-agent'];
    const ipAddress = (request.headers['x-forwarded-for'] as string) || request.ip;
    const deviceId =
      (request.headers['x-device-id'] as string) || (request.headers['device-id'] as string);
    const result = await this.authService.login(dto, userAgent, ipAddress, deviceId);
    setRefreshTokenCookie(response, result.tokens.refreshToken);

    return {
      accessToken: result.tokens.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('resend-confirmation-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi lại mã OTP xác nhận email' })
  @ApiResponse({ status: 200, description: 'Mã OTP đã được gửi lại.' })
  async resendConfirmationOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendSignupOtp(dto.email);
  }

  @Public()
  @Post('google/id-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập bằng Google ID Token' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công bằng Google.' })
  @ApiResponse({ status: 401, description: 'Google ID Token không hợp lệ.' })
  async loginGoogleIdToken(
    @Body() dto: GoogleIdTokenDto,
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const userAgent = request.headers['user-agent'];
    const ipAddress = (request.headers['x-forwarded-for'] as string) || request.ip;
    const deviceId =
      (request.headers['x-device-id'] as string) || (request.headers['device-id'] as string);
    const result = await this.authService.signInGoogleIdToken(
      dto.idToken,
      dto.nonce,
      userAgent,
      ipAddress,
      deviceId,
    );

    setRefreshTokenCookie(response, result.tokens.refreshToken);

    return {
      accessToken: result.tokens.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yêu cầu gửi email đặt lại mật khẩu' })
  @ApiResponse({ status: 200, description: 'Email hướng dẫn đã được gửi nếu tài khoản tồn tại.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đặt lại mật khẩu sử dụng OTP/token' })
  @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công.' })
  @ApiResponse({ status: 400, description: 'Token/OTP không hợp lệ hoặc mật khẩu không khớp.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ cá nhân' })
  async getMe(@GetCurrentUserId() userId: string) {
    return this.authService.getProfile(userId);
  }

  @Roles(Role.PROVIDER)
  @UseGuards(RolesGuard)
  @Get('provider/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ đối tác' })
  async getProviderMe(@GetCurrentUserId() userId: string) {
    return this.authService.getProfile(userId);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get('admin/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ quản trị viên' })
  async getAdminMe(@GetCurrentUserId() userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất' })
  async logout(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    clearRefreshTokenCookie(response);
    return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Làm mới access token bằng refresh token' })
  async refresh(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const userAgent = request.headers['user-agent'];
    const ipAddress = (request.headers['x-forwarded-for'] as string) || request.ip;
    const deviceId =
      (request.headers['x-device-id'] as string) || (request.headers['device-id'] as string);
    try {
      const tokens = await this.authService.refreshTokens(
        userId,
        refreshToken,
        userAgent,
        ipAddress,
        deviceId,
      );
      setRefreshTokenCookie(response, tokens.refreshToken);
      return { accessToken: tokens.accessToken };
    } catch (error) {
      clearRefreshTokenCookie(response);
      throw error;
    }
  }
}
