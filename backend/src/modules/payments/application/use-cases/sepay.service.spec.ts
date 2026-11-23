import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SepayService, SepayWebhookPayload } from './sepay.service';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../../../database/prisma.service';

const CONFIG: Record<string, string> = {
  BANK_ACCOUNT_NUMBER: '0123456789',
  BANK_ACCOUNT_NAME: 'NGUYEN VAN A',
  SEPAY_WEBHOOK_API_KEY: 'test-key',
};

describe('SepayService', () => {
  let service: SepayService;

  const mockPrisma: any = {
    bank_transactions: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      groupBy: jest.fn(),
    },
    payments: { findFirst: jest.fn(), upsert: jest.fn(), update: jest.fn() },
    provider_working_slots: { findUnique: jest.fn(), updateMany: jest.fn() },
    user: { findUnique: jest.fn() },
    audit_logs: { create: jest.fn() },
    $transaction: jest.fn(async (cb) => cb(mockPrisma)),
  };

  const mockPaymentsService = {
    assertBookingPayable: jest.fn(),
    calculateFinalAmount: jest.fn(),
    confirmPaidPayment: jest.fn(),
    creditCustomerWallet: jest.fn(),
    sendPaymentSuccessNotifications: jest.fn(),
    safeNotify: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn((key: string) => CONFIG[key]),
    getOrThrow: jest.fn((key: string) => {
      if (!(key in CONFIG)) throw new Error(`missing ${key}`);
      return CONFIG[key];
    }),
  };

  const CODE = 'PCABCDEFGH23';

  const webhook = (overrides: Partial<SepayWebhookPayload> = {}): SepayWebhookPayload => ({
    id: 92704,
    gateway: 'MBBank',
    transactionDate: '2026-11-23 11:08:33',
    accountNumber: '0123456789',
    subAccount: '',
    code: null,
    content: `MBVCB.123 ${CODE} chuyen tien`,
    transferType: 'in',
    description: 'NGUYEN VAN B chuyen tien',
    transferAmount: 100000,
    accumulated: 5000000,
    referenceCode: 'FT24012345678',
    ...overrides,
  });

  const pendingPayment = (overrides: any = {}) => ({
    id: 'payment-1',
    booking_id: 'booking-1',
    customer_id: 'cust-1',
    amount: 100000,
    method: 'BANK_TRANSFER',
    status: 'PENDING',
    transaction_code: CODE,
    promotion_code: null,
    bookings: {
      id: 'booking-1',
      status: 'PENDING_PAYMENT',
      provider_id: 'p-1',
      provider_working_slot_id: 's-1',
    },
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SepayService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: PaymentsService, useValue: mockPaymentsService },
      ],
    }).compile();

    service = module.get(SepayService);
    mockPrisma.bank_transactions.findUnique.mockResolvedValue(null);
  });

  afterEach(() => jest.clearAllMocks());

  describe('verifyWebhookAuth', () => {
    it('accepts the configured API key', () => {
      expect(() => service.verifyWebhookAuth('Apikey test-key')).not.toThrow();
    });

    it('rejects a wrong or missing key', () => {
      expect(() => service.verifyWebhookAuth('Apikey wrong')).toThrow(UnauthorizedException);
      expect(() => service.verifyWebhookAuth(undefined)).toThrow(UnauthorizedException);
    });

    it('rejects everything when no key is configured', () => {
      mockConfig.get.mockImplementationOnce((() => undefined) as any);
      expect(() => service.verifyWebhookAuth('Apikey ')).toThrow(UnauthorizedException);
    });
  });

  describe('createBankTransferCheckout', () => {
    const createdAt = new Date(Date.now() - 2 * 60_000); // đơn tạo 2 phút trước
    const bookingWithSlot = {
      id: 'booking-1',
      customer_id: 'cust-1',
      total_price: 120000,
      created_at: createdAt,
      provider_working_slot_id: 'slot-1',
    };

    beforeEach(() => {
      mockPaymentsService.assertBookingPayable.mockResolvedValue(bookingWithSlot);
      mockPaymentsService.calculateFinalAmount.mockResolvedValue(100000);
      mockPrisma.payments.findFirst.mockResolvedValue(null);
      mockPrisma.provider_working_slots.findUnique.mockResolvedValue({
        status: 'HELD_FOR_PAYMENT',
        held_until: new Date(createdAt.getTime() + 10 * 60_000),
      });
      mockPrisma.provider_working_slots.updateMany.mockResolvedValue({ count: 1 });
    });

    it('extends the slot hold to created_at + 30 minutes and returns expiresAt', async () => {
      const result = await service.createBankTransferCheckout('booking-1', 'cust-1');

      const deadline = new Date(createdAt.getTime() + 30 * 60_000);
      expect(mockPrisma.provider_working_slots.updateMany).toHaveBeenCalledWith({
        where: { id: 'slot-1', status: 'HELD_FOR_PAYMENT', held_until: expect.any(Date) },
        data: { held_until: deadline },
      });
      expect(result.expiresAt).toBe(deadline.toISOString());
    });

    it('respects BANK_TRANSFER_HOLD_MINUTES (clamped to 120)', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'BANK_TRANSFER_HOLD_MINUTES' ? '999' : CONFIG[key],
      );

      const result = await service.createBankTransferCheckout('booking-1', 'cust-1');

      expect(result.expiresAt).toBe(new Date(createdAt.getTime() + 120 * 60_000).toISOString());
      mockConfig.get.mockImplementation((key: string) => CONFIG[key]);
    });

    it('does not extend again when the hold is already at the deadline (requesting QR repeatedly)', async () => {
      const deadline = new Date(createdAt.getTime() + 30 * 60_000);
      mockPrisma.provider_working_slots.findUnique.mockResolvedValue({
        status: 'HELD_FOR_PAYMENT',
        held_until: deadline,
      });

      const result = await service.createBankTransferCheckout('booking-1', 'cust-1');

      expect(mockPrisma.provider_working_slots.updateMany).not.toHaveBeenCalled();
      expect(result.expiresAt).toBe(deadline.toISOString());
    });

    it('refuses when the hold has already lapsed', async () => {
      mockPrisma.provider_working_slots.findUnique.mockResolvedValue({
        status: 'HELD_FOR_PAYMENT',
        held_until: new Date(Date.now() - 1000),
      });
      await expect(service.createBankTransferCheckout('booking-1', 'cust-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.payments.upsert).not.toHaveBeenCalled();
    });

    it('refuses when the slot is no longer held for this booking', async () => {
      mockPrisma.provider_working_slots.findUnique.mockResolvedValue({
        status: 'AVAILABLE',
        held_until: null,
      });
      await expect(service.createBankTransferCheckout('booking-1', 'cust-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('refuses when the cron released the slot concurrently', async () => {
      mockPrisma.provider_working_slots.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.createBankTransferCheckout('booking-1', 'cust-1')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.payments.upsert).not.toHaveBeenCalled();
    });

    it('returns MB account info, a unique payment code and a VietQR image', async () => {
      const result = await service.createBankTransferCheckout('booking-1', 'cust-1', 'SALE');

      expect(result.paymentCode).toMatch(/^PC[A-Z2-9]{10}$/);
      expect(result.transferContent).toBe(result.paymentCode);
      expect(result.amount).toBe(100000);
      expect(result.accountNumber).toBe('0123456789');
      expect(result.qrImageUrl).toContain('acc=0123456789');
      expect(result.qrImageUrl).toContain('bank=MBBank');
      expect(result.qrImageUrl).toContain('amount=100000');
      expect(result.qrImageUrl).toContain(`des=${result.paymentCode}`);
      expect(mockPrisma.payments.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            method: 'BANK_TRANSFER',
            status: 'PENDING',
            transaction_code: result.paymentCode,
            promotion_code: 'SALE',
          }),
        }),
      );
    });

    it('rejects a 0đ order', async () => {
      mockPaymentsService.assertBookingPayable.mockResolvedValue({
        customer_id: 'cust-1',
        total_price: 50000,
      });
      mockPaymentsService.calculateFinalAmount.mockResolvedValue(0);
      await expect(service.createBankTransferCheckout('booking-1', 'cust-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('handleWebhook', () => {
    it('confirms the booking when the exact amount arrives with the payment code', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(pendingPayment());

      const result = await service.handleWebhook(webhook());

      expect(result.status).toBe('MATCHED');
      expect(mockPaymentsService.confirmPaidPayment).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({ id: 'payment-1' }),
        'SEPAY_92704',
        'SePay',
        null,
      );
      expect(mockPaymentsService.creditCustomerWallet).not.toHaveBeenCalled();
      expect(mockPrisma.bank_transactions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            external_id: '92704',
            status: 'MATCHED',
            code: CODE,
            payment_id: 'payment-1',
          }),
        }),
      );
      expect(mockPaymentsService.sendPaymentSuccessNotifications).toHaveBeenCalledWith(
        'booking-1',
        'cust-1',
        100000,
      );
    });

    it('uses the SePay-detected code field and tolerates lowercase/spaces in content', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(pendingPayment());
      await service.handleWebhook(webhook({ code: null, content: 'pcabcd efgh23 thanh toan' }));
      expect(mockPrisma.payments.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { transaction_code: CODE, method: 'BANK_TRANSFER' } }),
      );
    });

    it('confirms and refunds the excess when the customer overpays', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(pendingPayment());

      const result = await service.handleWebhook(webhook({ transferAmount: 150000 }));

      expect(result.status).toBe('MATCHED');
      expect(mockPaymentsService.confirmPaidPayment).toHaveBeenCalled();
      expect(mockPaymentsService.creditCustomerWallet).toHaveBeenCalledWith(
        mockPrisma,
        'cust-1',
        50000,
        'booking-1',
        expect.any(String),
      );
    });

    it('does not confirm an underpaid booking and refunds the transfer to the wallet', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(pendingPayment());

      const result = await service.handleWebhook(webhook({ transferAmount: 60000 }));

      expect(result.status).toBe('REFUNDED_TO_WALLET');
      expect(mockPaymentsService.confirmPaidPayment).not.toHaveBeenCalled();
      expect(mockPaymentsService.creditCustomerWallet).toHaveBeenCalledWith(
        mockPrisma,
        'cust-1',
        60000,
        'booking-1',
        expect.stringContaining('Chuyển thiếu'),
      );
      expect(mockPrisma.payments.update).not.toHaveBeenCalled();
    });

    it('refunds to the wallet and marks the payment REFUNDED when the booking already expired', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(
        pendingPayment({ status: 'VOIDED', bookings: { id: 'booking-1', status: 'EXPIRED' } }),
      );

      const result = await service.handleWebhook(webhook());

      expect(result.status).toBe('REFUNDED_TO_WALLET');
      expect(mockPaymentsService.confirmPaidPayment).not.toHaveBeenCalled();
      expect(mockPrisma.payments.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'REFUNDED' }) }),
      );
      expect(mockPaymentsService.creditCustomerWallet).toHaveBeenCalledWith(
        mockPrisma,
        'cust-1',
        100000,
        'booking-1',
        expect.any(String),
      );
    });

    it('refunds a second transfer for an already-paid booking without touching the payment', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(
        pendingPayment({ status: 'PAID_HELD_IN_ESCROW' }),
      );

      const result = await service.handleWebhook(webhook());

      expect(result.status).toBe('REFUNDED_TO_WALLET');
      expect(mockPrisma.payments.update).not.toHaveBeenCalled();
      expect(mockPaymentsService.creditCustomerWallet).toHaveBeenCalled();
    });

    it('records UNMATCHED when the content has no payment code', async () => {
      const result = await service.handleWebhook(webhook({ content: 'chuyen tien an trua' }));

      expect(result.status).toBe('UNMATCHED');
      expect(mockPrisma.payments.findFirst).not.toHaveBeenCalled();
      expect(mockPaymentsService.creditCustomerWallet).not.toHaveBeenCalled();
      expect(mockPrisma.bank_transactions.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'UNMATCHED' }) }),
      );
    });

    it('records UNMATCHED when the code matches no payment', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(null);
      const result = await service.handleWebhook(webhook());
      expect(result.status).toBe('UNMATCHED');
    });

    it('ignores outgoing transfers and other accounts', async () => {
      expect((await service.handleWebhook(webhook({ transferType: 'out' }))).status).toBe(
        'IGNORED',
      );
      expect((await service.handleWebhook(webhook({ accountNumber: '999' }))).status).toBe(
        'IGNORED',
      );
      expect(mockPaymentsService.confirmPaidPayment).not.toHaveBeenCalled();
    });

    it('skips a webhook whose SePay id was already processed', async () => {
      mockPrisma.bank_transactions.findUnique.mockResolvedValue({ id: 'existing' });

      const result = await service.handleWebhook(webhook());

      expect(result.status).toBe('DUPLICATE');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('treats a concurrent duplicate (unique violation) as DUPLICATE and sends no notification', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(pendingPayment());
      mockPrisma.bank_transactions.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'test' }),
      );

      const result = await service.handleWebhook(webhook());

      expect(result.status).toBe('DUPLICATE');
      expect(mockPaymentsService.sendPaymentSuccessNotifications).not.toHaveBeenCalled();
    });

    it('rejects an invalid payload', async () => {
      await expect(service.handleWebhook({ transferAmount: 'abc' } as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('adminResolve', () => {
    const unmatchedTxn = {
      id: 'txn-1',
      external_id: '555',
      status: 'UNMATCHED',
      transfer_amount: 100000,
      note: 'Không tìm thấy mã thanh toán trong nội dung CK',
      payment_id: null,
    };

    beforeEach(() => {
      mockPrisma.bank_transactions.findUnique.mockResolvedValue(unmatchedTxn);
      mockPrisma.bank_transactions.updateMany.mockResolvedValue({ count: 1 });
    });

    it('requires a reason', async () => {
      await expect(
        service.adminResolve('txn-1', 'admin-1', { action: 'MARK_RESOLVED', reason: ' ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('refuses a transaction that is no longer UNMATCHED', async () => {
      mockPrisma.bank_transactions.findUnique.mockResolvedValue({
        ...unmatchedTxn,
        status: 'MATCHED',
      });
      await expect(
        service.adminResolve('txn-1', 'admin-1', {
          action: 'MARK_RESOLVED',
          reason: 'đã chuyển trả',
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.audit_logs.create).not.toHaveBeenCalled();
    });

    it('ASSIGN confirms the booking through the same logic as the webhook', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(pendingPayment());

      const result = await service.adminResolve('txn-1', 'admin-1', {
        action: 'ASSIGN',
        paymentCode: 'pcabcdefgh23',
        reason: 'Khách gõ thiếu 1 ký tự, đã đối chiếu sao kê',
      });

      expect(result.status).toBe('MATCHED');
      expect(mockPrisma.payments.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { transaction_code: CODE, method: 'BANK_TRANSFER' } }),
      );
      expect(mockPaymentsService.confirmPaidPayment).toHaveBeenCalledWith(
        mockPrisma,
        expect.objectContaining({ id: 'payment-1' }),
        'SEPAY_555',
        'SePay',
        null,
      );
      expect(mockPrisma.bank_transactions.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'txn-1', status: 'UNMATCHED' },
          data: expect.objectContaining({
            status: 'MATCHED',
            resolved_by: 'admin-1',
            payment_id: 'payment-1',
          }),
        }),
      );
      expect(mockPrisma.audit_logs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actor_id: 'admin-1',
            action: 'BANK_TXN_ASSIGN',
            target_id: 'txn-1',
          }),
        }),
      );
      expect(mockPaymentsService.sendPaymentSuccessNotifications).toHaveBeenCalled();
    });

    it('ASSIGN by bookingId refunds to the wallet when the booking already expired', async () => {
      mockPrisma.payments.findFirst.mockResolvedValue(
        pendingPayment({ status: 'VOIDED', bookings: { id: 'booking-1', status: 'EXPIRED' } }),
      );

      const result = await service.adminResolve('txn-1', 'admin-1', {
        action: 'ASSIGN',
        bookingId: 'booking-1',
        reason: 'Khách gửi ảnh chụp giao dịch',
      });

      expect(result.status).toBe('REFUNDED_TO_WALLET');
      expect(mockPrisma.payments.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { booking_id: 'booking-1' } }),
      );
      expect(mockPaymentsService.creditCustomerWallet).toHaveBeenCalledWith(
        mockPrisma,
        'cust-1',
        100000,
        'booking-1',
        expect.any(String),
      );
    });

    it('CREDIT_WALLET credits the full amount to the customer found by email and notifies after commit', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'cust-9', email: 'khach@example.com' });

      const result = await service.adminResolve('txn-1', 'admin-1', {
        action: 'CREDIT_WALLET',
        customerEmail: ' Khach@Example.com ',
        reason: 'Khách liên hệ CSKH, đã xác minh',
      });

      expect(result.status).toBe('REFUNDED_TO_WALLET');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'khach@example.com' },
      });
      expect(mockPaymentsService.creditCustomerWallet).toHaveBeenCalledWith(
        mockPrisma,
        'cust-9',
        100000,
        null,
        expect.any(String),
      );
      expect(mockPaymentsService.safeNotify).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'cust-9' }),
      );
    });

    it('CREDIT_WALLET rejects an unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.adminResolve('txn-1', 'admin-1', {
          action: 'CREDIT_WALLET',
          customerEmail: 'nobody@example.com',
          reason: 'Khách liên hệ CSKH',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('MARK_RESOLVED moves no money', async () => {
      const result = await service.adminResolve('txn-1', 'admin-1', {
        action: 'MARK_RESOLVED',
        reason: 'Đã chuyển trả qua MB, FT2611230001',
      });

      expect(result.status).toBe('RESOLVED_MANUALLY');
      expect(mockPaymentsService.creditCustomerWallet).not.toHaveBeenCalled();
      expect(mockPaymentsService.confirmPaidPayment).not.toHaveBeenCalled();
    });

    it('fails if another admin resolved it concurrently (conditional update hits 0 rows)', async () => {
      mockPrisma.bank_transactions.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'cust-9', email: 'khach@example.com' });

      await expect(
        service.adminResolve('txn-1', 'admin-1', {
          action: 'CREDIT_WALLET',
          customerEmail: 'khach@example.com',
          reason: 'Khách liên hệ CSKH',
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockPaymentsService.safeNotify).not.toHaveBeenCalled();
    });
  });
});
