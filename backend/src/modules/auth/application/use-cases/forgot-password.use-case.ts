import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { AUTH_MESSAGES } from '../../../../common/constants/success-messages.constant';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string) {
    const origins = this.configService
      .getOrThrow<string>('FRONTEND_URL')
      .split(',')
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean);

    if (origins.length === 0) {
      throw new Error('FRONTEND_URL must contain at least one origin');
    }

    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const frontendUrl =
      (isProd ? origins.find((o) => !/localhost|127\.0\.0\.1/i.test(o)) : undefined) || origins[0];

    const redirectTo = `${frontendUrl}/reset-password`;

    await this.supabaseAuthService.resetPasswordForEmail(email, redirectTo);

    return {
      message: AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS,
    };
  }
}
