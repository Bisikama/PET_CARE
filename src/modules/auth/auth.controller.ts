import { Body, Controller, Post, Res, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendEmailOtpDto } from './dto/send-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { Public } from '../../common/decorators/public.decorator';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản và gửi OTP xác thực email' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('send-email-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi lại mã OTP xác thực email' })
  @ApiBody({ type: SendEmailOtpDto })
  @ApiOkResponse({ description: 'Mã OTP đã được gửi đến email' })
  async sendEmailOtp(@Body() dto: SendEmailOtpDto) {
    return this.authService.sendEmailVerificationOtp(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xác thực email bằng mã OTP' })
  @ApiBody({ type: VerifyEmailOtpDto })
  @ApiOkResponse({ description: 'Xác thực email thành công' })
  async verifyEmail(@Body() dto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
    const result = await this.authService.login(dto);
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return {
      accessToken: result.tokens.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Đăng xuất tài khoản hiện tại' })
  @ApiOkResponse({ description: 'Đăng xuất thành công' })
  async logout(
    @GetCurrentUserId() userId: number,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    await this.authService.logout(userId);
    res.clearCookie('refreshToken');
    return { message: 'Đăng xuất thành công' };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({ summary: 'Làm mới access token bằng refresh token trong cookie' })
  @ApiOkResponse({ description: 'Trả access token mới và cập nhật refresh token cookie' })
  async refresh(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken: tokens.accessToken,
    };
  }
}
