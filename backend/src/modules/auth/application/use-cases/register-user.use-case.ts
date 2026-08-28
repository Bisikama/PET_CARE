import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../../../users/application/use-cases/users.service';
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
  ) { }

  async execute(input: RegisterUserInput) {
    const normalizedEmail = this.supabaseAuthService.normalizeEmail(input.email);
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      if (existingUser.emailVerifiedAt) {
        throw new ConflictException(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS);
      } else {
        throw new ConflictException(AUTH_ERRORS.EMAIL_CONFIRMATION_PENDING);
      }
    }

    const { user: remoteUser } = await this.supabaseAuthService.signUpEmail(
      normalizedEmail,
      input.password,
      input.fullName,
    );

    if (!remoteUser?.identities || remoteUser.identities.length === 0) {
      // User bị làm mờ (Tồn tại rồi)
      throw new ConflictException(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS);
    }

    return {
      message: AUTH_MESSAGES.REGISTER_SUCCESS_CHECK_EMAIL,
      requiresEmailConfirmation: true,
    };
  }
}
