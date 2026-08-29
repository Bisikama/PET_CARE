import { Body, Controller, Param, Post, Put, Get, UseGuards, Query, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { Role } from '@prisma/client';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { AdminProvidersService } from './application/use-cases/admin-providers.service';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import { GrantBadgeDto } from './dto/grant-badge.dto';
import { GetProvidersQueryDto } from './dto/get-providers-query.dto';

@ApiTags('Admin Providers (Quản lý đối tác)')
@Controller('admin/providers')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminProvidersController {
  constructor(private readonly adminProvidersService: AdminProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đối tác (Có phân trang và lọc)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  async getProviders(
    @GetCurrentUserId() adminId: string,
    @Query() query: GetProvidersQueryDto,
  ) {
    return this.adminProvidersService.getProviders(adminId, query);
  }

  @Put('documents/:id/review')
  @ApiOperation({ summary: 'Xét duyệt tài liệu của đối tác (KYC/Chứng chỉ)' })
  @ApiParam({ name: 'id', description: 'ID của tài liệu', type: String })
  @ApiResponse({ status: 200, description: 'Xét duyệt tài liệu thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài liệu' })
  async reviewDocument(
    @GetCurrentUserId() adminId: string,
    @Param('id') documentId: string,
    @Body() dto: ReviewDocumentDto,
  ) {
    await this.adminProvidersService.reviewDocument(adminId, documentId, dto);
    return { success: true, message: 'Xét duyệt tài liệu thành công' };
  }

  @Put(':id/screening')
  @ApiOperation({ summary: 'Cập nhật trạng thái lý lịch đối tác (Screening)' })
  @ApiParam({ name: 'id', description: 'ID của đối tác', type: String })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đối tác' })
  async updateScreeningStatus(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
    @Body() dto: UpdateScreeningDto,
  ) {
    await this.adminProvidersService.updateScreeningStatus(adminId, providerId, dto);
    return { success: true, message: 'Cập nhật trạng thái thành công' };
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Phê duyệt hồ sơ đối tác để hiển thị công khai (Yêu cầu phải qua KYC và Sàng lọc)' })
  @ApiParam({ name: 'id', description: 'ID của đối tác', type: String })
  @ApiResponse({ status: 200, description: 'Phê duyệt hồ sơ thành công' })
  @ApiResponse({ status: 400, description: 'Hồ sơ chưa đủ điều kiện duyệt (Thiếu KYC hoặc Screening)' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đối tác' })
  async approveProvider(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
  ) {
    await this.adminProvidersService.approveProvider(adminId, providerId);
    return { success: true, message: 'Phê duyệt hồ sơ thành công' };
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Từ chối hoặc đình chỉ đối tác (Hạ cấp về Customer)' })
  @ApiParam({ name: 'id', description: 'ID của đối tác', type: String })
  @ApiResponse({ status: 200, description: 'Từ chối/Đình chỉ thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đối tác' })
  async rejectProvider(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
    @Body('reason') reason: string,
  ) {
    await this.adminProvidersService.rejectProvider(adminId, providerId, reason);
    return { success: true, message: 'Từ chối/Đình chỉ đối tác thành công' };
  }

  @Post(':id/badges')
  @ApiOperation({ summary: 'Cấp phù hiệu uy tín thủ công cho đối tác' })
  @ApiParam({ name: 'id', description: 'ID của đối tác', type: String })
  @ApiResponse({ status: 201, description: 'Cấp phù hiệu thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đối tác' })
  async grantBadge(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
    @Body() dto: GrantBadgeDto,
  ) {
    await this.adminProvidersService.grantBadge(adminId, providerId, dto);
    return { success: true, message: 'Cấp phù hiệu thành công' };
  }

  @Delete(':id/badges/:badgeCode')
  @ApiOperation({ summary: 'Thu hồi phù hiệu uy tín của đối tác' })
  @ApiParam({ name: 'id', description: 'ID của đối tác', type: String })
  @ApiParam({ name: 'badgeCode', description: 'Mã phù hiệu (vd: VERIFIED_PROVIDER)', type: String })
  @ApiResponse({ status: 200, description: 'Thu hồi phù hiệu thành công' })
  @ApiResponse({ status: 400, description: 'Đối tác chưa có phù hiệu này' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phù hiệu' })
  async revokeBadge(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
    @Param('badgeCode') badgeCode: string,
  ) {
    await this.adminProvidersService.revokeBadge(adminId, providerId, badgeCode);
    return { success: true, message: 'Thu hồi phù hiệu thành công' };
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ của đối tác' })
  @ApiParam({ name: 'id', description: 'ID của đối tác', type: String })
  @ApiResponse({ status: 200, description: 'Lấy hồ sơ thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đối tác' })
  async getProfile(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
  ) {
    return this.adminProvidersService.getProfile(adminId, providerId);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Lấy danh sách tài liệu của đối tác' })
  @ApiParam({ name: 'id', description: 'ID của đối tác', type: String })
  @ApiResponse({ status: 200, description: 'Lấy danh sách tài liệu thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đối tác' })
  async getDocuments(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
  ) {
    return this.adminProvidersService.getDocuments(adminId, providerId);
  }

  @Put(':id/kyc-review')
  @ApiOperation({ summary: 'Duyệt toàn bộ hồ sơ KYC của đối tác' })
  @ApiParam({ name: 'id', description: 'ID của đối tác', type: String })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái KYC thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đối tác' })
  async reviewBulkKyc(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
    @Body() dto: ReviewKycDto,
  ) {
    await this.adminProvidersService.reviewBulkKyc(adminId, providerId, dto);
    return { success: true, message: 'Cập nhật trạng thái KYC thành công' };
  }
}
