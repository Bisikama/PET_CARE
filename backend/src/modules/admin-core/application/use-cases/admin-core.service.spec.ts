import { Test, TestingModule } from '@nestjs/testing';
import { AdminCoreService } from './admin-core.service';
import { PrismaService } from '../../../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Role, user_status, provider_status } from '@prisma/client';

describe('AdminCoreService', () => {
  let service: AdminCoreService;
  let prismaService: PrismaService;

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
            $transaction: jest.fn((callback) => callback(prismaService)),
          },
        },
      ],
    }).compile();

    service = module.get<AdminCoreService>(AdminCoreService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
