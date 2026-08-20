import { Body, Controller, Param, Post, Put, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

@ApiTags('admin/customer-care')
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
  @ApiOperation({ summary: 'Hide a review' })
  async hideReview(
    @GetCurrentUserId() adminId: string,
    @Param('reviewId') reviewId: string,
    @Body('reason') reason: string,
  ) {
    return this.reviewsService.hideReview(adminId, reviewId, reason);
  }

  // --- SUPPORT TICKETS ---
  @Get('tickets')
  @ApiOperation({ summary: 'Get all support tickets' })
  async getAllTickets() {
    return this.supportService.getAllTicketsAdmin();
  }

  @Post('tickets/:ticketId/reply')
  @ApiOperation({ summary: 'Reply to a support ticket (Admin)' })
  async replyTicketAdmin(
    @GetCurrentUserId() adminId: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: ReplyTicketDto,
  ) {
    return this.supportService.replyTicket(adminId, ticketId, dto, true);
  }

  @Put('tickets/:ticketId/status')
  @ApiOperation({ summary: 'Update ticket status' })
  async updateTicketStatus(
    @GetCurrentUserId() adminId: string,
    @Param('ticketId') ticketId: string,
    @Body('status') status: support_ticket_status,
  ) {
    return this.supportService.updateTicketStatus(adminId, ticketId, status);
  }

  // --- DISPUTES ---
  @Put('disputes/:disputeId/resolve')
  @ApiOperation({ summary: 'Resolve a dispute and release/refund Escrow' })
  async resolveDispute(
    @GetCurrentUserId() adminId: string,
    @Param('disputeId') disputeId: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolveDispute(adminId, disputeId, dto);
  }

  // --- INCIDENTS ---
  @Put('incidents/:incidentId/resolve')
  @ApiOperation({ summary: 'Resolve an incident and release Escrow' })
  async resolveIncident(
    @GetCurrentUserId() adminId: string,
    @Param('incidentId') incidentId: string,
    @Body() dto: ResolveIncidentDto,
  ) {
    return this.incidentsService.resolveIncident(adminId, incidentId, dto);
  }
}
