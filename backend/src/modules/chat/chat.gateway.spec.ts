import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let mockClient: any;

  beforeEach(async () => {
    // Mock ConfigService
    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    // Mock JwtService
    const mockJwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { 
          provide: ChatService, 
          useValue: { saveMessage: jest.fn() } 
        }
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;

    // Mock Socket client
    mockClient = {
      id: 'test-client-id',
      handshake: {
        headers: {},
        auth: {},
      },
      data: {},
      disconnect: jest.fn(),
      join: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('Test Case 1 (Happy Path): should join room if token is valid', async () => {
      // Setup
      const validToken = 'valid.jwt.token';
      const userId = 'user-123';
      
      mockClient.handshake.auth.token = validToken;
      jwtService.verifyAsync.mockResolvedValue({ sub: userId });

      // Execute
      await gateway.handleConnection(mockClient as Socket);

      // Assert
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(validToken, { secret: 'test-secret' });
      expect(mockClient.data.userId).toBe(userId);
      expect(mockClient.join).toHaveBeenCalledWith(`room_user_${userId}`);
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('Test Case 2 (Unauthorized): should disconnect if token is invalid or missing', async () => {
      // Setup
      const invalidToken = 'invalid.jwt.token';
      
      mockClient.handshake.headers.authorization = `Bearer ${invalidToken}`;
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Execute
      await gateway.handleConnection(mockClient as Socket);

      // Assert
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(invalidToken, { secret: 'test-secret' });
      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
      expect(mockClient.join).not.toHaveBeenCalled();
      expect(mockClient.data.userId).toBeUndefined();
    });

    it('Test Case 3 (No Token): should disconnect if no token is provided', async () => {
      // Execute
      await gateway.handleConnection(mockClient as Socket);

      // Assert
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
      expect(mockClient.join).not.toHaveBeenCalled();
    });
  });
});
