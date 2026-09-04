import { Controller, Get, Param, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';

@ApiTags('Disputes (Customer & Provider)')
@Controller('api/bookings')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class BookingDisputeController {
  constructor(private readonly prisma: PrismaService) {}

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
    // 1. Kiểm tra IDOR: Booking này có thuộc về user đang gọi không?
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        complaints: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy lịch đặt chỗ (Booking).');
    }

    if (booking.customer_id !== userId && booking.provider_id !== userId) {
      throw new ForbiddenException('IDOR Prevented: Bạn không có quyền xem tranh chấp của Booking này.');
    }

    if (!booking.complaints || booking.complaints.length === 0) {
      throw new NotFoundException('Booking này chưa có bất kỳ tranh chấp nào được mở.');
    }

    // Lấy khiếu nại mới nhất
    const complaint = booking.complaints[booking.complaints.length - 1];

    return {
      id: complaint.id,
      status: complaint.status,
      decision: complaint.decision,
      resolutionNote: complaint.resolution_note,
      createdAt: complaint.created_at,
      resolvedAt: complaint.resolved_at,
    };
  }
}
