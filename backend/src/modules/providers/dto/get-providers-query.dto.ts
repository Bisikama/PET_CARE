import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { provider_status, screening_status, provider_document_status } from '@prisma/client';

export class GetProvidersQueryDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng trên mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên hoặc email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái hồ sơ chung', enum: provider_status })
  @IsOptional()
  @IsEnum(provider_status)
  status?: provider_status;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái KYC', enum: provider_document_status })
  @IsOptional()
  @IsEnum(provider_document_status)
  kycStatus?: provider_document_status;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái lý lịch', enum: screening_status })
  @IsOptional()
  @IsEnum(screening_status)
  screeningStatus?: screening_status;
}
