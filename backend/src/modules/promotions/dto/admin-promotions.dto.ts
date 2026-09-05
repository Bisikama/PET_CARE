import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePromotionDto {
  @ApiProperty({ example: 'SUMMER2026', description: 'Mã giảm giá' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 10, description: 'Phần trăm giảm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_percent?: number;

  @ApiPropertyOptional({ example: 50000, description: 'Số tiền giảm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @ApiPropertyOptional({ example: 100000, description: 'Số tiền giảm tối đa' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_discount_amount?: number;

  @ApiPropertyOptional({ example: 200000, description: 'Giá trị đơn tối thiểu' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_order_value?: number;

  @ApiPropertyOptional({ example: 1000, description: 'Tổng lượt sử dụng' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usage_limit?: number;

  @ApiPropertyOptional({ example: 1, description: 'Lượt sử dụng tối đa mỗi user' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  max_usage_per_user?: number;

  @ApiProperty({ example: '2026-06-01T00:00:00Z', description: 'Ngày bắt đầu' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ example: '2026-12-31T23:59:59Z', description: 'Ngày kết thúc' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}

export class UpdatePromotionLimitsDto {
  @ApiProperty({ example: 2000, description: 'Tổng lượt sử dụng mới' })
  @IsNumber()
  @Min(1)
  usageLimit: number;

  @ApiProperty({ example: 2, description: 'Lượt sử dụng tối đa mỗi user mới' })
  @IsNumber()
  @Min(1)
  maxUsagePerUser: number;
}

export class UpdatePromotionDto {
  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z', description: 'Ngày kết thúc mới' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ example: false, description: 'Trạng thái hoạt động' })
  @IsOptional()
  is_active?: boolean;
}
