import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GetCurrentUserId } from '../../../common/decorators/get-current-user-id.decorator';
import { AdminSubscriptionsService } from './admin-subscriptions.service';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from './dto/subscription-plan.dto';

@ApiTags('Admin/subscriptions')
@Controller('admin/subscriptions')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminSubscriptionsController {
  constructor(private readonly adminSubscriptionsService: AdminSubscriptionsService) {}

  @Get('plans')
  @ApiOperation({
    summary: 'Admin: tất cả gói hội viên kèm số đã bán, doanh thu, số khách đang dùng',
  })
  async listPlans() {
    return this.adminSubscriptionsService.listPlans();
  }

  @Post('plans')
  @ApiOperation({ summary: 'Admin: tạo gói hội viên mới' })
  @ApiResponse({ status: 409, description: 'Mã gói đã tồn tại' })
  async createPlan(@Body() dto: CreateSubscriptionPlanDto, @GetCurrentUserId() adminId: string) {
    return this.adminSubscriptionsService.createPlan(dto, adminId);
  }

  @Patch('plans/:id')
  @ApiOperation({
    summary: 'Admin: sửa gói (tên, giá, thời hạn, quyền lợi, mở/ngừng bán). Mã gói không đổi được.',
  })
  async updatePlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
    @GetCurrentUserId() adminId: string,
  ) {
    return this.adminSubscriptionsService.updatePlan(id, dto, adminId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Admin: danh sách đơn mua gói và tổng quan doanh thu' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PAID', 'CANCELLED'] })
  @ApiQuery({ name: 'planCode', required: false })
  @ApiQuery({ name: 'q', required: false, description: 'Tìm theo email, tên khách, mã thanh toán' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listOrders(
    @Query('status') status?: string,
    @Query('planCode') planCode?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminSubscriptionsService.listOrders({
      status,
      planCode,
      q,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }
}
