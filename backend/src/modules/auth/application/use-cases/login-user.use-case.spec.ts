import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { LoginUserUseCase } from './login-user.use-case';
import { UsersService } from '../../../users/users.service';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { SupabaseUserSyncService } from '../services/supabase-user-sync.service';
import { AuthSessionService } from '../services/auth-session.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let usersService: jest.Mocked<any>;
  let supabaseAuthService: jest.Mocked<any>;
  let supabaseUserSyncService: jest.Mocked<any>;
  let authSessionService: jest.Mocked<any>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: 'u1', isActive: true, role: Role.CUSTOMER }),
    };
    supabaseAuthService = {
      normalizeEmail: jest.fn((e) => e.trim().toLowerCase()),
      signInEmail: jest.fn(),
    };
    supabaseUserSyncService = {
      findOrCreateSupabaseUser: jest.fn(),
    };
    authSessionService = {
      getTokens: jest.fn(),
      saveRefreshToken: jest.fn(),
      toPublicUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        { provide: UsersService, useValue: usersService },
        { provide: SupabaseAuthService, useValue: supabaseAuthService },
        { provide: SupabaseUserSyncService, useValue: supabaseUserSyncService },
        { provide: AuthSessionService, useValue: authSessionService },
      ],
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    authSessionService.getTokens.mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' });
    authSessionService.toPublicUser.mockReturnValue({});
  });

  it('1. Supabase local user login thành công', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      isActive: true,
      role: Role.CUSTOMER,
    });
    supabaseAuthService.signInEmail.mockResolvedValue({
      user: { id: 'sb_id', email_confirmed_at: '2023-01-01' },
    });

    await useCase.execute({ email: 'test@example.com', password: 'pass' });
    expect(authSessionService.saveRefreshToken).toHaveBeenCalled();
  });

  it('2. Supabase ID mismatch -> exact conflict behavior', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id_old',
      isActive: true,
    });
    supabaseAuthService.signInEmail.mockResolvedValue({ user: { id: 'sb_id_new' } });

    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('3. Email chưa verified -> exact forbidden behavior', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'u1', supabaseId: 'sb_id', isActive: true });
    supabaseAuthService.signInEmail.mockResolvedValue({
      user: { id: 'sb_id', email_confirmed_at: null },
    });

    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('4. Legacy bcrypt user login thành công và không gọi Supabase', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: null,
      passwordHash: 'hash',
      isActive: true,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await useCase.execute({ email: 'test@example.com', password: 'pass' });
    expect(supabaseAuthService.signInEmail).not.toHaveBeenCalled();
    expect(authSessionService.saveRefreshToken).toHaveBeenCalled();
  });

  it('5. Legacy bcrypt wrong password -> exact unauthorized behavior', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: null,
      passwordHash: 'hash',
      isActive: true,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('6. Local account incomplete -> exact conflict behavior', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: null,
      passwordHash: null,
      isActive: true,
    });
    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('7. Local user không tồn tại -> login Supabase và JIT sync user', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signInEmail.mockResolvedValue({
      user: { id: 'sb_id', email_confirmed_at: '2023-01-01' },
    });
    supabaseUserSyncService.findOrCreateSupabaseUser.mockResolvedValue({
      id: 'u1',
      isActive: true,
    });

    await useCase.execute({ email: 'test@example.com', password: 'pass' });
    expect(supabaseUserSyncService.findOrCreateSupabaseUser).toHaveBeenCalled();
  });

  it('8. Inactive user -> exact locked behavior', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      isActive: false,
      emailVerifiedAt: new Date(),
    });
    supabaseAuthService.signInEmail.mockResolvedValue({
      user: { id: 'sb_id', email_confirmed_at: '2023-01-01' },
    });

    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      ForbiddenException,
    );
    expect(authSessionService.saveRefreshToken).not.toHaveBeenCalled();
  });
});
