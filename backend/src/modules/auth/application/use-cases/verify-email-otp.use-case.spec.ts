import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { VerifyEmailOtpUseCase } from './verify-email-otp.use-case';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { UsersService } from '../../../users/users.service';
import { AuthSessionService } from '../services/auth-session.service';
import { Role } from '@prisma/client';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';

describe('VerifyEmailOtpUseCase', () => {
  let useCase: VerifyEmailOtpUseCase;
  let supabaseAuthService: jest.Mocked<any>;
  let usersService: jest.Mocked<any>;
  let authSessionService: jest.Mocked<any>;

  beforeEach(async () => {
    supabaseAuthService = {
      verifySignupOtp: jest.fn(),
    };
    usersService = {
      ensureLocalUserFromVerifiedSupabaseUser: jest.fn(),
    };
    authSessionService = {
      getTokens: jest.fn(),
      saveRefreshToken: jest.fn(),
      toPublicUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyEmailOtpUseCase,
        { provide: SupabaseAuthService, useValue: supabaseAuthService },
        { provide: UsersService, useValue: usersService },
        { provide: AuthSessionService, useValue: authSessionService },
      ],
    }).compile();

    useCase = module.get<VerifyEmailOtpUseCase>(VerifyEmailOtpUseCase);
  });

  it('1. OTP đúng + local user đã tồn tại PENDING_VERIFICATION -> emailVerifiedAt được set -> status chuyển ACTIVE -> trả internal tokens.', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({
      user: { id: 'sb_id', email: 'test@example.com', email_confirmed_at: '2026-07-03' },
      session: null
    });
    const localUser = { id: 'u1', isActive: true, status: 'ACTIVE', role: Role.CUSTOMER, email: 'test@example.com', emailVerifiedAt: new Date() };
    usersService.ensureLocalUserFromVerifiedSupabaseUser.mockResolvedValue(localUser);
    authSessionService.getTokens.mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' });
    authSessionService.toPublicUser.mockReturnValue(localUser);

    const res = await useCase.execute({
      email: 'test@example.com',
      otp: '123456',
      context: { ipAddress: '1.1.1.1' },
    });

    expect(usersService.ensureLocalUserFromVerifiedSupabaseUser).toHaveBeenCalledWith({
      supabaseId: 'sb_id',
      email: 'test@example.com',
      fullName: null,
    });
    expect(authSessionService.saveRefreshToken).toHaveBeenCalledWith('u1', 'ref', {
      ipAddress: '1.1.1.1',
    });
    expect(res.tokens.accessToken).toBe('acc');
    expect(res.user.id).toBe('u1');
  });

  it('2. OTP đúng + local user không tồn tại -> local user được create -> trả internal tokens', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({
      user: { id: 'sb_id', email: 'test@example.com', email_confirmed_at: '2026-07-03' },
      session: null
    });
    const localUser = { id: 'u2', isActive: true, status: 'ACTIVE', role: Role.CUSTOMER, email: 'test@example.com' };
    usersService.ensureLocalUserFromVerifiedSupabaseUser.mockResolvedValue(localUser);
    authSessionService.getTokens.mockResolvedValue({ accessToken: 'acc2', refreshToken: 'ref2' });
    authSessionService.toPublicUser.mockReturnValue(localUser);

    const res = await useCase.execute({ email: 'test@example.com', otp: '123456' });

    expect(usersService.ensureLocalUserFromVerifiedSupabaseUser).toHaveBeenCalled();
    expect(res.tokens.accessToken).toBe('acc2');
  });

  it('3. OTP đúng + local user cùng email nhưng supabaseId null -> local user được link supabaseId -> trả internal tokens.', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({
      user: { id: 'sb_id', email: 'test@example.com', email_confirmed_at: '2026-07-03' },
      session: null
    });
    const localUser = { id: 'u3', isActive: true, status: 'ACTIVE', role: Role.CUSTOMER, email: 'test@example.com', supabaseId: 'sb_id' };
    usersService.ensureLocalUserFromVerifiedSupabaseUser.mockResolvedValue(localUser);
    authSessionService.getTokens.mockResolvedValue({ accessToken: 'acc3', refreshToken: 'ref3' });
    authSessionService.toPublicUser.mockReturnValue(localUser);

    const res = await useCase.execute({ email: 'test@example.com', otp: '123456' });

    expect(usersService.ensureLocalUserFromVerifiedSupabaseUser).toHaveBeenCalled();
    expect(res.tokens.accessToken).toBe('acc3');
  });

  it('4. OTP đúng + local user cùng email nhưng supabaseId khác -> conflict, không overwrite.', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({
      user: { id: 'sb_id_new', email: 'test@example.com', email_confirmed_at: '2026-07-03' },
      session: null
    });
    usersService.ensureLocalUserFromVerifiedSupabaseUser.mockRejectedValue(new ConflictException(AUTH_ERRORS.ACCOUNT_IDENTITY_CONFLICT));

    await expect(useCase.execute({ email: 'test@example.com', otp: '123456' })).rejects.toThrow(new ConflictException(AUTH_ERRORS.ACCOUNT_IDENTITY_CONFLICT));
    expect(authSessionService.saveRefreshToken).not.toHaveBeenCalled();
  });

  it('5. OTP đúng + local user SUSPENDED/BANNED -> không cấp token -> không tự mở khóa account.', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({ user: { id: 'sb_id', email: 'test@example.com', email_confirmed_at: '2026-07-03' }, session: null });
    const localUser = { id: 'u1', isActive: false, status: 'SUSPENDED', role: Role.CUSTOMER, email: 'test@example.com' };
    usersService.ensureLocalUserFromVerifiedSupabaseUser.mockResolvedValue(localUser);

    await expect(useCase.execute({ email: 'test@example.com', otp: '123456' })).rejects.toThrow(
      new ForbiddenException(AUTH_ERRORS.ACCOUNT_LOCKED)
    );
    expect(authSessionService.saveRefreshToken).not.toHaveBeenCalled();
  });

  it('6. OTP sai/hết hạn -> OTP_INVALID_OR_EXPIRED -> không tạo local user.', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({ user: null, session: null });

    await expect(useCase.execute({ email: 'test@example.com', otp: '123456' })).rejects.toThrow(
      new BadRequestException(AUTH_ERRORS.OTP_INVALID_OR_EXPIRED)
    );
    expect(usersService.ensureLocalUserFromVerifiedSupabaseUser).not.toHaveBeenCalled();
    expect(authSessionService.saveRefreshToken).not.toHaveBeenCalled();
  });
});
