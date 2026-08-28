import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { address_type } from '@prisma/client';

export class CreateAddressDto {
  @ApiProperty({ description: 'Nhãn địa chỉ', example: 'Nhà riêng' })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ description: 'Tên người nhận', example: 'Nguyễn Văn A' })
  @IsString()
  @IsOptional()
  receiverName?: string;

  @ApiProperty({ description: 'Số điện thoại nhận', example: '0987654321' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Địa chỉ chi tiết', example: 'Số 123 Đường số 7' })
  @IsString()
  @IsNotEmpty()
  addressLine: string;

  @ApiProperty({ description: 'Phường/Xã', example: 'Tân Kiểng' })
  @IsString()
  @IsOptional()
  ward?: string;

  @ApiProperty({ description: 'Quận/Huyện', example: 'Quận 7' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({ description: 'Tỉnh/Thành phố', example: 'Hồ Chí Minh' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Vĩ độ', example: 10.776889 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ description: 'Kinh độ', example: 106.700897 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ description: 'Địa chỉ đầy đủ (từ Google)', required: false, example: 'Số 123 Đường số 7, Tân Kiểng, Quận 7, Hồ Chí Minh' })
  @IsString()
  @IsOptional()
  formattedAddress?: string;

  @ApiProperty({ description: 'Place ID từ Google Maps', required: false })
  @IsString()
  @IsOptional()
  placeId?: string;

  @ApiProperty({ description: 'Loại địa chỉ', enum: address_type, required: false, default: address_type.OTHER })
  @IsEnum(address_type)
  @IsOptional()
  addressType?: address_type;

  @ApiProperty({ description: 'Đặt làm mặc định', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
