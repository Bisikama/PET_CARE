import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetProviderScheduleQueryDto {
  @ApiProperty({
    example: '2026-09-01',
    description: 'Ngày bắt đầu xem lịch (YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'Vui lòng cung cấp ngày bắt đầu (startDate)' })
  @IsDateString({}, { message: 'startDate phải có định dạng ngày hợp lệ (YYYY-MM-DD)' })
  startDate!: string;

  @ApiProperty({
    example: '2026-09-07',
    description: 'Ngày kết thúc xem lịch (YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'Vui lòng cung cấp ngày kết thúc (endDate)' })
  @IsDateString({}, { message: 'endDate phải có định dạng ngày hợp lệ (YYYY-MM-DD)' })
  endDate!: string;
}
