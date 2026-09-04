import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: {
            chat_rooms: {
              findUnique: jest.fn(),
            },
            chat_messages: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveMessage', () => {
    it('Lưu tin nhắn thành công', async () => {
      const mockRoom = {
        id: 'room-1',
        customer_id: 'user-1',
        provider_user_id: 'provider-1',
      };
      
      const mockMessage = {
        id: 'msg-1',
        chat_room_id: 'room-1',
        sender_id: 'user-1',
        content: 'hello',
        created_at: new Date(),
      };

      (prisma.chat_rooms.findUnique as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.chat_messages.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await service.saveMessage('user-1', { roomId: 'room-1', content: 'hello' });

      expect(prisma.chat_rooms.findUnique).toHaveBeenCalledWith({ where: { id: 'room-1' } });
      expect(prisma.chat_messages.create).toHaveBeenCalledWith({
        data: {
          chat_room_id: 'room-1',
          sender_id: 'user-1',
          content: 'hello',
          message_type: 'TEXT',
        },
      });
      expect(result.message).toEqual(mockMessage);
      expect(result.receiverId).toBe('provider-1');
    });

    it('Bị chặn (Forbidden) nếu cố ý lấy tin nhắn của phòng chat người khác', async () => {
      const mockRoom = {
        id: 'room-1',
        customer_id: 'user-2', // Not user-1
        provider_user_id: 'provider-1', // Not user-1
      };

      (prisma.chat_rooms.findUnique as jest.Mock).mockResolvedValue(mockRoom);

      await expect(
        service.saveMessage('user-1', { roomId: 'room-1', content: 'hello' })
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.chat_messages.create).not.toHaveBeenCalled();
    });

    it('Ném lỗi NotFound nếu phòng chat không tồn tại', async () => {
      (prisma.chat_rooms.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.saveMessage('user-1', { roomId: 'room-999', content: 'hello' })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
