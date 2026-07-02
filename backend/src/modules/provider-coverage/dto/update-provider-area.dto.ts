import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProviderAreaDto {
  @ApiProperty({ description: 'Tỉnh/Thành phố phục vụ', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Quận/Huyện phục vụ', required: false })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({ description: 'Phường/Xã phục vụ', required: false })
  @IsString()
  @IsOptional()
  ward?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
