import { Body, Controller, Param, Post, Put, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { ReviewsService } from './application/use-cases/reviews.service';
import { SupportService } from './application/use-cases/support.service';
import { DisputesService } from './application/use-cases/disputes.service';
import { IncidentsService } from './application/use-cases/incidents.service';
import { ReplyTicketDto } from './dto/support.dto';
import { ResolveDisputeDto } from './dto/dispute.dto';
import { ResolveIncidentDto } from './dto/incident.dto';
import { support_ticket_status } from '@prisma/client';

@ApiTags('Admin/customer-care')
@Controller('admin/customer-care')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminCustomerCareController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly supportService: SupportService,
    private readonly disputesService: DisputesService,
    private readonly incidentsService: IncidentsService,
  ) {}

  // --- REVIEWS ---
  @Put('reviews/:reviewId/hide')
  @ApiOperation({ summary: 'Ẩn đánh giá' })
  @ApiParam({ name: 'reviewId', description: 'ID của đánh giá', type: String })
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Ẩn đánh giá thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đánh giá' })
  async hideReview(
    @GetCurrentUserId() adminId: string,
    @Param('reviewId') reviewId: string,
    @Body('reason') reason: string,
  ) {
    return this.reviewsService.hideReview(adminId, reviewId, reason);
  }

  // --- SUPPORT TICKETS ---
  @Get('tickets')
  @ApiOperation({ summary: 'Lấy danh sách toàn bộ yêu cầu hỗ trợ' })
  @ApiResponse({ status: 200, description: 'Danh sách yêu cầu hỗ trợ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  async getAllTickets() {
    return this.supportService.getAllTicketsAdmin();
  }

  @Post('tickets/:ticketId/reply')
  @ApiOperation({ summary: 'Phản hồi yêu cầu hỗ trợ (Dành cho Admin)' })
  @ApiParam({ name: 'ticketId', description: 'ID của yêu cầu hỗ trợ', type: String })
  @ApiResponse({ status: 201, description: 'Phản hồi thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy yêu cầu hỗ trợ' })
  async replyTicketAdmin(
    @GetCurrentUserId() adminId: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: ReplyTicketDto,
  ) {
    return this.supportService.replyTicket(adminId, ticketId, dto, true);
  }

  @Put('tickets/:ticketId/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái yêu cầu hỗ trợ' })
  @ApiParam({ name: 'ticketId', description: 'ID của yêu cầu hỗ trợ', type: String })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] } } } })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy yêu cầu hỗ trợ' })
  async updateTicketStatus(
    @GetCurrentUserId() adminId: string,
    @Param('ticketId') ticketId: string,
    @Body('status') status: support_ticket_status,
  ) {
    return this.supportService.updateTicketStatus(adminId, ticketId, status);
  }

  // --- DISPUTES ---
  @Get('disputes')
  @ApiOperation({ summary: 'Lấy danh sách khiếu nại (Admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách khiếu nại' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  async getAllDisputes() {
    return this.disputesService.getAllDisputesAdmin();
  }

  @Put('disputes/:disputeId/resolve')
  @ApiOperation({ summary: 'Giải quyết tranh chấp và giải phóng/hoàn tiền Escrow' })
  @ApiParam({ name: 'disputeId', description: 'ID của tranh chấp', type: String })
  @ApiResponse({ status: 200, description: 'Giải quyết tranh chấp thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tranh chấp' })
  async resolveDispute(
    @GetCurrentUserId() adminId: string,
    @Param('disputeId') disputeId: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolveDispute(adminId, disputeId, dto);
  }

  // --- INCIDENTS ---
  @Put('incidents/:incidentId/resolve')
  @ApiOperation({ summary: 'Giải quyết sự cố và giải phóng Escrow' })
  @ApiParam({ name: 'incidentId', description: 'ID của sự cố', type: String })
  @ApiResponse({ status: 200, description: 'Giải quyết sự cố thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sự cố' })
  async resolveIncident(
    @GetCurrentUserId() adminId: string,
    @Param('incidentId') incidentId: string,
    @Body() dto: ResolveIncidentDto,
  ) {
    return this.incidentsService.resolveIncident(adminId, incidentId, dto);
  }
}
