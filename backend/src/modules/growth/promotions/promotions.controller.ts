import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
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

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khuyến mãi đang áp dụng' })
  @ApiResponse({ status: 200, description: 'Danh sách mã khuyến mãi.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  async getActivePromotions() {
    return this.promotionsService.getActivePromotions();
  }

  @Post('validate')
  @ApiOperation({ summary: 'Kiểm tra tính hợp lệ của mã khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Mã hợp lệ.' })
  @ApiResponse({ status: 400, description: 'Mã không hợp lệ hoặc đã hết hạn (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mã khuyến mãi (PROMOTION_NOT_FOUND).' })
  async validatePromotion(
    @GetCurrentUserId() userId: string,
    @Body() dto: ValidatePromotionDto,
  ) {
    return this.promotionsService.validatePromotion(userId, dto);
  }

}
