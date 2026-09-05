import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationGateway } from './notification.gateway';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;
  let gateway: NotificationGateway;

  const mockGateway = {
    sendToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notifications: {
              updateMany: jest.fn(),
            },
          },
        },
        {
          provide: NotificationGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<NotificationGateway>(NotificationGateway);
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications to read and emit socket event', async () => {
      (prisma.notifications.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead('user-1');

      expect(prisma.notifications.updateMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1', is_read: false },
        data: { is_read: true },
      });
      expect(mockGateway.sendToUser).toHaveBeenCalledWith('user-1', 'notification:unread_count', { unreadCount: 0 });
      expect(result).toEqual({ count: 5 });
    });
  });
});
