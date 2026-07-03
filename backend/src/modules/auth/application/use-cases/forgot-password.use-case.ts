import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseAuthService } from '../../supabase-auth.service';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string) {
    const frontendUrls = this.configService.get<string>('FRONTEND_URL')?.split(',') || [
      'http://localhost:5000',
      'http://127.0.0.1:5000',
    ];
    const redirectTo = frontendUrls[0] + '/reset-password';

    await this.supabaseAuthService.resetPasswordForEmail(email, redirectTo);

    return {
      message: 'Nếu email hợp lệ trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.',
    };
  }
}
