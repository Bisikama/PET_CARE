import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class ConfigItemDto {
  @ApiProperty({ description: 'Key của cấu hình', example: 'PLATFORM_FEE_PERCENT' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Value của cấu hình', example: '10' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class UpdateConfigDto {
  @ApiProperty({
    description: 'Danh sách cấu hình cần cập nhật',
    type: [ConfigItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigItemDto)
  configs: ConfigItemDto[];
}
