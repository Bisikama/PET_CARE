import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';
import { UsersService } from '../../../users/users.service';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';
import { AUTH_MESSAGES } from '../../../../common/constants/success-messages.constant';

export interface RegisterUserInput {
  email: string;
  password?: string;
  fullName: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseAuthService: SupabaseAuthService,
  ) {}

  async execute(input: RegisterUserInput) {
    const normalizedEmail = this.supabaseAuthService.normalizeEmail(input.email);
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS);
    }

    const { user: remoteUser } = await this.supabaseAuthService.signUpEmail(
      normalizedEmail,
      input.password,
      input.fullName,
    );

    if (!remoteUser?.identities || remoteUser.identities.length === 0) {
      return {
        message: AUTH_MESSAGES.REGISTER_CHECK_EMAIL,
        requiresEmailConfirmation: true,
      };
    }

    try {
      await this.usersService.create({
        email: normalizedEmail,
        fullName: input.fullName,
        passwordHash: null,
        supabaseId: remoteUser.id,
        emailVerifiedAt: remoteUser.email_confirmed_at
          ? new Date(remoteUser.email_confirmed_at)
          : null,
        role: Role.CUSTOMER,
        isActive: true,
      });
    } catch (err: any) {
      const reqId = crypto.randomUUID();
      console.error(`[${reqId}] Local profile create failed for ${normalizedEmail}`, err);
      throw new InternalServerErrorException(AUTH_ERRORS.LOCAL_PROFILE_CREATE_FAILED);
    }

    return {
      message: AUTH_MESSAGES.REGISTER_SUCCESS_CHECK_EMAIL,
      requiresEmailConfirmation: true,
    };
  }
}
