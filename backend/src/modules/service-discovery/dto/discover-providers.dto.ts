import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DiscoverProvidersDto {
  @ApiProperty({ description: 'Mã gói dịch vụ yêu cầu', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    description: 'Mã thú cưng (dùng để tự động lấy species & weight)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  petId?: string;

  @ApiProperty({
    description: 'Loại thú cưng (nếu không cung cấp petId)',
    required: false,
    example: 'Dog',
  })
  @IsString()
  @IsOptional()
  species?: string;

  @ApiProperty({
    description: 'Cân nặng thú cưng (nếu không cung cấp petId)',
    required: false,
    example: 7.5,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'Mã địa chỉ của khách hàng (dùng để tự động lấy city/district/ward)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  addressId?: string;

  @ApiProperty({
    description: 'Tỉnh/Thành phố (nếu không cung cấp addressId)',
    required: false,
    example: 'Hồ Chí Minh',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Quận/Huyện (nếu không cung cấp addressId)',
    required: false,
    example: 'Quận 7',
  })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({
    description: 'Phường/Xã (nếu không cung cấp addressId)',
    required: false,
    example: 'Tân Kiểng',
  })
  @IsString()
  @IsOptional()
  ward?: string;

  @ApiProperty({
    description: 'Ngày muốn đặt lịch (YYYY-MM-DD)',
    required: false,
    example: '2026-07-02',
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ description: 'Giá tối thiểu mong muốn', required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priceMin?: number;

  @ApiProperty({ description: 'Giá tối đa mong muốn', required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priceMax?: number;

  @ApiProperty({ description: 'Rating tối thiểu', required: false, example: 4.5 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  ratingMin?: number;

  @ApiProperty({ description: 'Yêu cầu có huy hiệu tin cậy', required: false })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  hasTrustBadge?: boolean;
}
