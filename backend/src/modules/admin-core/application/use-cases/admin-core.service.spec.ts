import { Test, TestingModule } from '@nestjs/testing';
import { AdminCoreService } from './admin-core.service';
import { PrismaService } from '../../../../database/prisma.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Role, user_status, provider_status, booking_status } from '@prisma/client';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';

describe('AdminCoreService', () => {
  let service: AdminCoreService;
  let prismaService: PrismaService;
  let settlementsService: SettlementsService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminCoreService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            provider_profiles: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            audit_logs: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            bookings: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback(prismaService)),
            $executeRaw: jest.fn(),
            $queryRaw: jest.fn(),
          },
        },
        {
          provide: SettlementsService,
          useValue: { refund: jest.fn() },
        },
        {
          provide: NotificationsService,
          useValue: { sendNotification: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<AdminCoreService>(AdminCoreService);
    prismaService = module.get<PrismaService>(PrismaService);
    settlementsService = module.get<SettlementsService>(SettlementsService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return paginated list of users', async () => {
      const mockUsers = [{ id: '1', fullName: 'Test' }];
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prismaService.user.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getUsers({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockUsers);
      expect(result.meta.total).toBe(1);
      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(prismaService.user.count).toHaveBeenCalled();
    });
  });

  describe('getUserDetails', () => {
    it('should throw NotFoundException if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getUserDetails('1')).rejects.toThrow(NotFoundException);
    });

    it('should return safe user details', async () => {
      const mockUser = {
        id: '1',
        fullName: 'Test',
        passwordHash: 'secret',
        supabaseId: 'sup-1',
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserDetails('1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('supabaseId');
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('fullName', 'Test');
    });
  });

  describe('suspendUser', () => {
    it('Test Case 1: Khóa một tài khoản Provider thành công', async () => {
      const targetUserId = 'uuid-provider';
      const adminId = 'uuid-admin';
      const reason = 'Vi phạm chính sách';

      // Mock user là PROVIDER
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: targetUserId,
        status: user_status.ACTIVE,
        role: Role.PROVIDER,
      });

      // Mock provider profile tồn tại
      (prismaService.provider_profiles.findUnique as jest.Mock).mockResolvedValue({
        user_id: targetUserId,
        status: provider_status.APPROVED,
      });

      // Mock $queryRaw
      (prismaService.$queryRaw as jest.Mock).mockResolvedValue([]);

      // Gọi service
      const result = await service.suspendUser(adminId, targetUserId, { reason });

      // Verify
      expect(result.message).toBe('User suspended successfully');
      
      // Verify $transaction được gọi (ở cấu hình mock thì callback đã được chạy với prismaService)
      expect(prismaService.$transaction).toHaveBeenCalled();

      // Verify update user
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: targetUserId },
        data: expect.objectContaining({
          status: user_status.SUSPENDED,
          suspended_reason: reason,
          suspended_at: expect.any(Date),
        }),
      });

      // Verify update provider_profiles
      expect(prismaService.provider_profiles.update).toHaveBeenCalledWith({
        where: { user_id: targetUserId },
        data: { status: provider_status.SUSPENDED },
      });

      // Verify lưu audit log
      expect(prismaService.audit_logs.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actor_id: adminId,
          action: 'SUSPEND_USER',
          target_type: 'USER',
          target_id: targetUserId,
          reason: reason,
          new_value: { status: user_status.SUSPENDED, reason },
        }),
      });
    });

    it('Test Case: Provider không có Booking Pending nào thì không gọi hàm refund', async () => {
      const targetUserId = 'uuid-provider';
      const adminId = 'uuid-admin';
      const reason = 'Vi phạm';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: targetUserId, status: user_status.ACTIVE, role: Role.PROVIDER,
      });
      (prismaService.provider_profiles.findUnique as jest.Mock).mockResolvedValue({
        user_id: targetUserId, status: provider_status.APPROVED,
      });

      // No pending bookings
      (prismaService.$queryRaw as jest.Mock).mockResolvedValue([]);

      await service.suspendUser(adminId, targetUserId, { reason });

      expect(prismaService.$executeRaw).toHaveBeenCalled(); // Should disable slots
      expect(prismaService.$queryRaw).toHaveBeenCalled(); // Should query bookings
      expect(prismaService.bookings.findMany).not.toHaveBeenCalled();
      expect(prismaService.bookings.update).not.toHaveBeenCalled();
      expect(settlementsService.refund).not.toHaveBeenCalled();
      expect(notificationsService.sendNotification).not.toHaveBeenCalled();
    });

    it('Test Case: Provider có Booking Pending thì phải gọi update trạng thái Booking và hàm refund', async () => {
      const targetUserId = 'uuid-provider';
      const adminId = 'uuid-admin';
      const reason = 'Vi phạm';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: targetUserId, status: user_status.ACTIVE, role: Role.PROVIDER,
      });
      (prismaService.provider_profiles.findUnique as jest.Mock).mockResolvedValue({
        user_id: targetUserId, status: provider_status.APPROVED,
      });

      // Mock pending booking IDs
      (prismaService.$queryRaw as jest.Mock).mockResolvedValue([{ id: 'booking-1' }]);

      // Mock pending booking with payment
      const mockBooking = {
        id: 'booking-1',
        customer_id: 'user-customer',
        payments: { status: 'PAID_HELD_IN_ESCROW' },
      };
      (prismaService.bookings.findMany as jest.Mock).mockResolvedValue([mockBooking]);

      await service.suspendUser(adminId, targetUserId, { reason });

      // Verify slot blocked
      expect(prismaService.$executeRaw).toHaveBeenCalled();
      // Verify query pending bookings
      expect(prismaService.$queryRaw).toHaveBeenCalled();
      
      // Verify booking cancelled
      expect(prismaService.bookings.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: booking_status.CANCELLED, cancellation_reason: 'Provider suspended by admin' }
      });

      // Verify refund called
      expect(settlementsService.refund).toHaveBeenCalledWith(
        'booking-1',
        prismaService,
        `Provider đã bị khóa bởi Admin. Lý do: ${reason}`
      );

      // Verify notification sent
      expect(notificationsService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-customer',
          type: 'BOOKING_CANCELLED',
          title: 'Lịch hẹn đã bị hủy',
          bookingId: 'booking-1',
        })
      );
    });
  });

  describe('reactivateUser', () => {
    it('Test Case 2: Mở khóa một tài khoản Provider (status về PENDING_REVIEW)', async () => {
      const targetUserId = 'uuid-provider';
      const adminId = 'uuid-admin';

      // Mock user là PROVIDER đang bị SUSPENDED
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: targetUserId,
        status: user_status.SUSPENDED,
        role: Role.PROVIDER,
      });

      // Mock provider profile tồn tại
      (prismaService.provider_profiles.findUnique as jest.Mock).mockResolvedValue({
        user_id: targetUserId,
        status: provider_status.SUSPENDED,
      });

      // Gọi service
      const result = await service.reactivateUser(adminId, targetUserId);

      // Verify
      expect(result.message).toBe('User reactivated successfully');
      
      // Verify update user
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: targetUserId },
        data: {
          status: user_status.ACTIVE,
          suspended_reason: null,
          suspended_at: null,
        },
      });

      // Verify update provider_profiles ĐÚNG TRẠNG THÁI PENDING_REVIEW
      expect(prismaService.provider_profiles.update).toHaveBeenCalledWith({
        where: { user_id: targetUserId },
        data: { status: provider_status.PENDING_REVIEW }, // <--- Bằng chứng
      });

      // Verify lưu audit log
      expect(prismaService.audit_logs.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actor_id: adminId,
          action: 'REACTIVATE_USER',
          target_type: 'USER',
          target_id: targetUserId,
        }),
      });
    });
  });
});
