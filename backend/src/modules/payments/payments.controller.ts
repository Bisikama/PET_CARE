import { Controller, Post, Body, Res, Get, Query, HttpCode, HttpStatus, Ip, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './application/use-cases/payments.service';
import type { Response } from 'express';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('checkout')
  @ApiOperation({ summary: 'Tạo URL thanh toán VNPay cho Booking hiện tại' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bookingId: { type: 'string', description: 'ID của Booking cần thanh toán' },
        promotionCode: { type: 'string', description: 'Mã khuyến mãi (tuỳ chọn)', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Trả về URL thanh toán', schema: { example: { paymentUrl: 'https://sandbox.vnpayment.vn/...' } } })
  async checkout(
    @GetCurrentUserId() userId: string,
    @Body('bookingId') bookingId: string,
    @Body('promotionCode') promotionCode: string | undefined,
    @Ip() ip: string,
  ) {
    const ipAddr = ip || '127.0.0.1';
    
    // Security Fix: Get amount directly from database
    const booking = await this.paymentsService.getBookingForCheckout(bookingId);
    
    const paymentUrl = await this.paymentsService.createVNPayUrl(bookingId, Number(booking.total_price), ipAddr, promotionCode);
    return { paymentUrl };
  }

  @Get('vnpay-ipn')
  @ApiOperation({ summary: 'Webhook IPN từ VNPay' })
  async vnpayIpn(@Query() query: any, @Res() res: Response) {
    const result = await this.paymentsService.processPaymentCallback(query);
    return res.status(HttpStatus.OK).json(result);
  }
}
