import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { SettlementsService } from './application/use-cases/settlements.service';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Settlements (Admin Only)')
@Controller('admin/settlements')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get('payout-requests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu rút tiền đang chờ duyệt (Admin)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách yêu cầu rút tiền trạng thái PAYOUT_PENDING' })
  async getPendingPayoutRequests() {
    return this.settlementsService.getPendingPayoutRequests();
  }

  @Post('payout-requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Duyệt yêu cầu rút tiền và giải ngân (Admin)' })
  @ApiParam({ name: 'id', description: 'ID của yêu cầu rút tiền (payoutRequestId)' })
  @ApiResponse({ status: 200, description: 'Giải ngân thành công', schema: { example: { success: true, payoutRequest: { id: '...', status: 'PAID_OUT' } } } })
  @ApiResponse({ status: 400, description: 'Không tìm thấy yêu cầu hoặc ví' })
  @ApiResponse({ status: 409, description: 'Yêu cầu không hợp lệ hoặc số dư ví không đủ' })
  async approvePayout(
    @GetCurrentUserId() adminId: string,
    @Param('id') payoutRequestId: string,
  ) {
    return this.settlementsService.approvePayoutRequest(adminId, payoutRequestId);
  }

  @Post('payout-requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Từ chối yêu cầu rút tiền (Admin)' })
  @ApiParam({ name: 'id', description: 'ID của yêu cầu rút tiền (payoutRequestId)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Lý do từ chối (bắt buộc)' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Từ chối thành công, tiền đã được hoàn lại vào ví Provider' })
  @ApiResponse({ status: 400, description: 'Thiếu lý do hoặc không tìm thấy yêu cầu' })
  async rejectPayout(
    @GetCurrentUserId() adminId: string,
    @Param('id') payoutRequestId: string,
    @Body('reason') reason: string,
  ) {
    return this.settlementsService.rejectPayoutRequest(adminId, payoutRequestId, reason);
  }

  @Post('payments/:bookingId/release-escrow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Giải phóng tiền ký quỹ thủ công cho Provider (Admin)' })
  @ApiParam({ name: 'bookingId', description: 'ID của Booking' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Lý do giải phóng thủ công' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Giải phóng tiền ký quỹ thành công' })
  @ApiResponse({ status: 400, description: 'Booking/Payment không tồn tại' })
  @ApiResponse({ status: 409, description: 'Trạng thái thanh toán không hợp lệ' })
  async manualReleaseEscrow(
    @GetCurrentUserId() adminId: string,
    @Param('bookingId') bookingId: string,
    @Body('reason') reason: string,
  ) {
    return this.settlementsService.manualReleaseEscrow(adminId, bookingId, reason);
  }

  @Post('payments/:bookingId/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hoàn tiền thủ công cho Customer (Admin Manual Refund)' })
  @ApiParam({ name: 'bookingId', description: 'ID của Booking cần hoàn tiền' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Lý do hoàn tiền' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Hoàn tiền thành công', schema: { example: { success: true, message: 'Hoàn tiền thành công' } } })
  @ApiResponse({ status: 400, description: 'Trạng thái Booking/Payment không cho phép hoàn tiền' })
  async manualRefund(
    @GetCurrentUserId() adminId: string,
    @Param('bookingId') bookingId: string,
    @Body('reason') reason: string,
  ) {
    return this.settlementsService.manualRefund(adminId, bookingId, reason);
  }
}
