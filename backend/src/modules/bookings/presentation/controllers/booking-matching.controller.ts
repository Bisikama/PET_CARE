import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchMatchingProvidersUseCase } from '../../application/use-cases/search-matching-providers.use-case';
import { SearchProviderDto } from '../dto/search-provider.dto';

@ApiTags('Booking Matching')
@ApiBearerAuth()
@Controller('booking-matching')
export class BookingMatchingController {
  constructor(private readonly searchMatchingUseCase: SearchMatchingProvidersUseCase) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Tìm kiếm, ghép đôi và xếp hạng đối tác (Provider) phù hợp cho thú cưng, dịch vụ, địa chỉ và ngày làm việc',
  })
  @ApiResponse({
    status: 200,
    description:
      'Danh sách đối tác đủ điều kiện ghép đôi, được chấm điểm và sắp xếp theo độ ưu tiên giảm dần, kèm các lý do đề xuất (Flow 25).',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  @ApiResponse({
    status: 404,
    description: 'Thú cưng hoặc địa chỉ của khách hàng không tồn tại.',
  })
  async search(@Body() dto: SearchProviderDto) {
    return this.searchMatchingUseCase.execute(dto);
  }
}
