import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { GetTimeSlotsUseCase } from './application/use-cases/get-time-slots.use-case';

@ApiTags('Time Slots')
@Controller('time-slots')
export class TimeSlotsController {
  constructor(private readonly getTimeSlotsUseCase: GetTimeSlotsUseCase) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách các khung giờ làm việc chuẩn của hệ thống' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách khung giờ được trả về thành công.',
  })
  async findAll() {
    return this.getTimeSlotsUseCase.execute();
  }
}
