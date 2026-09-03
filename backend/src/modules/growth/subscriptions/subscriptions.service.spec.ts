import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { WalletsService } from '../../wallets/application/use-cases/wallets.service';
import { ConflictException } from '@nestjs/common';

describe('SubscriptionsService — BUG #3 Idempotency Fix', () => {
  let service: SubscriptionsService;

  const mockPrisma = {
    subscriptions: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    wallets: { findUnique: jest.fn() },
    $transaction: jest.fn((fn) => fn(mockPrisma)),
  };

  const mockConfigService = { get: jest.fn().mockReturnValue('DUMMY_VALUE') };
  const mockWalletsService = { processTransaction: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: WalletsService, useValue: mockWalletsService },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('handleSubscriptionSuccess', () => {
    const USER_ID = 'user-uuid-1';
    const TIER = 'SILVER';

    it('🔴 should NOT create duplicate subscription if user already has ACTIVE sub (IPN retry)', async () => {
      // Giả lập VNPay IPN đến lần 2 — user đã có gói ACTIVE rồi
      mockPrisma.subscriptions.findFirst.mockResolvedValue({
        id: 'existing-sub-id',
        user_id: USER_ID,
        tier_name: TIER,
        status: 'ACTIVE',
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày nữa
      });

      await service.handleSubscriptionSuccess(USER_ID, TIER);

      // Quan trọng: KHÔNG được gọi create
      expect(mockPrisma.subscriptions.create).not.toHaveBeenCalled();
    });

    it('should create subscription when no active sub exists (first IPN call)', async () => {
      // Lần đầu tiên IPN đến — user chưa có gói
      mockPrisma.subscriptions.findFirst.mockResolvedValue(null);
      mockPrisma.subscriptions.create.mockResolvedValue({ id: 'new-sub-id' });

      await service.handleSubscriptionSuccess(USER_ID, TIER);

      expect(mockPrisma.subscriptions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            user_id: USER_ID,
            tier_name: TIER,
            status: 'ACTIVE',
          }),
        }),
      );
    });
  });

  describe('checkoutWallet', () => {
    it('should throw ConflictException if user already has an active subscription', async () => {
      mockPrisma.subscriptions.findFirst.mockResolvedValue({ id: 'sub-1', status: 'ACTIVE' });

      await expect(service.checkoutWallet(USER_ID, { tierName: 'GOLD' } as any))
        .rejects.toThrow(ConflictException);
    });
  });
});

// JSDoc: userId constant used in describe block — must hoist
const USER_ID = 'user-uuid-1';
