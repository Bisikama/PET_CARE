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
    const frontendUrl = this.configService
      .getOrThrow<string>('FRONTEND_URL')
      .split(',')[0]
      ?.trim()
      .replace(/\/$/, '');

    if (!frontendUrl) {
      throw new Error('FRONTEND_URL must contain at least one origin');
    }

    const redirectTo = `${frontendUrl}/reset-password`;

    await this.supabaseAuthService.resetPasswordForEmail(email, redirectTo);

    return {
      message: AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS,
    };
  }
}
