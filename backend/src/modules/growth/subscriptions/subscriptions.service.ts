import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, subscription_plans, subscription_status } from '@prisma/client';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { PrismaService } from '../../../database/prisma.service';
import { WalletsService } from '../../wallets/application/use-cases/wallets.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  BankTransferInstructions,
  buildBankTransferInstructions,
  buildTransferContent,
  generateUniquePaymentCode,
  getBankTransferConfig,
} from '../../payments/application/bank-transfer.helpers';

type Tx = Prisma.TransactionClient;
type SubscriptionOrder = Prisma.subscription_ordersGetPayload<object>;

/** Đơn mua gói bỏ dở quá số ngày này sẽ bị huỷ (mã CK hết hiệu lực). */
const ABANDONED_ORDER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface SubscriptionBankTransferCheckout extends BankTransferInstructions {
  orderId: string;
  planCode: string;
  planName: string;
  durationDays: number;
}

/** Kết quả áp một khoản chuyển khoản vào đơn mua gói (dùng bởi webhook SePay). */
export interface SubscriptionTransferResult {
  status: 'MATCHED' | 'REFUNDED_TO_WALLET';
  note?: string;
  /** Gửi thông báo SAU khi transaction commit */
  followUp: SubscriptionFollowUp;
}

export type SubscriptionFollowUp =
  | { kind: 'ACTIVATED'; userId: string; planName: string; endDate: Date; orderId: string }
  | { kind: 'REFUNDED'; userId: string; planName: string; amount: number; reason: string; orderId: string };

/** Nội dung mô tả in sau mã thanh toán, VD "PCABCD234567 Thanh toan goi BASIC". */
export const planTransferDescription = (planCode: string) => `Thanh toan goi ${planCode}`;

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly walletsService: WalletsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ---------------------------------------------------------------------------
  // Khách hàng
  // ---------------------------------------------------------------------------

  /** Các gói đang mở bán (giá lấy từ DB, admin chỉnh được). */
  async listPublicPlans() {
    const plans = await this.prisma.subscription_plans.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { price: 'asc' }],
    });
    return plans.map((p) => this.toPlanView(p));
  }

  /** Gói đang dùng (null nếu chưa có). `expiresAt` tính cả các kỳ gia hạn đã trả trước. */
  async getMySubscription(userId: string) {
    const now = new Date();
    const actives = await this.prisma.subscriptions.findMany({
      where: { user_id: userId, status: subscription_status.ACTIVE, end_date: { gt: now } },
      orderBy: { start_date: 'asc' },
      include: { plan: true },
    });
    if (actives.length === 0) return null;

    const current = actives.find((s) => s.start_date <= now) ?? actives[0];
    const expiresAt = actives.reduce((max, s) => (s.end_date > max ? s.end_date : max), current.end_date);
    return {
      id: current.id,
      planCode: current.tier_name,
      planName: current.plan?.name ?? current.tier_name,
      status: current.status,
      startsAt: current.start_date,
      currentPeriodEndsAt: current.end_date,
      expiresAt,
    };
  }

  /** Lịch sử mua gói của khách (kể cả đơn đang chờ chuyển khoản). */
  async getMyOrders(userId: string) {
    const orders = await this.prisma.subscription_orders.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20,
    });
    return orders.map((o) => this.toOrderView(o));
  }

  /** Trạng thái một đơn mua gói (web hỏi định kỳ khi khách đang chuyển khoản). */
  async getMyOrder(userId: string, orderId: string) {
    const order = await this.prisma.subscription_orders.findFirst({
      where: { id: orderId, user_id: userId },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn mua gói');
    return this.toOrderView(order);
  }

  /** Khách chủ động huỷ đơn mua gói đang chờ thanh toán (PENDING -> CANCELLED). */
  async cancelMyOrder(userId: string, orderId: string) {
    const order = await this.prisma.subscription_orders.findFirst({
      where: { id: orderId, user_id: userId },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn mua gói');
    if (order.status === 'PAID') {
      throw new ConflictException('Đơn mua gói đã được thanh toán, không thể huỷ');
    }
    if (order.status === 'CANCELLED') {
      return this.toOrderView(order);
    }

    await this.prisma.subscription_orders.updateMany({
      where: { id: orderId, user_id: userId, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });

    const updated = await this.prisma.subscription_orders.findUniqueOrThrow({
      where: { id: orderId },
    });
    return this.toOrderView(updated);
  }

  /**
   * Tạo đơn mua gói bằng chuyển khoản VietQR. Nội dung CK: "<mã> Thanh toan goi <MÃ GÓI>".
   * Webhook SePay dò theo mã để kích hoạt gói tự động.
   */
  async checkoutBankTransfer(userId: string, planCode: string): Promise<SubscriptionBankTransferCheckout> {
    const bank = getBankTransferConfig(this.configService);
    const plan = await this.getPurchasablePlan(userId, planCode);
    const amount = Math.round(Number(plan.price));

    // Khách bấm lại cùng gói => dùng lại đơn đang chờ (tránh sinh nhiều mã cho cùng một ý định mua)
    const reusable = await this.prisma.subscription_orders.findFirst({
      where: {
        user_id: userId,
        plan_id: plan.id,
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        amount,
        created_at: { gt: new Date(Date.now() - DAY_MS) },
      },
      orderBy: { created_at: 'desc' },
    });

    const order =
      reusable ??
      (await this.prisma.subscription_orders.create({
        data: await this.newOrderData(userId, plan, 'BANK_TRANSFER', bank.codePrefix),
      }));

    const transferContent =
      order.transfer_content || buildTransferContent(order.payment_code, planTransferDescription(plan.code));

    return {
      ...buildBankTransferInstructions(bank, order.payment_code, amount, transferContent),
      orderId: order.id,
      planCode: plan.code,
      planName: plan.name,
      durationDays: plan.duration_days,
    };
  }

  async checkoutVnpay(userId: string, planCode: string, ipAddress: string) {
    const plan = await this.getPurchasablePlan(userId, planCode);
    const prefix = getBankTransferConfig(this.configService).codePrefix;
    const order = await this.prisma.subscription_orders.create({
      data: await this.newOrderData(userId, plan, 'VNPAY', prefix),
    });

    const tmnCode = this.configService.getOrThrow<string>('VNP_TMN_CODE');
    const secretKey = this.configService.getOrThrow<string>('VNP_HASH_SECRET');
    const vnpUrl =
      this.configService.get<string>('VNP_URL') || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = this.configService.getOrThrow<string>('VNP_RETURN_URL');

    const vnp_Params: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: order.payment_code,
      // Tiền tố SUB_ để IPN phân biệt với thanh toán booking
      vnp_OrderInfo: `SUB_${order.payment_code} ${planTransferDescription(plan.code)}`,
      vnp_OrderType: 'other',
      vnp_Amount: Math.round(Number(order.amount)) * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddress || '127.0.0.1',
      vnp_CreateDate: this.formatDate(new Date()),
    };

    const sortedParams = this.sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    sortedParams['vnp_SecureHash'] = crypto
      .createHmac('sha512', secretKey)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    return { paymentUrl: vnpUrl + '?' + qs.stringify(sortedParams, { encode: false }), orderId: order.id };
  }

  /** Mua gói bằng số dư hoàn tiền trong Ví PetCare. */
  async checkoutWallet(userId: string, planCode: string) {
    const prefix = getBankTransferConfig(this.configService).codePrefix;
    const result = await this.prisma.$transaction(async (tx) => {
      const plan = await this.getPurchasablePlan(userId, planCode, tx);
      const amount = Math.round(Number(plan.price));

      const wallet = await tx.wallets.findUnique({ where: { user_id: userId } });
      if (!wallet || wallet.balance.lessThan(amount)) {
        throw new ConflictException('Số dư ví không đủ để thanh toán gói này');
      }

      const order = await tx.subscription_orders.create({
        data: await this.newOrderData(userId, plan, 'WALLET', prefix, tx),
      });
      await this.walletsService.processTransaction(
        wallet.id,
        amount,
        'DEBIT',
        null,
        `Thanh toán gói ${plan.name} (${plan.code}) — mã ${order.payment_code}`,
        tx,
      );
      const subscription = await this.activateOrder(tx, order, `WALLET_${order.id}`);
      return { order, subscription };
    });

    await this.notifyFollowUp({
      kind: 'ACTIVATED',
      userId,
      planName: result.order.plan_name,
      endDate: result.subscription.end_date,
      orderId: result.order.id,
    });
    return {
      success: true,
      message: 'Đăng ký gói thành công',
      subscription: await this.getMySubscription(userId),
    };
  }

  // ---------------------------------------------------------------------------
  // Cổng thanh toán gọi về
  // ---------------------------------------------------------------------------

  /** IPN VNPay cho đơn mua gói (chữ ký đã được PaymentsService xác thực). Trả RspCode VNPay. */
  async handleVnpayIpn(input: {
    paymentCode: string;
    success: boolean;
    paidAmount: number;
    transactionNo: string;
  }): Promise<'00' | '01' | '02' | '04'> {
    const order = await this.prisma.subscription_orders.findUnique({
      where: { payment_code: input.paymentCode },
    });
    if (!order || order.method !== 'VNPAY') return '01';
    if (order.status === 'PAID' || order.gateway_ref) return '02';
    if (!input.success) return '00';
    if (input.paidAmount !== Math.round(Number(order.amount))) return '04';

    let followUp: SubscriptionFollowUp;
    try {
      followUp = await this.prisma.$transaction(async (tx) => {
        if (order.status === 'PENDING') {
          const sub = await this.activateOrder(tx, order, `VNPAY_${input.transactionNo}`);
          return {
            kind: 'ACTIVATED' as const,
            userId: order.user_id,
            planName: order.plan_name,
            endDate: sub.end_date,
            orderId: order.id,
          };
        }
        // Đơn đã bị huỷ (khách đã mua bằng đơn khác) nhưng VNPay vẫn trừ tiền => hoàn ví
        const reason = 'Đơn mua gói đã bị huỷ trước khi nhận được tiền';
        // Đánh dấu trước (có điều kiện) để IPN lặp lại không hoàn ví 2 lần
        const { count } = await tx.subscription_orders.updateMany({
          where: { id: order.id, gateway_ref: null },
          data: { gateway_ref: `VNPAY_${input.transactionNo}` },
        });
        if (count === 0) throw new ConflictException('Đơn mua gói đã được xử lý');
        await this.creditWallet(tx, order.user_id, input.paidAmount, `Hoàn tiền mua gói ${order.plan_code}: ${reason}`);
        return {
          kind: 'REFUNDED' as const,
          userId: order.user_id,
          planName: order.plan_name,
          amount: input.paidAmount,
          reason,
          orderId: order.id,
        };
      });
    } catch (error) {
      if (error instanceof ConflictException) return '02'; // IPN song song đã xử lý
      throw error;
    }

    await this.notifyFollowUp(followUp);
    return '00';
  }

  /**
   * Áp một khoản chuyển khoản (SePay hoặc admin gán tay) vào đơn mua gói, trong transaction của người gọi.
   * Đủ/dư tiền cho đơn đang chờ => kích hoạt gói (dư hoàn ví); còn lại => hoàn toàn bộ vào ví.
   */
  async applyBankTransfer(
    tx: Tx,
    order: SubscriptionOrder,
    transferAmount: number,
    externalRef: string,
  ): Promise<SubscriptionTransferResult> {
    const expected = Math.round(Number(order.amount));

    if (order.status === 'PENDING' && transferAmount >= expected) {
      const sub = await this.activateOrder(tx, order, externalRef);
      let note: string | undefined;
      const excess = transferAmount - expected;
      if (excess > 0) {
        await this.creditWallet(tx, order.user_id, excess, `Hoàn tiền chuyển dư ${excess}đ khi mua gói ${order.plan_code}`);
        note = `Chuyển dư ${excess}đ — đã hoàn vào ví`;
      }
      return {
        status: 'MATCHED',
        note,
        followUp: {
          kind: 'ACTIVATED',
          userId: order.user_id,
          planName: order.plan_name,
          endDate: sub.end_date,
          orderId: order.id,
        },
      };
    }

    let reason: string;
    if (order.status === 'PENDING') reason = `Chuyển thiếu (${transferAmount}/${expected}đ)`;
    else if (order.status === 'PAID') reason = 'Gói đã được thanh toán trước đó (chuyển trùng)';
    else reason = 'Đơn mua gói đã bị huỷ (đã mua bằng đơn khác hoặc quá hạn)';

    await this.creditWallet(
      tx,
      order.user_id,
      transferAmount,
      `Hoàn tiền chuyển khoản ${transferAmount}đ mua gói ${order.plan_code}: ${reason}`,
    );
    return {
      status: 'REFUNDED_TO_WALLET',
      note: reason,
      followUp: {
        kind: 'REFUNDED',
        userId: order.user_id,
        planName: order.plan_name,
        amount: transferAmount,
        reason,
        orderId: order.id,
      },
    };
  }

  async notifyFollowUp(followUp: SubscriptionFollowUp | undefined) {
    if (!followUp) return;
    try {
      if (followUp.kind === 'ACTIVATED') {
        await this.notificationsService.sendNotification({
          userId: followUp.userId,
          type: 'PAYMENT_SUCCESS',
          title: 'Kích hoạt gói hội viên thành công',
          content: `${followUp.planName} đã được kích hoạt, hiệu lực đến ${followUp.endDate.toLocaleDateString('vi-VN')}.`,
          metadata: { subscriptionOrderId: followUp.orderId },
        });
      } else {
        await this.notificationsService.sendNotification({
          userId: followUp.userId,
          type: 'REFUND_SUCCESS',
          title: 'Đã hoàn tiền vào ví',
          content: `Đã nhận ${followUp.amount.toLocaleString('vi-VN')}đ cho ${followUp.planName} nhưng không thể kích hoạt (${followUp.reason}). Số tiền đã được hoàn vào Ví PetCare.`,
          metadata: { subscriptionOrderId: followUp.orderId, amount: followUp.amount },
        });
      }
    } catch (err: any) {
      this.logger.error(`Không gửi được thông báo gói hội viên: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Nội bộ
  // ---------------------------------------------------------------------------

  /**
   * Gói phải đang mở bán. Nếu khách đang có gói còn hạn thì chỉ được gia hạn CÙNG gói
   * (kỳ mới nối tiếp sau ngày hết hạn hiện tại).
   */
  private async getPurchasablePlan(userId: string, planCode: string, client: Tx | PrismaService = this.prisma) {
    const code = String(planCode || '').trim().toUpperCase();
    const plan = await client.subscription_plans.findUnique({ where: { code } });
    if (!plan || !plan.is_active) {
      throw new NotFoundException('Gói không tồn tại hoặc đã ngừng bán');
    }
    if (Math.round(Number(plan.price)) <= 0) {
      throw new BadRequestException('Giá gói không hợp lệ, vui lòng liên hệ hỗ trợ');
    }

    const active = await client.subscriptions.findFirst({
      where: { user_id: userId, status: subscription_status.ACTIVE, end_date: { gt: new Date() } },
      orderBy: { end_date: 'desc' },
    });
    if (active && active.tier_name !== plan.code) {
      throw new ConflictException(
        `Bạn đang dùng gói ${active.tier_name} đến ${active.end_date.toLocaleDateString('vi-VN')}. ` +
          'Bạn chỉ có thể gia hạn cùng gói, hoặc chọn gói khác sau khi gói hiện tại hết hạn.',
      );
    }
    return plan;
  }

  private async newOrderData(
    userId: string,
    plan: subscription_plans,
    method: 'BANK_TRANSFER' | 'VNPAY' | 'WALLET',
    codePrefix: string,
    client: Tx | PrismaService = this.prisma,
  ): Promise<Prisma.subscription_ordersUncheckedCreateInput> {
    const paymentCode = await generateUniquePaymentCode(codePrefix, async (code) => {
      const [payment, order] = await Promise.all([
        client.payments.findFirst({ where: { transaction_code: code }, select: { id: true } }),
        client.subscription_orders.findUnique({ where: { payment_code: code }, select: { id: true } }),
      ]);
      return Boolean(payment || order);
    });
    return {
      user_id: userId,
      plan_id: plan.id,
      plan_code: plan.code,
      plan_name: plan.name,
      duration_days: plan.duration_days,
      amount: Math.round(Number(plan.price)),
      method,
      status: 'PENDING',
      payment_code: paymentCode,
      transfer_content:
        method === 'BANK_TRANSFER'
          ? buildTransferContent(paymentCode, planTransferDescription(plan.code))
          : null,
    };
  }

  /**
   * Chuyển đơn sang PAID và tạo kỳ hội viên. Kỳ mới bắt đầu ngay, hoặc nối tiếp sau kỳ còn hạn
   * (gia hạn). Các đơn đang chờ khác của khách bị huỷ để không bị trả tiền 2 lần.
   * Ném ConflictException nếu đơn vừa được xử lý ở nơi khác.
   */
  private async activateOrder(tx: Tx, order: SubscriptionOrder, gatewayRef: string) {
    const now = new Date();
    const { count } = await tx.subscription_orders.updateMany({
      where: { id: order.id, status: 'PENDING' },
      data: { status: 'PAID', paid_at: now, gateway_ref: gatewayRef },
    });
    if (count === 0) throw new ConflictException('Đơn mua gói đã được xử lý');

    const latest = await tx.subscriptions.findFirst({
      where: { user_id: order.user_id, status: subscription_status.ACTIVE, end_date: { gt: now } },
      orderBy: { end_date: 'desc' },
    });
    const startDate = latest ? latest.end_date : now;
    const endDate = new Date(startDate.getTime() + order.duration_days * DAY_MS);

    const subscription = await tx.subscriptions.create({
      data: {
        user_id: order.user_id,
        tier_name: order.plan_code,
        plan_id: order.plan_id,
        start_date: startDate,
        end_date: endDate,
        status: subscription_status.ACTIVE,
      },
    });
    await tx.subscription_orders.update({
      where: { id: order.id },
      data: { subscription_id: subscription.id },
    });
    await tx.subscription_orders.updateMany({
      where: { user_id: order.user_id, status: 'PENDING', id: { not: order.id } },
      data: { status: 'CANCELLED' },
    });

    this.logger.log(`Kích hoạt gói ${order.plan_code} cho user ${order.user_id} (đơn ${order.payment_code}, ${gatewayRef})`);
    return subscription;
  }

  private async creditWallet(tx: Tx, userId: string, amount: number, note: string) {
    const wallet = await tx.wallets.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId },
    });
    await this.walletsService.processTransaction(wallet.id, amount, 'CREDIT', null, note, tx);
  }

  toPlanView(p: subscription_plans) {
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      durationDays: p.duration_days,
      benefits: p.benefits,
      isActive: p.is_active,
      sortOrder: p.sort_order,
    };
  }

  private toOrderView(o: SubscriptionOrder) {
    return {
      id: o.id,
      planCode: o.plan_code,
      planName: o.plan_name,
      amount: Number(o.amount),
      durationDays: o.duration_days,
      method: o.method,
      status: o.status,
      paymentCode: o.payment_code,
      transferContent: o.transfer_content,
      paidAt: o.paid_at,
      createdAt: o.created_at,
    };
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear().toString();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
  }

  private sortObject(obj: Record<string, string | number>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).map((k) => encodeURIComponent(k)).sort();
    for (const key of keys) {
      sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, '+');
    }
    return sorted;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSubscriptions() {
    const now = new Date();
    const { count } = await this.prisma.subscriptions.updateMany({
      where: { status: subscription_status.ACTIVE, end_date: { lt: now } },
      data: { status: subscription_status.EXPIRED },
    });
    // Đơn chờ thanh toán bỏ dở quá lâu => huỷ (tiền chuyển muộn vào mã này sẽ được hoàn ví)
    const abandoned = await this.prisma.subscription_orders.updateMany({
      where: { status: 'PENDING', created_at: { lt: new Date(now.getTime() - ABANDONED_ORDER_DAYS * DAY_MS) } },
      data: { status: 'CANCELLED' },
    });
    this.logger.log(`Gói hết hạn: ${count}; đơn mua gói bỏ dở bị huỷ: ${abandoned.count}`);
  }
}
