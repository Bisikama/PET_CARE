import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { deactivation_status } from '@prisma/client';

export class GetDeactivationRequestsDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại (mặc định 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Số bản ghi trên mỗi trang (mặc định 10)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái', enum: deactivation_status })
  @IsOptional()
  @IsEnum(deactivation_status)
  status?: deactivation_status;
}
