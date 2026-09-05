import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ApplyPromotionUseCase } from '../../application/use-cases/apply-promotion.use-case';
import { ApplyPromotionDto } from '../../dto/apply-promotion.dto';
import { AccessTokenGuard } from '../../../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../../../common/decorators/get-current-user-id.decorator';

@ApiTags('Promotions (Customer)')
@Controller('api/promotions')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class PromotionsController {
  constructor(private readonly applyPromotionUseCase: ApplyPromotionUseCase) {}

  @Post('apply')
  @ApiOperation({ summary: 'Áp dụng mã giảm giá (Hold Quota vào Redis trong 10 phút)' })
  @ApiResponse({ status: 201, description: 'Giữ chỗ mã giảm giá thành công.', schema: { example: { success: true, promoCode: 'SUMMER2026', discountAmount: 40000, finalOrderValue: 160000, heldUntil: '2026-09-04T16:00:00.000Z' } } })
  @ApiResponse({ status: 400, description: 'Mã không tồn tại, hết hạn, hoặc chưa đạt giá trị tối thiểu (Min Order Value).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 409, description: 'Mã giảm giá đã hết lượt sử dụng (Conflict).' })
  async applyPromotion(
    @GetCurrentUserId() userId: string,
    @Body() dto: ApplyPromotionDto,
  ) {
    return this.applyPromotionUseCase.execute({
      userId,
      promoCode: dto.promoCode,
      orderValue: dto.orderValue,
    });
  }
}
