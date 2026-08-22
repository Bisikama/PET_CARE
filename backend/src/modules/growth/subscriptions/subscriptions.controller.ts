import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../../common/decorators/get-current-user-id.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Đăng ký gói (Mock thanh toán)' })
  async subscribe(
    @GetCurrentUserId() userId: string,
    @Body() dto: SubscribeDto,
  ) {
    return this.subscriptionsService.subscribe(userId, dto);
  }

  @Get('my-subscription')
  @ApiOperation({ summary: 'Xem gói đăng ký hiện tại' })
  async getMySubscription(@GetCurrentUserId() userId: string) {
    return this.subscriptionsService.getMySubscription(userId);
  }
}
