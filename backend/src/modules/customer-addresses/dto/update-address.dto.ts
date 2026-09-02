import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { address_type } from '@prisma/client';

export class UpdateAddressDto {
  @ApiProperty({ description: 'Nhãn địa chỉ', required: false })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ description: 'Tên người nhận', required: false })
  @IsString()
  @IsOptional()
  receiverName?: string;

  @ApiProperty({ description: 'Số điện thoại nhận', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Địa chỉ chi tiết', required: false })
  @IsString()
  @IsOptional()
  addressLine?: string;

  @ApiProperty({ description: 'Phường/Xã', required: false })
  @IsString()
  @IsOptional()
  ward?: string;

  @ApiProperty({ description: 'Quận/Huyện', required: false })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({ description: 'Tỉnh/Thành phố', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Vĩ độ', required: false })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: 'Kinh độ', required: false })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiProperty({ description: 'Địa chỉ đầy đủ (từ Google)', required: false })
  @IsString()
  @IsOptional()
  formattedAddress?: string;

  @ApiProperty({ description: 'Place ID từ Google Maps', required: false })
  @IsString()
  @IsOptional()
  placeId?: string;

  @ApiProperty({ description: 'Loại địa chỉ', enum: address_type, required: false })
  @IsEnum(address_type)
  @IsOptional()
  addressType?: address_type;

  @ApiProperty({ description: 'Đặt làm mặc định', required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
