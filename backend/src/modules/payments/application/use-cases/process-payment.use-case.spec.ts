import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPaymentUseCase } from './process-payment.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let cacheManager: any;

  const mockPrisma = {
    $transaction: jest.fn((callback) => callback(mockPrisma)),
    $queryRaw: jest.fn(),
    promotions: { update: jest.fn() },
    promotion_usages: { create: jest.fn() },
    payments: { findFirst: jest.fn(), update: jest.fn() },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPaymentUseCase,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'CACHE_MANAGER', useValue: mockCacheManager },
      ],
    }).compile();

    useCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
    cacheManager = module.get('CACHE_MANAGER');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Trường hợp 1: Hold Redis còn hiệu lực -> Chốt DB thành công -> Xóa Redis Key', async () => {
    // 1. Redis có key
    mockCacheManager.get.mockImplementation((key) => {
      if (key === 'promo_hold:SUMMER:user-1') return Promise.resolve({ discountAmount: 50000, orderValue: 200000 });
      if (key === 'promo_hold_count:SUMMER') return Promise.resolve(10);
      return Promise.resolve(null);
    });

    // 2. DB Query Raw trả về dòng Promotion với used_count hợp lệ
    mockPrisma.$queryRaw.mockResolvedValueOnce([{
      id: 'promo-1',
      used_count: 5,
      usage_limit: 100
    }]);

    mockPrisma.payments.findFirst.mockResolvedValueOnce({ id: 'payment-1' });

    const result = await useCase.execute({
      bookingId: 'booking-1',
      userId: 'user-1',
      promoCode: 'SUMMER',
      paymentMethod: 'WALLET',
      amount: 150000,
    });

    expect(result.success).toBe(true);

    // Kiểm tra DB Pessimistic Lock đã chạy
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining('SELECT id, used_count, usage_limit')]),
      'SUMMER'
    );

    // Kiểm tra đã Update DB
    expect(mockPrisma.promotions.update).toHaveBeenCalledWith({
      where: { id: 'promo-1' },
      data: { used_count: { increment: 1 } },
    });
    
    expect(mockPrisma.promotion_usages.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ discount_amount: 50000 }),
    });

    // Kiểm tra Redis đã xóa Hold
    expect(mockCacheManager.del).toHaveBeenCalledWith('promo_hold:SUMMER:user-1');
    expect(mockCacheManager.set).toHaveBeenCalledWith('promo_hold_count:SUMMER', 9, 600000);
  });

  it('Trường hợp 2: Hold Redis đã hết TTL (không tìm thấy) -> Ném lỗi BadRequest (không gọi lệnh Update DB)', async () => {
    // 1. Redis KHÔNG CÓ KEY
    mockCacheManager.get.mockResolvedValueOnce(null);

    await expect(useCase.execute({
      bookingId: 'booking-1',
      userId: 'user-1',
      promoCode: 'EXPIRED',
      paymentMethod: 'WALLET',
      amount: 150000,
    })).rejects.toThrow(BadRequestException);

    // Kiểm tra KHÔNG GỌI lệnh DB
    expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    expect(mockPrisma.promotions.update).not.toHaveBeenCalled();
    expect(mockCacheManager.del).not.toHaveBeenCalled();
  });

  it('Trường hợp 3: Phát hiện Conflict ở phút chót do Database used_count >= usage_limit', async () => {
    // 1. Redis hợp lệ
    mockCacheManager.get.mockResolvedValueOnce({ discountAmount: 50000, orderValue: 200000 });

    // 2. NHƯNG DB trả về used_count đã = usage_limit (Conflict!)
    mockPrisma.$queryRaw.mockResolvedValueOnce([{
      id: 'promo-1',
      used_count: 100,
      usage_limit: 100
    }]);

    await expect(useCase.execute({
      bookingId: 'booking-1',
      userId: 'user-1',
      promoCode: 'SUMMER',
      paymentMethod: 'WALLET',
      amount: 150000,
    })).rejects.toThrow(BadRequestException);

    // Không update gì cả
    expect(mockPrisma.promotions.update).not.toHaveBeenCalled();
  });
});
