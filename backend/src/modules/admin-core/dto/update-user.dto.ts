import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Họ và tên người dùng',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại liên hệ',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
