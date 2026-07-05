import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePricingRuleDto {
  @ApiProperty({ description: 'Loại thú cưng áp dụng', required: false })
  @IsString()
  @IsOptional()
  petSpecies?: string;

  @ApiProperty({ description: 'Cân nặng tối thiểu (kg)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minWeight?: number;

  @ApiProperty({ description: 'Cân nặng tối đa (kg)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxWeight?: number;

  @ApiProperty({ description: 'Giá áp dụng', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Thời lượng thực hiện (phút)', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
