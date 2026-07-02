import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCancellationPolicyDto {
  @ApiProperty({ description: 'Tên chính sách hủy', example: 'Chính sách tiêu chuẩn' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Mô tả chính sách',
    required: false,
    example: 'Chính sách hủy linh hoạt cho khách hàng',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Cấu hình chi tiết (JSON)',
    example: { refundPercentage: 100, hoursBefore: 24 },
  })
  @IsObject()
  @IsNotEmpty()
  rulesJson: any;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
