import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { Socket } from 'socket.io';

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatGateway],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should add user to connectedUsers if userId is provided in query', () => {
      const mockClient = {
        id: 'socket-1',
        handshake: {
          query: {
            userId: 'user-1',
          },
        },
      } as unknown as Socket;

      gateway.handleConnection(mockClient);

      // Access private map for testing purpose
      const connectedUsers = gateway['connectedUsers'];
      expect(connectedUsers.get('user-1')).toBe('socket-1');
    });

    it('should not add user if userId is missing', () => {
      const mockClient = {
        id: 'socket-2',
        handshake: {
          query: {},
        },
      } as unknown as Socket;

      gateway.handleConnection(mockClient);

      const connectedUsers = gateway['connectedUsers'];
      expect(connectedUsers.has('undefined')).toBeFalsy();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove user from connectedUsers', () => {
      const mockClient = {
        id: 'socket-1',
        handshake: {
          query: {
            userId: 'user-1',
          },
        },
      } as unknown as Socket;

      // First connect
      gateway.handleConnection(mockClient);
      
      // Then disconnect
      gateway.handleDisconnect(mockClient);

      const connectedUsers = gateway['connectedUsers'];
      expect(connectedUsers.has('user-1')).toBeFalsy();
    });
  });

  describe('handleJoinRoom', () => {
    it('should join room and return joinedRoom event', () => {
      const mockClient = {
        id: 'socket-1',
        join: jest.fn(),
      } as unknown as Socket;

      const payload = { roomId: 'room-1' };

      const result = gateway.handleJoinRoom(mockClient, payload);

      expect(mockClient.join).toHaveBeenCalledWith('room-1');
      expect(result).toEqual({ event: 'joinedRoom', data: 'room-1' });
    });

    it('should return error if roomId is not provided', () => {
      const mockClient = {
        id: 'socket-1',
        join: jest.fn(),
      } as unknown as Socket;

      const payload = { roomId: '' };

      const result = gateway.handleJoinRoom(mockClient, payload);

      expect(mockClient.join).not.toHaveBeenCalled();
      expect(result).toEqual({ event: 'error', data: 'Room ID is required' });
    });
  });

  describe('handleLeaveRoom', () => {
    it('should leave room and return leftRoom event', () => {
      const mockClient = {
        id: 'socket-1',
        leave: jest.fn(),
      } as unknown as Socket;

      const payload = { roomId: 'room-1' };

      const result = gateway.handleLeaveRoom(mockClient, payload);

      expect(mockClient.leave).toHaveBeenCalledWith('room-1');
      expect(result).toEqual({ event: 'leftRoom', data: 'room-1' });
    });
  });
});
