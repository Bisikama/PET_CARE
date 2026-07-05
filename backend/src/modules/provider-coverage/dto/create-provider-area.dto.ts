import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderAreaDto {
  @ApiProperty({ description: 'Tỉnh/Thành phố phục vụ', example: 'Hồ Chí Minh' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Quận/Huyện phục vụ', example: 'Quận 7' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ description: 'Phường/Xã phục vụ', example: 'Tân Kiểng' })
  @IsString()
  @IsNotEmpty()
  ward: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
