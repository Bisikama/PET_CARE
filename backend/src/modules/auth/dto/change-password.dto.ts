import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mật khẩu cũ', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty({ description: 'Mật khẩu mới', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
