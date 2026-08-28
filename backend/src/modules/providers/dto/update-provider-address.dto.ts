import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, IsInt } from 'class-validator';

export class UpdateProviderAddressDto {
  @ApiProperty({ description: 'Địa chỉ cơ sở (chi tiết)', example: '720A Điện Biên Phủ' })
  @IsString()
  @IsNotEmpty()
  baseAddressLine: string;

  @ApiPropertyOptional({ description: 'Phường/Xã', example: 'Phường 22' })
  @IsString()
  @IsOptional()
  baseWard?: string;

  @ApiPropertyOptional({ description: 'Quận/Huyện', example: 'Quận Bình Thạnh' })
  @IsString()
  @IsOptional()
  baseDistrict?: string;

  @ApiPropertyOptional({ description: 'Tỉnh/Thành phố', example: 'Hồ Chí Minh' })
  @IsString()
  @IsOptional()
  baseCity?: string;

  @ApiProperty({ description: 'Vĩ độ', example: 10.794964 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  baseLatitude: number;

  @ApiProperty({ description: 'Kinh độ', example: 106.721968 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  baseLongitude: number;

  @ApiPropertyOptional({ description: 'Chuỗi địa chỉ chuẩn (từ Google)', example: '720A Điện Biên Phủ, Phường 22, Bình Thạnh, Hồ Chí Minh' })
  @IsString()
  @IsOptional()
  baseFormatted?: string;

  @ApiPropertyOptional({ description: 'Bán kính phục vụ (km)', example: 5, default: 5 })
  @IsInt()
  @Min(1)
  @IsOptional()
  serviceRadiusKm?: number;
}
