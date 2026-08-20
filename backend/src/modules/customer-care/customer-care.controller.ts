import { Body, Controller, Param, Post, Put, Get, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
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

@ApiTags('customer-care')
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
  @ApiOperation({ summary: 'Leave a review for a completed booking' })
  async createReview(
    @GetCurrentUserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(userId, bookingId, dto);
  }

  // --- SUPPORT TICKETS ---
  @Post('tickets')
  @ApiOperation({ summary: 'Create a support ticket' })
  async createTicket(@GetCurrentUserId() userId: string, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(userId, dto);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get my support tickets' })
  async getMyTickets(@GetCurrentUserId() userId: string) {
    return this.supportService.getMyTickets(userId);
  }

  @Post('tickets/:ticketId/reply')
  @ApiOperation({ summary: 'Reply to a support ticket' })
  async replyTicket(
    @GetCurrentUserId() userId: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: ReplyTicketDto,
  ) {
    return this.supportService.replyTicket(userId, ticketId, dto, false);
  }

  // --- DISPUTES ---
  @Post('bookings/:bookingId/disputes')
  @ApiOperation({ summary: 'Open a dispute for a booking' })
  @ApiConsumes('multipart/form-data')
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
  @ApiOperation({ summary: 'Report a safety incident' })
  @ApiConsumes('multipart/form-data')
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
