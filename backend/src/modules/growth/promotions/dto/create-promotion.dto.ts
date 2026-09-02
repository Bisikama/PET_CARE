import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: 'SUMMER2026' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 10, description: 'Phần trăm giảm giá', required: false })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiProperty({ example: 50000, description: 'Số tiền giảm giá', required: false })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiProperty({ example: 200000, description: 'Giá trị đơn hàng tối thiểu', required: false })
  @IsOptional()
  @IsNumber()
  minOrderValue?: number;

  @ApiProperty({ example: 100000, description: 'Giảm giá tối đa', required: false })
  @IsOptional()
  @IsNumber()
  maxDiscountAmount?: number;

  @ApiProperty({ example: 100, description: 'Giới hạn số lần sử dụng', required: false })
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiProperty({ example: '2026-08-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-09-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
