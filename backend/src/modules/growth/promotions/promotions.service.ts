import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPromotion(dto: CreatePromotionDto) {
    // Cannot have both percent and amount null
    if (!dto.discountPercent && !dto.discountAmount) {
      throw new BadRequestException('Phải nhập phần trăm giảm giá hoặc số tiền giảm giá');
    }
    // Cannot have both percent and amount set
    if (dto.discountPercent && dto.discountAmount) {
      throw new BadRequestException('Chỉ được chọn một hình thức giảm giá (Phần trăm HOẶC Số tiền)');
    }

    const exists = await this.prisma.promotions.findUnique({
      where: { code: dto.code },
    });
    if (exists) {
      throw new ConflictException('Mã khuyến mãi đã tồn tại');
    }

    return this.prisma.promotions.create({
      data: {
        code: dto.code,
        discount_percent: dto.discountPercent,
        discount_amount: dto.discountAmount,
        min_order_value: dto.minOrderValue,
        max_discount_amount: dto.maxDiscountAmount,
        usage_limit: dto.usageLimit,
        start_date: new Date(dto.startDate),
        end_date: new Date(dto.endDate),
        is_active: dto.isActive ?? true,
      },
    });
  }

  async validatePromotion(userId: string, dto: ValidatePromotionDto) {
    const promotion = await this.prisma.promotions.findUnique({
      where: { code: dto.code },
    });

    if (!promotion || !promotion.is_active) {
      throw new NotFoundException('Mã khuyến mãi không tồn tại hoặc đã bị vô hiệu hóa');
    }

    const now = new Date();
    if (now < promotion.start_date || now > promotion.end_date) {
      throw new BadRequestException('Mã khuyến mãi không nằm trong thời gian áp dụng');
    }

    if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
      throw new BadRequestException('Mã khuyến mãi đã hết lượt sử dụng');
    }

    if (promotion.min_order_value && new Prisma.Decimal(dto.orderValue).lessThan(promotion.min_order_value)) {
      throw new BadRequestException(`Giá trị đơn hàng tối thiểu để áp dụng là ${promotion.min_order_value}`);
    }

    // Check if user already used this promotion
    const usage = await this.prisma.promotion_usages.findFirst({
      where: {
        promotion_id: promotion.id,
        user_id: userId,
      },
    });

    if (usage) {
      throw new ConflictException('Bạn đã sử dụng mã khuyến mãi này rồi');
    }

    // Calculate discount
    let discountAmount = new Prisma.Decimal(0);
    const orderValDecimal = new Prisma.Decimal(dto.orderValue);

    if (promotion.discount_percent) {
      discountAmount = orderValDecimal.mul(promotion.discount_percent).div(100);
      if (promotion.max_discount_amount && discountAmount.greaterThan(promotion.max_discount_amount)) {
        discountAmount = promotion.max_discount_amount;
      }
    } else if (promotion.discount_amount) {
      discountAmount = promotion.discount_amount;
      // Cannot discount more than the order value
      if (discountAmount.greaterThan(orderValDecimal)) {
        discountAmount = orderValDecimal;
      }
    }

    return {
      isValid: true,
      promotionId: promotion.id,
      code: promotion.code,
      originalPrice: dto.orderValue,
      discountAmount: discountAmount.toNumber(),
      finalPrice: orderValDecimal.sub(discountAmount).toNumber(),
    };
  }

  // To be called when payment succeeds
  async consumePromotion(userId: string, code: string, bookingId?: string) {
    const promotion = await this.prisma.promotions.findUnique({
      where: { code },
    });

    if (!promotion) {
      throw new NotFoundException('Mã khuyến mãi không tồn tại');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Create usage record
      await tx.promotion_usages.create({
        data: {
          promotion_id: promotion.id,
          user_id: userId,
          booking_id: bookingId,
        },
      });

      // 2. Increment used_count (Phòng chống Race Condition)
      const updateCondition: Prisma.promotionsUpdateManyArgs['where'] = { id: promotion.id };
      
      if (promotion.usage_limit !== null) {
        updateCondition.used_count = { lt: promotion.usage_limit };
      }

      const { count } = await tx.promotions.updateMany({
        where: updateCondition,
        data: { used_count: { increment: 1 } },
      });

      if (count === 0) {
        throw new BadRequestException('Mã khuyến mãi đã hết lượt sử dụng (đã có người nhanh tay hơn)');
      }
    });
  }
}
