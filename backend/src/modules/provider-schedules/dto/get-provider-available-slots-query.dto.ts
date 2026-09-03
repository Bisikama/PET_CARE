import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GetProviderAvailableSlotsQueryDto {
  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Ngày bắt đầu xem lịch trống (YYYY-MM-DD), mặc định là hôm nay',
  })
  @IsOptional()
  @IsDateString({}, { message: 'startDate phải có định dạng ngày hợp lệ (YYYY-MM-DD)' })
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-07',
    description: 'Ngày kết thúc xem lịch trống (YYYY-MM-DD), mặc định là 6 ngày sau startDate',
  })
  @IsOptional()
  @IsDateString({}, { message: 'endDate phải có định dạng ngày hợp lệ (YYYY-MM-DD)' })
  endDate?: string;
}
