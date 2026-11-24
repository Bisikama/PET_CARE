import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ManageServiceFeesUseCase } from './application/use-cases/manage-service-fees.use-case';
import { UpdateServiceFeesDto } from './dto/update-service-fees.dto';

@ApiTags('Service fees')
@Controller()
export class ServiceFeesController {
  constructor(private readonly manageServiceFees: ManageServiceFeesUseCase) {}

  @Public()
  @Get('service-fees')
  @ApiOperation({ summary: 'Phí di chuyển & phụ phí dịch vụ (công khai, hiển thị cho khách)' })
  getFees() {
    return this.manageServiceFees.getSettings();
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Put('admin/service-fees')
  @ApiOperation({
    summary: 'Admin: cập nhật phí di chuyển (áp dụng khi tính tiền) và danh sách phụ phí',
  })
  updateFees(@GetCurrentUserId() adminId: string, @Body() dto: UpdateServiceFeesDto) {
    return this.manageServiceFees.updateSettings(adminId, dto);
  }
}
