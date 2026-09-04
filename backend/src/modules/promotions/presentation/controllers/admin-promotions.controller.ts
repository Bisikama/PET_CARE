import { Controller, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreatePromotionDto, UpdatePromotionLimitsDto } from '../../dto/admin-promotions.dto';
import { AccessTokenGuard } from '../../../../common/guards/access-token.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin - Promotions')
@ApiBearerAuth()
@Controller('api/admin/promotions')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminPromotionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mã giảm giá mới (Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo mã giảm giá thành công.' })
  @ApiResponse({ status: 400, description: 'Lỗi validate dữ liệu.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async createPromotion(@Body() dto: CreatePromotionDto) {
    const promotion = await this.prisma.promotions.create({
      data: {
        code: dto.code.toUpperCase().trim(),
        discount_percent: dto.discount_percent,
        discount_amount: dto.discount_amount,
        max_discount_amount: dto.max_discount_amount,
        min_order_value: dto.min_order_value,
        usage_limit: dto.usage_limit,
        max_usage_per_user: dto.max_usage_per_user,
        start_date: new Date(dto.start_date),
        end_date: new Date(dto.end_date),
      },
    });
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
    const updated = await this.prisma.promotions.update({
      where: { id },
      data: {
        usage_limit: dto.usageLimit,
        max_usage_per_user: dto.maxUsagePerUser,
      },
    });
    return { success: true, promotion: updated };
  }
}
