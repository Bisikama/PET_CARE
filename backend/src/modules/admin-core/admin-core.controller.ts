import { Controller, Get, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AdminCoreService } from './application/use-cases/admin-core.service';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Core')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminCoreController {
  constructor(private readonly adminCoreService: AdminCoreService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Lấy thống kê tổng quan (Dashboard Admin)' })
  @ApiResponse({ status: 200, description: 'Trả về các số liệu thống kê.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden, yêu cầu role ADMIN).' })
  async getDashboardStats() {
    return this.adminCoreService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Lấy danh sách người dùng có phân trang và lọc (Chỉ dành cho Admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async getUsers(@Query() queryDto: GetUsersDto) {
    return this.adminCoreService.getUsers(queryDto);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Xem chi tiết thông tin một người dùng (bao gồm hồ sơ đối tác/địa chỉ)' })
  @ApiParam({ name: 'id', description: 'ID của người dùng', type: String })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết người dùng.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async getUserDetails(@Param('id') id: string) {
    return this.adminCoreService.getUserDetails(id);
  }

  @Patch('users/:id/suspend')
  @ApiOperation({ summary: 'Khóa tài khoản người dùng (Chỉ dành cho Admin)' })
  @ApiParam({ name: 'id', description: 'ID của người dùng cần khóa', type: String })
  @ApiResponse({ status: 200, description: 'Khóa tài khoản thành công.' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden, yêu cầu role ADMIN).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng (USER_NOT_FOUND).' })
  async suspendUser(
    @Req() req: any,
    @Param('id') id: string,
    @Body() suspendUserDto: SuspendUserDto,
  ) {
    const adminId = req.user.sub;
    return this.adminCoreService.suspendUser(adminId, id, suspendUserDto);
  }

  @Patch('users/:id/reactivate')
  @ApiOperation({ summary: 'Mở khóa tài khoản người dùng (Chỉ dành cho Admin)' })
  @ApiParam({ name: 'id', description: 'ID của người dùng cần mở khóa', type: String })
  @ApiResponse({ status: 200, description: 'Mở khóa tài khoản thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden, yêu cầu role ADMIN).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng (USER_NOT_FOUND).' })
  async reactivateUser(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const adminId = req.user.sub;
    return this.adminCoreService.reactivateUser(adminId, id);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Lấy danh sách nhật ký hệ thống (Audit Logs) có phân trang và lọc (Chỉ dành cho Admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách nhật ký hệ thống.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden, yêu cầu role ADMIN).' })
  async getAuditLogs(@Query() queryDto: GetAuditLogsDto) {
    return this.adminCoreService.getAuditLogs(queryDto);
  }

  @Get('configs')
  @ApiOperation({ summary: 'Lấy danh sách cấu hình hệ thống (Platform Fee, Commission...)' })
  @ApiResponse({ status: 200, description: 'Danh sách cấu hình.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async getConfigs() {
    return this.adminCoreService.getConfigs();
  }

  @Patch('configs')
  @ApiOperation({ summary: 'Cập nhật cấu hình hệ thống' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async updateConfigs(
    @Req() req: any,
    @Body() updateConfigDto: UpdateConfigDto,
  ) {
    const adminId = req.user.sub;
    return this.adminCoreService.updateConfigs(adminId, updateConfigDto.configs);
  }
}
