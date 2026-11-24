import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { SepayService } from './application/use-cases/sepay.service';
import type { AdminResolveAction } from './application/use-cases/sepay.service';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class SepayController {
  constructor(private readonly sepayService: SepayService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('checkout-bank-transfer')
  @ApiOperation({
    summary: 'Tạo thông tin chuyển khoản VietQR (MB Bank, đối soát tự động qua SePay)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bookingId: { type: 'string', description: 'ID của Booking cần thanh toán' },
        promotionCode: { type: 'string', description: 'Mã khuyến mãi (tuỳ chọn)', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Thông tin tài khoản nhận, số tiền, nội dung chuyển khoản và ảnh VietQR.',
  })
  async checkoutBankTransfer(
    @GetCurrentUserId() userId: string,
    @Body('bookingId') bookingId: string,
    @Body('promotionCode') promotionCode?: string,
  ) {
    return this.sepayService.createBankTransferCheckout(bookingId, userId, promotionCode);
  }

  @Public()
  @SkipThrottle() // SePay không retry khi bị 429 => không được để rate limit nuốt mất giao dịch
  @Post('sepay-webhook')
  @ApiOperation({
    summary: 'Webhook SePay báo biến động số dư',
    description:
      'Xác thực bằng header `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`. Trả `{"success": true}` khi đã ghi nhận.',
  })
  async sepayWebhook(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: any,
    @Res() res: Response,
  ) {
    this.sepayService.verifyWebhookAuth(authorization);
    const outcome = await this.sepayService.handleWebhook(body);
    // SePay chỉ coi là thành công khi HTTP 200/201 VÀ body có {"success": true}
    return res.status(HttpStatus.OK).json({ success: true, status: outcome.status });
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('admin/bank-transactions')
  @ApiOperation({
    summary: 'Admin: sổ giao dịch ngân hàng từ SePay (lọc UNMATCHED để xử lý thủ công)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['MATCHED', 'REFUNDED_TO_WALLET', 'UNMATCHED', 'IGNORED', 'RESOLVED_MANUALLY'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Tìm theo nội dung CK, mã thanh toán, mã tham chiếu',
  })
  async listBankTransactions(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('q') q?: string,
  ) {
    return this.sepayService.listBankTransactions(
      status,
      Number(page) || 1,
      Number(limit) || 20,
      q,
    );
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post('admin/bank-transactions/:id/resolve')
  @ApiOperation({
    summary:
      'Admin: xử lý giao dịch UNMATCHED (gán đơn / hoàn ví khách / đánh dấu đã xử lý ngoài hệ thống)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['action', 'reason'],
      properties: {
        action: { type: 'string', enum: ['ASSIGN', 'CREDIT_WALLET', 'MARK_RESOLVED'] },
        paymentCode: { type: 'string', description: 'ASSIGN: mã thanh toán (PC...)' },
        bookingId: { type: 'string', description: 'ASSIGN: hoặc Booking ID' },
        customerEmail: { type: 'string', description: 'CREDIT_WALLET: email khách nhận tiền hoàn' },
        reason: { type: 'string', description: 'Lý do / bằng chứng (bắt buộc, ghi audit log)' },
      },
    },
  })
  async resolveBankTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUserId() adminId: string,
    @Body() body: AdminResolveAction,
  ) {
    return this.sepayService.adminResolve(id, adminId, body);
  }
}
