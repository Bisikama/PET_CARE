import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      verifyEmailOtp: jest.fn(),
      login: jest.fn(),
      resendSignupOtp: jest.fn(),
      signInGoogleIdToken: jest.fn(),
      getProfile: jest.fn(),
      logout: jest.fn(),
      refreshTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('AUTH-SB-17: Logout', async () => {
    const mockRequest = { cookies: { refreshToken: 'token' } } as any;
    const mockResponse = { clearCookie: jest.fn(), cookie: jest.fn() } as any;

    await controller.logout(mockRequest, mockResponse);
    expect(authService.logout).toHaveBeenCalledWith('token');
  });
});
