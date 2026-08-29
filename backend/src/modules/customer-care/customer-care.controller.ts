import { Body, Controller, Param, Post, Put, Get, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
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
