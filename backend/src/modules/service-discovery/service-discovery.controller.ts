import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';

import { DiscoverPackagesUseCase } from './application/use-cases/discover-packages.use-case';
import { DiscoverProvidersUseCase } from './application/use-cases/discover-providers.use-case';

import { DiscoverPackagesDto } from './dto/discover-packages.dto';
import { DiscoverProvidersDto } from './dto/discover-providers.dto';

@ApiTags('Service Discovery')
@Controller('service-discovery')
export class ServiceDiscoveryController {
  constructor(
    private readonly discoverPackagesUseCase: DiscoverPackagesUseCase,
    private readonly discoverProvidersUseCase: DiscoverProvidersUseCase,
  ) {}

  @Public()
  @Get('packages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Khám phá danh sách các gói dịch vụ tương ứng với thú cưng (Guest/Public)',
  })
  @ApiResponse({ status: 200, description: 'Khám phá danh sách gói dịch vụ thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Tham số đầu vào không hợp lệ (ví dụ: loài vật không phải Dog hoặc Cat).',
  })
  async findPackages(@Query() query: DiscoverPackagesDto) {
    return this.discoverPackagesUseCase.execute(query);
  }

  @ApiBearerAuth()
  @Get('providers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'So khớp (Matching) và xếp hạng (Ranking) các đối tác phù hợp (Đăng nhập)',
  })
  @ApiResponse({
    status: 200,
    description: 'So khớp đối tác thành công và trả về danh sách đã được xếp hạng kèm lý do.',
  })
  @ApiResponse({ status: 400, description: 'Thiếu thông tin thú cưng hoặc địa chỉ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thú cưng hoặc địa chỉ yêu cầu.' })
  async findProviders(@GetCurrentUserId() userId: string, @Query() query: DiscoverProvidersDto) {
    return this.discoverProvidersUseCase.execute({
      customerId: userId,
      ...query,
    });
  }
}
