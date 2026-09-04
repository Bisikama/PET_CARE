import { Test, TestingModule } from '@nestjs/testing';
import { PromotionsService } from './promotions.service';
import { PrismaService } from '../../../database/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('PromotionsService', () => {
  let service: PromotionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    promotions: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    promotion_usages: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PromotionsService>(PromotionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePromotion', () => {
    const mockValidPromotion = {
      id: 'promo-1',
      code: 'TET2026',
      discount_percent: 10,
      discount_amount: null,
      min_order_value: new Prisma.Decimal(200000), // 200k VND
      max_discount_amount: new Prisma.Decimal(50000),
      usage_limit: 100,
      used_count: 10,
      start_date: new Date(Date.now() - 86400000), // yesterday
      end_date: new Date(Date.now() + 86400000), // tomorrow
      is_active: true,
    };

    it('should validate successfully when user has not used it and order value is sufficient (Test Case 1)', async () => {
      // Arrange
      mockPrismaService.promotions.findUnique.mockResolvedValue(mockValidPromotion);
      mockPrismaService.promotion_usages.findFirst.mockResolvedValue(null);

      // Act
      const result = await service.validatePromotion('user-1', {
        code: 'TET2026',
        orderValue: 300000, // Above 200k
      });

      // Assert
      expect(prisma.promotions.findUnique).toHaveBeenCalledWith({
        where: { code: 'TET2026' },
      });
      expect(prisma.promotion_usages.findFirst).toHaveBeenCalledWith({
        where: { promotion_id: 'promo-1', user_id: 'user-1' },
      });
      
      expect(result.isValid).toBe(true);
      expect(result.discountAmount).toBe(30000);
      expect(result.finalPrice).toBe(270000);
    });

    it('should throw ConflictException if user ALREADY USED this voucher (Test Case 2)', async () => {
      // Arrange
      mockPrismaService.promotions.findUnique.mockResolvedValue(mockValidPromotion);
      mockPrismaService.promotion_usages.findFirst.mockResolvedValue({
        id: 'usage-1',
        promotion_id: 'promo-1',
        user_id: 'user-1',
      });

      // Act & Assert
      await expect(
        service.validatePromotion('user-1', {
          code: 'TET2026',
          orderValue: 300000,
        }),
      ).rejects.toThrow(ConflictException);

      // Assert
      expect(prisma.promotion_usages.findFirst).toHaveBeenCalled();
    });

    it('should throw BadRequestException if order value is below min_order_value (Test Case 3)', async () => {
      // Arrange
      mockPrismaService.promotions.findUnique.mockResolvedValue(mockValidPromotion);
      
      // Act & Assert
      await expect(
        service.validatePromotion('user-1', {
          code: 'TET2026',
          orderValue: 100000, // Below 200k
        }),
      ).rejects.toThrow(BadRequestException);
      
      // Assert
      expect(prisma.promotion_usages.findFirst).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if promotion does not exist', async () => {
      // Arrange
      mockPrismaService.promotions.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validatePromotion('user-1', {
          code: 'INVALID',
          orderValue: 300000,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if promotion is expired or usage limit reached (Test Case 4)', async () => {
      // Arrange
      const expiredPromo = {
        ...mockValidPromotion,
        start_date: new Date(Date.now() - 100000),
        end_date: new Date(Date.now() - 50000), // Expired
      };
      mockPrismaService.promotions.findUnique.mockResolvedValueOnce(expiredPromo);

      // Act & Assert (Expired)
      await expect(
        service.validatePromotion('user-1', {
          code: 'TET2026',
          orderValue: 300000,
        }),
      ).rejects.toThrow(BadRequestException);

      // Arrange
      const limitReachedPromo = {
        ...mockValidPromotion,
        usage_limit: 100,
        used_count: 100, // Limit reached
      };
      mockPrismaService.promotions.findUnique.mockResolvedValueOnce(limitReachedPromo);

      // Act & Assert (Limit Reached)
      await expect(
        service.validatePromotion('user-1', {
          code: 'TET2026',
          orderValue: 300000,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
