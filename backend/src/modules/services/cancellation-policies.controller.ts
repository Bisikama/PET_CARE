import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { ManageCancellationPolicyUseCase } from './application/use-cases/manage-cancellation-policy.use-case';
import { CreateCancellationPolicyDto } from './dto/create-cancellation-policy.dto';

@ApiTags('Cancellation Policies')
@ApiBearerAuth()
@Controller('cancellation-policies')
export class CancellationPoliciesController {
  constructor(
    private readonly manageCancellationPolicyUseCase: ManageCancellationPolicyUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo chính sách hủy mới (Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo chính sách hủy thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu cấu hình không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden, yêu cầu role ADMIN).' })
  async createCancellationPolicy(@Body() dto: CreateCancellationPolicyDto) {
    return this.manageCancellationPolicyUseCase.create(dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách các chính sách hủy' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách các chính sách hủy.' })
  async getCancellationPolicies() {
    return this.manageCancellationPolicyUseCase.getList();
  }
}
