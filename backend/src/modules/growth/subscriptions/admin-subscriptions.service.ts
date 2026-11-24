import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, subscription_order_status, subscription_status } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from './dto/subscription-plan.dto';
import { SubscriptionsService } from './subscriptions.service';

/** Admin quản lý các gói hội viên hệ thống bán ra và theo dõi doanh số. */
@Injectable()
export class AdminSubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  /** Tất cả gói (kể cả đã ngừng bán) kèm số liệu bán hàng. */
  async listPlans() {
    const now = new Date();
    const [plans, sales, pending, activeSubs] = await Promise.all([
      this.prisma.subscription_plans.findMany({
        orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
      }),
      this.prisma.subscription_orders.groupBy({
        by: ['plan_id'],
        where: { status: 'PAID' },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      this.prisma.subscription_orders.groupBy({
        by: ['plan_id'],
        where: { status: 'PENDING' },
        _count: { _all: true },
      }),
      // Khách đang có hiệu lực (một khách gia hạn nhiều kỳ vẫn tính 1)
      this.prisma.subscriptions.groupBy({
        by: ['plan_id', 'user_id'],
        where: {
          status: subscription_status.ACTIVE,
          start_date: { lte: now },
          end_date: { gt: now },
        },
      }),
    ]);

    return plans.map((p) => {
      const sold = sales.find((s) => s.plan_id === p.id);
      return {
        ...this.subscriptionsService.toPlanView(p),
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        stats: {
          soldCount: sold?._count._all ?? 0,
          revenue: Number(sold?._sum.amount ?? 0),
          pendingOrders: pending.find((x) => x.plan_id === p.id)?._count._all ?? 0,
          activeSubscribers: activeSubs.filter((a) => a.plan_id === p.id).length,
        },
      };
    });
  }

  async createPlan(dto: CreateSubscriptionPlanDto, adminId: string) {
    const exists = await this.prisma.subscription_plans.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException(`Mã gói ${dto.code} đã tồn tại`);

    const plan = await this.prisma.$transaction(async (tx) => {
      const created = await tx.subscription_plans.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description || null,
          price: dto.price,
          duration_days: dto.durationDays,
          benefits: this.cleanBenefits(dto.benefits),
          is_active: dto.isActive ?? true,
          sort_order: dto.sortOrder ?? 0,
        },
      });
      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'SUBSCRIPTION_PLAN_CREATE',
          target_type: 'SUBSCRIPTION_PLAN',
          target_id: created.id,
          new_value: this.auditSnapshot(created),
        },
      });
      return created;
    });
    return this.subscriptionsService.toPlanView(plan);
  }

  /** Sửa gói. Giá/thời hạn mới chỉ áp cho đơn tạo sau đó; đơn cũ giữ giá đã chụp lại. */
  async updatePlan(id: string, dto: UpdateSubscriptionPlanDto, adminId: string) {
    const plan = await this.prisma.$transaction(async (tx) => {
      const old = await tx.subscription_plans.findUnique({ where: { id } });
      if (!old) throw new NotFoundException('Không tìm thấy gói');

      const updated = await tx.subscription_plans.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description === undefined ? undefined : dto.description || null,
          price: dto.price,
          duration_days: dto.durationDays,
          benefits: dto.benefits === undefined ? undefined : this.cleanBenefits(dto.benefits),
          is_active: dto.isActive,
          sort_order: dto.sortOrder,
        },
      });
      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'SUBSCRIPTION_PLAN_UPDATE',
          target_type: 'SUBSCRIPTION_PLAN',
          target_id: id,
          old_value: this.auditSnapshot(old),
          new_value: this.auditSnapshot(updated),
        },
      });
      return updated;
    });
    return this.subscriptionsService.toPlanView(plan);
  }

  /** Danh sách đơn mua gói (lọc theo trạng thái/gói/tìm theo email, mã CK) + tổng quan. */
  async listOrders(params: {
    status?: string;
    planCode?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.subscription_ordersWhereInput = {};
    if (
      params.status &&
      (Object.values(subscription_order_status) as string[]).includes(params.status)
    ) {
      where.status = params.status as subscription_order_status;
    }
    if (params.planCode) where.plan_code = params.planCode.trim().toUpperCase();
    const q = params.q?.trim();
    if (q) {
      where.OR = [
        { payment_code: { contains: q, mode: 'insensitive' } },
        { gateway_ref: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { fullName: { contains: q, mode: 'insensitive' } } },
      ];
    }
    const take = Math.min(Math.max(Number(params.limit) || 20, 1), 100);
    const page = Math.max(Number(params.page) || 1, 1);

    const [items, total, grouped] = await Promise.all([
      this.prisma.subscription_orders.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * take,
        take,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          subscription: { select: { start_date: true, end_date: true, status: true } },
        },
      }),
      this.prisma.subscription_orders.count({ where }),
      this.prisma.subscription_orders.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { amount: true },
      }),
    ]);

    const summary = Object.fromEntries(
      Object.values(subscription_order_status).map((s) => {
        const row = grouped.find((g) => g.status === s);
        return [s, { count: row?._count._all ?? 0, amount: Number(row?._sum.amount ?? 0) }];
      }),
    );

    return {
      items: items.map((o) => ({
        id: o.id,
        planCode: o.plan_code,
        planName: o.plan_name,
        amount: Number(o.amount),
        durationDays: o.duration_days,
        method: o.method,
        status: o.status,
        paymentCode: o.payment_code,
        transferContent: o.transfer_content,
        gatewayRef: o.gateway_ref,
        paidAt: o.paid_at,
        createdAt: o.created_at,
        customer: o.user ? { id: o.user.id, fullName: o.user.fullName, email: o.user.email } : null,
        subscription: o.subscription
          ? {
              startDate: o.subscription.start_date,
              endDate: o.subscription.end_date,
              status: o.subscription.status,
            }
          : null,
      })),
      total,
      page,
      limit: take,
      summary,
    };
  }

  private cleanBenefits(benefits?: string[]) {
    return (benefits ?? []).map((b) => b.trim()).filter(Boolean);
  }

  private auditSnapshot(p: {
    code: string;
    name: string;
    price: Prisma.Decimal;
    duration_days: number;
    is_active: boolean;
  }): Prisma.InputJsonValue {
    return {
      code: p.code,
      name: p.name,
      price: Number(p.price),
      durationDays: p.duration_days,
      isActive: p.is_active,
    };
  }
}
