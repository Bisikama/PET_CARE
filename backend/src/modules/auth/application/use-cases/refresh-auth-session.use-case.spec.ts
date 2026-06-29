import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { RefreshAuthSessionUseCase } from './refresh-auth-session.use-case';
import { UsersService } from '../../../users/users.service';
import { AuthSessionService } from '../services/auth-session.service';
import { REFRESH_TOKEN_REPOSITORY } from '../../auth.tokens';

describe('RefreshAuthSessionUseCase', () => {
  let useCase: RefreshAuthSessionUseCase;
  let usersService: jest.Mocked<any>;
  let authSessionService: jest.Mocked<any>;
  let refreshTokenRepository: jest.Mocked<any>;

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
    };
    authSessionService = {
      hashToken: jest.fn((t) => `hashed_${t}`),
      getTokens: jest.fn(),
      saveRefreshToken: jest.fn(),
    };
    refreshTokenRepository = {
      findByHash: jest.fn(),
      deleteById: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshAuthSessionUseCase,
        { provide: UsersService, useValue: usersService },
        { provide: AuthSessionService, useValue: authSessionService },
        { provide: REFRESH_TOKEN_REPOSITORY, useValue: refreshTokenRepository },
      ],
    }).compile();

    useCase = module.get<RefreshAuthSessionUseCase>(RefreshAuthSessionUseCase);
    authSessionService.getTokens.mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' });
  });

  it('1. Refresh success: old token record delete trước khi persist token mới', async () => {
    usersService.findById.mockResolvedValue({ id: 'u1', isActive: true });
    refreshTokenRepository.findByHash.mockResolvedValue({ id: 'r1', user_id: 'u1', expires_at: new Date(Date.now() + 10000) });
    
    await useCase.execute({ userId: 'u1', rawRefreshToken: 'token' });
    
    expect(refreshTokenRepository.deleteById).toHaveBeenCalledWith('r1');
    expect(authSessionService.saveRefreshToken).toHaveBeenCalled();
  });

  it('2. Token hash không tồn tại -> error đúng', async () => {
    usersService.findById.mockResolvedValue({ id: 'u1', isActive: true });
    refreshTokenRepository.findByHash.mockResolvedValue(null);
    
    await expect(useCase.execute({ userId: 'u1', rawRefreshToken: 'token' })).rejects.toThrow(ForbiddenException);
    expect(authSessionService.saveRefreshToken).not.toHaveBeenCalled();
  });

  it('3. Token thuộc user khác -> error đúng', async () => {
    usersService.findById.mockResolvedValue({ id: 'u1', isActive: true });
    refreshTokenRepository.findByHash.mockResolvedValue({ id: 'r1', user_id: 'u2', expires_at: new Date(Date.now() + 10000) });
    
    await expect(useCase.execute({ userId: 'u1', rawRefreshToken: 'token' })).rejects.toThrow(ForbiddenException);
    expect(refreshTokenRepository.deleteById).toHaveBeenCalledWith('r1');
  });

  it('4. Token expired -> cleanup/error đúng', async () => {
    usersService.findById.mockResolvedValue({ id: 'u1', isActive: true });
    refreshTokenRepository.findByHash.mockResolvedValue({ id: 'r1', user_id: 'u1', expires_at: new Date(Date.now() - 10000) });
    
    await expect(useCase.execute({ userId: 'u1', rawRefreshToken: 'token' })).rejects.toThrow(ForbiddenException);
    expect(refreshTokenRepository.deleteById).toHaveBeenCalledWith('r1');
  });

  it('5. User inactive/not found -> error đúng', async () => {
    usersService.findById.mockResolvedValue({ id: 'u1', isActive: false });
    
    await expect(useCase.execute({ userId: 'u1', rawRefreshToken: 'token' })).rejects.toThrow(ForbiddenException);
  });
});
