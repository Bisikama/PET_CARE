import { Test, TestingModule } from '@nestjs/testing';
import { ApplyPromotionUseCase } from './apply-promotion.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('ApplyPromotionUseCase', () => {
  let useCase: ApplyPromotionUseCase;
  let cacheManager: any;

  const mockPrisma = {
    promotions: {
      findUnique: jest.fn(),
    },
    promotion_usages: {
      count: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplyPromotionUseCase,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'CACHE_MANAGER', useValue: mockCacheManager },
      ],
    }).compile();

    useCase = module.get<ApplyPromotionUseCase>(ApplyPromotionUseCase);
    cacheManager = module.get('CACHE_MANAGER');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const validPromotion = {
    id: 'promo-1',
    code: 'SUMMER2026',
    discount_percent: 20,
    max_discount_amount: 50000,
    min_order_value: 100000,
    usage_limit: 100,
    max_usage_per_user: 1,
    used_count: 50,
    start_date: new Date(Date.now() - 86400000), // Yesterday
    end_date: new Date(Date.now() + 86400000), // Tomorrow
    is_active: true,
  };

  it('Test Case 1: Thỏa mãn mọi điều kiện -> Ghi Redis thành công TTL 600s', async () => {
    mockPrisma.promotions.findUnique.mockResolvedValueOnce(validPromotion);
    mockCacheManager.get.mockResolvedValueOnce(0); // current global holds
    mockPrisma.promotion_usages.count.mockResolvedValueOnce(0); // user usage DB
    mockCacheManager.get.mockResolvedValueOnce(null); // user hold Redis

    const result = await useCase.execute({
      userId: 'user-1',
      promoCode: 'SUMMER2026',
      orderValue: 200000,
    });

    expect(result.success).toBe(true);
    expect(result.discountAmount).toBe(40000); // 20% of 200k
    expect(result.finalOrderValue).toBe(160000);
    
    // Verify Redis Set Hold
    expect(mockCacheManager.set).toHaveBeenCalledWith(
      'promo_hold:SUMMER2026:user-1',
      { discountAmount: 40000, orderValue: 200000 },
      600000 // 10 minutes TTL
    );

    // Verify global hold increment
    expect(mockCacheManager.set).toHaveBeenCalledWith(
      'promo_hold_count:SUMMER2026',
      1,
      600000
    );
  });

  it('Test Case 2: Đơn hàng không đạt min_order_value -> Báo lỗi BadRequest', async () => {
    mockPrisma.promotions.findUnique.mockResolvedValueOnce(validPromotion);

    await expect(
      useCase.execute({
        userId: 'user-1',
        promoCode: 'SUMMER2026',
        orderValue: 50000, // < 100000
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('Test Case 3: Tổng lượt dùng DB + lượt Hold Redis đã chạm trần usage_limit -> Báo lỗi Conflict', async () => {
    mockPrisma.promotions.findUnique.mockResolvedValueOnce(validPromotion); // used_count = 50, limit = 100
    
    // Giả lập Redis đang hold 50 lượt (Tổng = 50 + 50 = 100 >= 100)
    mockCacheManager.get.mockResolvedValueOnce(50); 

    await expect(
      useCase.execute({
        userId: 'user-1',
        promoCode: 'SUMMER2026',
        orderValue: 200000,
      })
    ).rejects.toThrow(ConflictException);
  });
});
