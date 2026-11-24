import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, bank_transaction_status } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../../../../database/prisma.service';
import { PaymentsService } from './payments.service';
import {
  SubscriptionFollowUp,
  SubscriptionsService,
} from '../../../growth/subscriptions/subscriptions.service';
import {
  CODE_ALPHABET,
  CODE_RANDOM_LENGTH,
  buildBankTransferInstructions,
  buildTransferContent,
  generateUniquePaymentCode,
  getBankTransferConfig,
} from '../bank-transfer.helpers';
import { DEFAULT_PAYMENT_HOLD_MINUTES } from '../../../provider-schedules/application/cron/release-held-slots.cron';

/** Payload SePay POST về webhook (https://docs.sepay.vn/tich-hop-webhooks.html). */
export interface SepayWebhookPayload {
  id: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  subAccount?: string | null;
  code?: string | null;
  content?: string;
  transferType?: 'in' | 'out' | string;
  description?: string;
  transferAmount: number | string;
  accumulated?: number | string;
  referenceCode?: string;
}

export interface BankTransferCheckout {
  paymentCode: string;
  amount: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
  qrImageUrl: string;
  /** Hết thời gian giữ chỗ (ISO). Chuyển sau mốc này => tiền được hoàn vào ví. */
  expiresAt: string;
}

const DEFAULT_BANK_TRANSFER_HOLD_MINUTES = 30;

type WebhookOutcome = {
  status: bank_transaction_status | 'DUPLICATE';
  note?: string;
};

type PaymentWithBooking = Prisma.paymentsGetPayload<{ include: { bookings: true } }>;

/** Việc cần làm sau khi transaction commit (gửi thông báo). */
type FollowUp = {
  confirmed?: { bookingId: string; customerId: string; amount: number };
  refunded?: { bookingId: string; customerId: string; amount: number; reason: string };
  subscription?: SubscriptionFollowUp;
};

type SubscriptionOrder = Prisma.subscription_ordersGetPayload<object>;

/** Kết quả áp tiền vào một đơn (booking hoặc gói hội viên). */
type ApplyDecision = {
  status: bank_transaction_status;
  note?: string;
  paymentId: string | null;
  subscriptionOrderId: string | null;
};

export type AdminResolveAction =
  | { action: 'ASSIGN'; paymentCode?: string; bookingId?: string; reason: string }
  | { action: 'CREDIT_WALLET'; customerEmail: string; reason: string }
  | { action: 'MARK_RESOLVED'; reason: string };


@Injectable()
export class SepayService {
  private readonly logger = new Logger(SepayService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  // ---------------------------------------------------------------------------
  // Tạo đơn chuyển khoản VietQR
  // ---------------------------------------------------------------------------

  async createBankTransferCheckout(
    bookingId: string,
    customerId: string,
    promotionCode?: string,
  ): Promise<BankTransferCheckout> {
    const bank = getBankTransferConfig(this.configService);
    const booking = await this.paymentsService.assertBookingPayable(bookingId, customerId);
    // Đơn đã áp mã lúc tạo => total_price đã giảm, không áp lại
    promotionCode = this.paymentsService.effectivePromoCode(booking, promotionCode);
    const amount = Math.round(
      await this.paymentsService.calculateFinalAmount(Number(booking.total_price), promotionCode),
    );

    if (amount <= 0) {
      throw new BadRequestException(
        'Đơn hàng 0đ không cần chuyển khoản, vui lòng thanh toán bằng ví',
      );
    }

    // Chuyển khoản cần nhiều thời gian hơn cổng online => gia hạn giữ chỗ (tính từ lúc tạo đơn)
    const expiresAt = await this.extendHoldForBankTransfer(booking);

    // Mỗi lần thanh toán một mã mới: mã cũ (nếu khách vẫn chuyển) sẽ không khớp đơn nữa
    const paymentCode = await generateUniquePaymentCode(bank.codePrefix, (code) =>
      this.isPaymentCodeTaken(code),
    );
    // VD: "PCABCD234567 Thanh toan goi Basic Bath" — khách/admin đọc sao kê biết trả cho gói nào
    const transferContent = buildTransferContent(
      paymentCode,
      `Thanh toan ${await this.describeBooking(bookingId)}`,
    );

    await this.prisma.payments.upsert({
      where: { booking_id: bookingId },
      update: {
        amount,
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        transaction_code: paymentCode,
        idempotency_key: null,
        promotion_code: promotionCode || null,
      },
      create: {
        booking_id: bookingId,
        customer_id: booking.customer_id,
        amount,
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        transaction_code: paymentCode,
        promotion_code: promotionCode || null,
      },
    });

    return {
      ...buildBankTransferInstructions(bank, paymentCode, amount, transferContent),
      expiresAt: expiresAt.toISOString(),
    };
  }

  /** Tên dịch vụ của đơn để in vào nội dung CK (không dấu, gọn). */
  private async describeBooking(bookingId: string): Promise<string> {
    const services = await this.prisma.booking_services.findMany({
      where: { booking_pets: { booking_id: bookingId } },
      select: { service_name: true },
    });
    const names = [...new Set(services.map((s) => s.service_name?.trim()).filter(Boolean))];
    if (names.length === 0) return 'dat lich PetCare';
    return names.length === 1 ? `goi ${names[0]}` : `goi ${names[0]} va ${names.length - 1} goi khac`;
  }

  /** Mã thanh toán dùng chung một dải cho booking và gói hội viên (webhook dò cả hai). */
  private async isPaymentCodeTaken(code: string): Promise<boolean> {
    const [payment, order] = await Promise.all([
      this.prisma.payments.findFirst({ where: { transaction_code: code }, select: { id: true } }),
      this.prisma.subscription_orders.findUnique({
        where: { payment_code: code },
        select: { id: true },
      }),
    ]);
    return Boolean(payment || order);
  }

  /**
   * Gia hạn slot đang giữ cho đơn chuyển khoản tới `created_at + BANK_TRANSFER_HOLD_MINUTES`.
   * Mốc tính từ lúc TẠO ĐƠN nên lấy mã QR nhiều lần cũng không kéo dài thêm được.
   * Trả về thời điểm hết hạn giữ chỗ.
   */
  private async extendHoldForBankTransfer(booking: {
    id: string;
    created_at: Date | null;
    provider_working_slot_id: string | null;
  }): Promise<Date> {
    const createdAt = booking.created_at ?? new Date();
    const deadline = new Date(createdAt.getTime() + this.getBankTransferHoldMinutes() * 60_000);

    // Không có slot: cron dùng mốc mặc định 10 phút từ lúc tạo đơn, không gia hạn được
    if (!booking.provider_working_slot_id) {
      return new Date(createdAt.getTime() + DEFAULT_PAYMENT_HOLD_MINUTES * 60_000);
    }

    const slot = await this.prisma.provider_working_slots.findUnique({
      where: { id: booking.provider_working_slot_id },
      select: { status: true, held_until: true },
    });
    if (!slot || slot.status !== 'HELD_FOR_PAYMENT') {
      throw new BadRequestException(
        'Khung giờ không còn được giữ cho đơn này, vui lòng đặt lịch lại',
      );
    }

    const current = slot.held_until;
    if (current && current.getTime() >= deadline.getTime()) return current;
    if (current && current.getTime() <= Date.now()) {
      throw new BadRequestException('Đơn đã hết thời gian giữ chỗ, vui lòng đặt lịch lại');
    }

    // Cập nhật có điều kiện: nếu cron vừa giải phóng slot thì count = 0
    const { count } = await this.prisma.provider_working_slots.updateMany({
      where: {
        id: booking.provider_working_slot_id,
        status: 'HELD_FOR_PAYMENT',
        held_until: current,
      },
      data: { held_until: deadline },
    });
    if (count === 0) {
      throw new ConflictException('Đơn vừa hết thời gian giữ chỗ, vui lòng đặt lịch lại');
    }
    return deadline;
  }

  private getBankTransferHoldMinutes(): number {
    const minutes = Number(this.configService.get<string>('BANK_TRANSFER_HOLD_MINUTES'));
    if (!Number.isFinite(minutes) || minutes <= 0) return DEFAULT_BANK_TRANSFER_HOLD_MINUTES;
    // Giới hạn hợp lý: không ngắn hơn mặc định, không giữ slot của provider quá 2 tiếng
    return Math.min(Math.max(Math.round(minutes), DEFAULT_PAYMENT_HOLD_MINUTES), 120);
  }

  // ---------------------------------------------------------------------------
  // Webhook SePay
  // ---------------------------------------------------------------------------

  /** Xác thực header `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`. Thiếu cấu hình => từ chối hết. */
  verifyWebhookAuth(authorizationHeader: string | undefined) {
    const apiKey = this.configService.get<string>('SEPAY_WEBHOOK_API_KEY');
    if (!apiKey) {
      this.logger.error('SEPAY_WEBHOOK_API_KEY chưa được cấu hình — từ chối mọi webhook SePay');
      throw new UnauthorizedException('Webhook not configured');
    }

    const expected = Buffer.from(`Apikey ${apiKey}`);
    const received = Buffer.from(String(authorizationHeader || '').trim());
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
      this.logger.warn('SePay webhook: sai API key');
      throw new UnauthorizedException('Invalid API key');
    }
  }

  async handleWebhook(payload: SepayWebhookPayload): Promise<WebhookOutcome> {
    const externalId = payload?.id !== undefined && payload?.id !== null ? String(payload.id) : '';
    const transferAmount = Math.round(Number(payload?.transferAmount));
    if (!externalId || !Number.isFinite(transferAmount)) {
      throw new BadRequestException('Payload SePay không hợp lệ');
    }

    const existing = await this.prisma.bank_transactions.findUnique({
      where: { provider_external_id: { provider: 'SEPAY', external_id: externalId } },
    });
    if (existing) return { status: 'DUPLICATE' };

    const followUp: FollowUp = {};

    let outcome: WebhookOutcome;
    try {
      outcome = await this.prisma.$transaction(async (tx) => {
        const decision = await this.applyTransaction(
          tx,
          payload,
          externalId,
          transferAmount,
          followUp,
        );

        // Ghi sổ CUỐI CÙNG: nếu trùng id (2 webhook song song) => unique violation => rollback toàn bộ
        await tx.bank_transactions.create({
          data: {
            provider: 'SEPAY',
            external_id: externalId,
            gateway: payload.gateway || null,
            account_number: payload.accountNumber || null,
            transaction_date: this.parseDate(payload.transactionDate),
            transfer_type: String(payload.transferType || ''),
            transfer_amount: transferAmount,
            content: payload.content || null,
            code: decision.code,
            reference_code: payload.referenceCode || null,
            status: decision.status,
            note: decision.note || null,
            payment_id: decision.paymentId,
            subscription_order_id: decision.subscriptionOrderId,
            raw_payload: payload as unknown as Prisma.InputJsonValue,
          },
        });

        return { status: decision.status, note: decision.note };
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { status: 'DUPLICATE' };
      }
      this.logger.error(`SePay webhook lỗi (id=${externalId}): ${error.message}`);
      throw new InternalServerErrorException('Không xử lý được giao dịch');
    }

    await this.sendFollowUpNotifications(followUp);
    this.logger.log(
      `SePay webhook id=${externalId}: ${outcome.status}${outcome.note ? ` — ${outcome.note}` : ''}`,
    );
    return outcome;
  }

  async listBankTransactions(status?: string, page = 1, limit = 20, search?: string) {
    const where: Prisma.bank_transactionsWhereInput = {};
    if (
      status &&
      Object.values(bank_transaction_status).includes(status as bank_transaction_status)
    ) {
      where.status = status as bank_transaction_status;
    }
    const q = search?.trim();
    if (q) {
      where.OR = [
        { content: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { reference_code: { contains: q, mode: 'insensitive' } },
        { external_id: q },
      ];
    }
    const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [items, total, grouped] = await Promise.all([
      this.prisma.bank_transactions.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take,
        select: {
          id: true,
          external_id: true,
          gateway: true,
          account_number: true,
          transaction_date: true,
          transfer_type: true,
          transfer_amount: true,
          content: true,
          code: true,
          reference_code: true,
          status: true,
          note: true,
          payment_id: true,
          resolved_at: true,
          created_at: true,
          resolver: { select: { id: true, fullName: true, email: true } },
          payments: { select: { booking_id: true, amount: true, status: true } },
          subscription_order: {
            select: {
              id: true,
              plan_code: true,
              plan_name: true,
              amount: true,
              status: true,
              payment_code: true,
              user: { select: { email: true, fullName: true } },
            },
          },
        },
      }),
      this.prisma.bank_transactions.count({ where }),
      this.prisma.bank_transactions.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { transfer_amount: true },
      }),
    ]);

    // Tổng quan theo trạng thái (không áp bộ lọc) — để admin thấy ngay còn bao nhiêu tiền chưa xử lý
    const summary = Object.fromEntries(
      Object.values(bank_transaction_status).map((s) => {
        const row = grouped.find((g) => g.status === s);
        return [
          s,
          { count: row?._count._all ?? 0, amount: Number(row?._sum.transfer_amount ?? 0) },
        ];
      }),
    );

    return { items, total, page: Math.max(Number(page) || 1, 1), limit: take, summary };
  }

  // ---------------------------------------------------------------------------
  // Admin xử lý giao dịch UNMATCHED
  // ---------------------------------------------------------------------------

  /**
   * Admin xử lý một giao dịch chưa khớp đơn. Chỉ áp dụng khi giao dịch còn UNMATCHED
   * (khoá bằng điều kiện trạng thái => 2 admin không xử lý trùng). Mọi thao tác ghi audit log.
   */
  async adminResolve(bankTransactionId: string, adminId: string, input: AdminResolveAction) {
    const reason = String(input?.reason || '').trim();
    if (reason.length < 5) {
      throw new BadRequestException('Vui lòng nhập lý do xử lý (tối thiểu 5 ký tự)');
    }

    const followUp: FollowUp = {};
    let walletNotice: { userId: string; amount: number } | null = null;

    const result = await this.prisma.$transaction(async (tx) => {
      const txn = await tx.bank_transactions.findUnique({ where: { id: bankTransactionId } });
      if (!txn) throw new NotFoundException('Không tìm thấy giao dịch');
      if (txn.status !== 'UNMATCHED') {
        throw new ConflictException(`Giao dịch đã được xử lý (trạng thái: ${txn.status})`);
      }

      const transferAmount = Math.round(Number(txn.transfer_amount));
      let decision: ApplyDecision;
      let auditTarget: Record<string, unknown>;

      switch (input.action) {
        case 'ASSIGN': {
          const paymentCode = input.paymentCode?.trim().toUpperCase();
          const bookingId = input.bookingId?.trim();
          if (!paymentCode && !bookingId) {
            throw new BadRequestException('Nhập mã thanh toán hoặc Booking ID cần gán');
          }
          // Mã thanh toán có thể thuộc đơn mua gói hội viên
          const subscriptionOrder = paymentCode
            ? await tx.subscription_orders.findUnique({ where: { payment_code: paymentCode } })
            : null;
          if (subscriptionOrder) {
            const applied = await this.applyToSubscriptionOrder(
              tx,
              subscriptionOrder,
              transferAmount,
              txn.external_id,
              followUp,
            );
            decision = {
              ...applied,
              note: `[Admin gán đơn mua gói] ${applied.note ? applied.note + ' — ' : ''}${reason}`,
            };
            auditTarget = {
              subscriptionOrderId: subscriptionOrder.id,
              planCode: subscriptionOrder.plan_code,
              result: applied.status,
            };
            break;
          }

          const payment = await tx.payments.findFirst({
            where: paymentCode
              ? { transaction_code: paymentCode, method: 'BANK_TRANSFER' }
              : { booking_id: bookingId },
            include: { bookings: true },
          });
          if (!payment) throw new NotFoundException('Không tìm thấy đơn thanh toán tương ứng');

          const applied = await this.applyToPayment(
            tx,
            payment,
            transferAmount,
            txn.external_id,
            followUp,
          );
          decision = {
            ...applied,
            note: `[Admin gán đơn] ${applied.note ? applied.note + ' — ' : ''}${reason}`,
          };
          auditTarget = {
            paymentId: payment.id,
            bookingId: payment.booking_id,
            result: applied.status,
          };
          break;
        }

        case 'CREDIT_WALLET': {
          const email = String(input.customerEmail || '')
            .trim()
            .toLowerCase();
          if (!email) throw new BadRequestException('Nhập email khách hàng cần hoàn tiền');
          const user = await tx.user.findUnique({ where: { email } });
          if (!user) throw new NotFoundException(`Không tìm thấy người dùng ${email}`);

          await this.paymentsService.creditCustomerWallet(
            tx,
            user.id,
            transferAmount,
            null,
            `Hoàn tiền chuyển khoản ${transferAmount}đ (admin xử lý): ${reason}`,
          );
          decision = {
            status: 'REFUNDED_TO_WALLET',
            note: `[Admin hoàn ví ${email}] ${reason}`,
            paymentId: null,
            subscriptionOrderId: null,
          };
          auditTarget = { userId: user.id, email };
          walletNotice = { userId: user.id, amount: transferAmount };
          break;
        }

        case 'MARK_RESOLVED': {
          decision = {
            status: 'RESOLVED_MANUALLY',
            note: `[Admin xử lý ngoài hệ thống] ${reason}`,
            paymentId: null,
            subscriptionOrderId: null,
          };
          auditTarget = {};
          break;
        }

        default:
          throw new BadRequestException('Thao tác không hợp lệ');
      }

      // Cập nhật có điều kiện: nếu admin khác vừa xử lý xong thì count = 0 => rollback
      const { count } = await tx.bank_transactions.updateMany({
        where: { id: txn.id, status: 'UNMATCHED' },
        data: {
          status: decision.status,
          note: decision.note,
          payment_id: decision.paymentId ?? txn.payment_id,
          subscription_order_id: decision.subscriptionOrderId ?? txn.subscription_order_id,
          resolved_by: adminId,
          resolved_at: new Date(),
        },
      });
      if (count === 0) throw new ConflictException('Giao dịch vừa được admin khác xử lý');

      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: `BANK_TXN_${input.action}`,
          target_type: 'BANK_TRANSACTION',
          target_id: txn.id,
          old_value: { status: txn.status, note: txn.note },
          new_value: {
            status: decision.status,
            amount: transferAmount,
            externalId: txn.external_id,
            ...auditTarget,
          } as Prisma.InputJsonValue,
          reason,
        },
      });

      return { id: txn.id, status: decision.status, note: decision.note };
    });

    // Gửi thông báo SAU khi commit
    await this.sendFollowUpNotifications(followUp);
    const notice = walletNotice as { userId: string; amount: number } | null;
    if (notice) {
      await this.paymentsService.safeNotify({
        userId: notice.userId,
        type: 'PAYMENT_SUCCESS',
        title: 'Đã hoàn tiền vào ví',
        content: `Khoản chuyển khoản ${notice.amount.toLocaleString('vi-VN')}đ đã được hoàn vào Ví PetCare của bạn.`,
        metadata: { amount: notice.amount, bankTransactionId },
      });
    }
    this.logger.log(`Admin ${adminId} xử lý giao dịch ${bankTransactionId}: ${result.status}`);
    return result;
  }

  // ---------------------------------------------------------------------------
  // Nội bộ
  // ---------------------------------------------------------------------------

  private async applyTransaction(
    tx: Prisma.TransactionClient,
    payload: SepayWebhookPayload,
    externalId: string,
    transferAmount: number,
    followUp: FollowUp,
  ): Promise<ApplyDecision & { code: string | null }> {
    const none = { paymentId: null, subscriptionOrderId: null };
    const bank = getBankTransferConfig(this.configService);
    const code = this.extractPaymentCode(payload, bank.codePrefix);

    if (payload.transferType !== 'in') {
      return { status: 'IGNORED', note: 'Giao dịch tiền ra', code, ...none };
    }

    const receivingAccounts = [payload.accountNumber, payload.subAccount]
      .filter(Boolean)
      .map(String);
    if (!receivingAccounts.includes(bank.accountNumber)) {
      return {
        status: 'IGNORED',
        note: `Tài khoản nhận khác ${bank.accountNumber}`,
        code,
        ...none,
      };
    }

    if (transferAmount <= 0) {
      return { status: 'IGNORED', note: 'Số tiền không hợp lệ', code, ...none };
    }

    if (!code) {
      return {
        status: 'UNMATCHED',
        note: 'Không tìm thấy mã thanh toán trong nội dung CK',
        code,
        ...none,
      };
    }

    const payment = await tx.payments.findFirst({
      where: { transaction_code: code, method: 'BANK_TRANSFER' },
      include: { bookings: true },
    });
    if (!payment) {
      // Không phải booking => có thể là đơn mua gói hội viên
      const subscriptionOrder = await tx.subscription_orders.findUnique({
        where: { payment_code: code },
      });
      if (subscriptionOrder) {
        const applied = await this.applyToSubscriptionOrder(
          tx,
          subscriptionOrder,
          transferAmount,
          externalId,
          followUp,
        );
        return { ...applied, code };
      }
      return { status: 'UNMATCHED', note: `Mã ${code} không khớp đơn nào`, code, ...none };
    }

    const applied = await this.applyToPayment(tx, payment, transferAmount, externalId, followUp);
    return { ...applied, code };
  }

  /**
   * Áp một khoản tiền vào payment chuyển khoản (dùng chung cho webhook và admin gán thủ công):
   * trả đủ/dư cho đơn còn hợp lệ => xác nhận; còn lại => hoàn toàn bộ khoản tiền vào ví khách.
   */
  private async applyToPayment(
    tx: Prisma.TransactionClient,
    payment: PaymentWithBooking,
    transferAmount: number,
    externalId: string,
    followUp: FollowUp,
  ): Promise<ApplyDecision> {
    const expected = Math.round(Number(payment.amount));
    const payable = payment.status === 'PENDING' && payment.bookings?.status === 'PENDING_PAYMENT';

    // 1. Trả đủ (hoặc dư) cho đơn còn hợp lệ => xác nhận
    if (payable && transferAmount >= expected) {
      await this.paymentsService.confirmPaidPayment(
        tx,
        payment,
        `SEPAY_${externalId}`,
        'SePay',
        payment.promotion_code,
      );

      let note: string | undefined;
      const excess = transferAmount - expected;
      if (excess > 0) {
        await this.paymentsService.creditCustomerWallet(
          tx,
          payment.customer_id,
          excess,
          payment.booking_id,
          `Hoàn tiền chuyển dư ${excess}đ cho đơn ${payment.booking_id}`,
        );
        note = `Chuyển dư ${excess}đ — đã hoàn vào ví`;
      }

      followUp.confirmed = {
        bookingId: payment.booking_id,
        customerId: payment.customer_id,
        amount: expected,
      };
      return { status: 'MATCHED', note, paymentId: payment.id, subscriptionOrderId: null };
    }

    // 2. Còn lại: chuyển thiếu / đơn đã hết hạn / đơn đã được trả => hoàn toàn bộ khoản này vào ví
    let reason: string;
    if (payable) {
      reason = `Chuyển thiếu (${transferAmount}/${expected}đ)`;
    } else if (PAID_OR_SETTLED.includes(payment.status)) {
      reason = 'Đơn đã được thanh toán trước đó (chuyển trùng)';
    } else {
      reason = 'Đơn đã hết hạn hoặc bị huỷ trước khi nhận được tiền';
      if (payment.status === 'PENDING' || payment.status === 'VOIDED') {
        await tx.payments.update({
          where: { id: payment.id },
          data: {
            status: 'REFUNDED',
            refunded_at: new Date(),
            idempotency_key: `SEPAY_${externalId}`,
          },
        });
      }
    }

    await this.paymentsService.creditCustomerWallet(
      tx,
      payment.customer_id,
      transferAmount,
      payment.booking_id,
      `Hoàn tiền chuyển khoản ${transferAmount}đ: ${reason}`,
    );

    followUp.refunded = {
      bookingId: payment.booking_id,
      customerId: payment.customer_id,
      amount: transferAmount,
      reason,
    };
    return {
      status: 'REFUNDED_TO_WALLET',
      note: reason,
      paymentId: payment.id,
      subscriptionOrderId: null,
    };
  }

  /** Khoản chuyển khoản cho đơn mua gói hội viên: đủ tiền => kích hoạt gói, còn lại => hoàn ví. */
  private async applyToSubscriptionOrder(
    tx: Prisma.TransactionClient,
    order: SubscriptionOrder,
    transferAmount: number,
    externalId: string,
    followUp: FollowUp,
  ): Promise<ApplyDecision> {
    const result = await this.subscriptionsService.applyBankTransfer(
      tx,
      order,
      transferAmount,
      `SEPAY_${externalId}`,
    );
    followUp.subscription = result.followUp;
    return {
      status: result.status,
      note: `[Gói ${order.plan_code}]${result.note ? ' ' + result.note : ''}`,
      paymentId: null,
      subscriptionOrderId: order.id,
    };
  }

  private async sendFollowUpNotifications(followUp: FollowUp) {
    await this.subscriptionsService.notifyFollowUp(followUp.subscription);
    if (followUp.confirmed) {
      const { bookingId, customerId, amount } = followUp.confirmed;
      await this.paymentsService.sendPaymentSuccessNotifications(bookingId, customerId, amount);
    }
    if (followUp.refunded) {
      const { bookingId, customerId, amount, reason } = followUp.refunded;
      await this.paymentsService.safeNotify({
        userId: customerId,
        type: 'PAYMENT_SUCCESS',
        title: 'Đã hoàn tiền vào ví',
        content: `Đã nhận ${amount.toLocaleString('vi-VN')}đ nhưng không thể xác nhận đơn (${reason}). Số tiền đã được hoàn vào Ví PetCare.`,
        bookingId,
        actionUrl: `/customer/bookings/${bookingId}`,
        metadata: { bookingId, amount },
      });
    }
  }

  /** Lấy mã thanh toán: ưu tiên trường `code` SePay đã nhận diện, nếu không thì dò trong nội dung CK. */
  private extractPaymentCode(payload: SepayWebhookPayload, prefix: string): string | null {
    const pattern = new RegExp(`${prefix}[${CODE_ALPHABET}]{${CODE_RANDOM_LENGTH}}`, 'i');
    for (const source of [payload.code, payload.content, payload.description]) {
      const match = String(source || '')
        .toUpperCase()
        .replace(/\s+/g, '')
        .match(pattern);
      if (match) return match[0].toUpperCase();
    }
    return null;
  }

  private parseDate(value?: string): Date | null {
    if (!value) return null;
    // SePay gửi "YYYY-MM-DD HH:mm:ss" theo giờ Việt Nam
    const date = new Date(`${value.replace(' ', 'T')}+07:00`);
    return isNaN(date.getTime()) ? null : date;
  }
}

const PAID_OR_SETTLED: string[] = [
  'PAID_HELD_IN_ESCROW',
  'RELEASE_PENDING',
  'RELEASED_TO_PROVIDER',
  'PARTIALLY_SETTLED',
  'REFUNDED',
  'REFUND_PENDING',
];
