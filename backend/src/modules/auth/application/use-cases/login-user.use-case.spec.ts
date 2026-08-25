import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, UnauthorizedException, ServiceUnavailableException, InternalServerErrorException } from '@nestjs/common';
import { LoginUserUseCase } from './login-user.use-case';
import { UsersService } from '../../../users/application/use-cases/users.service';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { AuthSessionService } from '../services/auth-session.service';
import { Role } from '@prisma/client';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';

describe('LoginUserUseCase (DATABASE-TRIGGER-FIRST)', () => {
  let useCase: LoginUserUseCase;
  let usersService: jest.Mocked<any>;
  let supabaseAuthService: jest.Mocked<any>;
  let authSessionService: jest.Mocked<any>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
    };
    supabaseAuthService = {
      normalizeEmail: jest.fn((e) => e.trim().toLowerCase()),
      signInEmail: jest.fn(),
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
        { provide: AuthSessionService, useValue: authSessionService },
      ],
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    authSessionService.getTokens.mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' });
    authSessionService.toPublicUser.mockReturnValue({});
  });

  it('LOGIN-STATE-01: Email chưa đăng ký (No local profile) -> 401 AUTH_INVALID_CREDENTIALS', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS),
    );
    expect(supabaseAuthService.signInEmail).not.toHaveBeenCalled();
  });

  it('LOGIN-STATE-02: Đã register nhưng chưa OTP -> 403 EMAIL_CONFIRMATION_PENDING', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      emailVerifiedAt: null,
      isActive: true,
    });

    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      new ForbiddenException(AUTH_ERRORS.EMAIL_CONFIRMATION_PENDING),
    );
    expect(supabaseAuthService.signInEmail).not.toHaveBeenCalled();
  });

  it('LOGIN-STATE-03: Đã OTP + active + đúng password -> 200, internal JWT', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      emailVerifiedAt: new Date(),
      isActive: true,
      role: Role.CUSTOMER,
      email: 'test@example.com',
    });
    supabaseAuthService.signInEmail.mockResolvedValue({
      user: { id: 'sb_id', email_confirmed_at: '2023-01-01' },
    });

    await useCase.execute({ email: 'test@example.com', password: 'pass' });
    expect(authSessionService.saveRefreshToken).toHaveBeenCalled();
  });

  it('LOGIN-STATE-04: Đã OTP + active + sai password -> 401 AUTH_INVALID_CREDENTIALS', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      emailVerifiedAt: new Date(),
      isActive: true,
    });
    // Giả lập sai password (AuthApiError)
    supabaseAuthService.signInEmail.mockRejectedValue(new Error('Invalid login credentials'));

    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS),
    );
  });

  it('LOGIN-STATE-05: Đã OTP + isActive=false -> 403 ACCOUNT_LOCKED', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      emailVerifiedAt: new Date(),
      isActive: false,
    });

    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      new ForbiddenException(AUTH_ERRORS.ACCOUNT_LOCKED),
    );
    expect(supabaseAuthService.signInEmail).not.toHaveBeenCalled();
  });

  it('LOGIN-STATE-06: Local verified nhưng Supabase chưa confirmed -> 500 AUTH_PROFILE_OUT_OF_SYNC', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      emailVerifiedAt: new Date(),
      isActive: true,
    });
    supabaseAuthService.signInEmail.mockResolvedValue({
      user: { id: 'sb_id', email_confirmed_at: null }, // Null ở Supabase
    });

    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      new InternalServerErrorException(AUTH_ERRORS.AUTH_PROFILE_OUT_OF_SYNC),
    );
  });

  it('LOGIN-STATE-06(b): Supabase reject với email_not_confirmed -> 403 EMAIL_CONFIRMATION_PENDING', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      emailVerifiedAt: new Date(),
      isActive: true,
    });
    // Giả lập Supabase trả về lỗi email_not_confirmed
    supabaseAuthService.signInEmail.mockRejectedValue({ 
      name: 'AuthApiError', 
      status: 400, 
      message: 'Email not confirmed' 
    });

    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      new ForbiddenException(AUTH_ERRORS.EMAIL_CONFIRMATION_PENDING),
    );
  });

  it('LOGIN-STATE-07: Supabase identity ID khác public.users.supabaseId -> 409 ACCOUNT_IDENTITY_CONFLICT', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id_old',
      emailVerifiedAt: new Date(),
      isActive: true,
    });
    supabaseAuthService.signInEmail.mockResolvedValue({
      user: { id: 'sb_id_new', email_confirmed_at: '2023-01-01' },
    });

    await expect(useCase.execute({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      new ConflictException(AUTH_ERRORS.ACCOUNT_IDENTITY_CONFLICT),
    );
  });
});
