import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { booking_status } from '@prisma/client';

export class GetBookingsDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại (mặc định: 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng item trên mỗi trang (mặc định: 10)', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái đơn hàng',
    enum: booking_status,
  })
  @IsOptional()
  @IsEnum(booking_status)
  status?: booking_status;
}
