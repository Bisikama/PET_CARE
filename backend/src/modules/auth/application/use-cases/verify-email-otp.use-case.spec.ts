import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { VerifyEmailOtpUseCase } from './verify-email-otp.use-case';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { SupabaseUserSyncService } from '../services/supabase-user-sync.service';
import { AuthSessionService } from '../services/auth-session.service';
import { Role } from '@prisma/client';

describe('VerifyEmailOtpUseCase', () => {
  let useCase: VerifyEmailOtpUseCase;
  let supabaseAuthService: jest.Mocked<any>;
  let supabaseUserSyncService: jest.Mocked<any>;
  let authSessionService: jest.Mocked<any>;

  beforeEach(async () => {
    supabaseAuthService = {
      verifySignupOtp: jest.fn(),
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
        VerifyEmailOtpUseCase,
        { provide: SupabaseAuthService, useValue: supabaseAuthService },
        { provide: SupabaseUserSyncService, useValue: supabaseUserSyncService },
        { provide: AuthSessionService, useValue: authSessionService },
      ],
    }).compile();

    useCase = module.get<VerifyEmailOtpUseCase>(VerifyEmailOtpUseCase);
  });

  it('1. OTP valid -> sync user, token, persist refresh, trả đúng result', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({ user: { id: 'sb_id' }, session: null });
    const localUser = { id: 'u1', isActive: true, role: Role.CUSTOMER, email: 'test@example.com' };
    supabaseUserSyncService.findOrCreateSupabaseUser.mockResolvedValue(localUser);
    authSessionService.getTokens.mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' });
    authSessionService.toPublicUser.mockReturnValue(localUser);

    const res = await useCase.execute({ email: 'test@example.com', otp: '123456', context: { ipAddress: '1.1.1.1' } });
    
    expect(authSessionService.saveRefreshToken).toHaveBeenCalledWith('u1', 'ref', { ipAddress: '1.1.1.1' });
    expect(res.tokens.accessToken).toBe('acc');
    expect(res.user.id).toBe('u1');
  });

  it('2. OTP invalid/expired -> error mapping đúng', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({ user: null, session: null });

    await expect(useCase.execute({ email: 'test@example.com', otp: '123456' })).rejects.toThrow(BadRequestException);
    expect(authSessionService.saveRefreshToken).not.toHaveBeenCalled();
  });

  it('3. Supabase không trả user -> behavior đúng', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({});
    await expect(useCase.execute({ email: 'test@example.com', otp: '123456' })).rejects.toThrow(BadRequestException);
  });

  it('4. Local user inactive -> đúng error', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({ user: { id: 'sb_id' }, session: null });
    const localUser = { id: 'u1', isActive: false, role: Role.CUSTOMER, email: 'test@example.com' };
    supabaseUserSyncService.findOrCreateSupabaseUser.mockResolvedValue(localUser);

    await expect(useCase.execute({ email: 'test@example.com', otp: '123456' })).rejects.toThrow(ForbiddenException);
    expect(authSessionService.saveRefreshToken).not.toHaveBeenCalled();
  });
});
