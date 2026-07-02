import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ description: 'Vĩ độ', required: false, example: 10.776889 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: 'Kinh độ', required: false, example: 106.700897 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiProperty({ description: 'Đặt làm mặc định', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
