import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'Email của người dùng mới' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Mật khẩu (ít nhất 6 ký tự)', minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Họ và tên' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Vai trò (Role)', enum: Role })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
