import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { PrismaService } from '../../../../database/prisma.service';
import { WalletsService } from '../../../wallets/application/use-cases/wallets.service';
import { SubscriptionsService } from '../../../growth/subscriptions/subscriptions.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';

export type Tx = Prisma.TransactionClient;
export type GatewaySource = 'VNPay' | 'MoMo' | 'SePay';

/**
 * Mã kết quả nội bộ khi xử lý IPN (dùng chung VNPay/MoMo, trùng quy ước RspCode của VNPay).
 * 00: thành công | 01: không tìm thấy đơn | 02: đã xử lý trước đó | 04: sai số tiền | 97: sai chữ ký | 99: lỗi khác
 */
type IpnCode = '00' | '01' | '02' | '04' | '97' | '99';

const IPN_MESSAGES: Record<IpnCode, string> = {
  '00': 'Confirm Success',
  '01': 'Order not found',
  '02': 'Order already confirmed',
  '04': 'Invalid amount',
  '97': 'Checksum failed',
  '99': 'Unknown error',
};

export const PAID_STATUSES = [
  'PAID_HELD_IN_ESCROW',
  'RELEASE_PENDING',
  'RELEASED_TO_PROVIDER',
  'REFUNDED',
  'PARTIALLY_SETTLED',
];

const MOMO_TEST_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/create';
const VNP_SANDBOX_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ---------------------------------------------------------------------------
  // VNPay
  // ---------------------------------------------------------------------------

  /**
   * Tạo URL thanh toán qua VNPay. Số tiền luôn lấy từ DB (booking.total_price), không tin client.
   */
  async createVNPayUrl(
    bookingId: string,
    customerId: string,
    ipAddress: string,
    promotionCode?: string,
  ): Promise<string> {
    const booking = await this.assertBookingPayable(bookingId, customerId);
    const finalAmount = Math.round(
      await this.calculateFinalAmount(Number(booking.total_price), promotionCode),
    );

    const { tmnCode, secretKey, vnpUrl, returnUrl } = this.getVnpConfig();

    // Mỗi lần thanh toán cần TxnRef mới (VNPay từ chối TxnRef trùng khi khách thử lại)
    const orderId = `${bookingId.replace(/-/g, '').substring(0, 12)}${Date.now()}`;

    const vnp_Params: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan booking ${bookingId}${promotionCode ? ` promo ${promotionCode}` : ''}`,
      vnp_OrderType: 'other',
      vnp_Amount: finalAmount * 100,
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

    await this.upsertPendingPayment(bookingId, booking.customer_id, finalAmount, 'VNPAY', orderId);

    return vnpUrl + '?' + qs.stringify(sortedParams, { encode: false });
  }

  /**
   * Xử lý IPN (và Return URL) từ VNPay.
   */
  async processPaymentCallback(vnp_Params: any): Promise<{ RspCode: string; Message: string }> {
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Chỉ lấy tham số vnp_ để tránh lỗi chữ ký do ngrok/browser tự thêm tham số
    const vnpayParams: Record<string, any> = {};
    for (const key in vnp_Params) {
      if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
        vnpayParams[key] = vnp_Params[key];
      }
    }

    const { secretKey } = this.getVnpConfig();
    const signData = qs.stringify(this.sortObject(vnpayParams), { encode: false });
    const signed = crypto
      .createHmac('sha512', secretKey)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    if (!secureHash || secureHash !== signed) {
      this.logger.error('VNPay IPN: Lỗi xác thực chữ ký (Checksum failed)');
      return this.ipnResponse('97');
    }

    const orderId = String(vnp_Params['vnp_TxnRef'] || '');
    const transactionStatus = vnp_Params['vnp_TransactionStatus'];
    const success =
      vnp_Params['vnp_ResponseCode'] === '00' &&
      (transactionStatus === undefined || transactionStatus === '00');
    const idempotencyKey = String(vnp_Params['vnp_TransactionNo'] || '');
    const orderInfo = String(vnp_Params['vnp_OrderInfo'] || '');
    const paidAmount = Math.round(Number(vnp_Params['vnp_Amount']) / 100);

    // 1. Giao dịch mua gói Subscription
    if (orderInfo.startsWith('SUB_')) {
      if (success) {
        // orderInfo: SUB_userId_tierName
        const parts = orderInfo.split('_');
        if (parts.length >= 3) {
          await this.subscriptionsService.handleSubscriptionSuccess(parts[1], parts.slice(2).join('_'));
        }
      }
      return this.ipnResponse('00');
    }

    // 2. Giao dịch thanh toán Booking
    const promoMatch = orderInfo.match(/promo (\w+)/);
    const code = await this.handleGatewayResult({
      source: 'VNPay',
      orderId,
      success,
      paidAmount,
      idempotencyKey,
      promoCode: promoMatch?.[1],
    });
    return this.ipnResponse(code);
  }

  // ---------------------------------------------------------------------------
  // MoMo
  // ---------------------------------------------------------------------------

  /**
   * Tạo URL thanh toán MoMo. Số tiền luôn lấy từ DB.
   */
  async createMomoUrl(bookingId: string, customerId: string, promotionCode?: string): Promise<string> {
    const booking = await this.assertBookingPayable(bookingId, customerId);
    const finalAmount = Math.round(
      await this.calculateFinalAmount(Number(booking.total_price), promotionCode),
    );

    const { partnerCode, accessKey, secretKey, endpoint } = this.getMomoConfig();

    const requestType = 'captureWallet';
    const orderInfo = `PetCare Booking ${bookingId}${promotionCode ? ` promo ${promotionCode}` : ''}`;
    const backendUrl = this.configService.getOrThrow<string>('BACKEND_URL').replace(/\/$/, '');
    const returnUrl = `${backendUrl}/api/payments/momo-return`;
    const ipnUrl = `${backendUrl}/api/payments/momo-ipn`;
    const extraData = promotionCode ? `promotionCode=${promotionCode}` : '';
    const orderId = `${bookingId}_${Date.now()}`;
    const requestId = orderId;

    const rawSignature = `accessKey=${accessKey}&amount=${finalAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(Buffer.from(rawSignature, 'utf-8'))
      .digest('hex');

    const requestBody = {
      partnerCode,
      partnerName: 'Pet Care',
      storeId: 'PetCareStore',
      requestId,
      amount: finalAmount,
      orderId,
      orderInfo,
      redirectUrl: returnUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    await this.upsertPendingPayment(bookingId, booking.customer_id, finalAmount, 'MOMO', orderId);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      if (data.resultCode !== 0) {
        this.logger.error(`Momo URL creation failed: ${data.message}`, data);
        throw new BadRequestException(`Không thể tạo giao dịch MoMo: ${data.message}`);
      }
      return data.payUrl;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Error calling MoMo API', error);
      throw new BadRequestException('Lỗi kết nối đến cổng thanh toán MoMo');
    }
  }

  /**
   * Xử lý IPN / Return từ MoMo. Chữ ký là BẮT BUỘC.
   */
  async processMomoIPN(momo_Params: any): Promise<{ RspCode: string; Message: string }> {
    const {
      partnerCode, orderId, requestId, amount, orderInfo, orderType,
      transId, resultCode, message, payType, responseTime, extraData, signature,
    } = momo_Params;

    const { accessKey, secretKey } = this.getMomoConfig();

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData || ''}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType || ''}&partnerCode=${partnerCode}&payType=${payType || ''}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(Buffer.from(rawSignature, 'utf-8'))
      .digest('hex');

    if (!signature || signature !== expectedSignature) {
      this.logger.error('Momo IPN: Lỗi xác thực chữ ký (Checksum failed)');
      return this.ipnResponse('97');
    }

    const promoMatch = String(extraData || '').match(/promotionCode=([^&]+)/);
    const code = await this.handleGatewayResult({
      source: 'MoMo',
      orderId: String(orderId || ''),
      success: String(resultCode) === '0',
      paidAmount: Math.round(Number(amount)),
      idempotencyKey: String(transId || ''),
      promoCode: promoMatch?.[1],
    });
    return this.ipnResponse(code);
  }

  // ---------------------------------------------------------------------------
  // Ví PetCare (chỉ chứa tiền hoàn — dùng để trả cho đơn sau)
  // ---------------------------------------------------------------------------

  async checkoutWithWallet(customerId: string, bookingId: string, promotionCode?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id: bookingId },
        include: { payments: true },
      });

      if (!booking) throw new BadRequestException('Không tìm thấy Booking');
      if (booking.customer_id !== customerId) throw new BadRequestException('Booking không thuộc về bạn');
      if (booking.status !== 'PENDING_PAYMENT') throw new ConflictException('Booking không ở trạng thái chờ thanh toán');
      if (booking.payments && PAID_STATUSES.includes(booking.payments.status)) {
        throw new ConflictException('Đơn đặt lịch này đã được thanh toán trước đó');
      }

      const finalAmount = Math.round(
        await this.calculateFinalAmount(Number(booking.total_price), promotionCode, tx),
      );
      const { platformFee, providerAmount } = await this.splitAmount(finalAmount, tx);

      const customerWallet = await tx.wallets.findUnique({ where: { user_id: customerId } });
      if (!customerWallet) throw new BadRequestException('Không tìm thấy ví của Khách hàng');
      if (customerWallet.balance.lessThan(finalAmount)) {
        throw new ConflictException('Số dư trong ví không đủ để thanh toán Booking này');
      }

      // Trừ ví khách
      await this.walletsService.processTransaction(
        customerWallet.id,
        finalAmount,
        'DEBIT',
        bookingId,
        `Thanh toán Booking ${bookingId}`,
        tx,
      );

      const transactionCode = `WALLET_${Date.now()}`;
      const paidData = {
        amount: finalAmount,
        method: 'WALLET' as const,
        status: 'PAID_HELD_IN_ESCROW' as const,
        transaction_code: transactionCode,
        paid_at: new Date(),
        platform_fee: platformFee,
        provider_amount: providerAmount,
      };
      const payment = await tx.payments.upsert({
        where: { booking_id: bookingId },
        update: paidData,
        create: { booking_id: bookingId, customer_id: customerId, ...paidData },
      });

      await this.holdEscrowAndReserveSlot(tx, booking, providerAmount, 'Ký quỹ thanh toán từ Ví Customer (đã trừ phí)');

      if (promotionCode) {
        await this.recordPromotionUsage(tx, promotionCode, customerId, bookingId);
      }

      return { success: true, message: 'Thanh toán bằng ví thành công', payment };
    });

    await this.sendPaymentSuccessNotifications(bookingId, customerId, Number(result.payment.amount));
    return result;
  }

  async getBookingForCheckout(bookingId: string) {
    const booking = await this.prisma.bookings.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }
    return booking;
  }

  // ---------------------------------------------------------------------------
  // Logic dùng chung
  // ---------------------------------------------------------------------------

  /**
   * Xử lý kết quả từ cổng thanh toán (VNPay/MoMo) sau khi đã xác thực chữ ký.
   * - Đối chiếu số tiền thực trả với số tiền đã lưu.
   * - Idempotent: IPN/Return gọi nhiều lần chỉ xử lý một lần.
   * - Khách trả tiền khi đơn đã hết hạn/huỷ => hoàn vào ví khách.
   */
  private async handleGatewayResult(input: {
    source: GatewaySource;
    orderId: string;
    success: boolean;
    paidAmount: number;
    idempotencyKey: string;
    promoCode?: string;
  }): Promise<IpnCode> {
    const { source, orderId, success, paidAmount, idempotencyKey, promoCode } = input;
    // Kết quả được ghi trong transaction, dùng sau commit để gửi thông báo
    const state: {
      outcome: 'CONFIRMED' | 'REFUNDED' | 'FAILED' | 'NOOP';
      ref: { booking_id: string; customer_id: string; amount: number } | null;
    } = { outcome: 'NOOP', ref: null };

    try {
      const code = await this.prisma.$transaction(async (tx): Promise<IpnCode> => {
        if (!orderId) return '01';

        const payment = await tx.payments.findFirst({
          where: { transaction_code: orderId },
          include: { bookings: true },
        });
        if (!payment) return '01';

        if (idempotencyKey && payment.idempotency_key === idempotencyKey) return '02';

        if (Math.round(Number(payment.amount)) !== paidAmount) {
          this.logger.error(
            `${source} IPN: Sai số tiền cho đơn ${orderId} (DB: ${payment.amount}, cổng: ${paidAmount})`,
          );
          return '04';
        }

        state.ref = {
          booking_id: payment.booking_id,
          customer_id: payment.customer_id,
          amount: Number(payment.amount),
        };

        // Khách trả thành công nhưng đơn đã hết hạn giữ chỗ (cron đã VOID) hoặc không còn chờ thanh toán
        const bookingStillPayable = payment.bookings?.status === 'PENDING_PAYMENT';
        if (success && (payment.status === 'VOIDED' || (payment.status === 'PENDING' && !bookingStillPayable))) {
          await this.refundLatePaymentToWallet(tx, payment, idempotencyKey, source);
          state.outcome = 'REFUNDED';
          return '00';
        }

        if (payment.status !== 'PENDING') return '02';

        if (!success) {
          await tx.payments.update({
            where: { id: payment.id },
            data: { status: 'FAILED', idempotency_key: idempotencyKey || null },
          });
          state.outcome = 'FAILED';
          return '00';
        }

        await this.confirmPaidPayment(tx, payment, idempotencyKey, source, promoCode);

        state.outcome = 'CONFIRMED';
        return '00';
      });

      const { ref, outcome } = state;
      if (ref && outcome === 'CONFIRMED') {
        await this.sendPaymentSuccessNotifications(ref.booking_id, ref.customer_id, ref.amount);
      } else if (ref && outcome === 'REFUNDED') {
        await this.safeNotify({
          userId: ref.customer_id,
          type: 'PAYMENT_SUCCESS',
          title: 'Đã hoàn tiền vào ví',
          content: 'Đơn đặt lịch đã hết hạn giữ chỗ trước khi thanh toán hoàn tất. Số tiền đã được hoàn vào Ví PetCare của bạn.',
          bookingId: ref.booking_id,
          actionUrl: `/customer/bookings/${ref.booking_id}`,
          metadata: { bookingId: ref.booking_id, amount: ref.amount },
        });
      }

      return code;
    } catch (error: any) {
      this.logger.error(`${source} IPN Error: ${error.message}`);
      return '99';
    }
  }

  /**
   * Xác nhận một payment PENDING đã được trả đủ tiền: tính phí, ký quỹ cho provider,
   * chuyển booking sang chờ provider và ghi nhận khuyến mãi.
   */
  async confirmPaidPayment(
    tx: Tx,
    payment: {
      id: string;
      booking_id: string;
      customer_id: string;
      amount: Prisma.Decimal | number;
      bookings: { id: string; provider_id: string | null; provider_working_slot_id: string | null };
    },
    idempotencyKey: string,
    source: GatewaySource,
    promoCode?: string | null,
  ) {
    const { platformFee, providerAmount } = await this.splitAmount(Number(payment.amount), tx);
    await tx.payments.update({
      where: { id: payment.id },
      data: {
        status: 'PAID_HELD_IN_ESCROW',
        paid_at: new Date(),
        idempotency_key: idempotencyKey || null,
        platform_fee: platformFee,
        provider_amount: providerAmount,
      },
    });

    await this.holdEscrowAndReserveSlot(
      tx,
      payment.bookings,
      providerAmount,
      `Ký quỹ thanh toán từ ${source} (đã trừ phí hoa hồng)`,
    );

    if (promoCode) {
      await this.recordPromotionUsage(tx, promoCode, payment.customer_id, payment.booking_id);
    }
  }

  /** Cộng tiền hoàn vào ví khách (tạo ví nếu chưa có). */
  async creditCustomerWallet(
    tx: Tx,
    customerId: string,
    amount: Prisma.Decimal | number,
    bookingId: string | null,
    note: string,
  ) {
    const wallet = await tx.wallets.upsert({
      where: { user_id: customerId },
      update: {},
      create: { user_id: customerId },
    });
    await this.walletsService.processTransaction(wallet.id, amount, 'CREDIT', bookingId, note, tx);
  }

  /** Hoàn tiền vào ví khách khi cổng thanh toán báo thành công cho một đơn không còn hợp lệ. */
  private async refundLatePaymentToWallet(
    tx: Tx,
    payment: { id: string; booking_id: string; customer_id: string; amount: Prisma.Decimal },
    idempotencyKey: string,
    source: GatewaySource,
  ) {
    await this.creditCustomerWallet(
      tx,
      payment.customer_id,
      payment.amount,
      payment.booking_id,
      `Hoàn tiền ${source} do đơn ${payment.booking_id} đã hết hạn trước khi thanh toán hoàn tất`,
    );

    await tx.payments.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED',
        paid_at: new Date(),
        idempotency_key: idempotencyKey || null,
      },
    });

    this.logger.warn(`${source}: Thanh toán trễ cho booking ${payment.booking_id} — đã hoàn ${payment.amount} vào ví khách`);
  }

  /** Chuyển booking sang chờ provider, giữ slot, và ký quỹ phần tiền của provider. */
  private async holdEscrowAndReserveSlot(
    tx: Tx,
    booking: { id: string; provider_id: string | null; provider_working_slot_id: string | null },
    providerAmount: number,
    note: string,
  ) {
    await tx.bookings.update({
      where: { id: booking.id },
      data: { status: 'PENDING_PROVIDER_ACCEPTANCE' },
    });

    if (booking.provider_working_slot_id) {
      await tx.provider_working_slots.update({
        where: { id: booking.provider_working_slot_id },
        data: {
          status: 'RESERVED_FOR_PROVIDER_RESPONSE',
          held_until: null,
          reserved_until: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
    }

    if (!booking.provider_id) return;
    const providerProfile = await tx.provider_profiles.findUnique({ where: { id: booking.provider_id } });
    if (!providerProfile) return;
    const providerWallet = await tx.wallets.findUnique({ where: { user_id: providerProfile.user_id } });
    if (!providerWallet) return;

    await this.walletsService.processTransaction(
      providerWallet.id,
      providerAmount,
      'ESCROW_HOLD',
      booking.id,
      note,
      tx,
    );
  }

  /** Kiểm tra booking tồn tại, thuộc về khách, đang chờ thanh toán và chưa được trả. */
  async assertBookingPayable(bookingId: string, customerId: string) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      throw new BadRequestException('Không tìm thấy thông tin đơn đặt lịch');
    }
    if (booking.customer_id !== customerId) {
      throw new BadRequestException('Booking không thuộc về bạn');
    }
    if (booking.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(`Đơn đặt lịch không ở trạng thái chờ thanh toán (trạng thái: ${booking.status})`);
    }
    if (booking.payments && PAID_STATUSES.includes(booking.payments.status)) {
      throw new BadRequestException('Đơn đặt lịch này đã được thanh toán trước đó');
    }
    return booking;
  }

  /** Tính số tiền sau khuyến mãi, validate đầy đủ mã (dùng chung cho mọi phương thức). */
  async calculateFinalAmount(amount: number, promotionCode?: string, client: Tx = this.prisma): Promise<number> {
    if (!promotionCode) return amount;

    const promotion = await client.promotions.findUnique({ where: { code: promotionCode } });

    if (!promotion) throw new BadRequestException('Mã khuyến mãi không tồn tại');
    if (!promotion.is_active) throw new BadRequestException('Mã khuyến mãi đã ngừng hoạt động');

    const now = new Date();
    if (promotion.start_date > now || promotion.end_date < now) {
      throw new BadRequestException('Mã khuyến mãi đã hết hạn hoặc chưa đến ngày áp dụng');
    }
    if (promotion.min_order_value && amount < Number(promotion.min_order_value)) {
      throw new BadRequestException(`Đơn hàng phải tối thiểu ${promotion.min_order_value} để áp dụng mã`);
    }
    if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
      throw new BadRequestException('Mã khuyến mãi đã hết lượt sử dụng');
    }

    let discountAmount = 0;
    if (promotion.discount_percent) {
      discountAmount = amount * (promotion.discount_percent / 100);
    } else if (promotion.discount_amount) {
      discountAmount = Number(promotion.discount_amount);
    }
    if (promotion.max_discount_amount && discountAmount > Number(promotion.max_discount_amount)) {
      discountAmount = Number(promotion.max_discount_amount);
    }

    return Math.max(0, amount - discountAmount);
  }

  /** Chia số tiền thành phí nền tảng và phần của provider. COMMISSION_RATE: .env -> DB -> 10%. */
  private async splitAmount(amount: number, tx: Tx) {
    const envCommission = this.configService.get<string>('COMMISSION_RATE');
    let commissionRate = envCommission ? parseFloat(envCommission) : NaN;
    if (isNaN(commissionRate)) {
      const config = await tx.system_configs.findUnique({ where: { key: 'COMMISSION_RATE' } });
      commissionRate = config && !isNaN(parseFloat(config.value)) ? parseFloat(config.value) : 0.1;
    }
    const platformFee = Math.round(amount * commissionRate);
    return { platformFee, providerAmount: amount - platformFee };
  }

  private async recordPromotionUsage(tx: Tx, promoCode: string, userId: string, bookingId: string) {
    const promotion = await tx.promotions.findUnique({ where: { code: promoCode } });
    if (!promotion) return;

    await tx.promotions.update({
      where: { id: promotion.id },
      data: { used_count: { increment: 1 } },
    });
    await tx.promotion_usages.create({
      data: { promotion_id: promotion.id, user_id: userId, booking_id: bookingId },
    });
  }

  private async upsertPendingPayment(
    bookingId: string,
    customerId: string,
    amount: number,
    method: 'VNPAY' | 'MOMO',
    transactionCode: string,
  ) {
    await this.prisma.payments.upsert({
      where: { booking_id: bookingId },
      update: { amount, method, status: 'PENDING', transaction_code: transactionCode, idempotency_key: null },
      create: {
        booking_id: bookingId,
        customer_id: customerId,
        amount,
        method,
        status: 'PENDING',
        transaction_code: transactionCode,
      },
    });
  }

  async sendPaymentSuccessNotifications(bookingId: string, customerId: string, amount: number) {
    const booking = await this.prisma.bookings
      .findUnique({ where: { id: bookingId }, include: { provider_profiles: true } })
      .catch(() => null);
    if (!booking) return;

    if (booking.provider_profiles?.user_id) {
      await this.safeNotify({
        userId: booking.provider_profiles.user_id,
        type: 'BOOKING_NEW',
        title: 'Đơn đặt lịch mới cần duyệt',
        content: 'Bạn có đơn đặt lịch mới cần duyệt trong vòng 10 phút!',
        bookingId,
        actionUrl: `/provider/bookings/${bookingId}`,
        metadata: { bookingId, amount },
      });
    }

    await this.safeNotify({
      userId: customerId,
      type: 'PAYMENT_SUCCESS',
      title: 'Thanh toán cọc thành công',
      content: 'Tiền đã được ký quỹ an toàn, đang chờ đối tác xác nhận.',
      bookingId,
      actionUrl: `/customer/bookings/${bookingId}`,
      metadata: { bookingId, amount },
    });
  }

  async safeNotify(payload: Parameters<NotificationsService['sendNotification']>[0]) {
    try {
      await this.notificationsService.sendNotification(payload);
    } catch (err: any) {
      this.logger.error(`Error sending payment notification: ${err.message}`);
    }
  }

  private ipnResponse(code: IpnCode) {
    return { RspCode: code, Message: IPN_MESSAGES[code] };
  }

  private getVnpConfig() {
    return {
      tmnCode: this.configService.getOrThrow<string>('VNP_TMN_CODE'),
      secretKey: this.configService.getOrThrow<string>('VNP_HASH_SECRET'),
      vnpUrl: this.configService.get<string>('VNP_URL') || VNP_SANDBOX_URL,
      returnUrl: this.configService.getOrThrow<string>('VNP_RETURN_URL'),
    };
  }

  private getMomoConfig() {
    return {
      partnerCode: this.configService.getOrThrow<string>('MOMO_PARTNER_CODE'),
      accessKey: this.configService.getOrThrow<string>('MOMO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow<string>('MOMO_SECRET_KEY'),
      endpoint: this.configService.get<string>('MOMO_ENDPOINT') || MOMO_TEST_ENDPOINT,
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

  private sortObject(obj: any): any {
    const sorted: Record<string, string> = {};
    const str: string[] = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
}
