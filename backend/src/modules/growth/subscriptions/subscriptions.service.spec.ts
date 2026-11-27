import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../../database/prisma.service';
import { WalletsService } from '../../wallets/application/use-cases/wallets.service';
import { NotificationsService } from '../notifications/notifications.service';

const CONFIG: Record<string, string> = {
  BANK_ACCOUNT_NUMBER: '0123456789',
  BANK_ACCOUNT_NAME: 'NGUYEN VAN A',
  VNP_TMN_CODE: 'TMN',
  VNP_HASH_SECRET: 'secret',
  VNP_RETURN_URL: 'https://backend.example.test/api/payments/vnpay-return',
};
const DAY = 24 * 60 * 60 * 1000;
const USER_ID = 'user-1';

const plan = (overrides: any = {}) => ({
  id: 'plan-basic',
  code: 'BASIC',
  name: 'Gói Cơ Bản',
  description: null,
  price: new Prisma.Decimal(99000),
  duration_days: 30,
  benefits: [],
  is_active: true,
  sort_order: 1,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

const order = (overrides: any = {}) => ({
  id: 'order-1',
  user_id: USER_ID,
  plan_id: 'plan-basic',
  plan_code: 'BASIC',
  plan_name: 'Gói Cơ Bản',
  duration_days: 30,
  amount: new Prisma.Decimal(99000),
  method: 'BANK_TRANSFER',
  status: 'PENDING',
  payment_code: 'PCABCDEFGH23',
  transfer_content: 'PCABCDEFGH23 Thanh toan goi thanh vien BASIC',
  gateway_ref: null,
  subscription_id: null,
  paid_at: null,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  const mockPrisma: any = {
    subscription_plans: { findUnique: jest.fn(), findMany: jest.fn() },
    subscription_orders: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    subscriptions: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
    payments: { findFirst: jest.fn() },
    wallets: { findUnique: jest.fn(), upsert: jest.fn() },
    $transaction: jest.fn((fn) => fn(mockPrisma)),
  };
  const mockConfig = {
    get: jest.fn((key: string) => CONFIG[key]),
    getOrThrow: jest.fn((key: string) => {
      if (!(key in CONFIG)) throw new Error(`missing ${key}`);
      return CONFIG[key];
    }),
  };
  const mockWallets = { processTransaction: jest.fn() };
  const mockNotifications = { sendNotification: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: WalletsService, useValue: mockWallets },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();
    service = module.get(SubscriptionsService);

    mockPrisma.subscription_plans.findUnique.mockResolvedValue(plan());
    mockPrisma.subscriptions.findFirst.mockResolvedValue(null);
    mockPrisma.subscription_orders.findFirst.mockResolvedValue(null);
    mockPrisma.subscription_orders.findUnique.mockResolvedValue(null);
    mockPrisma.payments.findFirst.mockResolvedValue(null);
    mockPrisma.subscription_orders.create.mockImplementation(async ({ data }) => ({ ...order(), ...data, id: 'order-new' }));
    mockPrisma.subscription_orders.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.subscriptions.create.mockImplementation(async ({ data }) => ({ id: 'sub-1', ...data }));
    mockPrisma.wallets.upsert.mockResolvedValue({ id: 'wallet-1' });
  });

  afterEach(() => jest.clearAllMocks());

  describe('checkoutBankTransfer', () => {
    it('creates an order whose transfer content names the plan', async () => {
      const result = await service.checkoutBankTransfer(USER_ID, 'basic');

      expect(result.paymentCode).toMatch(/^PC[A-Z2-9]{10}$/);
      expect(result.transferContent).toBe(`${result.paymentCode} Thanh toan goi thanh vien BASIC`);
      expect(result.amount).toBe(99000);
      expect(result.planCode).toBe('BASIC');
      expect(result.qrImageUrl).toContain('des=' + result.paymentCode + '+Thanh+toan+goi+thanh+vien+BASIC');
      expect(mockPrisma.subscription_orders.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: USER_ID,
          plan_id: 'plan-basic',
          plan_code: 'BASIC',
          amount: 99000,
          duration_days: 30,
          method: 'BANK_TRANSFER',
          status: 'PENDING',
          transfer_content: result.transferContent,
        }),
      });
    });

    it('reuses a recent pending order for the same plan instead of issuing a new code', async () => {
      mockPrisma.subscription_orders.findFirst.mockResolvedValue(order());
      const result = await service.checkoutBankTransfer(USER_ID, 'BASIC');
      expect(result.paymentCode).toBe('PCABCDEFGH23');
      expect(mockPrisma.subscription_orders.create).not.toHaveBeenCalled();
    });

    it('refuses a plan that is not on sale', async () => {
      mockPrisma.subscription_plans.findUnique.mockResolvedValue(plan({ is_active: false }));
      await expect(service.checkoutBankTransfer(USER_ID, 'BASIC')).rejects.toThrow(NotFoundException);
    });

    it('refuses buying a different plan while another one is still active', async () => {
      mockPrisma.subscriptions.findFirst.mockResolvedValue({
        tier_name: 'PREMIUM',
        end_date: new Date(Date.now() + 10 * DAY),
      });
      await expect(service.checkoutBankTransfer(USER_ID, 'BASIC')).rejects.toThrow(ConflictException);
    });

    it('allows renewing the same plan while it is active', async () => {
      mockPrisma.subscriptions.findFirst.mockResolvedValue({
        tier_name: 'BASIC',
        end_date: new Date(Date.now() + 10 * DAY),
      });
      await expect(service.checkoutBankTransfer(USER_ID, 'BASIC')).resolves.toBeDefined();
    });
  });

  describe('applyBankTransfer', () => {
    it('activates the plan for the exact amount and cancels the user\'s other pending orders', async () => {
      const result = await service.applyBankTransfer(mockPrisma, order() as any, 99000, 'SEPAY_1');

      expect(result.status).toBe('MATCHED');
      expect(mockPrisma.subscription_orders.updateMany).toHaveBeenCalledWith({
        where: { id: 'order-1', status: 'PENDING' },
        data: expect.objectContaining({ status: 'PAID', gateway_ref: 'SEPAY_1' }),
      });
      const created = mockPrisma.subscriptions.create.mock.calls[0][0].data;
      expect(created).toEqual(expect.objectContaining({ user_id: USER_ID, tier_name: 'BASIC', plan_id: 'plan-basic' }));
      expect(created.end_date.getTime() - created.start_date.getTime()).toBe(30 * DAY);
      expect(mockPrisma.subscription_orders.updateMany).toHaveBeenCalledWith({
        where: { user_id: USER_ID, status: 'PENDING', id: { not: 'order-1' } },
        data: { status: 'CANCELLED' },
      });
      expect(mockWallets.processTransaction).not.toHaveBeenCalled();
    });

    it('starts a renewal after the current period ends', async () => {
      const currentEnd = new Date(Date.now() + 5 * DAY);
      mockPrisma.subscriptions.findFirst.mockResolvedValue({ end_date: currentEnd });

      await service.applyBankTransfer(mockPrisma, order() as any, 99000, 'SEPAY_1');

      const created = mockPrisma.subscriptions.create.mock.calls[0][0].data;
      expect(created.start_date).toEqual(currentEnd);
      expect(created.end_date.getTime()).toBe(currentEnd.getTime() + 30 * DAY);
    });

    it('refunds the excess to the wallet on overpayment', async () => {
      const result = await service.applyBankTransfer(mockPrisma, order() as any, 100000, 'SEPAY_1');
      expect(result.status).toBe('MATCHED');
      expect(mockWallets.processTransaction).toHaveBeenCalledWith(
        'wallet-1',
        1000,
        'CREDIT',
        null,
        expect.stringContaining('chuyển dư'),
        mockPrisma,
      );
    });

    it('refunds an underpayment and keeps the order pending', async () => {
      const result = await service.applyBankTransfer(mockPrisma, order() as any, 50000, 'SEPAY_1');
      expect(result.status).toBe('REFUNDED_TO_WALLET');
      expect(result.note).toContain('Chuyển thiếu');
      expect(mockPrisma.subscriptions.create).not.toHaveBeenCalled();
      expect(mockPrisma.subscription_orders.updateMany).not.toHaveBeenCalled();
      expect(mockWallets.processTransaction).toHaveBeenCalledWith('wallet-1', 50000, 'CREDIT', null, expect.any(String), mockPrisma);
    });

    it('refunds a transfer to an already-paid or cancelled order', async () => {
      for (const status of ['PAID', 'CANCELLED']) {
        const result = await service.applyBankTransfer(mockPrisma, order({ status }) as any, 99000, 'SEPAY_1');
        expect(result.status).toBe('REFUNDED_TO_WALLET');
      }
      expect(mockPrisma.subscriptions.create).not.toHaveBeenCalled();
      expect(mockWallets.processTransaction).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleVnpayIpn', () => {
    const ipn = { paymentCode: 'PCABCDEFGH23', success: true, paidAmount: 99000, transactionNo: '777' };

    it('activates a pending VNPay order', async () => {
      mockPrisma.subscription_orders.findUnique.mockResolvedValue(order({ method: 'VNPAY' }));
      await expect(service.handleVnpayIpn(ipn)).resolves.toBe('00');
      expect(mockPrisma.subscriptions.create).toHaveBeenCalled();
      expect(mockNotifications.sendNotification).toHaveBeenCalled();
    });

    it('answers 02 for a retried IPN of a paid order', async () => {
      mockPrisma.subscription_orders.findUnique.mockResolvedValue(order({ method: 'VNPAY', status: 'PAID' }));
      await expect(service.handleVnpayIpn(ipn)).resolves.toBe('02');
      expect(mockPrisma.subscriptions.create).not.toHaveBeenCalled();
    });

    it('rejects a wrong amount and unknown orders', async () => {
      mockPrisma.subscription_orders.findUnique.mockResolvedValue(order({ method: 'VNPAY' }));
      await expect(service.handleVnpayIpn({ ...ipn, paidAmount: 1000 })).resolves.toBe('04');
      mockPrisma.subscription_orders.findUnique.mockResolvedValue(null);
      await expect(service.handleVnpayIpn(ipn)).resolves.toBe('01');
      expect(mockPrisma.subscriptions.create).not.toHaveBeenCalled();
    });

    it('refunds money received for a cancelled order exactly once', async () => {
      mockPrisma.subscription_orders.findUnique.mockResolvedValue(order({ method: 'VNPAY', status: 'CANCELLED' }));
      await expect(service.handleVnpayIpn(ipn)).resolves.toBe('00');
      expect(mockWallets.processTransaction).toHaveBeenCalledTimes(1);

      mockPrisma.subscription_orders.updateMany.mockResolvedValue({ count: 0 }); // IPN song song
      await expect(service.handleVnpayIpn(ipn)).resolves.toBe('02');
      expect(mockWallets.processTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkoutWallet', () => {
    it('debits the DB price and activates immediately', async () => {
      mockPrisma.wallets.findUnique.mockResolvedValue({ id: 'wallet-1', balance: new Prisma.Decimal(200000) });
      mockPrisma.subscriptions.findMany.mockResolvedValue([]);

      await service.checkoutWallet(USER_ID, 'BASIC');

      expect(mockWallets.processTransaction).toHaveBeenCalledWith(
        'wallet-1',
        99000,
        'DEBIT',
        null,
        expect.stringContaining('BASIC'),
        mockPrisma,
      );
      expect(mockPrisma.subscriptions.create).toHaveBeenCalled();
    });

    it('refuses when the wallet balance is insufficient', async () => {
      mockPrisma.wallets.findUnique.mockResolvedValue({ id: 'wallet-1', balance: new Prisma.Decimal(1000) });
      await expect(service.checkoutWallet(USER_ID, 'BASIC')).rejects.toThrow(ConflictException);
      expect(mockWallets.processTransaction).not.toHaveBeenCalled();
    });
  });
});
