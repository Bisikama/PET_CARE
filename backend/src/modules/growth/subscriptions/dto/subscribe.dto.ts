import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export const PLAN_CODE_PATTERN = /^[A-Z0-9]{2,20}$/;

export class SubscribeDto {
  @ApiProperty({ example: 'BASIC', description: 'Mã gói hội viên (xem GET /subscriptions/plans)' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @IsNotEmpty()
  @Matches(PLAN_CODE_PATTERN, { message: 'Mã gói không hợp lệ' })
  planCode: string;
}
