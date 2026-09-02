import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ValidatePromotionDto {
  @ApiProperty({ example: 'SUMMER2026' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 400000, description: 'Tổng giá trị đơn hàng (trước giảm giá)' })
  @IsNumber()
  @Min(0)
  orderValue: number;
}
