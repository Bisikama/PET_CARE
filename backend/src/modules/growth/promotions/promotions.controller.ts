import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../../common/decorators/get-current-user-id.decorator';
import { PromotionsService } from './promotions.service';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';

@ApiTags('Promotions')
@Controller('promotions')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Kiểm tra tính hợp lệ của mã khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Mã hợp lệ' })
  @ApiResponse({ status: 400, description: 'Mã không hợp lệ hoặc đã hết hạn' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mã khuyến mãi' })
  async validatePromotion(
    @GetCurrentUserId() userId: string,
    @Body() dto: ValidatePromotionDto,
  ) {
    return this.promotionsService.validatePromotion(userId, dto);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Mô phỏng áp dụng mã giảm giá (Dành cho Test)' })
  @ApiBody({ schema: { type: 'object', properties: { code: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Đã áp dụng mã thành công' })
  @ApiResponse({ status: 400, description: 'Mã không hợp lệ hoặc đã hết hạn' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mã khuyến mãi' })
  async applyPromotion(
    @GetCurrentUserId() userId: string,
    @Body('code') code: string,
  ) {
    // Hardcode order value 100k for testing purpose
    await this.promotionsService.validatePromotion(userId, { code, orderValue: 100000 });
    await this.promotionsService.consumePromotion(userId, code);
    return { message: 'Đã áp dụng mã thành công và lưu vào promotion_usages!' };
  }
}
