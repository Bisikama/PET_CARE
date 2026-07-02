import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateServiceDto {
  @ApiProperty({ description: 'Tên dịch vụ', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Mô tả dịch vụ', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Danh mục dịch vụ', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Giá cơ bản', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @ApiProperty({ description: 'Thời lượng thực hiện (phút)', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Mã chính sách hủy', required: false })
  @IsUUID()
  @IsOptional()
  cancellationPolicyId?: string;
}
