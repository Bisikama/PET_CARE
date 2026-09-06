import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminCoreService } from './application/use-cases/admin-core.service';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { GetDeactivationRequestsDto } from './dto/get-deactivation-requests.dto';
import { RejectDeactivationRequestDto } from './dto/reject-deactivation-request.dto';
import { CreateUserDto } from './dto/create-user.dto';
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

  @Post('users')
  @ApiOperation({ summary: 'Tạo tài khoản người dùng/nhân viên mới trực tiếp' })
  @ApiResponse({ status: 201, description: 'Tạo thành công.' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại.' })
  async createUser(@Req() req: Request, @Body() dto: CreateUserDto) {
    const adminId = (req.user as any).sub;
    return this.adminCoreService.createUser(adminId, dto);
  }

  @Get('users/deactivation-requests')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu hủy tài khoản (Chỉ dành cho Admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách yêu cầu.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async getDeactivationRequests(@Query() queryDto: GetDeactivationRequestsDto) {
    return this.adminCoreService.getDeactivationRequests(queryDto);
  }

  @Patch('users/deactivation-requests/:id/approve')
  @ApiOperation({ summary: 'Phê duyệt yêu cầu hủy tài khoản (Chỉ dành cho Admin)' })
  @ApiParam({ name: 'id', description: 'ID của yêu cầu', type: String })
  @ApiResponse({ status: 200, description: 'Phê duyệt thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async approveDeactivationRequest(@Req() req: any, @Param('id') id: string) {
    const adminId = req.user.sub;
    return this.adminCoreService.approveDeactivationRequest(adminId, id);
  }

  @Patch('users/deactivation-requests/:id/reject')
  @ApiOperation({ summary: 'Từ chối yêu cầu hủy tài khoản (Chỉ dành cho Admin)' })
  @ApiParam({ name: 'id', description: 'ID của yêu cầu', type: String })
  @ApiResponse({ status: 200, description: 'Từ chối thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async rejectDeactivationRequest(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: RejectDeactivationRequestDto,
  ) {
    const adminId = req.user.sub;
    return this.adminCoreService.rejectDeactivationRequest(adminId, id, dto);
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

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Cấp quyền/Thay đổi Role của người dùng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 409, description: 'Người dùng đã có role này.' })
  async updateUserRole(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    const adminId = (req.user as any).sub;
    return this.adminCoreService.updateUserRole(adminId, id, dto);
  }

  @Get('users/:id/sessions')
  @ApiOperation({ summary: 'Xem danh sách thiết bị/phiên đăng nhập của người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách phiên.' })
  async getUserSessions(@Param('id') id: string) {
    return this.adminCoreService.getUserSessions(id);
  }

  @Delete('users/:id/sessions')
  @ApiOperation({ summary: 'Buộc người dùng đăng xuất khỏi tất cả thiết bị (Force Logout)' })
  @ApiResponse({ status: 200, description: 'Đã thu hồi tất cả phiên.' })
  async revokeUserSessions(@Req() req: Request, @Param('id') id: string) {
    const adminId = (req.user as any).sub;
    return this.adminCoreService.revokeUserSessions(adminId, id);
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
