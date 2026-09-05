import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CopyWeekScheduleUseCase } from './application/use-cases/copy-week-schedule.use-case';
import { GetProviderAvailableSlotsUseCase } from './application/use-cases/get-provider-available-slots.use-case';
import { GetProviderScheduleUseCase } from './application/use-cases/get-provider-schedule.use-case';
import { UpdateProviderScheduleUseCase } from './application/use-cases/update-provider-schedule.use-case';
import { BlockProviderSlotUseCase } from './application/use-cases/block-provider-slot.use-case';
import { CopyWeekScheduleDto } from './dto/copy-week-schedule.dto';
import { GetProviderAvailableSlotsQueryDto } from './dto/get-provider-available-slots-query.dto';
import { GetProviderScheduleQueryDto } from './dto/get-provider-schedule-query.dto';
import { UpdateProviderScheduleDto } from './dto/update-provider-schedule.dto';
import { CheckConflictSlotUseCase } from './application/use-cases/check-conflict-slot.use-case';
import { CheckConflictSlotDto } from './dto/check-conflict-slot.dto';
import { Put, Param } from '@nestjs/common';

@ApiTags('Provider Schedules')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('provider-schedules')
export class ProviderSchedulesController {
  constructor(
    private readonly getProviderScheduleUseCase: GetProviderScheduleUseCase,
    private readonly getProviderAvailableSlotsUseCase: GetProviderAvailableSlotsUseCase,
    private readonly updateProviderScheduleUseCase: UpdateProviderScheduleUseCase,
    private readonly copyWeekScheduleUseCase: CopyWeekScheduleUseCase,
    private readonly blockProviderSlotUseCase: BlockProviderSlotUseCase,
    private readonly checkConflictSlotUseCase: CheckConflictSlotUseCase,
  ) {}

  @Put('slots/:slotId/block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tạm khóa (block) một slot làm việc cụ thể',
    description: 'Dành cho Provider tự động khóa khẩn cấp những Slot đang mở. Yêu cầu Slot phải rảnh và thuộc về Provider đang đăng nhập.',
  })
  @ApiResponse({ status: 200, description: 'Khóa slot thành công.' })
  @ApiResponse({ status: 400, description: 'Slot không tồn tại, đã bị khóa, hoặc đang có Booking (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden, yêu cầu role PROVIDER).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy slot (SLOT_NOT_FOUND).' })
  async blockSlot(
    @GetCurrentUserId() userId: string,
    @Param('slotId') slotId: string,
  ) {
    return this.blockProviderSlotUseCase.execute(userId, slotId);
  }

  @Get('available-slots/:providerId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Lấy danh sách các ca làm việc và trạng thái còn trống (AVAILABLE) của một Provider theo khoảng ngày/tuần để khách hàng chọn đặt lịch',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy ma trận ca làm việc thành công.',
  })
  @ApiResponse({ status: 400, description: 'Khoảng thời gian không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác.' })
  async getAvailableSlots(
    @Param('providerId') providerId: string,
    @Query() query: GetProviderAvailableSlotsQueryDto,
  ) {
    return this.getProviderAvailableSlotsUseCase.execute(
      providerId,
      query.startDate,
      query.endDate,
    );
  }

  @Get()
  @Roles(Role.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy ma trận lịch làm việc và trạng thái slots của Provider theo khoảng ngày',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về ma trận lịch làm việc thành công.',
  })
  @ApiResponse({ status: 400, description: 'Khoảng thời gian không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập (Forbidden, yêu cầu role PROVIDER).',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác (PROVIDER_NOT_FOUND).' })
  async getSchedule(
    @GetCurrentUserId() userId: string,
    @Query() query: GetProviderScheduleQueryDto,
  ) {
    return this.getProviderScheduleUseCase.execute(
      userId,
      query.startDate,
      query.endDate,
    );
  }

  @Post()
  @Roles(Role.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Đăng ký / Cập nhật lịch làm việc (Hỗ trợ lưu 1 ngày hoặc cả tuần trong một request)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật lịch làm việc thành công.',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập (Forbidden, yêu cầu role PROVIDER).',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác (PROVIDER_NOT_FOUND).' })
  async updateSchedule(
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateProviderScheduleDto,
  ) {
    return this.updateProviderScheduleUseCase.execute({
      userId,
      schedules: dto.schedules,
    });
  }

  @Post('copy-week')
  @Roles(Role.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sao chép nhanh toàn bộ lịch làm việc từ tuần nguồn sang tuần đích',
  })
  @ApiResponse({
    status: 200,
    description: 'Sao chép lịch thành công.',
  })
  @ApiResponse({ status: 400, description: 'Ngày tuần nguồn hoặc tuần đích không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập (Forbidden, yêu cầu role PROVIDER).',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác (PROVIDER_NOT_FOUND).' })
  async copyWeek(
    @GetCurrentUserId() userId: string,
    @Body() dto: CopyWeekScheduleDto,
  ) {
    return this.copyWeekScheduleUseCase.execute({
      userId,
      sourceWeekStart: dto.sourceWeekStart,
      targetWeekStart: dto.targetWeekStart,
    });
  }

  @Post('check-conflict')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kiểm tra xem slot có bị trùng hoặc đã bị khóa hay không' })
  @ApiResponse({ status: 200, description: 'Trả về kết quả kiểm tra xung đột.' })
  @ApiResponse({ status: 400, description: 'Tham số đầu vào không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  async checkConflict(@Body() dto: CheckConflictSlotDto) {
    return this.checkConflictSlotUseCase.execute(dto);
  }
}
