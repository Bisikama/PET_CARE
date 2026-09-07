import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Role, user_status } from '@prisma/client';

export class GetUsersDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại (mặc định 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Số bản ghi trên mỗi trang (mặc định 10)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên, email, hoặc số điện thoại' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo vai trò', enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái', enum: user_status })
  @IsOptional()
  @IsEnum(user_status)
  status?: user_status;
}
