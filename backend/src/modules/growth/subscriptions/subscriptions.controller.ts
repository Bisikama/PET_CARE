import { Body, Controller, Get, Post, UseGuards, Ip } from '@nestjs/common';
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

  @Post('checkout-vnpay')
  @ApiOperation({ summary: 'Tạo URL thanh toán VNPay để mua gói' })
  @ApiResponse({ status: 201, description: 'Trả về URL thanh toán.' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 409, description: 'Đã có gói đang hoạt động (Conflict).' })
  async checkoutVnpay(
    @GetCurrentUserId() userId: string,
    @Body() dto: SubscribeDto,
    @Ip() ip: string,
  ) {
    return this.subscriptionsService.checkoutVnpay(userId, dto, ip || '127.0.0.1');
  }

  @Post('checkout-wallet')
  @ApiOperation({ summary: 'Mua gói bằng số dư Ví Customer' })
  @ApiResponse({ status: 201, description: 'Đăng ký gói thành công.' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 409, description: 'Đã có gói đang hoạt động hoặc số dư không đủ (Conflict).' })
  async checkoutWallet(
    @GetCurrentUserId() userId: string,
    @Body() dto: SubscribeDto,
  ) {
    return this.subscriptionsService.checkoutWallet(userId, dto);
  }

  @Get('my-subscription')
  @ApiOperation({ summary: 'Xem gói đăng ký hiện tại' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin gói đăng ký.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói đăng ký (SUBSCRIPTION_NOT_FOUND).' })
  async getMySubscription(@GetCurrentUserId() userId: string) {
    return this.subscriptionsService.getMySubscription(userId);
  }
}
