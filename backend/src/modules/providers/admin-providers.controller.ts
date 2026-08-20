import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { AdminProvidersService } from './application/use-cases/admin-providers.service';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import { GrantBadgeDto } from './dto/grant-badge.dto';

@ApiTags('admin/providers')
@Controller('admin/providers')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminProvidersController {
  constructor(private readonly adminProvidersService: AdminProvidersService) {}

  @Put('documents/:id/review')
  @ApiOperation({ summary: 'Review a provider document (KYC/Certificate)' })
  async reviewDocument(
    @GetCurrentUserId() adminId: string,
    @Param('id') documentId: string,
    @Body() dto: ReviewDocumentDto,
  ) {
    return this.adminProvidersService.reviewDocument(adminId, documentId, dto);
  }

  @Put(':id/screening')
  @ApiOperation({ summary: 'Update provider background screening status' })
  async updateScreeningStatus(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
    @Body() dto: UpdateScreeningDto,
  ) {
    return this.adminProvidersService.updateScreeningStatus(adminId, providerId, dto);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve provider profile to be public' })
  async approveProvider(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
  ) {
    return this.adminProvidersService.approveProvider(adminId, providerId);
  }

  @Post(':id/badges')
  @ApiOperation({ summary: 'Manually grant a trust badge to provider' })
  async grantBadge(
    @GetCurrentUserId() adminId: string,
    @Param('id') providerId: string,
    @Body() dto: GrantBadgeDto,
  ) {
    return this.adminProvidersService.grantBadge(adminId, providerId, dto);
  }
}
