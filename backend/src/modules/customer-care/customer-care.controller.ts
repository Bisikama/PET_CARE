import { Body, Controller, Param, Post, Put, Get, UseGuards, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { ReviewsService } from './application/use-cases/reviews.service';
import { SupportService } from './application/use-cases/support.service';
import { DisputesService } from './application/use-cases/disputes.service';
import { IncidentsService } from './application/use-cases/incidents.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateTicketDto, ReplyTicketDto } from './dto/support.dto';
import { OpenDisputeDto } from './dto/dispute.dto';
import { ReportIncidentDto } from './dto/incident.dto';

@ApiTags('Customer-care')
@Controller('customer-care')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class CustomerCareController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly supportService: SupportService,
    private readonly disputesService: DisputesService,
    private readonly incidentsService: IncidentsService,
  ) {}

  // --- REVIEWS ---
  @Get('providers/:providerId/reviews')
  @ApiOperation({ summary: 'Lấy danh sách đánh giá của một Provider' })
  @ApiParam({ name: 'providerId', description: 'ID của Provider', type: String })
  @ApiResponse({ status: 200, description: 'Danh sách đánh giá phân trang' })
  async getProviderReviews(
    @Param('providerId') providerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.reviewsService.getProviderReviews(providerId, pageNum, limitNum);
  }

  @Post('bookings/:bookingId/reviews')
  @ApiOperation({ summary: 'Để lại đánh giá cho dịch vụ đã hoàn thành' })
  @ApiParam({ name: 'bookingId', description: 'ID của lịch đặt', type: String })
  @ApiResponse({ status: 201, description: 'Đánh giá thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch đặt' })
  async createReview(
    @GetCurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(userId, bookingId, dto);
  }

  // --- SUPPORT TICKETS ---
  @Post('tickets')
  @ApiOperation({ summary: 'Tạo yêu cầu hỗ trợ mới' })
  @ApiResponse({ status: 201, description: 'Tạo yêu cầu hỗ trợ thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  async createTicket(@GetCurrentUserId() userId: string, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(userId, dto);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu hỗ trợ của tôi' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách yêu cầu hỗ trợ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  async getMyTickets(@GetCurrentUserId() userId: string) {
    return this.supportService.getMyTickets(userId);
  }

  @Get('tickets/:ticketId')
  @ApiOperation({ summary: 'Lấy chi tiết yêu cầu hỗ trợ (gồm tin nhắn)' })
  @ApiParam({ name: 'ticketId', description: 'ID của yêu cầu hỗ trợ', type: String })
  @ApiResponse({ status: 200, description: 'Chi tiết yêu cầu hỗ trợ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy yêu cầu hỗ trợ' })
  async getTicketDetails(
    @GetCurrentUserId() userId: string,
    @Param('ticketId') ticketId: string,
  ) {
    return this.supportService.getTicketDetails(userId, ticketId, false);
  }

  @Post('tickets/:ticketId/reply')
  @ApiOperation({ summary: 'Phản hồi yêu cầu hỗ trợ' })
  @ApiParam({ name: 'ticketId', description: 'ID của yêu cầu hỗ trợ', type: String })
  @ApiResponse({ status: 201, description: 'Phản hồi thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy yêu cầu hỗ trợ' })
  async replyTicket(
    @GetCurrentUserId() userId: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: ReplyTicketDto,
  ) {
    return this.supportService.replyTicket(userId, ticketId, dto, false);
  }

  // --- DISPUTES ---
  @Post('bookings/:bookingId/disputes')
  @ApiOperation({ summary: 'Mở tranh chấp cho một lịch đặt' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Lý do tranh chấp' },
        title: { type: 'string', description: 'Tiêu đề tranh chấp' },
        description: { type: 'string', description: 'Mô tả chi tiết' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Danh sách ảnh/tài liệu bằng chứng (tối đa 5 file)',
        },
      },
    },
  })
  @ApiParam({ name: 'bookingId', description: 'ID của lịch đặt', type: String })
  @ApiResponse({ status: 201, description: 'Mở tranh chấp thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch đặt' })
  @UseInterceptors(FilesInterceptor('files', 5))
  async openDispute(
    @GetCurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: OpenDisputeDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.disputesService.openDispute(userId, bookingId, dto, files);
  }

  // --- INCIDENTS ---
  @Post('bookings/:bookingId/incidents')
  @ApiOperation({ summary: 'Báo cáo sự cố an toàn' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        severity: { type: 'string', description: 'Mức độ nghiêm trọng (LOW, MEDIUM, HIGH, CRITICAL)' },
        title: { type: 'string', description: 'Tiêu đề sự cố' },
        description: { type: 'string', description: 'Mô tả chi tiết sự cố' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Danh sách ảnh/tài liệu bằng chứng (tối đa 5 file)',
        },
      },
    },
  })
  @ApiParam({ name: 'bookingId', description: 'ID của lịch đặt', type: String })
  @ApiResponse({ status: 201, description: 'Báo cáo sự cố thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch đặt' })
  @UseInterceptors(FilesInterceptor('files', 5))
  async reportIncident(
    @GetCurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: ReportIncidentDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.incidentsService.reportIncident(userId, bookingId, dto, files);
  }
}
