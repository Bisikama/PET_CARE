import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalculateBookingPriceDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'ID của thú cưng',
  })
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @ApiProperty({
    example: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
    description: 'ID của gói dịch vụ',
  })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    example: '9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e',
    description: 'ID địa chỉ của khách hàng',
  })
  @IsUUID()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty({
    example: 'f8e7d6c5-b4a3-2f1e-0d9c-8b7a6f5e4d3c',
    description: 'ID hồ sơ của đối tác (Provider ID)',
  })
  @IsUUID()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({
    example: 'PETLOVE20',
    description: 'Mã giảm giá khuyến mãi (tùy chọn)',
    required: false,
  })
  @IsString()
  @IsOptional()
  promoCode?: string;
}
