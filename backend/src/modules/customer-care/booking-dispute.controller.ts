import { Controller, Get, Param, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DisputesService } from './application/use-cases/disputes.service';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';

@ApiTags('Disputes (Customer & Provider)')
@Controller('api/bookings')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class BookingDisputeController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get(':id/dispute')
  @ApiOperation({ summary: 'Theo dõi tiến trình và kết quả phân xử tranh chấp' })
  @ApiParam({ name: 'id', description: 'Mã Booking ID', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Chi tiết tranh chấp.',
    schema: { 
      example: { 
        id: 'comp-123',
        status: 'RESOLVED',
        decision: 'REFUND_50_PERCENT',
        resolutionNote: 'Hòa giải đôi bên 50-50',
        resolvedAt: '2026-09-04T16:00:00.000Z'
      } 
    } 
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Chỉ Customer hoặc Provider của Booking này mới được xem).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy Booking hoặc chưa có tranh chấp.' })
  async getBookingDispute(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
  ) {
    return this.disputesService.getBookingDispute(userId, bookingId);
  }
}
