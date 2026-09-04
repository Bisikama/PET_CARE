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
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { CreateAddressUseCase } from './application/use-cases/create-address.use-case';
import { UpdateAddressUseCase } from './application/use-cases/update-address.use-case';
import { GetAddressesUseCase } from './application/use-cases/get-addresses.use-case';
import { DeleteAddressUseCase } from './application/use-cases/delete-address.use-case';

import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Customer Addresses')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.CUSTOMER)
@Controller('customer-addresses')
export class CustomerAddressesController {
  constructor(
    private readonly createAddressUseCase: CreateAddressUseCase,
    private readonly updateAddressUseCase: UpdateAddressUseCase,
    private readonly getAddressesUseCase: GetAddressesUseCase,
    private readonly deleteAddressUseCase: DeleteAddressUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm địa chỉ mới cho khách hàng' })
  @ApiResponse({ status: 201, description: 'Địa chỉ được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden, yêu cầu role CUSTOMER).' })
  async create(@GetCurrentUserId() userId: string, @Body() dto: CreateAddressDto) {
    return this.createAddressUseCase.execute(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách địa chỉ của khách hàng đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách địa chỉ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden, yêu cầu role CUSTOMER).' })
  async findAll(@GetCurrentUserId() userId: string) {
    return this.getAddressesUseCase.executeList(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy chi tiết một địa chỉ' })
  @ApiParam({ name: 'id', description: 'ID của địa chỉ', type: String })
  @ApiResponse({ status: 200, description: 'Trả về chi tiết địa chỉ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập hoặc địa chỉ không thuộc về bạn (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy địa chỉ (ADDRESS_NOT_FOUND).' })
  async findOne(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    return this.getAddressesUseCase.executeDetail(id, userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật địa chỉ khách hàng' })
  @ApiParam({ name: 'id', description: 'ID của địa chỉ', type: String })
  @ApiResponse({ status: 200, description: 'Cập nhật địa chỉ thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập hoặc địa chỉ không thuộc về bạn (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy địa chỉ (ADDRESS_NOT_FOUND).' })
  async update(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.updateAddressUseCase.execute(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa mềm địa chỉ khách hàng' })
  @ApiParam({ name: 'id', description: 'ID của địa chỉ', type: String })
  @ApiResponse({ status: 204, description: 'Xóa mềm địa chỉ thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập hoặc địa chỉ không thuộc về bạn (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy địa chỉ (ADDRESS_NOT_FOUND).' })
  async delete(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    await this.deleteAddressUseCase.execute(id, userId);
  }
}
