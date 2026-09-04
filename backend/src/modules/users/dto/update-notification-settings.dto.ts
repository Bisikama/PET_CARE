import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @ApiProperty({ description: 'Nhận thông báo qua Email', required: false })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiProperty({ description: 'Nhận thông báo qua Push (App)', required: false })
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @ApiProperty({ description: 'Nhận thông báo Khuyến mãi/Marketing', required: false })
  @IsOptional()
  @IsBoolean()
  marketing?: boolean;
}
