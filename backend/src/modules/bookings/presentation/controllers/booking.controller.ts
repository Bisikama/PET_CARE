import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from '../../../../common/decorators/get-current-user-id.decorator';
import { CreateBookingRequestUseCase } from '../../application/use-cases/create-booking-request.use-case';
import { ProviderAcceptBookingUseCase } from '../../application/use-cases/provider-accept-booking.use-case';
import { ProviderRejectBookingUseCase } from '../../application/use-cases/provider-reject-booking.use-case';
import { GetBookingChecklistUseCase } from '../../application/use-cases/get-booking-checklist.use-case';
import { StartBookingServiceUseCase } from '../../application/use-cases/start-booking-service.use-case';
import { UpdateBookingChecklistItemUseCase } from '../../application/use-cases/update-booking-checklist-item.use-case';
import { CompleteBookingUseCase } from '../../application/use-cases/complete-booking.use-case';
import { CustomerCancelBookingUseCase } from '../../application/use-cases/customer-cancel-booking.use-case';
import type { BookingRepositoryPort } from '../../application/ports/booking-repository.port';
import { BOOKING_REPOSITORY } from '../../booking.tokens';
import { Inject } from '@nestjs/common';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { CompleteBookingDto } from '../dto/complete-booking.dto';
import { UpdateSingleChecklistItemDto } from '../dto/update-checklist-item.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly createBookingUseCase: CreateBookingRequestUseCase,
    private readonly acceptBookingUseCase: ProviderAcceptBookingUseCase,
    private readonly rejectBookingUseCase: ProviderRejectBookingUseCase,
    private readonly getBookingChecklistUseCase: GetBookingChecklistUseCase,
    private readonly startBookingServiceUseCase: StartBookingServiceUseCase,
    private readonly updateBookingChecklistItemUseCase: UpdateBookingChecklistItemUseCase,
    private readonly completeBookingUseCase: CompleteBookingUseCase,
    private readonly cancelBookingUseCase: CustomerCancelBookingUseCase,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Khởi tạo yêu cầu đặt lịch mới và tạm thời khóa slot làm việc' })
  @ApiResponse({
    status: 201,
    description: 'Yêu cầu đặt lịch được tạo thành công và slot đã được khóa tạm thời.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Dữ liệu đầu vào không hợp lệ hoặc tài nguyên không thuộc quyền sở hữu của khách hàng.',
  })
  @ApiResponse({
    status: 404,
    description: 'Thú cưng, địa chỉ, slot làm việc hoặc dịch vụ không tồn tại.',
  })
  @ApiResponse({
    status: 409,
    description: 'Slot làm việc này đã được người khác đặt hoặc khóa trước đó.',
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
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
    description: 'Trạng thái đơn hàng không hợp lệ để thực hiện thao tác này.',
  })
  @ApiResponse({
    status: 403,
    description: 'Bạn không phải là đối tác được chỉ định cho đơn hàng này.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng hoặc thông tin liên quan.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
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
    description: 'Trạng thái đơn hàng không hợp lệ để thực hiện thao tác này.',
  })
  @ApiResponse({
    status: 403,
    description: 'Bạn không phải là đối tác được chỉ định cho đơn hàng này.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng hoặc thông tin liên quan.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  async reject(@GetCurrentUserId() userId: string, @Param('id') bookingId: string) {
    return this.rejectBookingUseCase.execute(userId, bookingId);
  }

  @Post(':id/start-service')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đối tác bắt đầu thực hiện dịch vụ (chuyển sang IN_PROGRESS)' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch', type: 'string' })
  @ApiResponse({ status: 200, description: 'Bắt đầu dịch vụ thành công.' })
  @ApiResponse({ status: 400, description: 'Trạng thái đơn hàng không hợp lệ để bắt đầu.' })
  @ApiResponse({ status: 403, description: 'Không phải đối tác được phân công.' })
  async startService(@GetCurrentUserId() userId: string, @Param('id') bookingId: string) {
    return this.startBookingServiceUseCase.execute(userId, bookingId);
  }

  @Get(':id/checklist')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách checklist và media của đơn đặt lịch' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch', type: 'string' })
  @ApiResponse({ status: 200, description: 'Danh sách checklist được truy xuất thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập đơn này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt lịch.' })
  async getChecklist(@GetCurrentUserId() userId: string, @Param('id') bookingId: string) {
    return this.getBookingChecklistUseCase.execute(userId, bookingId);
  }

  @Patch(':id/checklist/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đối tác cập nhật trạng thái của một mục checklist' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch', type: 'string' })
  @ApiParam({ name: 'itemId', description: 'ID của mục checklist cần cập nhật', type: 'string' })
  @ApiResponse({ status: 200, description: 'Cập nhật mục checklist thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thao tác trên đơn này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mục checklist hoặc đơn đặt lịch.' })
  async updateChecklistItem(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateSingleChecklistItemDto,
  ) {
    return this.updateBookingChecklistItemUseCase.execute(userId, bookingId, itemId, dto);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đối tác xác nhận checklist và hoàn tất đơn dịch vụ' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch', type: 'string' })
  @ApiResponse({ status: 200, description: 'Dịch vụ đã hoàn tất thành công (COMPLETED).' })
  @ApiResponse({ status: 400, description: 'Trạng thái đơn hàng không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thao tác trên đơn này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đặt lịch.' })
  async completeBooking(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
    @Body() dto: CompleteBookingDto,
  ) {
    return this.completeBookingUseCase.execute(userId, bookingId, dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một đơn đặt lịch' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch (Booking ID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Chi tiết đơn đặt lịch được truy xuất thành công.' })
  @ApiResponse({ status: 404, description: 'Đơn đặt lịch không tồn tại.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  async findById(@Param('id') bookingId: string) {
    return this.bookingRepo.findBookingById(bookingId);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hủy đơn đặt lịch (Khách hàng)' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch (Booking ID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Đơn đặt lịch đã được hủy thành công. Tiền đã được hoàn lại nếu thanh toán bằng Ví/Ký quỹ.' })
  @ApiResponse({ status: 400, description: 'Đơn đặt lịch không tồn tại hoặc không thuộc quyền sở hữu.' })
  @ApiResponse({ status: 409, description: 'Trạng thái đơn đặt lịch không cho phép hủy.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  async cancel(
    @GetCurrentUserId() userId: string,
    @Param('id') bookingId: string,
  ) {
    return this.cancelBookingUseCase.execute(userId, bookingId);
  }
}

