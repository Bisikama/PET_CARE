import { Body, Controller, Get, Ip, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../../common/decorators/get-current-user-id.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'Danh sách gói hội viên đang mở bán' })
  async listPlans() {
    return this.subscriptionsService.listPublicPlans();
  }

  @Post('checkout-bank-transfer')
  @ApiOperation({
    summary: 'Mua gói bằng chuyển khoản VietQR (nội dung CK: "<mã> Thanh toan goi <MÃ GÓI>")',
  })
  @ApiResponse({ status: 201, description: 'Thông tin tài khoản nhận, số tiền, nội dung CK và ảnh VietQR.' })
  @ApiResponse({ status: 404, description: 'Gói không tồn tại hoặc đã ngừng bán.' })
  @ApiResponse({ status: 409, description: 'Đang dùng gói khác còn hạn.' })
  async checkoutBankTransfer(@GetCurrentUserId() userId: string, @Body() dto: SubscribeDto) {
    return this.subscriptionsService.checkoutBankTransfer(userId, dto.planCode);
  }

  @Post('checkout-vnpay')
  @ApiOperation({ summary: 'Tạo URL thanh toán VNPay để mua gói' })
  @ApiResponse({ status: 201, description: 'Trả về URL thanh toán.' })
  @ApiResponse({ status: 409, description: 'Đang dùng gói khác còn hạn.' })
  async checkoutVnpay(@GetCurrentUserId() userId: string, @Body() dto: SubscribeDto, @Ip() ip: string) {
    return this.subscriptionsService.checkoutVnpay(userId, dto.planCode, ip || '127.0.0.1');
  }

  @Post('checkout-wallet')
  @ApiOperation({ summary: 'Mua gói bằng số dư hoàn tiền trong Ví PetCare' })
  @ApiResponse({ status: 201, description: 'Đăng ký gói thành công.' })
  @ApiResponse({ status: 409, description: 'Đang dùng gói khác còn hạn hoặc số dư không đủ.' })
  async checkoutWallet(@GetCurrentUserId() userId: string, @Body() dto: SubscribeDto) {
    return this.subscriptionsService.checkoutWallet(userId, dto.planCode);
  }

  @Get('my-subscription')
  @ApiOperation({ summary: 'Gói đang dùng (null nếu chưa có)' })
  async getMySubscription(@GetCurrentUserId() userId: string) {
    return this.subscriptionsService.getMySubscription(userId);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Lịch sử mua gói của tôi' })
  async getMyOrders(@GetCurrentUserId() userId: string) {
    return this.subscriptionsService.getMyOrders(userId);
  }

  @Get('my-orders/:id')
  @ApiOperation({ summary: 'Trạng thái một đơn mua gói (dùng để hỏi định kỳ khi đang chuyển khoản)' })
  async getMyOrder(@GetCurrentUserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.getMyOrder(userId, id);
  }

  @Post('my-orders/:id/cancel')
  @ApiOperation({ summary: 'Huỷ một đơn mua gói đang chờ thanh toán (PENDING)' })
  @ApiResponse({ status: 201, description: 'Đã huỷ đơn mua gói đang chờ thanh toán.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn mua gói.' })
  @ApiResponse({ status: 409, description: 'Đơn đã thanh toán, không thể huỷ.' })
  async cancelMyOrder(@GetCurrentUserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.cancelMyOrder(userId, id);
  }
}
