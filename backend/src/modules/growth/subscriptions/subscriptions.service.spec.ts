import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../../database/prisma.service';
import { subscription_status } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SubscriptionTier } from './dto/subscribe.dto';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    subscriptions: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should create a subscription successfully (Test Case 1)', async () => {
      // Arrange: Mock no active subscription found
      mockPrismaService.subscriptions.findFirst.mockResolvedValue(null);

      const mockDate = new Date();
      const mockResult = {
        id: 'sub-1',
        user_id: 'user-1',
        tier_name: SubscriptionTier.GOLD,
        start_date: mockDate,
        end_date: new Date(mockDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: subscription_status.ACTIVE,
        created_at: mockDate,
      };

      // Arrange: Mock creation success
      mockPrismaService.subscriptions.create.mockResolvedValue(mockResult);

      // Act
      const result = await service.subscribe('user-1', { tierName: SubscriptionTier.GOLD });

      // Assert
      expect(prisma.subscriptions.findFirst).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          status: subscription_status.ACTIVE,
          end_date: { gt: expect.any(Date) },
        },
      });

      expect(prisma.subscriptions.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: 'user-1',
          tier_name: SubscriptionTier.GOLD,
          status: subscription_status.ACTIVE,
        }),
      });

      expect(result).toEqual(mockResult);
    });

    it('should throw ConflictException if user already has active subscription', async () => {
      // Arrange: Mock active subscription exists
      mockPrismaService.subscriptions.findFirst.mockResolvedValue({ id: 'sub-1' });

      // Act & Assert
      await expect(service.subscribe('user-1', { tierName: SubscriptionTier.GOLD })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getMySubscription', () => {
    it('should return the current active subscription (Test Case 2)', async () => {
      // Arrange
      const mockSub = { id: 'sub-1', tier_name: 'GOLD', status: 'ACTIVE' };
      mockPrismaService.subscriptions.findFirst.mockResolvedValue(mockSub);

      // Act
      const result = await service.getMySubscription('user-1');

      // Assert
      expect(prisma.subscriptions.findFirst).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          status: subscription_status.ACTIVE,
        },
        orderBy: {
          end_date: 'desc',
        },
      });
      expect(result).toEqual(mockSub);
    });

    it('should throw NotFoundException if no active subscription found', async () => {
      // Arrange
      mockPrismaService.subscriptions.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getMySubscription('user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
