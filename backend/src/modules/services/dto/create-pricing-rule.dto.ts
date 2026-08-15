import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePricingRuleDto {
  @ApiProperty({ description: 'Loại thú cưng áp dụng', example: 'Dog' })
  @IsString()
  @IsNotEmpty()
  petSpecies: string;

  @ApiProperty({ description: 'Cân nặng tối thiểu (kg)', required: false, example: 5.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minWeight?: number;

  @ApiProperty({ description: 'Cân nặng tối đa (kg)', required: false, example: 10.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxWeight?: number;

  @ApiProperty({ description: 'Giá áp dụng', example: 320000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Thời lượng thực hiện (phút)', example: 120 })
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
