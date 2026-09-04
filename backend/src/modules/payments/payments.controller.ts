import { Controller, Post, Body, Res, Get, Query, HttpCode, HttpStatus, Ip, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
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
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
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

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('checkout-wallet')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Thanh toán Booking bằng số dư Ví Customer' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bookingId: { type: 'string', description: 'ID của Booking cần thanh toán' },
        promotionCode: { type: 'string', description: 'Mã khuyến mãi (tùy chọn)', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Thanh toán thành công.' })
  @ApiResponse({ status: 400, description: 'Lỗi đầu vào hoặc không tìm thấy ví (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 409, description: 'Số dư không đủ hoặc Booking không hợp lệ (Conflict).' })
  async checkoutWallet(
    @GetCurrentUserId() userId: string,
    @Body('bookingId') bookingId: string,
    @Body('promotionCode') promotionCode?: string,
  ) {
    return this.paymentsService.checkoutWithWallet(userId, bookingId, promotionCode);
  }

  @Get('vnpay-ipn')
  @ApiOperation({ summary: 'Webhook IPN (VNPAY gọi server-to-server để báo trạng thái thanh toán)' })
  @ApiResponse({ status: 200, description: 'Trả về mã lỗi quy định của VNPAY (vd: {RspCode: "00", Message: "Confirm Success"})' })
  async vnpayIpn(@Query() query: any, @Res() res: Response) {
    const result = await this.paymentsService.processPaymentCallback(query);
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('momo-ipn')
  @ApiOperation({ 
    summary: 'Webhook IPN từ Momo',
    description: 'Endpoint nhận thông báo trạng thái thanh toán từ hệ thống Momo. Yêu cầu xác thực chữ ký (Signature) bằng thuật toán HMAC SHA256.',
  })
  @ApiBody({
    description: 'Payload chuẩn của Momo IPN',
    schema: {
      type: 'object',
      properties: {
        partnerCode: { type: 'string' },
        orderId: { type: 'string' },
        requestId: { type: 'string' },
        amount: { type: 'number' },
        orderInfo: { type: 'string' },
        orderType: { type: 'string' },
        transId: { type: 'number' },
        resultCode: { type: 'number' },
        message: { type: 'string' },
        payType: { type: 'string' },
        responseTime: { type: 'number' },
        extraData: { type: 'string' },
        signature: { type: 'string' },
      },
    }
  })
  @ApiResponse({ status: 204, description: 'Momo ghi nhận webhook thành công.' })
  @ApiResponse({ status: 400, description: 'Lỗi xác thực chữ ký hoặc payload không hợp lệ (Validation Error).' })
  async momoIpn(@Body() body: any, @Res() res: Response) {
    const result = await this.paymentsService.processMomoIPN(body);
    if (result.RspCode === '00') {
      return res.status(HttpStatus.NO_CONTENT).send();
    }
    return res.status(HttpStatus.BAD_REQUEST).json(result);
  }

  @Get('vnpay-return')
  @ApiOperation({ summary: 'Return URL (Frontend redirect người dùng về đây sau khi thanh toán xong trên VNPAY)' })
  @ApiQuery({ name: 'vnp_ResponseCode', required: false, description: 'Mã phản hồi từ VNPAY (00 là thành công)' })
  @ApiQuery({ name: 'vnp_TxnRef', required: false, description: 'Mã giao dịch (chính là bookingId)' })
  @ApiResponse({ status: 200, description: 'Thanh toán thành công.' })
  @ApiResponse({ status: 400, description: 'Thanh toán thất bại hoặc bị hủy (Validation Error).' })
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    // Trong thực tế, bạn thường redirect về Frontend kèm query string
    // Ví dụ: res.redirect(`http://localhost:5173/payment-result?code=${query.vnp_ResponseCode}`);
    
    if (query.vnp_ResponseCode === '00') {
      return res.status(HttpStatus.OK).json({ success: true, message: 'Thanh toán VNPay thành công', data: query });
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Thanh toán VNPay thất bại hoặc bị hủy', data: query });
    }
  }
}
