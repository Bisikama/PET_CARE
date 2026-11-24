import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../database/prisma.service';
import { WalletsService } from '../../../wallets/application/use-cases/wallets.service';
import { SubscriptionsService } from '../../../growth/subscriptions/subscriptions.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as qs from 'qs';

const CONFIG: Record<string, string> = {
  VNP_TMN_CODE: 'TMN',
  VNP_HASH_SECRET: 'secret',
  VNP_RETURN_URL: 'https://backend.example.test/api/payments/vnpay-return',
  MOMO_PARTNER_CODE: 'MOMO',
  MOMO_ACCESS_KEY: 'valid_access_key',
  MOMO_SECRET_KEY: 'valid_secret_key',
  BACKEND_URL: 'https://backend.example.test',
  COMMISSION_RATE: '0.1',
};

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockPrisma: any = {
    promotions: { findUnique: jest.fn(), update: jest.fn() },
    promotion_usages: { create: jest.fn() },
    payments: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), upsert: jest.fn() },
    bookings: { findUnique: jest.fn(), update: jest.fn() },
    provider_working_slots: { update: jest.fn() },
    wallets: { findUnique: jest.fn(), upsert: jest.fn() },
    provider_profiles: { findUnique: jest.fn() },
    system_configs: { findUnique: jest.fn() },
    $transaction: jest.fn(async (cb) => cb(mockPrisma)),
  };

  const mockWalletsService = { processTransaction: jest.fn() };
  const mockSubscriptionsService = { handleVnpayIpn: jest.fn() };
  const mockNotificationsService = { sendNotification: jest.fn() };
  const mockConfig = {
    get: jest.fn((key: string) => CONFIG[key]),
    getOrThrow: jest.fn((key: string) => {
      if (!(key in CONFIG)) throw new Error(`missing ${key}`);
      return CONFIG[key];
    }),
  };

  const pendingBooking = {
    id: 'booking-123',
    customer_id: 'cust-1',
    status: 'PENDING_PAYMENT',
    total_price: 100000,
    provider_id: 'provider-1',
    provider_working_slot_id: 'slot-1',
    payments: null,
  };

  const signVnp = (params: Record<string, any>) => {
    const sorted = (service as any).sortObject(params);
    const signData = qs.stringify(sorted, { encode: false });
    return crypto.createHmac('sha512', 'secret').update(Buffer.from(signData, 'utf-8')).digest('hex');
  };

  const signMomo = (p: any) => {
    const raw = `accessKey=valid_access_key&amount=${p.amount}&extraData=${p.extraData}&message=${p.message}&orderId=${p.orderId}&orderInfo=${p.orderInfo}&orderType=${p.orderType}&partnerCode=${p.partnerCode}&payType=${p.payType}&requestId=${p.requestId}&responseTime=${p.responseTime}&resultCode=${p.resultCode}&transId=${p.transId}`;
    return crypto.createHmac('sha256', 'valid_secret_key').update(Buffer.from(raw, 'utf-8')).digest('hex');
  };

  const pendingPayment = (overrides: any = {}) => ({
    id: 'payment-1',
    transaction_code: 'order-1',
    status: 'PENDING',
    booking_id: 'booking-123',
    customer_id: 'cust-1',
    amount: 100000,
    idempotency_key: null,
    bookings: { ...pendingBooking },
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: WalletsService, useValue: mockWalletsService },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);

    mockPrisma.provider_profiles.findUnique.mockResolvedValue({ id: 'provider-1', user_id: 'provider-user' });
    mockPrisma.wallets.findUnique.mockResolvedValue({ id: 'provider-wallet', user_id: 'provider-user' });
    mockPrisma.wallets.upsert.mockResolvedValue({ id: 'customer-wallet', user_id: 'cust-1' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVNPayUrl', () => {
    it('applies promotion and records the discounted amount', async () => {
      mockPrisma.promotions.findUnique.mockResolvedValue({
        id: 'promo-1',
        code: 'SALE20',
        is_active: true,
        start_date: new Date(Date.now() - 10000),
        end_date: new Date(Date.now() + 10000),
        min_order_value: 50000,
        discount_percent: 20,
        usage_limit: 100,
        used_count: 0,
      });
      mockPrisma.bookings.findUnique.mockResolvedValue(pendingBooking);

      const url = await service.createVNPayUrl('booking-123', 'cust-1', '127.0.0.1', 'SALE20');

      expect(url).toContain('vnp_Amount=8000000');
      expect(mockPrisma.payments.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { booking_id: 'booking-123' },
          update: expect.objectContaining({ amount: 80000 }),
          create: expect.objectContaining({ amount: 80000, customer_id: 'cust-1' }),
        }),
      );
    });

    it('rejects a booking owned by another customer', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(pendingBooking);
      await expect(service.createVNPayUrl('booking-123', 'someone-else', '127.0.0.1')).rejects.toThrow(BadRequestException);
    });

    it('rejects a booking that is not PENDING_PAYMENT', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue({ ...pendingBooking, status: 'ACCEPTED' });
      await expect(service.createVNPayUrl('booking-123', 'cust-1', '127.0.0.1')).rejects.toThrow(BadRequestException);
    });

    it('rejects a booking already paid', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue({ ...pendingBooking, payments: { status: 'PAID_HELD_IN_ESCROW' } });
      await expect(service.createVNPayUrl('booking-123', 'cust-1', '127.0.0.1')).rejects.toThrow(BadRequestException);
    });

    it('rejects an expired promotion', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(pendingBooking);
      mockPrisma.promotions.findUnique.mockResolvedValue({
        id: 'promo-1',
        code: 'SALE20',
        is_active: true,
        start_date: new Date(Date.now() - 20000),
        end_date: new Date(Date.now() - 10000),
      });
      await expect(service.createVNPayUrl('booking-123', 'cust-1', '127.0.0.1', 'SALE20')).rejects.toThrow(BadRequestException);
    });
  });

  describe('processPaymentCallback (VNPay)', () => {
    const basePayload = {
      vnp_TxnRef: 'order-1',
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
      vnp_TransactionNo: '123456',
      vnp_Amount: '10000000',
      vnp_OrderInfo: 'Thanh toan booking booking-123',
    };

    it('rejects a missing or invalid signature', async () => {
      const result = await service.processPaymentCallback({ ...basePayload, vnp_SecureHash: 'bad' });
      expect(result.RspCode).toBe('97');
      expect(mockPrisma.payments.update).not.toHaveBeenCalled();
    });

    it('delegates subscription orders (orderInfo starts with SUB_) to SubscriptionsService', async () => {
      mockSubscriptionsService.handleVnpayIpn.mockResolvedValue('00');
      const payload = {
        ...basePayload,
        vnp_TxnRef: 'PCABCDEFGH23',
        vnp_OrderInfo: 'SUB_PCABCDEFGH23 Thanh toan goi PREMIUM',
      };
      const result = await service.processPaymentCallback({ ...payload, vnp_SecureHash: signVnp(payload) });

      expect(result.RspCode).toBe('00');
      expect(mockSubscriptionsService.handleVnpayIpn).toHaveBeenCalledWith({
        paymentCode: 'PCABCDEFGH23',
        success: true,
        paidAmount: 100000,
        transactionNo: '123456',
      });
      expect(mockPrisma.payments.update).not.toHaveBeenCalled();
    });

    it('holds escrow minus commission and notifies on success', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(pendingPayment());
      mockPrisma.bookings.findUnique.mockResolvedValue({ id: 'booking-123', provider_profiles: { user_id: 'provider-user' } });

      const result = await service.processPaymentCallback({ ...basePayload, vnp_SecureHash: signVnp(basePayload) });

      expect(result.RspCode).toBe('00');
      expect(mockPrisma.payments.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PAID_HELD_IN_ESCROW', platform_fee: 10000, provider_amount: 90000 }),
        }),
      );
      expect(mockWalletsService.processTransaction).toHaveBeenCalledWith(
        'provider-wallet', 90000, 'ESCROW_HOLD', 'booking-123', expect.any(String), mockPrisma,
      );
      expect(mockNotificationsService.sendNotification).toHaveBeenCalled();
    });

    it('rejects when the paid amount differs from the recorded amount', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(pendingPayment({ amount: 200000 }));

      const result = await service.processPaymentCallback({ ...basePayload, vnp_SecureHash: signVnp(basePayload) });

      expect(result.RspCode).toBe('04');
      expect(mockPrisma.payments.update).not.toHaveBeenCalled();
    });

    it('refunds to the customer wallet when the booking already expired', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(
        pendingPayment({ status: 'VOIDED', bookings: { ...pendingBooking, status: 'EXPIRED' } }),
      );

      const result = await service.processPaymentCallback({ ...basePayload, vnp_SecureHash: signVnp(basePayload) });

      expect(result.RspCode).toBe('00');
      expect(mockWalletsService.processTransaction).toHaveBeenCalledWith(
        'customer-wallet', 100000, 'CREDIT', 'booking-123', expect.any(String), mockPrisma,
      );
      expect(mockPrisma.payments.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'REFUNDED' }) }),
      );
      expect(mockPrisma.bookings.update).not.toHaveBeenCalled();
    });

    it('is idempotent for a repeated transaction', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(
        pendingPayment({ status: 'PAID_HELD_IN_ESCROW', idempotency_key: '123456' }),
      );

      const result = await service.processPaymentCallback({ ...basePayload, vnp_SecureHash: signVnp(basePayload) });

      expect(result.RspCode).toBe('02');
      expect(mockWalletsService.processTransaction).not.toHaveBeenCalled();
    });
  });

  describe('processMomoIPN', () => {
    const momoPayload = {
      partnerCode: 'MOMO',
      orderId: 'order-1',
      requestId: 'req-123',
      amount: 100000,
      orderInfo: 'Thanh toan booking',
      orderType: 'momo_wallet',
      transId: 123456789,
      resultCode: 0,
      message: 'Success',
      payType: 'qr',
      responseTime: 1616161616,
      extraData: '',
    };

    it('returns 97 if signature is invalid', async () => {
      const result = await service.processMomoIPN({ ...momoPayload, signature: 'invalid_signature' });
      expect(result.RspCode).toBe('97');
    });

    it('returns 97 if signature is missing (forged success)', async () => {
      const result = await service.processMomoIPN({ ...momoPayload });
      expect(result.RspCode).toBe('97');
      expect(mockPrisma.payments.findFirst).not.toHaveBeenCalled();
    });

    it('holds escrow minus commission on success', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(pendingPayment());
      mockPrisma.bookings.findUnique.mockResolvedValue({ id: 'booking-123', provider_profiles: { user_id: 'provider-user' } });

      const result = await service.processMomoIPN({ ...momoPayload, signature: signMomo(momoPayload) });

      expect(result.RspCode).toBe('00');
      expect(mockPrisma.payments.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'payment-1' },
          data: expect.objectContaining({
            status: 'PAID_HELD_IN_ESCROW',
            idempotency_key: '123456789',
            platform_fee: 10000,
            provider_amount: 90000,
          }),
        }),
      );
      expect(mockWalletsService.processTransaction).toHaveBeenCalledWith(
        'provider-wallet', 90000, 'ESCROW_HOLD', 'booking-123', 'Ký quỹ thanh toán từ MoMo (đã trừ phí hoa hồng)', mockPrisma,
      );
    });
  });

  describe('calculateCommissionPreview', () => {
    it('splits the amount using COMMISSION_RATE', async () => {
      await expect(service.calculateCommissionPreview(200000)).resolves.toEqual({
        amount: 200000,
        commissionRate: 0.1,
        commissionPercent: 10,
        platformFee: 20000,
        providerAmount: 180000,
      });
    });

    it('rejects an invalid amount', async () => {
      await expect(service.calculateCommissionPreview(-1)).rejects.toThrow(BadRequestException);
      await expect(service.calculateCommissionPreview(NaN)).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkoutWithWallet', () => {
    it('stores platform_fee/provider_amount even when a payment row already exists', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue({ ...pendingBooking, payments: { status: 'FAILED' } });
      mockPrisma.wallets.findUnique.mockImplementation(({ where }: any) =>
        where.user_id === 'cust-1'
          ? { id: 'customer-wallet', balance: { lessThan: () => false } }
          : { id: 'provider-wallet' },
      );
      mockPrisma.payments.upsert.mockResolvedValue({ amount: 100000 });

      await service.checkoutWithWallet('cust-1', 'booking-123');

      expect(mockPrisma.payments.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ platform_fee: 10000, provider_amount: 90000 }),
        }),
      );
    });
  });
});
