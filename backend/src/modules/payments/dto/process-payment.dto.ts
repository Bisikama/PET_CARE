import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'ID của Booking cần thanh toán',
    example: 'book-1234-5678',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiPropertyOptional({
    description: 'Mã giảm giá (Nếu có áp dụng ở bước trước)',
    example: 'SUMMER2026',
    type: String,
  })
  @IsString()
  @IsOptional()
  promoCode?: string;

  @ApiProperty({
    description: 'Phương thức thanh toán (WALLET, VNPAY, v.v...)',
    example: 'WALLET',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({
    description: 'Số tiền thực tế cuối cùng phải thanh toán (sau khi đã trừ giảm giá)',
    example: 160000,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  amount: number;
}
