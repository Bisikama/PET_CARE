import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@ApiTags('Admin/promotions')
@Controller('admin/promotions')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mã khuyến mãi mới' })
  @ApiResponse({ status: 201, description: 'Tạo mã thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  async createPromotion(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.createPromotion(dto);
  }
}
