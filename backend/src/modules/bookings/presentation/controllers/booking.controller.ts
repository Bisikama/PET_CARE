/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from '../../../../common/decorators/get-current-user-id.decorator';
import { CreateBookingRequestUseCase } from '../../application/use-cases/create-booking-request.use-case';
import { ProviderAcceptBookingUseCase } from '../../application/use-cases/provider-accept-booking.use-case';
import { ProviderRejectBookingUseCase } from '../../application/use-cases/provider-reject-booking.use-case';
import type { BookingRepositoryPort } from '../../application/ports/booking-repository.port';
import { BOOKING_REPOSITORY } from '../../booking.tokens';
import { Inject } from '@nestjs/common';
import { CreateBookingDto } from '../dto/create-booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly createBookingUseCase: CreateBookingRequestUseCase,
    private readonly acceptBookingUseCase: ProviderAcceptBookingUseCase,
    private readonly rejectBookingUseCase: ProviderRejectBookingUseCase,
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
  async reject(@GetCurrentUserId() userId: string, @Param('id') bookingId: string) {
    return this.rejectBookingUseCase.execute(userId, bookingId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một đơn đặt lịch' })
  @ApiParam({ name: 'id', description: 'ID của đơn đặt lịch (Booking ID)', type: 'string' })
  @ApiResponse({ status: 200, description: 'Chi tiết đơn đặt lịch được truy xuất thành công.' })
  @ApiResponse({ status: 404, description: 'Đơn đặt lịch không tồn tại.' })
  async findById(@Param('id') bookingId: string) {
    return this.bookingRepo.findBookingById(bookingId);
  }
}
