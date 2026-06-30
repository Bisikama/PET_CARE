import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';

@Injectable()
export class SupabaseAuthService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    const supabaseKey = this.configService.getOrThrow<string>('SUPABASE_PUBLISHABLE_KEY');

    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_PUBLISHABLE_KEY'),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        realtime: {
          transport: ws as any,
        },
      },
    );
  }

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async signUpEmail(email: string, password?: string, fullName?: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const options: Record<string, unknown> = { data: {} };
    if (fullName) {
      (options.data as Record<string, unknown>).full_name = fullName;
    }

    const { data, error } = await this.supabase.auth.signUp({
      email: normalizedEmail,
      password: password || this.generateRandomPassword(),
      options: options,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new ConflictException('ACCOUNT_ALREADY_EXISTS');
      }
      throw new InternalServerErrorException(`Supabase signup failed: ${error.message}`);
    }

    return data;
  }

  async verifySignupOtp(email: string, otp: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const { data, error } = await this.supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: otp,
      type: 'email',
    });

    if (error) {
      throw new BadRequestException('AUTH_OTP_INVALID_OR_EXPIRED');
    }

    return data;
  }

  async signInEmail(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw new UnauthorizedException('AUTH_INVALID_CREDENTIALS');
    }

    return data;
  }

  async resendSignupOtp(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const { data, error } = await this.supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
    });

    if (error) {
      throw new InternalServerErrorException('AUTH_PROVIDER_UNAVAILABLE');
    }

    return data;
  }

  async signInGoogleIdToken(idToken: string, nonce?: string) {
    const { data, error } = await this.supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
      nonce,
    });

    if (error) {
      throw new UnauthorizedException('GOOGLE_ID_TOKEN_INVALID');
    }

    return data;
  }

  async getUserByAccessToken(accessToken: string) {
    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error) {
      throw new UnauthorizedException('Invalid Supabase access token');
    }
    return data;
  }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + 'A1!';
  }
}
