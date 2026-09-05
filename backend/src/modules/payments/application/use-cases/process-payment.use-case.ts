import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { Cache } from 'cache-manager';

export interface ProcessPaymentInput {
  bookingId: string;
  userId: string;
  promoCode?: string;
  paymentMethod: string;
  amount: number;
}

@Injectable()
export class ProcessPaymentUseCase {
  private readonly logger = new Logger(ProcessPaymentUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('CACHE_MANAGER') private readonly cacheManager: any,
  ) {}

  async execute(input: ProcessPaymentInput) {
    const { bookingId, userId, promoCode, amount } = input;
    
    return this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra mã giảm giá (Nếu có truyền vào)
      if (promoCode) {
        const normalizedCode = promoCode.toUpperCase().trim();
        const userHoldKey = `promo_hold:${normalizedCode}:${userId}`;
        
        // Đọc Redis kiểm tra suất Hold
        const holdData = (await this.cacheManager.get(userHoldKey)) as { discountAmount: number, orderValue: number };
        
        if (!holdData) {
          throw new BadRequestException('Mã giảm giá đã hết hạn giữ chỗ hoặc không hợp lệ.');
        }

        // 2. Pessimistic Lock (SELECT ... FOR UPDATE)
        // Khóa dòng Promotion này lại để đảm bảo không ai khác cập nhật used_count cùng lúc
        const promotions: any[] = await tx.$queryRaw`
          SELECT id, used_count, usage_limit 
          FROM promotions 
          WHERE code = ${normalizedCode} 
          FOR UPDATE
        `;

        if (!promotions || promotions.length === 0) {
          throw new BadRequestException('Mã giảm giá không tồn tại.');
        }

        const promotion = promotions[0];

        // 3. Validate Final: Kiểm tra chắc chắn lần cuối trong DB
        if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
          throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng (Conflict detected).');
        }

        // 4. Update DB: Tăng used_count và ghi log
        await tx.promotions.update({
          where: { id: promotion.id },
          data: {
            used_count: { increment: 1 },
          },
        });

        // Ghi nhận lịch sử sử dụng
        await tx.promotion_usages.create({
          data: {
            promotion_id: promotion.id,
            user_id: userId,
            booking_id: bookingId,
          },
        });

        // 5. Dọn dẹp Redis (Giải phóng RAM)
        await this.cacheManager.del(userHoldKey);
        
        // Cố gắng giảm biến đếm tổng lượt Hold (promo_hold_count) nếu có thể
        const holdCountKey = `promo_hold_count:${normalizedCode}`;
        const currentHolds = (await this.cacheManager.get(holdCountKey)) as number;
        if (currentHolds && currentHolds > 0) {
          await this.cacheManager.set(holdCountKey, currentHolds - 1, 600000); // Reset lại TTL hoặc giữ nguyên
        }

        this.logger.log(`User ${userId} successfully consumed promotion ${normalizedCode} for booking ${bookingId}`);
      }

      // 6. Xử lý logic Payment thông thường (Trừ tiền ví, v.v...)
      // Giả lập cập nhật trạng thái thanh toán
      const payment = await tx.payments.findFirst({
        where: { booking_id: bookingId },
      });

      if (payment) {
        await tx.payments.update({
          where: { id: payment.id },
          data: {
            status: 'PAID_HELD_IN_ESCROW',
            amount: amount, 
          },
        });
      }

      return {
        success: true,
        message: 'Thanh toán thành công',
        bookingId,
      };
    });
  }
}
