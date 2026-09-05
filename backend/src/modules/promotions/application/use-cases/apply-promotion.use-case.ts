import { Injectable, Inject, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

import { Cache } from 'cache-manager';

export interface ApplyPromotionInput {
  userId: string;
  promoCode: string;
  orderValue: number;
}

export interface ApplyPromotionOutput {
  success: true;
  promoCode: string;
  discountAmount: number;
  finalOrderValue: number;
  heldUntil: Date;
}

@Injectable()
export class ApplyPromotionUseCase {
  private readonly logger = new Logger(ApplyPromotionUseCase.name);
  private readonly HOLD_TTL_MS = 600000; // 10 minutes

  constructor(
    private readonly prisma: PrismaService,
    @Inject('CACHE_MANAGER') private readonly cacheManager: any,
  ) {}

  async execute(input: ApplyPromotionInput): Promise<ApplyPromotionOutput> {
    const { userId, promoCode, orderValue } = input;
    const normalizedCode = promoCode.toUpperCase().trim();

    // 1. Validate Promotion in DB
    const promotion = await this.prisma.promotions.findUnique({
      where: { code: normalizedCode },
    });

    if (!promotion || !promotion.is_active) {
      throw new BadRequestException('Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa.');
    }

    const now = new Date();
    if (now < promotion.start_date || now > promotion.end_date) {
      throw new BadRequestException('Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng.');
    }

    const minOrderValue = promotion.min_order_value ? Number(promotion.min_order_value) : 0;
    if (orderValue < minOrderValue) {
      throw new BadRequestException(`Đơn hàng chưa đạt giá trị tối thiểu ${minOrderValue}đ để áp dụng mã này.`);
    }

    // 2. Concurrency Check: DB Used Count + Redis Holds vs Limit
    if (promotion.usage_limit) {
      // Get all current holds for this promo code
      // Note: In a real Redis setup, we'd use KEYS or a Set. With cache-manager, we can simulate or keep a counter.
      // Better approach for Redis: keep a counter `promo_hold_count:{code}` or atomic increments.
      // For this implementation, we will check if usage_limit is reached by reading a specific counter.
      const holdCountKey = `promo_hold_count:${normalizedCode}`;
      const currentHolds = (await this.cacheManager.get(holdCountKey)) || 0;

      if (promotion.used_count + currentHolds >= promotion.usage_limit) {
        throw new ConflictException('Mã giảm giá đã hết lượt sử dụng.');
      }
    }

    // 3. User usage limit check
    if (promotion.max_usage_per_user) {
      const userUsage = await this.prisma.promotion_usages.count({
        where: { promotion_id: promotion.id, user_id: userId },
      });
      
      const userHoldKey = `promo_hold:${normalizedCode}:${userId}`;
      const userHold = await this.cacheManager.get(userHoldKey);

      if (userUsage + (userHold ? 1 : 0) >= promotion.max_usage_per_user) {
        throw new ConflictException('Bạn đã hết lượt sử dụng mã này.');
      }
    }

    // 4. Calculate Discount
    let discountAmount = 0;
    if (promotion.discount_percent) {
      discountAmount = (orderValue * promotion.discount_percent) / 100;
      if (promotion.max_discount_amount) {
        const maxDiscount = Number(promotion.max_discount_amount);
        if (discountAmount > maxDiscount) {
          discountAmount = maxDiscount;
        }
      }
    } else if (promotion.discount_amount) {
      discountAmount = Number(promotion.discount_amount);
    }
    
    // Ensure discount doesn't exceed order value
    discountAmount = Math.min(discountAmount, orderValue);

    // 5. Create Hold in Redis
    const userHoldKey = `promo_hold:${normalizedCode}:${userId}`;
    const holdData = { discountAmount, orderValue };
    
    // In cache-manager v5+, ttl is in milliseconds
    await this.cacheManager.set(userHoldKey, holdData, this.HOLD_TTL_MS);

    // Increment global hold counter atomically (simulated for cache-manager)
    const holdCountKey = `promo_hold_count:${normalizedCode}`;
    const currentHolds = (await this.cacheManager.get(holdCountKey)) || 0;
    await this.cacheManager.set(holdCountKey, currentHolds + 1, this.HOLD_TTL_MS);

    return {
      success: true,
      promoCode: normalizedCode,
      discountAmount,
      finalOrderValue: orderValue - discountAmount,
      heldUntil: new Date(Date.now() + this.HOLD_TTL_MS),
    };
  }
}
