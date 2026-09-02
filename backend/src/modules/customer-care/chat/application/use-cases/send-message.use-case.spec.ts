import { Test, TestingModule } from '@nestjs/testing';
import { SendMessageUseCase } from './send-message.use-case';
import { PrismaService } from '../../../../../database/prisma.service';
import { SupabaseStorageService } from '../../../../storage/supabase-storage.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { message_type } from '@prisma/client';

import { ChatGateway } from '../../chat.gateway';

describe('SendMessageUseCase', () => {
  let useCase: SendMessageUseCase;
  let prisma: PrismaService;
  let storageService: SupabaseStorageService;
  let chatGateway: ChatGateway;

  const mockPrismaService = {
    chat_rooms: {
      findUnique: jest.fn(),
    },
    chat_messages: {
      create: jest.fn(),
    },
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
  };

  const mockChatGateway = {
    emitNewMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendMessageUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SupabaseStorageService, useValue: mockStorageService },
        { provide: ChatGateway, useValue: mockChatGateway },
      ],
    }).compile();

    useCase = module.get<SendMessageUseCase>(SendMessageUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    storageService = module.get<SupabaseStorageService>(SupabaseStorageService);
    
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockRoomId = 'room-1';
    const mockUserId = 'user-1';

    it('should throw BadRequestException if both content and file are missing', async () => {
      await expect(useCase.execute(mockUserId, mockRoomId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if room is not found', async () => {
      mockPrismaService.chat_rooms.findUnique.mockResolvedValue(null);
      await expect(useCase.execute(mockUserId, mockRoomId, 'hello')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not in the room', async () => {
      mockPrismaService.chat_rooms.findUnique.mockResolvedValue({
        id: mockRoomId,
        customer_id: 'other-user',
        provider_user_id: 'another-user',
        is_active: true,
      });
      await expect(useCase.execute(mockUserId, mockRoomId, 'hello')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if room is inactive', async () => {
      mockPrismaService.chat_rooms.findUnique.mockResolvedValue({
        id: mockRoomId,
        customer_id: mockUserId,
        provider_user_id: 'provider-1',
        is_active: false,
      });
      await expect(useCase.execute(mockUserId, mockRoomId, 'hello')).rejects.toThrow(ForbiddenException);
    });

    it('should successfully send a text message without calling storage', async () => {
      mockPrismaService.chat_rooms.findUnique.mockResolvedValue({
        id: mockRoomId,
        customer_id: mockUserId,
        provider_user_id: 'provider-1',
        is_active: true,
      });

      mockPrismaService.chat_messages.create.mockResolvedValue({
        id: 'msg-1',
        content: 'hello',
        message_type: message_type.TEXT,
      });

      const result = await useCase.execute(mockUserId, mockRoomId, 'hello');

      expect(storageService.uploadFile).not.toHaveBeenCalled();
      expect(prisma.chat_messages.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          content: 'hello',
          message_type: message_type.TEXT,
          media_url: null,
        }),
      });
      expect(result.id).toBe('msg-1');
    });

    it('should successfully upload file and send message', async () => {
      mockPrismaService.chat_rooms.findUnique.mockResolvedValue({
        id: mockRoomId,
        customer_id: mockUserId,
        provider_user_id: 'provider-1',
        is_active: true,
      });

      const mockFile = {
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      } as Express.Multer.File;

      mockStorageService.uploadFile.mockResolvedValue('http://supabase.url/test.jpg');
      mockPrismaService.chat_messages.create.mockResolvedValue({
        id: 'msg-2',
        media_url: 'http://supabase.url/test.jpg',
        message_type: message_type.IMAGE,
      });

      await useCase.execute(mockUserId, mockRoomId, undefined, mockFile);

      expect(storageService.uploadFile).toHaveBeenCalled();
      expect(prisma.chat_messages.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          media_url: 'http://supabase.url/test.jpg',
          message_type: message_type.IMAGE,
        }),
      });
    });

    it('should throw BadRequestException if file is not image or video', async () => {
      mockPrismaService.chat_rooms.findUnique.mockResolvedValue({
        id: mockRoomId,
        customer_id: mockUserId,
        provider_user_id: 'provider-1',
        is_active: true,
      });

      const mockFile = {
        mimetype: 'application/pdf',
        originalname: 'test.pdf',
      } as Express.Multer.File;

      await expect(useCase.execute(mockUserId, mockRoomId, undefined, mockFile)).rejects.toThrow(BadRequestException);
      expect(storageService.uploadFile).not.toHaveBeenCalled();
      expect(prisma.chat_messages.create).not.toHaveBeenCalled();
    });
  });
});
