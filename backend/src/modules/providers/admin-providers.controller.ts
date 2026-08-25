import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { AdminProvidersService } from './application/use-cases/admin-providers.service';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import { GrantBadgeDto } from './dto/grant-badge.dto';

@ApiTags('Admin/providers')
@Controller('admin/providers')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminProvidersController {
  constructor(private readonly adminProvidersService: AdminProvidersService) {}

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
    return this.adminProvidersService.reviewDocument(adminId, documentId, dto);
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
    return this.adminProvidersService.updateScreeningStatus(adminId, providerId, dto);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Phê duyệt hồ sơ đối tác để hiển thị công khai' })
  @ApiParam({ name: 'id', description: 'ID của đối tác', type: String })
  @ApiResponse({ status: 200, description: 'Phê duyệt hồ sơ thành công' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đối tác' })
  async approveProvider(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
  ) {
    return this.adminProvidersService.approveProvider(adminId, providerId);
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
    return this.adminProvidersService.grantBadge(adminId, providerId, dto);
  }
}
