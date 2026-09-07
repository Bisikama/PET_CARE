import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserRoleDto {
  @ApiProperty({ description: 'Vai trò mới của người dùng', enum: Role })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
