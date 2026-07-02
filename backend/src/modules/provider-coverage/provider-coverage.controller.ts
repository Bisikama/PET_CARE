import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { ManageProviderAreaUseCase } from './application/use-cases/manage-provider-area.use-case';
import { CreateProviderAreaDto } from './dto/create-provider-area.dto';
import { UpdateProviderAreaDto } from './dto/update-provider-area.dto';

@ApiTags('Provider Coverage')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.PROVIDER)
@Controller('provider-service-areas')
export class ProviderCoverageController {
  constructor(private readonly manageProviderAreaUseCase: ManageProviderAreaUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký khu vực phục vụ mới cho đối tác' })
  @ApiResponse({ status: 201, description: 'Đăng ký khu vực thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (yêu cầu role PROVIDER).' })
  @ApiResponse({ status: 409, description: 'Khu vực phục vụ này đã được đăng ký trước đó.' })
  async create(@GetCurrentUserId() userId: string, @Body() dto: CreateProviderAreaDto) {
    return this.manageProviderAreaUseCase.create(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách khu vực phục vụ của đối tác đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách khu vực thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (yêu cầu role PROVIDER).' })
  async findAll(@GetCurrentUserId() userId: string) {
    return this.manageProviderAreaUseCase.getList(userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật khu vực phục vụ của đối tác' })
  @ApiResponse({ status: 200, description: 'Cập nhật khu vực thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu cập nhật không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập hoặc khu vực không thuộc quản lý của bạn.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khu vực hoạt động.' })
  @ApiResponse({ status: 409, description: 'Khu vực phục vụ mới đã được đăng ký trước đó.' })
  async update(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProviderAreaDto,
  ) {
    return this.manageProviderAreaUseCase.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa mềm khu vực phục vụ của đối tác' })
  @ApiResponse({ status: 204, description: 'Xóa mềm khu vực thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập hoặc khu vực không thuộc quản lý của bạn.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khu vực hoạt động.' })
  async delete(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    await this.manageProviderAreaUseCase.delete(id, userId);
  }
}
