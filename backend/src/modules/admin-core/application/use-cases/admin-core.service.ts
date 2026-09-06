import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { SuspendUserDto } from '../../dto/suspend-user.dto';
import { GetAuditLogsDto } from '../../dto/get-audit-logs.dto';
import { GetUsersDto } from '../../dto/get-users.dto';
import { UpdateUserRoleDto } from '../../dto/update-user-role.dto';
import { GetDeactivationRequestsDto } from '../../dto/get-deactivation-requests.dto';
import { RejectDeactivationRequestDto } from '../../dto/reject-deactivation-request.dto';
import { Role, user_status, provider_status, booking_status, deactivation_status } from '@prisma/client';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';

@Injectable()
export class AdminCoreService {
  private readonly logger = new Logger(AdminCoreService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settlementsService: SettlementsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalProviders,
      totalBookings,
      openDisputes,
      totalRevenueAgg,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.provider_profiles.count(),
      this.prisma.bookings.count(),
      this.prisma.bookings.count({
        where: { status: 'DISPUTED' },
      }),
      this.prisma.bookings.aggregate({
        _sum: { total_price: true },
        where: { status: 'COMPLETED' },
      }),
    ]);

    return {
      totalUsers,
      totalProviders,
      totalBookings,
      openDisputes,
      totalRevenue: totalRevenueAgg._sum.total_price || 0,
    };
  }

  async getUsers(query: GetUsersDto) {
    const { page = 1, limit = 10, search, role, status } = query;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (status) {
      whereClause.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          avatarUrl: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        provider_profiles: true,
        customer_addresses: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Omit sensitive fields like passwordHash
    const { passwordHash, supabaseId, ...safeUser } = user;
    return safeUser;
  }

  async suspendUser(adminId: string, targetUserId: string, suspendUserDto: SuspendUserDto) {
    const { reason } = suspendUserDto;

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === user_status.SUSPENDED) {
      throw new ConflictException('Tài khoản đã ở trạng thái khóa');
    }

    // Execute in a transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Update user
      const updatedUser = await tx.user.update({
        where: { id: targetUserId },
        data: {
          status: user_status.SUSPENDED,
          suspended_reason: reason,
          suspended_at: new Date(),
        },
      });

      // 2. If provider, suspend profile and handle cascading effects
      if (user.role === Role.PROVIDER) {
        const profile = await tx.provider_profiles.findUnique({
          where: { user_id: targetUserId },
        });

        if (profile) {
          await tx.provider_profiles.update({
            where: { user_id: targetUserId },
            data: { status: provider_status.SUSPENDED },
          });

          // 2.2 Disable future available working slots
          await tx.$executeRaw`
            UPDATE provider_working_slots pws
            SET status = 'BLOCKED', updated_at = NOW()
            FROM provider_working_days pwd
            WHERE pws.working_day_id = pwd.id
              AND pwd.provider_id = ${targetUserId}::uuid
              AND pws.status = 'AVAILABLE'
              AND pwd.work_date >= CURRENT_DATE
          `;

          // 2.3 Find all pending bookings with Pessimistic Lock
          const pendingBookingIds = await tx.$queryRaw<{id: string}[]>`
            SELECT id FROM bookings
            WHERE provider_id = ${targetUserId}::uuid 
              AND status IN ('PENDING_PROVIDER_ACCEPTANCE', 'ACCEPTED')
            FOR UPDATE
          `;

          if (pendingBookingIds.length > 0) {
            const ids = pendingBookingIds.map(b => b.id);
            const bookings = await tx.bookings.findMany({
              where: { id: { in: ids } },
              include: { payments: true }
            });

            for (const booking of bookings) {
              // Cancel Booking
              await tx.bookings.update({
                where: { id: booking.id },
                data: { status: booking_status.CANCELLED, cancellation_reason: 'Provider suspended by admin' }
              });

              // Auto Refund if paid
              if (booking.payments && ['PAID_HELD_IN_ESCROW', 'ESCROW_ON_HOLD'].includes(booking.payments.status)) {
                await this.settlementsService.refund(
                  booking.id, 
                  tx, 
                  `Provider đã bị khóa bởi Admin. Lý do: ${reason}`
                );
              }
              
              // Notify Customer
              await this.notificationsService.sendNotification({
                userId: booking.customer_id,
                type: 'BOOKING_CANCELLED',
                title: 'Lịch hẹn đã bị hủy',
                content: 'Đơn đặt lịch của bạn đã bị hủy do Provider hiện không khả dụng. Tiền sẽ được hoàn về ví của bạn (nếu có).',
                bookingId: booking.id,
              }).catch((e) => this.logger.warn(`Failed to send notification: ${(e as Error).message}`));
            }
          }
        }
      }

      // 3. Log to audit_logs
      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'SUSPEND_USER',
          target_type: 'USER',
          target_id: targetUserId,
          old_value: { status: user.status },
          new_value: { status: user_status.SUSPENDED, reason },
          reason: reason,
        },
      });

      return {
        message: 'User suspended successfully',
        userId: targetUserId,
      };
    });
  }

  async reactivateUser(adminId: string, targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== user_status.SUSPENDED) {
      throw new ConflictException('Tài khoản không ở trạng thái khóa');
    }

    // Execute in a transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Update user
      const updatedUser = await tx.user.update({
        where: { id: targetUserId },
        data: {
          status: user_status.ACTIVE,
          suspended_reason: null,
          suspended_at: null,
        },
      });

      // 2. If provider, set to PENDING_REVIEW (strict security standard)
      if (user.role === Role.PROVIDER) {
        const profile = await tx.provider_profiles.findUnique({
          where: { user_id: targetUserId },
        });

        if (profile) {
          await tx.provider_profiles.update({
            where: { user_id: targetUserId },
            data: { status: provider_status.PENDING_REVIEW },
          });
        }
      }

      // 3. Log to audit_logs
      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'REACTIVATE_USER',
          target_type: 'USER',
          target_id: targetUserId,
          old_value: { status: user.status },
          new_value: { status: user_status.ACTIVE },
          reason: 'Admin reactivated user account',
        },
      });

      return {
        message: 'User reactivated successfully',
        userId: targetUserId,
      };
    });
  }

  async getAuditLogs(queryDto: GetAuditLogsDto) {
    const { page, limit, actorId, action, targetType, fromDate, toDate } = queryDto;

    const currentPage = page || 1;
    const currentLimit = limit || 10;
    const skip = (currentPage - 1) * currentLimit;
    const take = currentLimit;

    const whereClause: any = {};

    if (actorId) {
      whereClause.actor_id = actorId;
    }
    if (action) {
      whereClause.action = action;
    }
    if (targetType) {
      whereClause.target_type = targetType;
    }
    if (fromDate || toDate) {
      whereClause.created_at = {};
      if (fromDate) whereClause.created_at.gte = new Date(fromDate);
      if (toDate) whereClause.created_at.lte = new Date(toDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.audit_logs.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.audit_logs.count({ where: whereClause }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    };
  }

  async getConfigs() {
    return this.prisma.system_configs.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateConfigs(adminId: string, configs: { key: string; value: string }[]) {
    return this.prisma.$transaction(async (tx) => {
      const updatedConfigs: any[] = [];

      for (const config of configs) {
        // Upsert logic for system configs
        const updated = await tx.system_configs.upsert({
          where: { key: config.key },
          update: { value: config.value, updated_at: new Date() },
          create: { key: config.key, value: config.value },
        });
        updatedConfigs.push(updated);
      }

      // Log to audit_logs
      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'UPDATE_SYSTEM_CONFIGS',
          target_type: 'SYSTEM_CONFIG',
          target_id: 'GLOBAL',
          old_value: {},
          new_value: { configs },
          reason: 'Cập nhật cấu hình hệ thống',
        },
      });

      return { success: true, data: updatedConfigs };
    });
  }

  async updateUserRole(adminId: string, targetUserId: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === dto.role) {
      throw new ConflictException(`User is already ${dto.role}`);
    }

    const oldRole = user.role;

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: targetUserId },
        data: { role: dto.role },
      });

      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'UPDATE_USER_ROLE',
          target_type: 'USER',
          target_id: targetUserId,
          old_value: { role: oldRole },
          new_value: { role: dto.role },
          reason: `Phân quyền thành ${dto.role}`,
        },
      });

      return {
        message: 'User role updated successfully',
        user: { id: updatedUser.id, role: updatedUser.role },
      };
    });
  }

  async getDeactivationRequests(query: GetDeactivationRequestsDto) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const [requests, total] = await Promise.all([
      this.prisma.account_deactivation_requests.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { requested_at: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true, role: true, status: true },
          },
        },
      }),
      this.prisma.account_deactivation_requests.count({ where: whereClause }),
    ]);

    return {
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveDeactivationRequest(adminId: string, requestId: string) {
    const request = await this.prisma.account_deactivation_requests.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundException('Deactivation request not found');
    }
    if (request.status !== deactivation_status.PENDING) {
      throw new ConflictException(`Request is already ${request.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Soft delete user (similar to self-delete)
      const emailRandomSuffix = `_deleted_${Date.now()}`;
      await tx.user.update({
        where: { id: request.user_id },
        data: {
          status: user_status.DELETED,
          email: `${request.user.email}${emailRandomSuffix}`,
          fullName: 'Người dùng đã xoá',
          phone: null,
          avatarUrl: null,
        },
      });

      // 2. Hide provider profile if exists
      if (request.user.role === Role.PROVIDER) {
        await tx.provider_profiles.updateMany({
          where: { user_id: request.user_id },
          data: { status: provider_status.SUSPENDED },
        });
      }

      // 3. Update request status
      const updatedRequest = await tx.account_deactivation_requests.update({
        where: { id: requestId },
        data: {
          status: deactivation_status.APPROVED,
          processed_at: new Date(),
          admin_note: 'Đã duyệt yêu cầu xoá tài khoản',
        },
      });

      // 4. Log audit
      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'APPROVE_DEACTIVATION',
          target_type: 'USER',
          target_id: request.user_id,
          old_value: { request_status: 'PENDING' },
          new_value: { request_status: 'APPROVED' },
          reason: 'Admin approved deactivation request',
        },
      });

      return {
        message: 'Deactivation request approved successfully',
        request: updatedRequest,
      };
    });
  }

  async rejectDeactivationRequest(adminId: string, requestId: string, dto: RejectDeactivationRequestDto) {
    const request = await this.prisma.account_deactivation_requests.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Deactivation request not found');
    }
    if (request.status !== deactivation_status.PENDING) {
      throw new ConflictException(`Request is already ${request.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.account_deactivation_requests.update({
        where: { id: requestId },
        data: {
          status: deactivation_status.REJECTED,
          processed_at: new Date(),
          admin_note: dto.reason,
        },
      });

      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'REJECT_DEACTIVATION',
          target_type: 'USER',
          target_id: request.user_id,
          old_value: { request_status: 'PENDING' },
          new_value: { request_status: 'REJECTED' },
          reason: `Admin rejected deactivation request: ${dto.reason}`,
        },
      });

      return {
        message: 'Deactivation request rejected successfully',
        request: updatedRequest,
      };
    });
  }
}
