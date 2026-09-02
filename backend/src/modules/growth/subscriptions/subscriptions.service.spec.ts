import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { WalletsService } from '../../wallets/application/use-cases/wallets.service';
import { subscription_status } from '@prisma/client';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { SubscriptionTier } from './dto/subscribe.dto';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: PrismaService;
  let configService: ConfigService;
  let walletsService: WalletsService;

  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation(async (cb) => {
      return cb(mockPrismaService);
    }),
    subscriptions: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    wallets: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-val'),
  };

  const mockWalletsService = {
    processTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: WalletsService, useValue: mockWalletsService },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    walletsService = module.get<WalletsService>(WalletsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkoutVnpay', () => {
    it('should throw ConflictException if user has active subscription', async () => {
      mockPrismaService.subscriptions.findFirst.mockResolvedValue({ id: 'active-sub' });
      await expect(
        service.checkoutVnpay('user-1', { tierName: SubscriptionTier.PLATINUM }, '127.0.0.1')
      ).rejects.toThrow(ConflictException);
    });

    it('should return vnpay url', async () => {
      mockPrismaService.subscriptions.findFirst.mockResolvedValue(null);
      const res = await service.checkoutVnpay('user-1', { tierName: SubscriptionTier.PLATINUM }, '127.0.0.1');
      expect(res.paymentUrl).toContain('mock-val');
    });
  });

  describe('checkoutWallet', () => {
    it('should throw ConflictException if user has active subscription', async () => {
      mockPrismaService.subscriptions.findFirst.mockResolvedValue({ id: 'active-sub' });
      await expect(
        service.checkoutWallet('user-1', { tierName: SubscriptionTier.PLATINUM })
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if wallet not found', async () => {
      mockPrismaService.subscriptions.findFirst.mockResolvedValue(null);
      mockPrismaService.wallets.findUnique.mockResolvedValue(null);
      
      await expect(
        service.checkoutWallet('user-1', { tierName: SubscriptionTier.PLATINUM })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if balance is insufficient', async () => {
      mockPrismaService.subscriptions.findFirst.mockResolvedValue(null);
      mockPrismaService.wallets.findUnique.mockResolvedValue({
        id: 'wallet-1',
        balance: { lessThan: () => true },
      });
      
      await expect(
        service.checkoutWallet('user-1', { tierName: SubscriptionTier.PLATINUM })
      ).rejects.toThrow(ConflictException);
    });

    it('should process payment and create subscription', async () => {
      mockPrismaService.subscriptions.findFirst.mockResolvedValue(null);
      mockPrismaService.wallets.findUnique.mockResolvedValue({
        id: 'wallet-1',
        balance: { lessThan: () => false },
      });
      mockPrismaService.subscriptions.create.mockResolvedValue({ id: 'sub-1' });

      const res = await service.checkoutWallet('user-1', { tierName: SubscriptionTier.PLATINUM });
      expect(res.success).toBe(true);
      expect(mockWalletsService.processTransaction).toHaveBeenCalled();
      expect(mockPrismaService.subscriptions.create).toHaveBeenCalled();
    });
  });

  describe('handleSubscriptionSuccess', () => {
    it('should create an active subscription', async () => {
      mockPrismaService.subscriptions.create.mockResolvedValue({ id: 'sub-1' });
      await service.handleSubscriptionSuccess('user-1', 'PLATINUM');
      expect(mockPrismaService.subscriptions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            user_id: 'user-1',
            tier_name: 'PLATINUM',
            status: subscription_status.ACTIVE,
          })
        })
      );
    });
  });

  describe('getMySubscription', () => {
    it('should return the current active subscription', async () => {
      const mockSub = { id: 'sub-1', tier_name: 'PLATINUM', status: 'ACTIVE' };
      mockPrismaService.subscriptions.findFirst.mockResolvedValue(mockSub);

      const result = await service.getMySubscription('user-1');
      expect(result).toEqual(mockSub);
    });

    it('should throw NotFoundException if no active subscription found', async () => {
      mockPrismaService.subscriptions.findFirst.mockResolvedValue(null);
      await expect(service.getMySubscription('user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
