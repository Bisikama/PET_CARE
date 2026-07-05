import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { GoogleIdTokenSignInUseCase } from './google-id-token-sign-in.use-case';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { SupabaseUserSyncService } from '../services/supabase-user-sync.service';
import { AuthSessionService } from '../services/auth-session.service';
import { Role } from '@prisma/client';

describe('GoogleIdTokenSignInUseCase', () => {
  let useCase: GoogleIdTokenSignInUseCase;
  let supabaseAuthService: jest.Mocked<any>;
  let supabaseUserSyncService: jest.Mocked<any>;
  let authSessionService: jest.Mocked<any>;

  beforeEach(async () => {
    supabaseAuthService = {
      signInGoogleIdToken: jest.fn(),
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
        GoogleIdTokenSignInUseCase,
        { provide: SupabaseAuthService, useValue: supabaseAuthService },
        { provide: SupabaseUserSyncService, useValue: supabaseUserSyncService },
        { provide: AuthSessionService, useValue: authSessionService },
      ],
    }).compile();

    useCase = module.get<GoogleIdTokenSignInUseCase>(GoogleIdTokenSignInUseCase);
    authSessionService.getTokens.mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' });
    authSessionService.toPublicUser.mockReturnValue({});
  });

  it('1. Success path', async () => {
    supabaseAuthService.signInGoogleIdToken.mockResolvedValue({
      user: { email: 't@example.com', user_metadata: { full_name: 'Test' } },
    });
    supabaseUserSyncService.findOrCreateSupabaseUser.mockResolvedValue({
      id: 'u1',
      isActive: true,
    });

    await useCase.execute({ idToken: 'token' });

    expect(supabaseUserSyncService.findOrCreateSupabaseUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 't@example.com' }),
      'Test',
    );
    expect(authSessionService.saveRefreshToken).toHaveBeenCalled();
  });

  it('2. Provider invalid token mapping', async () => {
    supabaseAuthService.signInGoogleIdToken.mockRejectedValue(new Error('Provider Error'));

    await expect(useCase.execute({ idToken: 'token' })).rejects.toThrow('Provider Error');
  });

  it('3. Remote user không có email', async () => {
    supabaseAuthService.signInGoogleIdToken.mockResolvedValue({ user: { email: null } });

    await expect(useCase.execute({ idToken: 'token' })).rejects.toThrow(UnauthorizedException);
  });

  it('4. Inactive local user', async () => {
    supabaseAuthService.signInGoogleIdToken.mockResolvedValue({ user: { email: 't@example.com' } });
    supabaseUserSyncService.findOrCreateSupabaseUser.mockResolvedValue({
      id: 'u1',
      isActive: false,
    });

    await expect(useCase.execute({ idToken: 'token' })).rejects.toThrow(ForbiddenException);
    expect(authSessionService.saveRefreshToken).not.toHaveBeenCalled();
  });
});
