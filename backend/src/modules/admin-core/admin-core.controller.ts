import { Controller, Get, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminCoreService } from './application/use-cases/admin-core.service';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';
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

  @Patch('users/:id/suspend')
  @ApiOperation({ summary: 'Khóa tài khoản người dùng (Chỉ dành cho Admin)' })
  @ApiResponse({ status: 200, description: 'Khóa tài khoản thành công' })
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
  @ApiResponse({ status: 200, description: 'Mở khóa tài khoản thành công' })
  async reactivateUser(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const adminId = req.user.sub;
    return this.adminCoreService.reactivateUser(adminId, id);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Lấy danh sách nhật ký hệ thống (Audit Logs) có phân trang và lọc (Chỉ dành cho Admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách nhật ký hệ thống' })
  async getAuditLogs(@Query() queryDto: GetAuditLogsDto) {
    return this.adminCoreService.getAuditLogs(queryDto);
  }
}
