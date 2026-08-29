import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../../common/decorators/get-current-user-id.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Đăng ký gói (Mock thanh toán)' })
  @ApiResponse({ status: 201, description: 'Đăng ký gói thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  async subscribe(
    @GetCurrentUserId() userId: string,
    @Body() dto: SubscribeDto,
  ) {
    return this.subscriptionsService.subscribe(userId, dto);
  }

  @Get('my-subscription')
  @ApiOperation({ summary: 'Xem gói đăng ký hiện tại' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin gói đăng ký' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói đăng ký' })
  async getMySubscription(@GetCurrentUserId() userId: string) {
    return this.subscriptionsService.getMySubscription(userId);
  }
}
