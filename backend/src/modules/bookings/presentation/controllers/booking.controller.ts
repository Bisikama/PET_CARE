import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUserId } from '../../../../common/decorators/get-current-user-id.decorator';
import { AccessTokenGuard } from '../../../../common/guards/access-token.guard';
import { CreateBookingRequestUseCase } from '../../application/use-cases/create-booking-request.use-case';
import { ProviderAcceptBookingUseCase } from '../../application/use-cases/provider-accept-booking.use-case';
import { ProviderRejectBookingUseCase } from '../../application/use-cases/provider-reject-booking.use-case';
import { GetBookingByIdUseCase } from '../../application/use-cases/get-booking-by-id.use-case';
import { GetBookingsUseCase } from '../../application/use-cases/get-bookings.use-case';
import { GetActiveBookingUseCase } from '../../application/use-cases/get-active-booking.use-case';
import { GetBookingChecklistUseCase } from '../../application/use-cases/get-booking-checklist.use-case';
import { StartBookingServiceUseCase } from '../../application/use-cases/start-booking-service.use-case';
import { UpdateBookingChecklistItemUseCase } from '../../application/use-cases/update-booking-checklist-item.use-case';
import { CompleteBookingUseCase } from '../../application/use-cases/complete-booking.use-case';
import { UploadBookingEvidenceUseCase } from '../../application/use-cases/upload-booking-evidence.use-case';
import { CustomerConfirmBookingUseCase } from '../../application/use-cases/customer-confirm-booking.use-case';
import { CustomerCancelBookingUseCase } from '../../application/use-cases/customer-cancel-booking.use-case';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { CompleteBookingDto } from '../dto/complete-booking.dto';
import { GetBookingsDto } from '../dto/get-bookings.dto';
import { UpdateSingleChecklistItemDto } from '../dto/update-checklist-item.dto';
import { CreateReviewUseCase } from '../../application/use-cases/create-review.use-case';
import { CreateReviewDto } from '../../dto/create-review.dto';
import { OpenDisputeUseCase } from '../../application/use-cases/open-dispute.use-case';
import { OpenDisputeDto } from '../../dto/open-dispute.dto';
import { RequestBookingExtensionUseCase } from '../../application/use-cases/request-booking-extension.use-case';
import { RequestExtensionDto } from '../../dto/request-extension.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly createBookingUseCase: CreateBookingRequestUseCase,
    private readonly acceptBookingUseCase: ProviderAcceptBookingUseCase,
    private readonly rejectBookingUseCase: ProviderRejectBookingUseCase,
    private readonly getBookingByIdUseCase: GetBookingByIdUseCase,
    private readonly getBookingsUseCase: GetBookingsUseCase,
    private readonly getActiveBookingUseCase: GetActiveBookingUseCase,
    private readonly getBookingChecklistUseCase: GetBookingChecklistUseCase,
    private readonly startBookingServiceUseCase: StartBookingServiceUseCase,
    private readonly updateBookingChecklistItemUseCase: UpdateBookingChecklistItemUseCase,
    private readonly completeBookingUseCase: CompleteBookingUseCase,
    private readonly uploadBookingEvidenceUseCase: UploadBookingEvidenceUseCase,
    private readonly customerConfirmBookingUseCase: CustomerConfirmBookingUseCase,
    private readonly cancelBookingUseCase: CustomerCancelBookingUseCase,
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly openDisputeUseCase: OpenDisputeUseCase,
    private readonly requestBookingExtensionUseCase: RequestBookingExtensionUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách đơn đặt lịch của người dùng (Customer hoặc Provider)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách đơn đặt lịch có phân trang.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  async getBookings(
    @GetCurrentUserId() userId: string,
    @Query() query: GetBookingsDto,
  ) {
    return this.getBookingsUseCase.execute(userId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Khởi tạo yêu cầu đặt lịch mới và tạm thời khóa slot làm việc' })
  @ApiResponse({
    status: 201,
    description: 'Yêu cầu đặt lịch được tạo thành công và slot đã được khóa tạm thời.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).',
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập hoặc tài nguyên không thuộc quyền sở hữu (Forbidden).',
  })
  @ApiResponse({
    status: 404,
    description: 'Thú cưng, địa chỉ, slot làm việc hoặc dịch vụ không tồn tại (NOT_FOUND).',
  })
  @ApiResponse({
    status: 409,
    description: 'Slot làm việc này đã được người khác đặt hoặc khóa trước đó (Conflict).',
  })
  async create(@GetCurrentUserId() userId: string, @Body() dto: CreateBookingDto) {
    return this.createBookingUseCase.execute(userId, dto);
  }

  @Post(':id/provider-accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Đối tác (Provider) chấp nhận yêu cầu đặt lịch (trong MVP sẽ xác nhận ngay thành ACCEPTED)',
  })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch (Booking ID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Đồng ý nhận đơn thành công, trạng thái chuyển sang ACCEPTED.',
  })
  @ApiResponse({
    status: 400,
    description: 'Trạng thái đơn hàng không hợp lệ để thực hiện thao tác này (Validation Error).',
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không phải là đối tác được chỉ định cho đơn hàng này (Forbidden).',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng hoặc thông tin liên quan (BOOKING_NOT_FOUND).' })
  async accept(@GetCurrentUserId() userId: string, @Param('id') bookingId: string) {
    return this.acceptBookingUseCase.execute(userId, bookingId);
  }

  @Post(':id/provider-reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đối tác (Provider) từ chối yêu cầu đặt lịch' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch (Booking ID)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Từ chối nhận đơn thành công, slot được giải phóng về AVAILABLE.',
  })
  @ApiResponse({
    status: 400,
    description: 'Trạng thái đơn hàng không hợp lệ để thực hiện thao tác này (Validation Error).',
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không phải là đối tác được chỉ định cho đơn hàng này (Forbidden).',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng hoặc thông tin liên quan (BOOKING_NOT_FOUND).' })
  async reject(@GetCurrentUserId() userId: string, @Param('id') bookingId: string) {
    return this.rejectBookingUseCase.execute(userId, bookingId);
  }

  @Post(':id/start-service')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đối tác bắt đầu thực hiện dịch vụ (chuyển sang IN_PROGRESS)' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch', type: 'string' })
  @ApiResponse({ status: 200, description: 'Bắt đầu dịch vụ thành công.' })
  @ApiResponse({ status: 400, description: 'Trạng thái đơn hàng không hợp lệ để bắt đầu (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không phải đối tác được phân công (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt lịch (BOOKING_NOT_FOUND).' })
  async startService(@GetCurrentUserId() userId: string, @Param('id') bookingId: string) {
    return this.startBookingServiceUseCase.execute(userId, bookingId);
  }

  @Get(':id/checklist')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách checklist và media của đơn đặt lịch' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch', type: 'string' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách checklist.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập đơn này (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt lịch (BOOKING_NOT_FOUND).' })
  async getChecklist(@GetCurrentUserId() userId: string, @Param('id') bookingId: string) {
    return this.getBookingChecklistUseCase.execute(userId, bookingId);
  }

  @Patch(':id/checklist/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đối tác cập nhật trạng thái của một mục checklist' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch', type: 'string' })
  @ApiParam({ name: 'itemId', description: 'ID của mục checklist cần cập nhật', type: 'string' })
  @ApiResponse({ status: 200, description: 'Cập nhật mục checklist thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền thao tác trên đơn này (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mục checklist hoặc đơn đặt lịch (NOT_FOUND).' })
  async updateChecklistItem(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateSingleChecklistItemDto,
  ) {
    return this.updateBookingChecklistItemUseCase.execute(userId, bookingId, itemId, dto);
  }

  @Post(':id/evidence-upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tải lên ảnh minh chứng (evidence) cho đơn đặt lịch trước khi hoàn tất' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch (Booking ID)', type: 'string' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh chụp nghiệm thu/minh chứng (jpg, jpeg, png, webp)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, description: 'Tải ảnh lên thành công, trả về đường link mediaUrl.' })
  @ApiResponse({ status: 400, description: 'File không hợp lệ hoặc quá dung lượng (Max 10MB).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền thao tác trên đơn này (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt lịch (BOOKING_NOT_FOUND).' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadEvidence(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadBookingEvidenceUseCase.execute(userId, bookingId, file);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đối tác xác nhận checklist và hoàn tất đơn dịch vụ' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch', type: 'string' })
  @ApiResponse({ status: 200, description: 'Dịch vụ đã hoàn tất thành công (COMPLETED).' })
  @ApiResponse({ status: 400, description: 'Trạng thái đơn hàng không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền thao tác trên đơn này (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt lịch (BOOKING_NOT_FOUND).' })
  async completeBooking(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
    @Body() dto: CompleteBookingDto,
  ) {
    return this.completeBookingUseCase.execute(userId, bookingId, dto);
  }

  @Post(':id/customer-confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Khách hàng xác nhận dịch vụ hoàn tất' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch', type: 'string' })
  @ApiResponse({ status: 200, description: 'Đã xác nhận thành công (COMPLETED) và giải phóng ký quỹ.' })
  @ApiResponse({ status: 400, description: 'Trạng thái đơn hàng không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Bạn không phải là khách hàng của đơn này (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt lịch (BOOKING_NOT_FOUND).' })
  async customerConfirm(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
  ) {
    return this.customerConfirmBookingUseCase.execute(userId, bookingId);
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thông tin đơn dịch vụ đang diễn ra (Active Booking) của user hiện tại' })
  @ApiResponse({ status: 200, description: 'Trả về chi tiết đơn đặt lịch đang active hoặc null nếu không có.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng (Not Found).' })
  async getActiveBooking(
    @GetCurrentUserId() userId: string,
  ) {
    return this.getActiveBookingUseCase.execute(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một đơn đặt lịch' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch (Booking ID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Trả về chi tiết đơn đặt lịch.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt lịch (BOOKING_NOT_FOUND).' })
  async findById(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
  ) {
    return this.getBookingByIdUseCase.execute(userId, bookingId);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hủy đơn đặt lịch (Khách hàng)' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch (Booking ID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Đơn đặt lịch đã được hủy thành công. Tiền đã được hoàn lại nếu thanh toán bằng Ví/Ký quỹ.' })
  @ApiResponse({ status: 400, description: 'Đơn đặt lịch không tồn tại hoặc không thuộc quyền sở hữu (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt lịch (BOOKING_NOT_FOUND).' })
  @ApiResponse({ status: 409, description: 'Trạng thái đơn đặt lịch không cho phép hủy (Conflict).' })
  async cancel(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
  ) {
    return this.cancelBookingUseCase.execute(userId, bookingId);
  }

  @Post(':id/reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đánh giá chất lượng dịch vụ của đơn đặt lịch' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch (Booking ID)', type: 'string' })
  @ApiResponse({ status: 201, description: 'Đánh giá thành công.' })
  @ApiResponse({ status: 400, description: 'Chỉ có thể đánh giá khi đơn đã hoàn thành hoặc đã đánh giá rồi.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Chỉ khách hàng của đơn này mới được đánh giá.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt lịch.' })
  async createReview(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.createReviewUseCase.execute(bookingId, userId, dto);
  }

  @Post(':id/dispute')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Mở khiếu nại (Dispute) cho đơn dịch vụ' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch', type: 'string' })
  @ApiResponse({ status: 201, description: 'Mở khiếu nại thành công.' })
  @ApiResponse({ status: 400, description: 'Trạng thái đơn hàng không hợp lệ hoặc đã có khiếu nại.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Chỉ khách hàng của đơn này mới được khiếu nại.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt lịch.' })
  async openDispute(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
    @Body() dto: OpenDisputeDto,
  ) {
    return this.openDisputeUseCase.execute(bookingId, userId, dto);
  }

  @Patch(':id/request-extension')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Provider xin phép khách hàng kéo dài thời gian' })
  @ApiParam({ name: 'id', description: 'ID của booking (UUID)' })
  @ApiResponse({ status: 200, description: 'Đã gửi yêu cầu xin thêm thời gian.' })
  @ApiResponse({ status: 400, description: 'Trạng thái booking không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy booking.' })
  async requestExtension(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: RequestExtensionDto,
  ) {
    return this.requestBookingExtensionUseCase.execute(userId, id, dto);
  }
}
