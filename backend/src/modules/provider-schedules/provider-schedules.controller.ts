import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CopyWeekScheduleDto } from './dto/copy-week-schedule.dto';
import { GetProviderAvailableSlotsQueryDto } from './dto/get-provider-available-slots-query.dto';
import { GetProviderScheduleQueryDto } from './dto/get-provider-schedule-query.dto';
import { UpdateProviderScheduleDto } from './dto/update-provider-schedule.dto';

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
  ) {}

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
    description: 'Lấy ma trận lịch làm việc thành công.',
  })
  @ApiResponse({ status: 400, description: 'Khoảng thời gian không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập (Yêu cầu role PROVIDER).',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác.' })
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
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập (Yêu cầu role PROVIDER).',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác.' })
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
  @ApiResponse({ status: 400, description: 'Ngày tuần nguồn hoặc tuần đích không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập (Yêu cầu role PROVIDER).',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác.' })
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
}
