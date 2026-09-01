import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class CopyWeekScheduleDto {
  @ApiProperty({
    example: '2026-09-01',
    description: 'Ngày bắt đầu của tuần nguồn cần sao chép (Thứ 2, YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'sourceWeekStart không được để trống' })
  @IsDateString({}, { message: 'sourceWeekStart phải có định dạng ngày hợp lệ (YYYY-MM-DD)' })
  sourceWeekStart!: string;

  @ApiProperty({
    example: '2026-09-08',
    description: 'Ngày bắt đầu của tuần đích muốn áp dụng lịch (Thứ 2, YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'targetWeekStart không được để trống' })
  @IsDateString({}, { message: 'targetWeekStart phải có định dạng ngày hợp lệ (YYYY-MM-DD)' })
  targetWeekStart!: string;
}
