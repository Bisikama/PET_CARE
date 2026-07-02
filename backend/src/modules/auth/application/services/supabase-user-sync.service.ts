import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Role, User as PrismaUser } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UsersService } from '../../../users/users.service';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';

@Injectable()
export class SupabaseUserSyncService {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseAuthService: SupabaseAuthService,
  ) {}

  async findOrCreateSupabaseUser(
    remoteUser: SupabaseUser,
    fallbackFullName?: string,
  ): Promise<PrismaUser> {
    const normalizedEmail = this.supabaseAuthService.normalizeEmail(remoteUser.email || '');
    let user = await this.usersService.findBySupabaseId(remoteUser.id);

    if (user) {
      if (remoteUser.email_confirmed_at && !user.emailVerifiedAt) {
        user = await this.usersService.update(user.id, {
          emailVerifiedAt: new Date(remoteUser.email_confirmed_at),
        });
      }
      return user;
    }

    user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      if (user.supabaseId && user.supabaseId !== remoteUser.id) {
        throw new ConflictException(AUTH_ERRORS.ACCOUNT_IDENTITY_CONFLICT);
      }
      if (!user.supabaseId && user.passwordHash) {
        throw new ConflictException(AUTH_ERRORS.LEGACY_ACCOUNT_LINK_REQUIRED);
      }
      if (!user.supabaseId && !user.passwordHash) {
        user = await this.usersService.update(user.id, {
          supabaseId: remoteUser.id,
          emailVerifiedAt: remoteUser.email_confirmed_at
            ? new Date(remoteUser.email_confirmed_at)
            : null,
        });
        return user;
      }
    }

    try {
      user = await this.usersService.create({
        email: normalizedEmail,
        fullName: fallbackFullName || (remoteUser.user_metadata?.full_name as string) || 'Customer',
        passwordHash: null,
        supabaseId: remoteUser.id,
        emailVerifiedAt: remoteUser.email_confirmed_at
          ? new Date(remoteUser.email_confirmed_at)
          : null,
        role: Role.CUSTOMER,
        isActive: true,
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
        user = await this.usersService.findByEmail(normalizedEmail);
        if (!user) {
          user = await this.usersService.findBySupabaseId(remoteUser.id);
        }
        if (user) return user;
      }
      throw new InternalServerErrorException(AUTH_ERRORS.LOCAL_PROFILE_CREATE_FAILED);
    }

    return user;
  }
}
