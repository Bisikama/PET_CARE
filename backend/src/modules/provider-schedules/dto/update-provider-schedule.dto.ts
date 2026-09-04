import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { working_mode } from '@prisma/client';

export class DayScheduleDto {
  @ApiProperty({
    example: '2026-09-01',
    description: 'Ngày làm việc (YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'workDate không được để trống' })
  @IsDateString({}, { message: 'workDate phải có định dạng ngày hợp lệ (YYYY-MM-DD)' })
  workDate!: string;

  @ApiPropertyOptional({
    enum: working_mode,
    default: working_mode.FULL_TIME,
    description: 'Chế độ làm việc (FULL_TIME / PART_TIME)',
  })
  @IsOptional()
  @IsEnum(working_mode, { message: 'workingMode phải là FULL_TIME hoặc PART_TIME' })
  workingMode?: working_mode;

  @ApiProperty({
    type: [String],
    example: [
      'b23b1234-abcd-4234-8f02-000000000001',
      'b23b1234-abcd-4234-8f02-000000000002',
    ],
    description: 'Danh sách ID của các khung giờ (slot_id) muốn mở nhận việc (AVAILABLE)',
  })
  @IsArray({ message: 'slotIds phải là một danh sách' })
  @IsUUID('4', { each: true, message: 'Mỗi slot_id phải là UUID hợp lệ' })
  slotIds!: string[];
}

export class UpdateProviderScheduleDto {
  @ApiProperty({
    type: [DayScheduleDto],
    description: 'Danh sách lịch làm việc của các ngày (hỗ trợ cập nhật 1 ngày hoặc cả tuần)',
  })
  @IsArray({ message: 'schedules phải là một danh sách các ngày' })
  @ArrayNotEmpty({ message: 'schedules không được để trống' })
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  schedules!: DayScheduleDto[];
}
