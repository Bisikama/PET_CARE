import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { SuspendUserDto } from '../../dto/suspend-user.dto';
import { GetAuditLogsDto } from '../../dto/get-audit-logs.dto';
import { Role, user_status, provider_status } from '@prisma/client';

@Injectable()
export class AdminCoreService {
  constructor(private readonly prisma: PrismaService) {}

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

      // 2. If provider, suspend profile
      if (user.role === Role.PROVIDER) {
        const profile = await tx.provider_profiles.findUnique({
          where: { user_id: targetUserId },
        });

        if (profile) {
          await tx.provider_profiles.update({
            where: { user_id: targetUserId },
            data: { status: provider_status.SUSPENDED },
          });
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
}
