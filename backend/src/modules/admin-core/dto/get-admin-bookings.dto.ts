import { IsOptional, IsString, IsInt, Min, Max, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { booking_status } from '@prisma/client';

export class GetAdminBookingsDto {
  @ApiPropertyOptional({ description: 'Số trang', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng đơn mỗi trang', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái đơn', enum: booking_status })
  @IsOptional()
  @IsEnum(booking_status)
  status?: booking_status;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo mã booking hoặc tên/email khách hàng, chuyên viên' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Ngày bắt đầu lọc (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Ngày kết thúc lọc (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID hồ sơ đối tác (provider_id)' })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID khách hàng (customer_id)' })
  @IsOptional()
  @IsString()
  customerId?: string;
}
