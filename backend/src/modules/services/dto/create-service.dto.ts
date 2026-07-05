import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Tên dịch vụ', example: 'Clean Care' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Mô tả dịch vụ',
    required: false,
    example: 'Chăm sóc toàn diện cho thú cưng',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Danh mục dịch vụ', required: false, example: 'Grooming' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Giá cơ bản', example: 320000 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ description: 'Thời lượng thực hiện (phút)', example: 120 })
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Mã chính sách hủy', required: false })
  @IsUUID()
  @IsOptional()
  cancellationPolicyId?: string;
}
