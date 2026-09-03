import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from './notification.gateway';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationGateway,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        id: 'socket-1',
        handshake: {
          auth: {},
          headers: {},
          query: {},
        },
        data: {},
        disconnect: jest.fn(),
        join: jest.fn(),
      };
    });

    it('should disconnect if no token is provided', async () => {
      await gateway.handleConnection(mockClient as unknown as Socket);
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should disconnect if token is invalid', async () => {
      mockClient.handshake.auth.token = 'invalid-token';
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(mockClient as unknown as Socket);
      
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('invalid-token', { secret: 'mock-secret' });
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should join user room if token is valid', async () => {
      mockClient.handshake.headers.authorization = 'Bearer valid-token';
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user-123' });

      await gateway.handleConnection(mockClient as unknown as Socket);
      
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token', { secret: 'mock-secret' });
      expect(mockClient.data.userId).toBe('user-123');
      expect(mockClient.join).toHaveBeenCalledWith('user_user-123');
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });
  });
});
