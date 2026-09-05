import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ApplyPromotionDto {
  @ApiProperty({
    description: 'Mã giảm giá do người dùng nhập',
    example: 'SUMMER2026',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  promoCode: string;

  @ApiProperty({
    description: 'Tổng giá trị đơn hàng hiện tại để xét điều kiện áp dụng mã (VNĐ)',
    example: 200000,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  orderValue: number;
}
