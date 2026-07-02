import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseAuthService } from './supabase-auth.service';
import { REFRESH_TOKEN_REPOSITORY } from './auth.tokens';
import { Role } from '@prisma/client';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { VerifyEmailOtpUseCase } from './application/use-cases/verify-email-otp.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { GoogleIdTokenSignInUseCase } from './application/use-cases/google-id-token-sign-in.use-case';
import { RefreshAuthSessionUseCase } from './application/use-cases/refresh-auth-session.use-case';
import { AuthSessionService } from './application/services/auth-session.service';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let refreshTokenRepository: jest.Mocked<any>;
  let registerUserUseCase: jest.Mocked<RegisterUserUseCase>;
  let verifyEmailOtpUseCase: jest.Mocked<VerifyEmailOtpUseCase>;
  let loginUserUseCase: jest.Mocked<LoginUserUseCase>;
  let googleIdTokenSignInUseCase: jest.Mocked<GoogleIdTokenSignInUseCase>;
  let refreshAuthSessionUseCase: jest.Mocked<RefreshAuthSessionUseCase>;
  let authSessionService: jest.Mocked<AuthSessionService>;

  beforeEach(async () => {
    const mockUsersService = { findPublicById: jest.fn() };
    const mockSupabaseAuthService = { resendSignupOtp: jest.fn() };
    const mockRefreshTokenRepository = {
      deleteByHash: jest.fn(),
      deleteAllByUserId: jest.fn(),
    };

    const mockRegisterUserUseCase = { execute: jest.fn() };
    const mockVerifyEmailOtpUseCase = { execute: jest.fn() };
    const mockLoginUserUseCase = { execute: jest.fn() };
    const mockGoogleIdTokenSignInUseCase = { execute: jest.fn() };
    const mockRefreshAuthSessionUseCase = { execute: jest.fn() };
    const mockAuthSessionService = { hashToken: jest.fn((t) => `hashed_${t}`) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: SupabaseAuthService, useValue: mockSupabaseAuthService },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: REFRESH_TOKEN_REPOSITORY, useValue: mockRefreshTokenRepository },
        { provide: RegisterUserUseCase, useValue: mockRegisterUserUseCase },
        { provide: VerifyEmailOtpUseCase, useValue: mockVerifyEmailOtpUseCase },
        { provide: LoginUserUseCase, useValue: mockLoginUserUseCase },
        { provide: GoogleIdTokenSignInUseCase, useValue: mockGoogleIdTokenSignInUseCase },
        { provide: RefreshAuthSessionUseCase, useValue: mockRefreshAuthSessionUseCase },
        { provide: AuthSessionService, useValue: mockAuthSessionService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY);
    registerUserUseCase = module.get(RegisterUserUseCase);
    verifyEmailOtpUseCase = module.get(VerifyEmailOtpUseCase);
    loginUserUseCase = module.get(LoginUserUseCase);
    googleIdTokenSignInUseCase = module.get(GoogleIdTokenSignInUseCase);
    refreshAuthSessionUseCase = module.get(RefreshAuthSessionUseCase);
    authSessionService = module.get(AuthSessionService);
  });

  it('AUTH-SB-01: Register delegates to RegisterUserUseCase', async () => {
    registerUserUseCase.execute.mockResolvedValue({
      message: 'Test message',
      requiresEmailConfirmation: true,
    });
    const res = await service.register({
      email: 'test@example.com',
      password: 'pass',
      fullName: 'Test Name',
    });
    expect(registerUserUseCase.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'pass',
      fullName: 'Test Name',
    });
    expect(res.message).toBe('Test message');
    expect(res.requiresEmailConfirmation).toBe(true);
  });

  it('AUTH-SB-01: VerifyEmailOtp delegates', async () => {
    verifyEmailOtpUseCase.execute.mockResolvedValue('result' as any);
    const res = await service.verifyEmailOtp(
      'test@example.com',
      '123456',
      'agent',
      '1.1.1.1',
      'dev',
    );
    expect(verifyEmailOtpUseCase.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      otp: '123456',
      context: { userAgent: 'agent', ipAddress: '1.1.1.1', deviceId: 'dev' },
    });
    expect(res).toBe('result');
  });

  it('AUTH-SB-02: Login delegates', async () => {
    loginUserUseCase.execute.mockResolvedValue('result' as any);
    const res = await service.login(
      { email: 'test@example.com', password: 'pwd' },
      'agent',
      '1.1.1.1',
      'dev',
    );
    expect(loginUserUseCase.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'pwd',
      context: { userAgent: 'agent', ipAddress: '1.1.1.1', deviceId: 'dev' },
    });
    expect(res).toBe('result');
  });

  it('AUTH-SB-03: SignInGoogle delegates', async () => {
    googleIdTokenSignInUseCase.execute.mockResolvedValue('result' as any);
    const res = await service.signInGoogleIdToken('token', 'nonce', 'agent', '1.1.1.1', 'dev');
    expect(googleIdTokenSignInUseCase.execute).toHaveBeenCalledWith({
      idToken: 'token',
      nonce: 'nonce',
      context: { userAgent: 'agent', ipAddress: '1.1.1.1', deviceId: 'dev' },
    });
    expect(res).toBe('result');
  });

  it('AUTH-SB-04: RefreshTokens delegates', async () => {
    refreshAuthSessionUseCase.execute.mockResolvedValue('result' as any);
    const res = await service.refreshTokens('u1', 'rt', 'agent', '1.1.1.1', 'dev');
    expect(refreshAuthSessionUseCase.execute).toHaveBeenCalledWith({
      userId: 'u1',
      rawRefreshToken: 'rt',
      context: { userAgent: 'agent', ipAddress: '1.1.1.1', deviceId: 'dev' },
    });
    expect(res).toBe('result');
  });
});
