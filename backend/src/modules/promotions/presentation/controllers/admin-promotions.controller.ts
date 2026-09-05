import { Controller, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreatePromotionDto, UpdatePromotionLimitsDto } from '../../dto/admin-promotions.dto';
import { AccessTokenGuard } from '../../../../common/guards/access-token.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

import { PromotionsService } from '../../../growth/promotions/promotions.service';

@ApiTags('Admin - Promotions')
@ApiBearerAuth()
@Controller('api/admin/promotions')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mã giảm giá mới (Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo mã giảm giá thành công.' })
  @ApiResponse({ status: 400, description: 'Lỗi validate dữ liệu.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async createPromotion(@Body() dto: CreatePromotionDto) {
    const mappedDto = {
      code: dto.code,
      discountPercent: dto.discount_percent,
      discountAmount: dto.discount_amount,
      maxDiscountAmount: dto.max_discount_amount,
      minOrderValue: dto.min_order_value,
      usageLimit: dto.usage_limit,
      maxUsagePerUser: dto.max_usage_per_user,
      startDate: dto.start_date,
      endDate: dto.end_date,
    };
    const promotion = await this.promotionsService.createPromotion(mappedDto as any);
    return { success: true, promotion };
  }

  @Put(':id/limits')
  @ApiOperation({ summary: 'Cập nhật giới hạn mã giảm giá (Admin)' })
  @ApiParam({ name: 'id', description: 'ID của mã giảm giá' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 400, description: 'Lỗi validate dữ liệu.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async updateLimits(@Param('id') id: string, @Body() dto: UpdatePromotionLimitsDto) {
    const updated = await this.promotionsService.updatePromotionLimits(id, dto);
    return { success: true, promotion: updated };
  }
}
